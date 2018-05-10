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
var optionContractABI;
var optionContractBinary;

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

// order book
fs.readFile("./public/contracts/__contracts_Option_sol_Option.bin", "ascii", function(err, data) {
  if (err)
    throw err;  // make sure you've compiled the smart contracts!
  orderBookBinary = data;
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
  // console.log("ABI:", tradingAccountABI);
  res.render("dashboard", {
    user: req.user,
    tradingAccountABI: tradingAccountABI,
    tradingAccountBinary: tradingAccountBinary,
    optionContractABI: optionContractABI,
    optionContractBinary: optionContractBinary
  });
});

router.get("/exchange", function(req, res, next) {
  res.render("exchange", {
    user: req.user
  });
});

router.get("/trade", function(req, res, next) {
  if (!req.query || !req.query.strike || !req.query.date) {
    res.redirect("/exchange");
  }
  res.render("trade", {
    user: req.user,
    strike: req.query.strike,
    date: req.query.date
  });
});

router.get("/unfulfilled", function(req, res, next) {
  // could add authentication here... if authetnicated:
  res.render("unfulfilled_options", { user: req.user });
});




module.exports = router;
