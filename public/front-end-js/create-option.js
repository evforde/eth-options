const fs = require('fs');
const solc = require('solc');

// already done in metamask.js ?
// var Web3 = require('web3');
// var web3 = new Web3();
// Connected already, right?
// const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));


class callOption {
  constructor(maturityDate, ETHStrikePrice,
    premiumPrice, optionCreatorAddress,
    optionCreatorType, optionValue, offerExpiry) {
    this.maturityDate = maturityDate;
    this.ETHStrikePrice = ETHStrikePrice;
    this.premiumPrice = premiumPrice
    this.optionCreatorAddress = optionCreatorAddress;
    this.optionCreatorType = optionCreatorType;
    this.optionValue = optionValue;
    // only allow fulfillemnt before certain datetime
    this.offerExpiry = offerExpiry;
  }

  set setSmartContractAddress(address) {
    this.contractAddress = address;
  }

  // Getters
  get contractAddress() {
    return this.contractAddress;
  }
}

$(document).ready(function() {

  $("#createOptionOffer").click(function() {
    maturityDate = $("maturity").text();
    ETHStrikePrice = $("ETHStrikePrice").text();
    premiumPrice = $("premiumPrice").text();
    optionCreatorType = "writer";//or holder TODO how to do this nicely in UI - create bid /create ask>?
    optionCreatorAddress = web3.eth.contracts[0] //TODO correct? from metamask...
    offerExpiry = $("offerExpiry").text();
    optionValue = $("numberETH").text();



    console.log('writing to ipfs');

    const curOption = new Option(maturityDate, ETHStrikePrice,
       premiumPrice, optionCreatorAddress, optionCreatorType,
      optionValue, offerExpiry)


    const smartContractInstance = optionSmartContractOperation(curOption);
    sendToIPFS(curOption);
    // 4) upload the optin to ipfs
    //
    // 5) update list of unfulfilled options
    //
    // 6) update list of 'my options' tab
    // update list of unfulfilled options

    //update my options tab
  });

});


class optionSmartContractOperation {

  constructor(optionObj) {
    this.optionObj = optionObj;
    smartContractAddress, optionSmartContractInstance = instantiateOptionSmartContract(optionObj);
    despositFunds(smartContractAddress, optionObj, optionSmartContractInstance);
  }

  function despositFunds(smartContractAddress, optionObj, optionSmartContractInstance) {
    if (!smartContractAddress) {
      console.log("ERROR DEPLOYING Contract");
    }
    else {
      // desposit funds
      if (optionObj.optionCreatorType == "holder") {
        const premiumWei = web3.toWei(premiumPrice, 'ether');
        const transactionObj = {from: optionObj.optionCreatorAddress,
          to:smartContractAddress, value: premiumWei,
          gas: 21000, gasPrice: 20000000000}
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
          gas: 21000, gasPrice: 20000000000}
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



  function instantiateOptionSmartContract(optionObj) {

  //TODO in case this doesn't work https://github.com/ethereum/wiki/wiki/JavaScript-API#web3ethsendtransaction
    const smartContractAddress;
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


  function addSmartContractAddress(optionObj, smartContractAddress, optionSmartContract) {
    // add address of smart contract
    // const deployedContract = optionSmartContract.at(address);
    optionSmartContract.options.address = smartContractAddress
    // if options are mutable...
    optionObj.setSmartContractAddress(address);
  }



}







function sendToIPFS(payload) {
  $.ajax({
    type: "POST",
    url: "/api/appendToIPFS",
    data: {
      data: payload,
      maturity: payload.maturity
    },
    error: function(err) {
      console.log(err, "error from post");
      return err;
    },
    success: function(res) {
      console.log("result from post is", res);
      return res;
    }
  });
}
