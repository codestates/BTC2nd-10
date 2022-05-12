use rocket::serde::json::Json;
use rocket::tokio::sync::mpsc::UnboundedSender;
use rocket::tokio::sync::oneshot::Sender;
use rocket::Responder;
use serde_derive::Deserialize;
use serde_derive::Serialize;

#[derive(Debug)]
pub enum IndexerMessage {
    Save(Transaction),
    Get(Sender<IndexerMessage>),
    GetResponse(Vec<Transaction>),
    GetFrom((Sender<IndexerMessage>, String)),
    GetFromResponse(Vec<Transaction>),
    GetTo((Sender<IndexerMessage>, String)),
    GetToResponse(Vec<Transaction>),
}
#[derive(Debug)]
pub enum UserMessage {
    NewUserCreated(SaveUser),
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct UserCreate {
    pub password: String,
}
impl UserCreate {
    pub fn json_to_struct(json_data: Json<UserCreate>) -> Self {
        Self {
            password: json_data.password.clone(),
        }
    }
}
#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserCreateResponse {
    pub client: ClientUser,
    pub save: SaveUser,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClientUser {
    pub address: String,
    pub pk: String,
    pub access_token: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveUser {
    pub address: String,
    pub pk: String,
    pub salt: String,
    pub password: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Transaction {
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
impl Transaction {
    pub fn json_to_struct(json_data: Json<Transaction>) -> Self {
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

pub struct ManagedState {
    pub tx_indexer: UnboundedSender<IndexerMessage>,
    pub tx_user: UnboundedSender<UserMessage>,
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
