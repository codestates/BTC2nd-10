const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const makeSalt = (length) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQ44TUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
//--------------------------------------------------------------------
let userTemplate = {
    address: "",
    pk: "",
    salt:"",
    password: ""
}
const createUser = async (req, password, address = null, privateKey = null) => {
  let newAccount;
  if (!address && !privateKey) {
    newAccount = await req.web3.eth.accounts.create();
    address = newAccount.address;
    privateKey = newAccount.privateKey;
  }
  const salt = makeSalt(18);
  // Encrypt
  const encryptedPk = CryptoJS.AES.encrypt(privateKey, salt).toString();
  // Decrypt
  let user = userTemplate;
  user.address = address; 
  user.pk = encryptedPk; 
  user.salt = salt; 
  user.password = CryptoJS.SHA256(password).toString();
  console.log(user);
  const token = getToken(user);
  return [address, privateKey, token, user];
};
const getToken = (user) => {
  return jwt.sign({ address: user.address }, "12234");
};
//--------------------------------------------------------------------
const sendTransaction = async (to,from, pk, amount,req) => {
  let tx = {
    from,
    to,
    value: req.web3.utils.toWei(amount, "ether"),
    gas: 22000,
  };
  console.log(tx)
  await req.web3.eth.accounts.privateKeyToAccount(pk);
  const signedTx = await req.web3.eth.accounts.signTransaction(tx, pk);
  return await req.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
};
//--------------------------------------------------------------------

module.exports = {
  createUser: async (req, res) => {
    try {
      const { password } = req.body;
      const [address, privateKey, token, user] = await createUser(req, password);
      res.status(200).send({ 
           "client":{   
                "address": `${address}`,
                "pk": `${privateKey}`,
                "accessToken": `${token}`
            },
            "save":{
                "address": `${user.address}`,
                "pk": `${user.pk}`,
                "salt": `${user.salt}`,
                "password": `${user.password}`,
            }
        });
    } catch (err) {
      console.log(err);
      res.status(404).send({
        message: "server error",
        errMsg: err,
      });
    }
  },
  getBalance: async (req, res) => {
    let address = req.params.address;
    const resBalance = req.web3.utils.fromWei(
      await req.web3.eth.getBalance(address),
      "ether"
    );
    return res.status(200).json({    
        "balance": `${resBalance}`,
    });
  },
  transfer: async (req, res) => {
    try {
      const { to, from, amount ,pk } = req.body;
      console.log(`to ${to}  \n ${from} \n ${amount} , \n ${pk}`)
      const result = await sendTransaction(
        to,
        from,
        pk,
        amount,
        req
      );
      if (result?.status !== null) {
        if (result.status) {
          res.status(200).json({ 
            message: "success" 
          });
        } else {
          res.status(400).json({
             message: "fail" 
          });
        }
      }
    } catch (e) {
      console.log(e);
      res.status(404).send({
        message: "server error",
        errMsg: e,
      });
    }
  },  
};
