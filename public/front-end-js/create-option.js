// const fs = require('fs');
// const solc = require('solc');

class createOptionSmartContract {

  constructor(_optionObj) {
    this.optionObj = _optionObj;
    //TODO(moezinia) optimize gas and price..
    this.maxGasProvided = 4000000; //gas limit max 4665264   860444 used for create/deposit!
    this.gasPrice = "25000000000"; // 25 Gwei (next few blocks ~ few seconds)
    this.valueToSend = 0;
  }

  instantiateOptionSmartContract(curOption) {
    var smartContractAddress = "";
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
      this.valueToSend = web3.toWei(this.optionObj.premiumPrice, 'ether');
    }
    else {
      this.valueToSend = this.optionObj.underlyingAmount; // already in wei
    }

    const fallbackValues = {
      // data: bytecode,
      data: OptionContractBinary,
      from: this.optionObj.optionCreatorAddress,
      gas: this.maxGasProvided,
      gasPrice: this.gasPrice,
      value: this.valueToSend
    }
    const optionContract = web3.eth.contract(OptionContractABI, null, fallbackValues);
    this.optionContract = optionContract;
    const argz = [this.optionObj.type, this.optionObj.ETHStrikePrice,
      this.optionObj.maturityDate, this.optionObj.offerExpiry,
      this.optionObj.premiumPrice, this.optionObj.optionCreatorType];

    const optionSmartContract = optionContract.new(argz[0],
      argz[1], argz[2], argz[3],
      argz[4], argz[5],
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
          smartContractAddress = data.address;
          curOption.smartContractAddress = smartContractAddress;
          // console.log("successfully deployed contract at ", smartContractAddress);
          // console.log("contract info ", data);
          console.log(JSON.stringify(curOption), ' see if saved');
          //TODO(moezinia) call set cookie
          //TODO(moezinia) call load unactivated options into dashboard
          // 6) update list of 'my options' tab?
        }
      });
  }
}


class callOption {
  constructor(maturityDate, ETHStrikePrice,
    premiumPrice, optionCreatorAddress,
    optionCreatorType, optionValue, offerExpiry) {
    this.underlyingAmount = 1000000000000000000; //1 eth in wei
    this.maturityDate = maturityDate;
    this.ETHStrikePrice = ETHStrikePrice;
    //TODO(moezinia) this can only be integer in solidity contstrcutor. figure out how to do float
    this.premiumPrice = premiumPrice
    this.optionCreatorAddress = optionCreatorAddress;
    this.optionCreatorType = optionCreatorType;
    // only allow fulfillemnt before certain datetime
    this.offerExpiry = offerExpiry;
    this.optionType = false; //call option...
    this.active = false;
  }

  setSmartContractAddress(address) {
    this.contractAddress = address;
  }

  // Getters
  contractAddress() {
    return this.contractAddress;
  }
}


// ---------------Action JS Here--------------------//

$(document).ready(function() {

  $("#createOptionOffer").click(function() {
    maturityDate = $("maturity").text();
    ETHStrikePrice = $("ETHStrikePrice").text();
    premiumPrice = $("premiumPrice").text();
    //buyer/holder = True, seller/writer = False.
    optionCreatorType = false;// TODO how to do this nicely in UI - create bid /create ask>?
    offerExpiry = $("offerExpiry").text();

    //TODO remove, just for testing
    premiumPrice = 1;
    offerExpiry = 999999999999999;
    ETHStrikePrice = 100;
    maturityDate = 99999999999990;
    //TODO



    // TODO unless use tradingaccount ?
    getMetamaskAccount(function(optionCreatorAddress) {


      const curOption = new callOption(maturityDate, ETHStrikePrice,
        premiumPrice, optionCreatorAddress, optionCreatorType,
        offerExpiry);

      // instantiateOptionSmartContract
      const interfaceInstance = new createOptionSmartContract(curOption);
      // smartContractAddress, optionSmartContractInstance = interfaceInstance.instantiateOptionSmartContract(optionObj);
      interfaceInstance.instantiateOptionSmartContract(curOption);
    });

  });

});








// function sendToIPFS(payload) {
//   $.ajax({
//     type: "POST",
//     url: "/api/appendToIPFS",
//     data: {
//       data: payload,
//       maturity: payload.maturity
//     },
//     error: function(err) {
//       console.log(err, "error from post");
//       return err;
//     },
//     success: function(res) {
//       // console.log("result from post is", res);
//       return res;
//     }
//   });
// }
