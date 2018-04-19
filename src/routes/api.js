// BACK END api
const express = require('express');
const router = express.Router();

// local dependencies
const IPFS = require("../back-end-js/IPFS.js");



// GETs

router.get("/getFromIPFS", function(req, res) {
    //TODO fix
    data = IPFS.getFromIPFS(req.body);
    res.send(data);
});


// POSTs


router.post("/appendToIPFS", function(req, res) {

    // console.log(req, ' monkey ', res);
    // console.log('body to here', req.body);
    IPFS.sendToIPFS(req.body);
    res.send({response: "success"});

    // res.send
});


module.exports = router;
