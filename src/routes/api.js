// BACK END api
const express = require('express');
const router = express.Router();

// local dependencies
const IPFS = require("../back-end-js/IPFS.js");
const auth = require("../back-end-js/metamask-auth.js");
const optionSmartContract = require("../back-end-js/option-smart-contract-interface.js")



// GETs

router.get("/getFromIPFS", function(req, res) {
  //TODO fix
  const data = IPFS.getFromIPFS(req.body);
  res.send(data);
});


// POSTs


router.post("/deployOptionSmartContract", function(req, res) {

  optionSmartContractOperations(req.body.curOption);
  // res.status(200).send({});

});

router.post("/appendToIPFS", function(req, res) {
  // console.log('body to here', req.body);
  const result = IPFS.sendToIPFS(req.body);
  res.send({ response: result });
});

router.post("/authenticate", function(req, res, next) {
  const body = req.body;
  const token = auth.getJWTForSignedMessage(body.data, body.signature, body.sender);
  if (token) {
    // TODO(eforde): make cookie secure over https!!!!
    res.cookie("authtoken", token, { httpOnly: true /*, secure: true */ });
    res.status(200).send({ success: true });
    return;
  }
  res.status(400).send({ success: false });
});


module.exports = router;
