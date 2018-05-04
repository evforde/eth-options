const Web3   = require("web3");
const fs     = require("fs");

// TODO(eforde): switch this to main network
const web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/'));

const tradingAccountABI = JSON.parse(fs.readFileSync("./public/contracts/__contracts_TradingAccount_sol_TradingAccount.abi", "ascii"));
const tradingAccountBinary = "0x" + fs.readFileSync("./public/contracts/__contracts_TradingAccount_sol_TradingAccount.bin", "ascii");
const TradingAccount = new web3.eth.Contract(tradingAccountABI);
console.log(tradingAccountABI);
console.log(tradingAccountBinary);


web3.eth.getCode("0xd8698771582225d52cdf8639fc57164a42c4f24e").then(console.log).catch(console.log);


web3.eth.getCode("0xd8698771582225d52cdf8639fc57164a42c4f24e", function(err, data) {
  console.log(err || data);
  console.log(data == tradingAccountBinary);
});

function createNewTradingAccount(account, callback) {
  // TradingAccount.deploy({
  //   data: tradingAccountBinary,
  // }).send({
  //   from: account,
  //   gas: 1000,
  //   gasPrice: "1"
  // })
  // .on("error", function(error){ 
  //   console.log("err", error);
  //  })
  // .on("transactionHash", function(transactionHash){ 
  //   console.log("tx", transactionHash);
  //  })
  // .on("receipt", function(receipt){
  //    console.log("receipt", receipt.contractAddress) // contains the new contract address
  // })
  // .on("confirmation", function(confirmationNumber, receipt){ 
  //   console.log("conf", confirmationNumber, receipt) // contains the new contract address
  //  })
  // .then(function(newContractInstance) {
  //     console.log("instance", newContractInstance.options.address) // instance with the new contract address
  // });
  
}

module.exports = {
  createNewTradingAccount: createNewTradingAccount
}