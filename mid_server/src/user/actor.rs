use rocket::serde::json::Json;
use rocket::tokio;
use rocket::tokio::sync::mpsc::{UnboundedReceiver, UnboundedSender};
use rocket::tokio::sync::oneshot;
use std::collections::{HashMap, HashSet};

use crate::envs::env::WALLET_SERVER;
use crate::models::message::{
    BalanceResponse, ClientUser, ErrorResponse, ErrorTypes, GetMyResponse, GetUserResponse,
    IndexerMessage, RestErrorResponses, SaveUser, SuccessResponse, Transaction, Transfer,
    TransferInternal, TransferResponse, UserCreate, UserCreateResponse, UserMessage,
};

pub struct UserActor {
    created_user: HashMap<String, (SaveUser, ClientUser)>,
    access_address_map: HashMap<String, String>,
    tx_self: UnboundedSender<UserMessage>,
    rx_self: UnboundedReceiver<UserMessage>,
}
impl UserActor {
    pub fn new() -> Self {
        let (tx_self, rx_self) = tokio::sync::mpsc::unbounded_channel::<UserMessage>();
        Self {
            created_user: HashMap::new(),
            access_address_map: HashMap::new(),
            tx_self,
            rx_self,
        }
    }
    pub fn get_tx(&self) -> UnboundedSender<UserMessage> {
        self.tx_self.clone()
    }
    pub async fn listen(&mut self) {
        loop {
            let msg = self.rx_self.recv().await;
            match msg {
                Some(types) => match types {
                    UserMessage::NewUserCreated(data) => {
                        println!("save user");
                        self.access_address_map
                            .insert(data.1.access_token.clone(), data.0.address.clone());
                        self.created_user.insert(data.0.address.clone(), data);
                        println!("created: {:?}", &self.access_address_map)
                    }
                    UserMessage::GetUserFromAccess((tx_oneshot, access)) => {
                        // sending option
                        println!("recevied: {:?}, stored: {:?}", access, self.created_user);
                        match self.access_address_map.get(&access) {
                            Some(data) => match self.created_user.get(data) {
                                Some(data) => {
                                    println!("sending: {:?}", data.1);
                                    tx_oneshot
                                        .send(UserMessage::GetUserResponse(Some(data.1.clone())))
                                        .unwrap()
                                }
                                None => {
                                    tx_oneshot.send(UserMessage::GetUserResponse(None)).unwrap()
                                }
                            },
                            None => tx_oneshot.send(UserMessage::GetUserResponse(None)).unwrap(),
                        }
                    }
                    UserMessage::GetUser((tx_oneshot, address)) => {
                        // sending option
                        match self.created_user.get(&address) {
                            Some(data) => tx_oneshot
                                .send(UserMessage::GetUserResponse(Some(data.1.clone())))
                                .unwrap(),
                            None => tx_oneshot.send(UserMessage::GetUserResponse(None)).unwrap(),
                        }
                    }
                    UserMessage::GetUserResponse(_) => todo!(),
                },
                None => {
                    // IGNORE OTHER MESSAGES
                }
            }
        }
    }
}

pub async fn create_user(
    data: UserCreate,
    tx_user: UnboundedSender<UserMessage>,
) -> Result<Json<SuccessResponse<ClientUser>>, RestErrorResponses> {
    let url = format!("{}/user", WALLET_SERVER.as_str());
    let mut headers = reqwest::header::HeaderMap::new();
    headers.insert(
        reqwest::header::ACCEPT,
        reqwest::header::HeaderValue::from_static("Application/json"),
    );
    let client = reqwest::Client::builder()
        .default_headers(headers)
        .build()
        .unwrap();
    let response = client.post(url).json(&data).send().await;
    println!("{:?}", response);
    match response {
        Ok(res) => {
            if res.status() == 200 {
                match res.json::<UserCreateResponse>().await {
                    Ok(parsed) => {
                        println!("parsed :{:?}", parsed);
                        tx_user
                            .send(UserMessage::NewUserCreated((
                                parsed.save,
                                parsed.client.clone(),
                            )))
                            .unwrap();
                        Ok(Json(SuccessResponse {
                            data: parsed.client,
                        }))
                    }
                    Err(msg) => {
                        println!("parsing failed");
                        let error = ErrorResponse::create_error(ErrorTypes::StandardError(
                            format!("error msg: {}", msg),
                        ));
                        return Err(error);
                    }
                }
            } else {
                println!("Fail to get response, {:#?}", res.status());
                let error = ErrorResponse::create_error(ErrorTypes::StandardError(format!(
                    "error msg: {}",
                    res.status()
                )));
                return Err(error);
            }
        }
        Err(e) => {
            println!("Fail to send message {}", e);
            let error =
                ErrorResponse::create_error(ErrorTypes::StandardError(format!("error msg: {}", e)));
            return Err(error);
        }
    }
}

