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
    const result = auth.authenticate(req.body);
    res.send({ response: result });
});


module.exports = router;
