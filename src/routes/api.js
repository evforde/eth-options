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