pub async fn get_user(
    address: String,
    tx_user: UnboundedSender<UserMessage>,
    tx_indexer: UnboundedSender<IndexerMessage>,
) -> Result<Json<SuccessResponse<GetUserResponse>>, RestErrorResponses> {
    let url = format!("{}/user/{}", WALLET_SERVER.as_str(), address);
    println!("1");
    let headers = reqwest::header::HeaderMap::new();
    let client = reqwest::Client::builder()
        .default_headers(headers)
        .build()
        .unwrap();

    let (tx_oneshot, rx_oneshot) = oneshot::channel::<UserMessage>();
    tx_user
        .send(UserMessage::GetUser((tx_oneshot, address.clone())))
        .unwrap();
    let response = client.get(url).send().await;
    println!("2 : {:?}", response);
    match response {
        Ok(res) => {
            if res.status() == 200 {
                match res.json::<BalanceResponse>().await {
                    Ok(parsed) => {
                        println!("parsed :{:?}", parsed);
                        let (tx_oneshot, rx_oneshot) = oneshot::channel::<IndexerMessage>();
                        tx_indexer
                            .send(IndexerMessage::GetMy((tx_oneshot, address.clone())))
                            .unwrap();
                        match rx_oneshot.await {
                            Ok(txs) => match txs {
                                IndexerMessage::GetMyResponse(txs) => {
                                    let response =
                                        GetUserResponse::new(parsed.balance, address, txs);
                                    Ok(Json(SuccessResponse { data: response }))
                                }
                                _ => todo!(),
                            },
                            Err(_) => todo!(),
                        }
                    }
                    Err(msg) => {
                        println!("parsing failed");
                        let error = ErrorResponse::create_error(ErrorTypes::StandardError(
                            format!("error msg: {}", msg),
                        ));
                        return Err(error);
                    }
                }
            } else {
                println!("Fail to get response, {:#?}", res.status());
                let error = ErrorResponse::create_error(ErrorTypes::StandardError(format!(
                    "error msg: {}",
                    res.status()
                )));
                return Err(error);
            }
        }
        Err(e) => {
            println!("Fail to send message {}", e);
            let error =
                ErrorResponse::create_error(ErrorTypes::StandardError(format!("error msg: {}", e)));
            return Err(error);
        }
    }
}

