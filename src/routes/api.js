// BACK END api
const express = require('express');
const router = express.Router();

// local dependencies
const IPFS = require("../back-end-js/IPFS.js");



// GETs

// api endpoints... use for authentication!!!!!!!!
// router.get('/whoami', function(req, res) {
//
//     if(user in database....) {
//         res.send(req.user);
//     }
//     else{
//         res.send({});
//     }
// });


// POSTs


router.post("/appendToIPFS", function(req, res) {

    // console.log(req, ' monkey ', res);
    // console.log('body to here', req.body);
    IPFS.sendToIPFS(req.body);
    res.send({response: "success"});

    // res.send
});


module.exports = router;
