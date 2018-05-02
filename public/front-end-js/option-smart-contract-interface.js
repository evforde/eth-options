// const fs = require('fs');
// const solc = require('solc');

class optionSmartContractInterface {

  constructor(_optionObj) {
    this.optionObj = _optionObj;
  }

  instantiateOptionSmartContract() {
    // Compile the source code
    //TODO could use a new FileReader that compiles...
    // const input = fs.readFileSync('./contracts/Option.sol', 'utf8');
    // const output = solc.compile(input, 1);
    // // console.log(output, "output");
    // const bytecode = output.contracts[':Option'].bytecode;
    // // abi is jsoninterface https://web3js.readthedocs.io/en/1.0/glossary.html#glossary-json-interface
    // const abi = JSON.parse(output.contracts[':Option'].interface);

    const fallbackValues = {
      // data: bytecode,
      data: OptionContractBinary,
      from: this.optionObj.optionCreatorAddress,
      //TODO(moezinia) optimize gas and price..
      gas: 400000, //gas limit max 4665264
      gasPrice: '200000000000' // 20 Gwei (next few blocks ~ few seconds)
    }
    // const optionContract = web3.eth.contract(OptionContractABI);
    const optionContract = web3.eth.contract(OptionContractABI, null, fallbackValues);
    this.optionContract = optionContract;

    const constructorArgs = [this.optionObj.type, this.optionObj.ETHStrikePrice,
      this.optionObj.maturityDate, this.optionObj.offerExpiry,
      this.optionObj.premiumPrice, this.optionObj.optionCreatorType];

    const optionSmartContract = optionContract.new(constructorArgs[0],
      constructorArgs[1], constructorArgs[2], constructorArgs[3],
      constructorArgs[4], constructorArgs[5],
      fallbackValues, function(err, data) {
        // callback fires multiple times...
        if (err) {
          console.log(err);
          return;
        }
        if (data && data.address === undefined) {
          console.log("waiting for someone to mine block...");
          console.log("txn ", data.transactionHash, "follow progress at https://ropsten.etherscan.io/tx/" + data.transactionHash);
        }
        if (data.address) {
          console.log("successfully deployed contract at ", data.address);
          console.log("contract info ", data);
          // data.owner(function(err, data) {
          //   console.log("owner of contract is ", err || data);
          // });
          return data.address;
        }
      });
  }

  despositFunds(smartContractAddress, optionObj) {
  console.log("DESPOSITING FUNDS INTO ", smartContractAddress);
  if (!smartContractAddress) {
    console.log("ERROR DEPLOYING Contract");
  }
  else {
    const optionSmartContractInstance = this.optionContract.at(smartContractAddress);
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
