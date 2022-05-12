const Web3 = require("web3");
const NODE_URL =  "https://speedy-nodes-nyc.moralis.io/418f8e6973f3c5924015ef94/avalanche/testnet";
const provider = new Web3.providers.HttpProvider(NODE_URL);
module.exports = {
  getWeb3: (req, res, next) => {
    const network = req.cookies["network"];
    if (!network) {
      req.network = "testnet";
      const web3 = new Web3(provider);
      req.web3 = web3;
      next();
    } else {
        req.network = "testnet";
        const web3 = new Web3(provider);
        req.web3 = web3;
        next();
    }
  },
};
