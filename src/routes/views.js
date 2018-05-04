// dependencies
const express = require("express");
const router  = express.Router();
const solc    = require("solc");
const fs      = require("fs");



// Option Smart Contract


var optionContractABI;
var optionContractBinary;

fs.readFile("./public/contracts/__contracts_Option_sol_Option.abi", "ascii", function(err, data) {
  if (err)
    throw err;  // make sure you've compiled the smart contracts!
  optionContractABI = JSON.stringify(data);
});

fs.readFile("./public/contracts/__contracts_Option_sol_Option.bin", "ascii", function(err, data) {
  if (err)
    throw err;  // make sure you've compiled the smart contracts!
  optionContractBinary = data;
});

//TODO fetch all options (unfulfilled) from IPFS
const unfulfilledOptions = [];



router.get("/", function(req, res, next) {
  res.render("index");
});

router.get("/index", function(req, res, next) {
  res.redirect("/");
});

router.get("/dashboard", function(req, res, next) {
  // console.log("ABI:", tradingAccountABI);
  res.render("dashboard", {
    user: req.user,
    // tradingAccountABI: tradingAccountABI,
    // tradingAccountBinary: tradingAccountBinary,
    optionContractABI: optionContractABI,
    optionContractBinary: optionContractBinary
    //TODO(moezinia) unfulfilledOptions: unfulfilledOptions
  });
});

router.get("/unfulfilled", function(req, res, next) {
  // could add authentication here... if authetnicated:
  res.render("unfulfilled_options", { user: req.user });
});




module.exports = router;
