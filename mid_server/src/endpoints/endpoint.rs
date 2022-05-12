use rocket::serde::json::Json;
use rocket::tokio::sync::oneshot::{self};
use rocket::{get, post, tokio, State};

use crate::models::message::{
    ClientUser, ErrorResponse, ErrorTypes, GetUserResponse, IndexerMessage, ManagedState,
    RestErrorResponses, SuccessResponse, Transaction, UserCreate,
};
use crate::user::actor::{create_user, get_user};

#[post("/", format = "json", data = "<body>")]
pub async fn transaction_post(
    state: &State<ManagedState>,
    body: Option<Json<Transaction>>,
) -> String {
    match body {
        Some(data) => {
            let main_data = Transaction::json_to_struct(data);
            state
                .tx_indexer
                .clone()
                .send(IndexerMessage::Save(main_data))
                .unwrap();
        }
        None => {}
    }
    "".to_string()
}

#[get("/")]
pub async fn transaction_get(
    state: &State<ManagedState>,
) -> Result<Json<SuccessResponse<Vec<Transaction>>>, RestErrorResponses> {
    log::debug!("hi Get, ");
    let (tx_oneshot, rx_oneshot) = oneshot::channel::<IndexerMessage>();
    state
        .tx_indexer
        .clone()
        .send(IndexerMessage::Get(tx_oneshot))
        .unwrap();
    match rx_oneshot.await {
        Ok(result) => match result {
            IndexerMessage::Save(_) => unreachable!(),
            IndexerMessage::Get(_) => unreachable!(),
            IndexerMessage::GetFrom(_) => unreachable!(),
            IndexerMessage::GetFromResponse(_) => unreachable!(),
            IndexerMessage::GetTo(_) => unreachable!(),
            IndexerMessage::GetToResponse(_) => unreachable!(),
            IndexerMessage::GetMy(_) => unreachable!(),
            IndexerMessage::GetMyResponse(_) => unreachable!(),
            IndexerMessage::GetResponse(data) => {
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
) -> Result<Json<SuccessResponse<Vec<Transaction>>>, RestErrorResponses> {
    log::debug!("hi from, {}", address);
    log::debug!("hi Get, ");
    let (tx_oneshot, rx_oneshot) = oneshot::channel::<IndexerMessage>();
    state
        .tx_indexer
        .clone()
        .send(IndexerMessage::GetFrom((tx_oneshot, address.to_string())))
        .unwrap();
    match rx_oneshot.await {
        Ok(result) => match result {
            IndexerMessage::Save(_) => unreachable!(),
            IndexerMessage::Get(_) => unreachable!(),
            IndexerMessage::GetFrom(_) => unreachable!(),
            IndexerMessage::GetFromResponse(data) => {
                return Ok(Json(SuccessResponse { data }));
            }
            IndexerMessage::GetMy(_) => unreachable!(),
            IndexerMessage::GetMyResponse(_) => unreachable!(),
            IndexerMessage::GetResponse(_) => unreachable!(),
            IndexerMessage::GetTo(_) => unreachable!(),
            IndexerMessage::GetToResponse(_) => unreachable!(),
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
) -> Result<Json<SuccessResponse<Vec<Transaction>>>, RestErrorResponses> {
    log::debug!("hi to, {}", address);
    let (tx_oneshot, rx_oneshot) = oneshot::channel::<IndexerMessage>();
    state
        .tx_indexer
        .clone()
        .send(IndexerMessage::GetTo((tx_oneshot, address.to_string())))
        .unwrap();
    match rx_oneshot.await {
        Ok(result) => match result {
            IndexerMessage::Save(_) => unreachable!(),
            IndexerMessage::Get(_) => unreachable!(),
            IndexerMessage::GetFrom(_) => unreachable!(),
            IndexerMessage::GetFromResponse(_) => unreachable!(),
            IndexerMessage::GetResponse(_) => unreachable!(),
            IndexerMessage::GetTo(_) => unreachable!(),
            IndexerMessage::GetMy(_) => unreachable!(),
            IndexerMessage::GetMyResponse(_) => unreachable!(),
            IndexerMessage::GetToResponse(data) => {
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

#[post("/", format = "json", data = "<body>")]
pub async fn user_create(
    state: &State<ManagedState>,
    body: Option<Json<UserCreate>>,
) -> Result<Json<SuccessResponse<ClientUser>>, RestErrorResponses> {
    println!("hi to create user with password: {:?}", &body);
    match body {
        Some(data) => {
            let main_data = UserCreate::json_to_struct(data);
            let res = tokio::spawn(create_user(main_data, state.tx_user.clone()))
                .await
                .unwrap();
            return res;
        }
        None => todo!(),
    }
}

#[get("/<address>")]
pub async fn user_get(
    state: &State<ManagedState>,
    address: &str,
) -> Result<Json<SuccessResponse<GetUserResponse>>, RestErrorResponses> {
    log::debug!("hi get, {}", address);
    tokio::spawn(get_user(
        address.to_string(),
        state.tx_user.clone(),
        state.tx_indexer.clone(),
    ))
    .await
    .unwrap()
}

