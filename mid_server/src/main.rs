#[macro_use]
extern crate rocket;
use rocket::serde::json::{self, Json};
use rocket::tokio::sync::mpsc::{UnboundedReceiver, UnboundedSender};
use rocket::tokio::sync::oneshot::{self, Sender};
use rocket::{get, post, State};
use rocket::{routes, tokio};
use serde_derive::Deserialize;
use serde_derive::Serialize;
use std::collections::HashSet;

#[derive(Debug)]
pub enum IndexerMessage {
    save(Root),
    get(Sender<IndexerMessage>),
    get_response(Vec<Root>),
    get_from((Sender<IndexerMessage>, String)),
    get_from_response(Vec<Root>),
    get_to((Sender<IndexerMessage>, String)),
    get_to_response(Vec<Root>),
}
pub struct Indexer {
    received_data: Vec<Root>,
    inserted: HashSet<String>,
    tx_self: UnboundedSender<IndexerMessage>,
    rx_self: UnboundedReceiver<IndexerMessage>,
}
impl Indexer {
    pub fn new() -> Self {
        let (tx_self, rx_self) = tokio::sync::mpsc::unbounded_channel::<IndexerMessage>();
        Self {
            received_data: Vec::new(),
            inserted: HashSet::new(),
            tx_self,
            rx_self,
        }
    }
    pub fn get_tx(&self) -> UnboundedSender<IndexerMessage> {
        self.tx_self.clone()
    }

    pub async fn listen(&mut self) {
        loop {
            let msg = self.rx_self.recv().await;
            match msg {
                Some(types) => match types {
                    IndexerMessage::save(data) => {
                        let block_hash = data.block_hash.clone();
                        if self.inserted.contains(&block_hash) {
                            //
                        } else {
                            self.inserted.insert(block_hash);
                            self.received_data.push(data);
                        }
                    }
                    IndexerMessage::get(tx_oneshot) => {
                        tx_oneshot
                            .send(IndexerMessage::get_response(self.received_data.clone()))
                            .unwrap();
                    }
                    IndexerMessage::get_response(_) => {}
                    IndexerMessage::get_from((tx_oneshot, from_address)) => {
                        let mut interest = Vec::new();
                        for item in &self.received_data {
                            if item.from == from_address {
                                interest.push(item.clone());
                            }
                        }
                        tx_oneshot
                            .send(IndexerMessage::get_from_response(interest))
                            .unwrap();
                    }
                    IndexerMessage::get_from_response(_) => unreachable!(),
                    IndexerMessage::get_to((tx_oneshot, to_address)) => {
                        let mut interest = Vec::new();
                        for item in &self.received_data {
                            if item.to == to_address {
                                interest.push(item.clone());
                            }
                        }
                        tx_oneshot
                            .send(IndexerMessage::get_to_response(interest))
                            .unwrap();
                    }
                    IndexerMessage::get_to_response(_) => unreachable!(),
                },
                None => {
                    // IGNORE OTHER MESSAGES
                }
            }
        }
    }
}
pub struct ManagedState {
    pub tx_indexer: UnboundedSender<IndexerMessage>,
}
#[derive(Debug, Serialize)]
pub struct SuccessResponse<T> {
    pub data: T,
}

#[derive(Debug, Responder)]
pub enum RestErrorResponses {
    #[response(status = 500, content_type = "json")]
    StandardError(Json<ErrorResponse>),
    #[response(status = 400, content_type = "json")]
    InvalidInput(Json<ErrorResponse>),
}
#[derive(Debug, Serialize)]
pub struct ErrorResponse {
    pub error_type: String,
    pub message: String,
}

impl ErrorResponse {
    pub fn create_error(e_type: ErrorTypes) -> RestErrorResponses {
        match e_type {
            ErrorTypes::StandardError(extra_message) => {
                RestErrorResponses::StandardError(Json(ErrorResponse {
                    error_type: "StandardError".to_string(),
                    message: extra_message,
                }))
            }
        }
    }
}

pub enum ErrorTypes {
    StandardError(String),
}

#[launch]
fn rocket() -> _ {
    env_logger::init();
    let mut indexer_actor = Indexer::new();
    let tx_indexer = indexer_actor.get_tx();
    tokio::spawn(async move {
        indexer_actor.listen().await;
    });
    let managed = ManagedState { tx_indexer };
    rocket::build()
        .mount(
            "/transaction",
            routes![
                transaction_post,
                transaction_get,
                transaction_get_from,
                transaction_get_to
            ],
        )
        .manage(managed)
}

