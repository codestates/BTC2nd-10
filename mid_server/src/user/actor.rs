use rocket::serde::json::Json;
use rocket::tokio;
use rocket::tokio::sync::mpsc::{UnboundedReceiver, UnboundedSender};
use rocket::tokio::sync::oneshot;
use std::collections::{HashMap, HashSet};

use crate::envs::env::WALLET_SERVER;
use crate::models::message::{
    BalanceResponse, ClientUser, ErrorResponse, ErrorTypes, GetUserResponse, IndexerMessage,
    RestErrorResponses, SaveUser, SuccessResponse, Transaction, UserCreate, UserCreateResponse,
    UserMessage,
};

pub struct UserActor {
    created_user: HashMap<String, (SaveUser, ClientUser)>,
    tx_self: UnboundedSender<UserMessage>,
    rx_self: UnboundedReceiver<UserMessage>,
}
impl UserActor {
    pub fn new() -> Self {
        let (tx_self, rx_self) = tokio::sync::mpsc::unbounded_channel::<UserMessage>();
        Self {
            created_user: HashMap::new(),
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
                        self.created_user.insert(data.0.address.clone(), data);
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
    match rx_oneshot.await {
        Ok(val) => match val {
            UserMessage::NewUserCreated(_) => todo!(),
            UserMessage::GetUser(_) => todo!(),
            UserMessage::GetUserResponse(data) => {
                if let Some(user) = data {
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
                                            .send(IndexerMessage::GetMy((tx_oneshot, address)))
                                            .unwrap();
                                        match rx_oneshot.await {
                                            Ok(txs) => match txs {
                                                IndexerMessage::GetMyResponse(txs) => {
                                                    let response = GetUserResponse::new(
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