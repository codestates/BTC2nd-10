const router = require("express").Router();
const { getWeb3 } = require("./midle.js");
const {
  createUser,
  getBalance,
  transfer,
} = require("../handler.js");

router.post("/", getWeb3, createUser);
router.get("/:address",getWeb3, getBalance);
router.post("/transfer", getWeb3, transfer);
module.exports = router;

