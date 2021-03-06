// dependencies
const express  = require("express");
const router   = express.Router();
const solc     = require("solc");
const fs       = require("fs");
const ethPrice = require("../back-end-js/eth-price.js");

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
var orderBookBinary;
var orderBookABI;



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

fs.readFile("./public/contracts/__contracts_OrderBook_sol_OrderBook.bin", "ascii", function(err, data) {
  if (err)
    throw err;  // make sure you've compiled the smart contracts!
  orderBookBinary = data;
});

fs.readFile("./public/contracts/__contracts_OrderBook_sol_OrderBook.abi", "ascii", function(err, data) {
  if (err)
    throw err;  // make sure you've compiled the smart contracts!
  orderBookABI = JSON.stringify(data);
});



//
// views
//

router.get("/", function(req, res, next) {
  res.render("index", {
    ethPrice: ethPrice.getEthPrice()
  });
});

router.get("/index", function(req, res, next) {
  res.redirect("/");
});

router.get("/dashboard", function(req, res, next) {
  // console.log("ABI:", tradingAccountABI);
  res.render("dashboard", {
    user: req.user,
    optionContractABI: optionContractABI,
    tradingAccountABI: tradingAccountABI,
    tradingAccountBinary: tradingAccountBinary,
    ethPrice: ethPrice.getEthPrice()
  });
});

router.get("/exchange", function(req, res, next) {
  res.render("exchange", {
    user: req.user,
    orderBookABI: orderBookABI,
    orderBookBinary: orderBookBinary,
    ethPrice: ethPrice.getEthPrice()
  });
});

router.get("/trade", function(req, res, next) {
  if (!req.query || !req.query.strike || !req.query.date) {
    res.redirect("/exchange");
  }
  res.render("trade", {
    user: req.user,
    strike: req.query.strike,
    date: req.query.date,
    optionContractABI: optionContractABI,
    optionContractBinary: optionContractBinary,
    orderBookABI: orderBookABI,
    ethPrice: ethPrice.getEthPrice()
  });
});


module.exports = router;
