const fs = require('fs');
const solc = require('solc');

// already done in metamask.js ?
var Web3 = require('web3');
var web3 = new Web3();


class optionSmartContractOperations {

  constructor(optionObj) {
    this.optionObj = optionObj;
    smartContractAddress, optionSmartContractInstance = instantiateOptionSmartContract(optionObj);
    despositFunds(smartContractAddress, optionObj, optionSmartContractInstance);
  }

    despositFunds(smartContractAddress, optionObj, optionSmartContractInstance) {
    if (!smartContractAddress) {
      console.log("ERROR DEPLOYING Contract");
    }

    else {
      const maxGasProvided = 40000; //min txn is 21000
      const weiPerGas = 30000000000; // or 20000000000
      // desposit funds
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

  instantiateOptionSmartContract(optionObj) {

  //TODO in case this doesn't work https://github.com/ethereum/wiki/wiki/JavaScript-API#web3ethsendtransaction
    var smartContractAddress;
    // Compile the source code
    const input = fs.readFileSync('Option.sol');
    const output = solc.compile(input.toString(), 1);
    const bytecode = output.contracts[':Option'].bytecode;
    // abi is jsoninterface https://web3js.readthedocs.io/en/1.0/glossary.html#glossary-json-interface
    const abi = JSON.parse(output.contracts[':Option'].interface);

    const optionSmartContract = web3.eth.contract(abi); //const contract = new web3.eth.Contract(abi, '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe', {

    const fallbackValues = {
      // data: '0x' + bytecode, //TODO
      from: optionObj.optionCreatorAddress,
      gas: 90000*2 // TODO change
    }

    const optionSmartContractInstance = optionSmartContract.new(
      fallbackValues, (err, res) => {
      if (err) {
        console.log(err);
        return;
      }

      // Log the tx,to use eth.getTransaction()
      console.log(res.transactionHash);

      // If we have an address property, the contract was deployed
      if (res.address) {
        smartContractAddress = res.address;
        console.log('Contract address: ' + smartContractAddress);

        addSmartContractAddress(optionObj, smartContractAddress, optionSmartContract);
        // TODO test the deployed contract
        // testContract(res.address);
      }
      console.log("Error Deploying Contract!")
    });
    return smartContractAddress, optionSmartContractInstance;

  }


  addSmartContractAddress(optionObj, smartContractAddress, optionSmartContract) {
    // add address of smart contract
    // const deployedContract = optionSmartContract.at(address);
    optionSmartContract.options.address = smartContractAddress
    // if options are mutable...
    optionObj.setSmartContractAddress(address);
  }
}


module.exports = {optionSmartContractOperations: optionSmartContractOperations};
