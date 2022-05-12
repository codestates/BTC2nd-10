use rocket::tokio;
use rocket::tokio::sync::mpsc::{UnboundedReceiver, UnboundedSender};
use std::collections::HashSet;

use crate::models::message::{IndexerMessage, Transaction};

pub struct Indexer {
    received_data: Vec<Transaction>,
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
                    IndexerMessage::Save(data) => {
                        let block_hash = data.block_hash.clone();
                        if self.inserted.contains(&block_hash) {
                            //
                        } else {
                            self.inserted.insert(block_hash);
                            self.received_data.push(data);
                        }
                    }
                    IndexerMessage::Get(tx_oneshot) => {
                        tx_oneshot
                            .send(IndexerMessage::GetResponse(self.received_data.clone()))
                            .unwrap();
                    }
                    IndexerMessage::GetResponse(_) => {}
                    IndexerMessage::GetFrom((tx_oneshot, from_address)) => {
                        let mut interest = Vec::new();
                        for item in &self.received_data {
                            if item.from == from_address {
                                interest.push(item.clone());
                            }
                        }
                        tx_oneshot
                            .send(IndexerMessage::GetFromResponse(interest))
                            .unwrap();
                    }
                    IndexerMessage::GetFromResponse(_) => unreachable!(),
                    IndexerMessage::GetTo((tx_oneshot, to_address)) => {
                        let mut interest = Vec::new();
                        for item in &self.received_data {
                            if item.to == to_address {
                                interest.push(item.clone());
                            }
                        }
                        tx_oneshot
                            .send(IndexerMessage::GetToResponse(interest))
                            .unwrap();
                    }
                    IndexerMessage::GetToResponse(_) => unreachable!(),
                    IndexerMessage::GetMy((tx_oneshot, tx_address)) => {
                        let mut interest = Vec::new();
                        for item in &self.received_data {
                            if item.from == tx_address || item.to == tx_address {
                                interest.push(item.clone());
                            }
                        }
                        tx_oneshot
                            .send(IndexerMessage::GetMyResponse(interest))
                            .unwrap();
                    }
                    IndexerMessage::GetMyResponse(_) => unreachable!(),
                },
                None => {
                    // IGNORE OTHER MESSAGES
                }
            }
        }
    }
}
