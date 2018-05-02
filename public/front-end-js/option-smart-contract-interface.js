// const fs = require('fs');
// const solc = require('solc');

class optionSmartContractInterface {

  constructor(_optionObj) {
    this.optionObj = _optionObj;
    //TODO(moezinia) optimize gas and price..
    this.maxGasProvided = 1000000; //gas limit max 4665264   860444 used for create/deposit!
    this.gasPrice = "20000000000"; // 20 Gwei (next few blocks ~ few seconds)
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

    // true is holder/buyer, false writer
    if (this.optionObj.optionCreatorType) {
      const valueToSend = web3.toWei(this.optionObj.premiumPrice, 'ether');
    }
    else {
      const valueToSend = this.optionObj.underlyingAmount; // already in wei
    }

    const fallbackValues = {
      // data: bytecode,
      data: OptionContractBinary,
      from: this.optionObj.optionCreatorAddress,
      gas: this.maxGasProvided,
      gasPrice: this.gasPrice,
      value: valueToSend
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
          return data.address;
        }
      });
  }

  // addSmartContractAddress(smartContractAddress, optionSmartContract) {
  //   // add address of smart contract
  //   // const smartContractAddress = optionSmartContract.at(address);?
  //   optionSmartContract.options.address = smartContractAddress;
  // }
}
