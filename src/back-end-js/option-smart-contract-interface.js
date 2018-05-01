const fs = require('fs');
const solc = require('solc');
// var web3;
var Web3 = require('web3');
var web3 = new Web3();
// // var web3 = new Web3(web3.currentProvider);
// // web3.setProvider(new web3.providers.HttpProvider());
// // web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
web3.setProvider(new web3.providers.HttpProvider("http://localhost:7545"))






class optionSmartContractOperations {

  constructor(_optionObj) {
    this.optionObj = _optionObj;

  }

  instantiateOptionSmartContract(optionObj) {
    //TODO in case this doesn't work https://github.com/ethereum/wiki/wiki/JavaScript-API#web3ethsendtransaction
    // Compile the source code
    const input = fs.readFileSync('./contracts/Option.sol', 'utf8');
    const output = solc.compile(input, 1);
    // console.log(output, "output");
    const bytecode = output.contracts[':Option'].bytecode;
    // abi is jsoninterface https://web3js.readthedocs.io/en/1.0/glossary.html#glossary-json-interface
    const abi = JSON.parse(output.contracts[':Option'].interface);


    const fallbackValues = {
      data: bytecode,
      from: optionObj.optionCreatorAddress,
      gas: 90000*2,
      gasPrice: '20000000000'
    }

    const optionSmartContract = new web3.eth.Contract(abi, null, fallbackValues);
    optionSmartContract.deploy({
      data: bytecode,
      arguments: [optionObj.type, optionObj.ETHStrikePrice,
      optionObj.maturityDate, optionObj.offerExpiry,
      optionObj.premiumPrice, optionObj.optionCreatorType]
    })
    .send(fallbackValues, (err, txnHash) => {console.log(err, txnHash)})
    .on("error", (err) => {console.log("ERR", err)})
    .on("transactionHash", (txn) => {console.log(txn)})
    .on("receipt", (rec) => {console.log(rec.contractAddress)})
    .on("confirmation", (confNumber, receipt) => {console.log(confNumber, receipt)})
    .then(function(optionSmartContractInstance){
        console.log(optionSmartContractInstance.options.address, ' new address');
    });

    // return smartContractAddress, optionSmartContractInstance;

  }

  despositFunds(smartContractAddress, optionObj, optionSmartContractInstance) {
  if (!smartContractAddress) {
    console.log("ERROR DEPLOYING Contract");
  }

  else {
    const maxGasProvided = 40000; //min txn is 21000
    const weiPerGas = 30000000000; // or 20000000000
    // desposit premium
    if (optionObj.optionCreatorType == "holder") {
      const premiumWei = web3.toWei(premiumPrice, 'ether');
      const transactionObj = {from: optionObj.optionCreatorAddress,
        to:smartContractAddress, value: premiumWei,
        gas: maxGasProvided, gasPrice: weiPerGas}
        // true is option buyer / holder
      optionSmartContractInstance.initialDeposit(premiumWei, true, transactionObj, (res) => {
        if (res == "failure") {
          console.log("FAILURE to Desposit Funds. Abort!");
        }
      });
    }
    //desposit collateral
    if (optionObj.optionCreatorType == "writer") {
      const collateralWei = web3.toWei(numberETH, 'ether');
      const transactionObj = {from: optionObj.optionCreatorAddress,
        to:smartContractAddress, value: collateralWei,
        gas: maxGasProvided, gasPrice: weiPerGas}
        // true is option buyer / holder
      optionSmartContractInstance.initialDeposit(collateralWei, true, transactionObj, (res) => {
        if (res == "failure") {
          console.log("FAILURE to Desposit Funds. Abort!");
        }
      });
    }
    else {
      console.error("SHOULD only be writer or holder!");
    }
  }
}




  addSmartContractAddress(smartContractAddress, optionSmartContract) {
    // add address of smart contract
    // const smartContractAddress = optionSmartContract.at(address);?
    optionSmartContract.options.address = smartContractAddress;
  }
}


module.exports = {optionSmartContractOperations: optionSmartContractOperations};
