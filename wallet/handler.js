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
  login: async (req, res) => {
    const { address, password } = req.body;
    login(address, password, res);
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
  }
};