pub async fn get_my(
    address: String,
    tx_user: UnboundedSender<UserMessage>,
    tx_indexer: UnboundedSender<IndexerMessage>,
) -> Result<Json<SuccessResponse<GetMyResponse>>, RestErrorResponses> {
    let (tx_oneshot, rx_oneshot) = oneshot::channel::<UserMessage>();
    tx_user
        .send(UserMessage::GetUserFromAccess((
            tx_oneshot,
            address.clone(),
        )))
        .unwrap();
    match rx_oneshot.await {
        Ok(val) => match val {
            UserMessage::GetUserFromAccess(_) => todo!(),
            UserMessage::NewUserCreated(_) => todo!(),
            UserMessage::GetUser(_) => todo!(),
            UserMessage::GetUserResponse(data) => {
                if let Some(user) = data {
                    let url = format!("{}/user/{}", WALLET_SERVER.as_str(), user.address);
                    println!("1");
                    let headers = reqwest::header::HeaderMap::new();
                    let client = reqwest::Client::builder()
                        .default_headers(headers)
                        .build()
                        .unwrap();
                    let response = client.get(url).send().await;
                    println!("2 : {:?}", response);
                    match response {
                        Ok(res) => {
                            if res.status() == 200 {
                                match res.json::<BalanceResponse>().await {
                                    Ok(parsed) => {
                                        println!("parsed :{:?}", parsed);
                                        let (tx_oneshot, rx_oneshot) =
                                            oneshot::channel::<IndexerMessage>();
                                        tx_indexer
                                            .send(IndexerMessage::GetMy((
                                                tx_oneshot,
                                                address.clone(),
                                            )))
                                            .unwrap();
                                        match rx_oneshot.await {
                                            Ok(txs) => match txs {
                                                IndexerMessage::GetMyResponse(txs) => {
                                                    let response = GetMyResponse::new(
                                                        parsed.balance,
                                                        user,
                                                        txs,
                                                    );
                                                    Ok(Json(SuccessResponse { data: response }))
                                                }
                                                _ => todo!(),
                                            },
                                            Err(_) => todo!(),
                                        }
                                    }
                                    Err(msg) => {
                                        println!("parsing failed");
                                        let error =
                                            ErrorResponse::create_error(ErrorTypes::StandardError(
                                                format!("error msg: {}", msg),
                                            ));
                                        return Err(error);
                                    }
                                }
                            } else {
                                println!("Fail to get response, {:#?}", res.status());
                                let error = ErrorResponse::create_error(ErrorTypes::StandardError(
                                    format!("error msg: {}", res.status()),
                                ));
                                return Err(error);
                            }
                        }
                        Err(e) => {
                            println!("Fail to send message {}", e);
                            let error = ErrorResponse::create_error(ErrorTypes::StandardError(
                                format!("error msg: {}", e),
                            ));
                            return Err(error);
                        }
                    }
                } else {
                    todo!()
                }
            }
        },
        Err(e) => todo!(),
    }
}

pub async fn transfer_handle(
    transfer: Transfer,
    tx_user: UnboundedSender<UserMessage>,
    tx_indexer: UnboundedSender<IndexerMessage>,
) -> Result<Json<SuccessResponse<TransferResponse>>, RestErrorResponses> {
    let (tx_oneshot, rx_oneshot) = oneshot::channel::<UserMessage>();
    tx_user
        .send(UserMessage::GetUserFromAccess((
            tx_oneshot,
            transfer.from.clone(),
        )))
        .unwrap();
    match rx_oneshot.await {
        Ok(val) => match val {
            UserMessage::GetUserFromAccess(_) => todo!(),
            UserMessage::NewUserCreated(_) => todo!(),
            UserMessage::GetUser(_) => todo!(),
            UserMessage::GetUserResponse(data) => {
                if let Some(user) = data {
                    println!("1");
                    let url = format!("{}/user/transfer", WALLET_SERVER.as_str());
                    let mut headers = reqwest::header::HeaderMap::new();
                    headers.insert(
                        reqwest::header::ACCEPT,
                        reqwest::header::HeaderValue::from_static("Application/json"),
                    );
                    let client = reqwest::Client::builder()
                        .default_headers(headers)
                        .build()
                        .unwrap();
                    let internal_data = TransferInternal {
                        from: user.address,
                        to: transfer.to,
                        pk: user.pk,
                        amount: transfer.amount,
                    };
                    println!("2 sending : {:?}", internal_data);
                    let response = client.post(url).json(&internal_data).send().await;
                    println!("2 : {:?}", response);
                    match response {
                        Ok(res) => {
                            if res.status() == 200 {
                                match res.json::<TransferResponse>().await {
                                    Ok(parsed) => {
                                        println!("parsed :{:?}", parsed);
                                        Ok(Json(SuccessResponse { data: parsed }))
                                    }
                                    Err(msg) => {
                                        println!("parsing failed");
                                        let error =
                                            ErrorResponse::create_error(ErrorTypes::StandardError(
                                                format!("error msg: {}", msg),
                                            ));
                                        return Err(error);
                                    }
                                }
                            } else {
                                println!("Fail to get response, {:#?}", res.status());
                                let error = ErrorResponse::create_error(ErrorTypes::StandardError(
                                    format!("error msg: {}", res.status()),
                                ));
                                return Err(error);
                            }
                        }
                        Err(e) => {
                            println!("Fail to send message {}", e);
                            let error = ErrorResponse::create_error(ErrorTypes::StandardError(
                                format!("error msg: {}", e),
                            ));
                            return Err(error);
                        }
                    }
                } else {
                    todo!()
                }
            }
        },
        Err(e) => todo!(),
    }
}
