const Web3 = require("web3");
const NODE_URL = "https://speedy-nodes-nyc.moralis.io/418f8e6973f3c5924015ef94/avalanche/testnet";
const provider = new Web3.providers.HttpProvider(NODE_URL);
const web3 = new Web3(provider);
// const MID_SERVER_URL = "http://10.0.0.240:8000";
const MID_SERVER_URL = `${process.env.SERVER}`;
const axios = require('axios').default;

// Moralisz api call here
const getCurrentBlockNumber = async () => await web3.eth.getBlockNumber();
const getTx = async (tx) => await web3.eth.getTransaction(tx);
const getNewTxs = async (start_block, currentBlockNumber) => {
    try {
        const txs = [];
        for (let j = start_block; j < currentBlockNumber + 1; j++) {
            let block = await web3.eth.getBlock(j);
            for (let tx of block.transactions) {
                txs.push(getTx(tx));
            }
        }
        return Promise.all(txs);
    } catch (e) {
        console.log(e.message);
        return null
    }
};
const notify_to_mid_sever = async (tx) => {
    console.log(JSON.stringify(tx));
    // 여기서 rest post
    axios.post(`${MID_SERVER_URL}/transaction`, JSON.stringify(tx), { headers: { "Content-Type": `application/json` } });
};

module.exports = {
    notify_to_mid_sever,
    getCurrentBlockNumber,
    getNewTxs,
};
