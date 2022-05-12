var express = require('express');
var axios = require('axios');
var router = express.Router();
const { MnemonicWallet } = require('@avalabs/avalanche-wallet-sdk');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/wallet', function(req, res, next) {
  res.render('create_wallet', { title: 'Express' });
});

router.get('/transaction',async function (req,res,next){
  await axios.get('http://localhost:8000/transaction').then((Response)=>{
    res.send({data: JSON.stringify(Response.data)});
  }).catch((Error)=>{
    console.log(Error);
  })
})

router.post('/wallet', function(req, res, next) {
  // Create a new wallet
  let newMnemonic = MnemonicWallet.generateMnemonicPhrase()
  let myWallet = MnemonicWallet.fromMnemonic(newMnemonic)

  let addressX = myWallet.getAddressX()
  let addressP = myWallet.getAddressP()
  let addressC = myWallet.getAddressC()

  console.log(newMnemonic,
      myWallet,
      addressX,
      addressP,
      addressC,
  )
  res.send({newMnemonic,
    myWallet,
    addressX,
    addressP,
    addressC})
});

module.exports = router;
