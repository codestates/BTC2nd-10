use rocket::serde::json::Json;
use rocket::tokio;
use rocket::tokio::sync::mpsc::{UnboundedReceiver, UnboundedSender};
use std::collections::HashSet;

use crate::envs::env::WALLET_SERVER;
use crate::models::message::{
    ClientUser, ErrorResponse, ErrorTypes, RestErrorResponses, SaveUser, SuccessResponse,
    Transaction, UserCreate, UserCreateResponse, UserMessage,
};

pub struct UserActor {
    created_user: Vec<SaveUser>,
    tx_self: UnboundedSender<UserMessage>,
    rx_self: UnboundedReceiver<UserMessage>,
}
impl UserActor {
    pub fn new() -> Self {
        let (tx_self, rx_self) = tokio::sync::mpsc::unbounded_channel::<UserMessage>();
        Self {
            created_user: Vec::new(),
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
                        self.created_user.push(data);
                    }
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
                            .send(UserMessage::NewUserCreated(parsed.save))
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

