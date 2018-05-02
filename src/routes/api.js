// BACK END api
const express = require('express');
const router = express.Router();

// local dependencies
const IPFS = require("../back-end-js/IPFS.js");
const auth = require("../back-end-js/metamask-auth.js");

// GETs

router.get("/getFromIPFS", function(req, res) {
  //TODO fix
  const data = IPFS.getFromIPFS(req.body);
  res.send(data);
});


// POSTs
// dont in front end
// router.post("/deployOptionSmartContract", function(req, res) {
//   // console.log(req);
//   const optionObj = req.body;
//   const smartContractAddress = "";
//   console.log(optionObj, " API hit for deploying smart contract for option")
//   newContract = new optionSmartContract.optionSmartContractOperations(optionObj);
//   smartContractAddress, optionSmartContractInstance = newContract.instantiateOptionSmartContract(optionObj);
//   // newContract.despositFunds(smartContractAddress, optionObj, optionSmartContractInstance);
//   // res.status(200).send({smartContractAddress: smartContractAddress});
// });

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
