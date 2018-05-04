// dependencies
const express = require("express");
const router  = express.Router();
const solc    = require("solc");
const fs      = require("fs");

//
// setup
//

// const source = fs.readFileSync('./contracts/TradingAccount.sol', 'utf8');
// const compiledContract = solc.compile(source, 1);
// const abi = JSON.stringify(compiledContract.contracts['nameContract'].interface);
// const bytecode = compiledContract.contracts['nameContract'].bytecode;

var tradingAccountABI;
var tradingAccountBinary;

fs.readFile("./public/contracts/__contracts_TradingAccount_sol_TradingAccount.abi", "ascii", function(err, data) {
  if (err)
    throw err;  // make sure you've compiled the smart contracts!
  tradingAccountABI = JSON.stringify(data);
});

fs.readFile("./public/contracts/__contracts_TradingAccount_sol_TradingAccount.bin", "ascii", function(err, data) {
  if (err)
    throw err;  // make sure you've compiled the smart contracts!
  tradingAccountBinary = data;
});

//
// views
//

router.get("/", function(req, res, next) {
  res.render("index");
});

router.get("/index", function(req, res, next) {
  res.redirect("/");
});

router.get("/dashboard", function(req, res, next) {
  console.log("ABI:", tradingAccountABI);
  res.render("dashboard", {
    user: req.user,
    tradingAccountABI: tradingAccountABI,
    tradingAccountBinary: tradingAccountBinary
  });
});

router.get("/exchange", function(req, res, next) {
  res.render("exchange", {
    user: req.user
  });
});

router.get("/unfulfilled", function(req, res, next) {
  // could add authentication here... if authetnicated:
  res.render("unfulfilled_options", { user: req.user });
});




module.exports = router;
