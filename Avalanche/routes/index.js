var express = require('express');
var router = express.Router();
const { MnemonicWallet } = require('@avalabs/avalanche-wallet-sdk');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

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
