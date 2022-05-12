#[macro_use]
extern crate rocket;
use mid_server::endpoints::endpoint::{
    my_wallet, transaction_get, transaction_get_from, transaction_get_to, transaction_post,
    user_create, user_get,
};
use mid_server::indexer::actor::Indexer;
use mid_server::models::message::ManagedState;
use mid_server::user::actor::UserActor;
use rocket::{routes, tokio};
#[launch]
fn rocket() -> _ {
    env_logger::init();
    let mut indexer_actor = Indexer::new();
    let tx_indexer = indexer_actor.get_tx();
    let mut user_actor = UserActor::new();
    let tx_user = user_actor.get_tx();
    tokio::spawn(async move {
        indexer_actor.listen().await;
    });
    tokio::spawn(async move {
        user_actor.listen().await;
    });
    let managed = ManagedState {
        tx_indexer,
        tx_user,
    };
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
        .mount("/user", routes![user_create, user_get, my_wallet])
        .manage(managed)
}
