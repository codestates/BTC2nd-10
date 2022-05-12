const router = require("express").Router();
const { getWeb3 } = require("./midle.js");
const {
  createUser,
  getBalance,
} = require("../handler.js");

router.post("/", getWeb3, createUser);
router.get("/:address",getWeb3, getBalance);
module.exports = router;

