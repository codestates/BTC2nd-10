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
  await axios.get('http://172.30.1.40:8000/transaction').then((Response)=>{
    res.send({data: JSON.stringify(Response.data)});
  }).catch((Error)=>{
    console.log(Error);
  })
})

router.post('/wallet', async function(req, res, next) {
  // Create a new wallet
  await axios({
    method: 'post',
    url: 'http://172.30.1.40:8000/user',
    data: req.body
  }).then(function (response) {
        let { data } = response;
        res.send(data.data);
        // console.log(response);
  })
});

module.exports = router;