#[post("/", format = "json", data = "<body>")]
pub async fn transaction_post(state: &State<ManagedState>, body: Option<Json<Root>>) -> String {
    match body {
        Some(data) => {
            let main_data = Root::JsonToStruct(data);
            state
                .tx_indexer
                .clone()
                .send(IndexerMessage::save(main_data))
                .unwrap();
        }
        None => {}
    }
    "".to_string()
}
#[get("/")]
pub async fn transaction_get(
    state: &State<ManagedState>,
) -> Result<Json<SuccessResponse<Vec<Root>>>, RestErrorResponses> {
    log::debug!("hi get, ");
    let (tx_oneshot, rx_oneshot) = oneshot::channel::<IndexerMessage>();
    state
        .tx_indexer
        .clone()
        .send(IndexerMessage::get(tx_oneshot))
        .unwrap();
    match rx_oneshot.await {
        Ok(result) => match result {
            IndexerMessage::save(_) => unreachable!(),
            IndexerMessage::get(_) => unreachable!(),
            IndexerMessage::get_from(_) => unreachable!(),
            IndexerMessage::get_from_response(_) => unreachable!(),
            IndexerMessage::get_to(_) => unreachable!(),
            IndexerMessage::get_to_response(_) => unreachable!(),
            IndexerMessage::get_response(data) => {
                return Ok(Json(SuccessResponse { data }));
            }
        },
        Err(msg) => {
            let error = ErrorResponse::create_error(ErrorTypes::StandardError(format!(
                "error msg: {}",
                msg
            )));
            return Err(error);
        }
    };
}
#[get("/from/<address>")]
pub async fn transaction_get_from(
    state: &State<ManagedState>,
    address: &str,
) -> Result<Json<SuccessResponse<Vec<Root>>>, RestErrorResponses> {
    log::debug!("hi from, {}", address);
    log::debug!("hi get, ");
    let (tx_oneshot, rx_oneshot) = oneshot::channel::<IndexerMessage>();
    state
        .tx_indexer
        .clone()
        .send(IndexerMessage::get_from((tx_oneshot, address.to_string())))
        .unwrap();
    match rx_oneshot.await {
        Ok(result) => match result {
            IndexerMessage::save(_) => unreachable!(),
            IndexerMessage::get(_) => unreachable!(),
            IndexerMessage::get_from(_) => unreachable!(),
            IndexerMessage::get_from_response(data) => {
                return Ok(Json(SuccessResponse { data }));
            }
            IndexerMessage::get_response(_) => unreachable!(),
            IndexerMessage::get_to(_) => unreachable!(),
            IndexerMessage::get_to_response(_) => unreachable!(),
        },
        Err(msg) => {
            let error = ErrorResponse::create_error(ErrorTypes::StandardError(format!(
                "error msg: {}",
                msg
            )));
            return Err(error);
        }
    };
}
#[get("/to/<address>")]
pub async fn transaction_get_to(
    state: &State<ManagedState>,
    address: &str,
) -> Result<Json<SuccessResponse<Vec<Root>>>, RestErrorResponses> {
    log::debug!("hi to, {}", address);
    let (tx_oneshot, rx_oneshot) = oneshot::channel::<IndexerMessage>();
    state
        .tx_indexer
        .clone()
        .send(IndexerMessage::get_to((tx_oneshot, address.to_string())))
        .unwrap();
    match rx_oneshot.await {
        Ok(result) => match result {
            IndexerMessage::save(_) => unreachable!(),
            IndexerMessage::get(_) => unreachable!(),
            IndexerMessage::get_from(_) => unreachable!(),
            IndexerMessage::get_from_response(_) => unreachable!(),
            IndexerMessage::get_response(_) => unreachable!(),
            IndexerMessage::get_to(_) => unreachable!(),
            IndexerMessage::get_to_response(data) => {
                return Ok(Json(SuccessResponse { data }));
            }
        },
        Err(msg) => {
            let error = ErrorResponse::create_error(ErrorTypes::StandardError(format!(
                "error msg: {}",
                msg
            )));
            return Err(error);
        }
    };
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Root {
    pub block_hash: String,
    pub block_number: i64,
    pub from: String,
    pub gas: i64,
    pub gas_price: String,
    pub hash: String,
    pub input: String,
    pub nonce: i64,
    pub to: String,
    pub transaction_index: i64,
    pub value: String,
    #[serde(rename = "type")]
    pub type_field: i64,
    pub v: String,
    pub r: String,
    pub s: String,
}
impl Root {
    pub fn JsonToStruct(json_data: Json<Root>) -> Self {
        Self {
            block_hash: json_data.block_hash.clone(),
            block_number: json_data.block_number,
            from: json_data.from.clone(),
            gas: json_data.gas,
            gas_price: json_data.gas_price.clone(),
            hash: json_data.hash.clone(),
            input: json_data.input.clone(),
            nonce: json_data.nonce,
            to: json_data.to.clone(),
            transaction_index: json_data.transaction_index,
            value: json_data.value.clone(),
            type_field: json_data.type_field,
            v: json_data.v.clone(),
            r: json_data.r.clone(),
            s: json_data.s.clone(),
        }
    }
}
