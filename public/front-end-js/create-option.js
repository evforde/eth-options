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


// ---------WORKFLOW FOR CREATING OPTION --------
//
// 1) WHEN CREATE BUTTON PRESSED LISTEN
//
// 2) CREATE OPTION CONTRACT (have unfulfilled status) (get smart contract address and save)
//
// 3) send ETH (either premium or the collateral to smart contract)
// web3.eth.sendTransaction({from: acct1, to:acct2, value: web3.toWei(1, 'ether'), gasLimit: 21000, gasPrice: 20000000000})
//
// 4) upload the optin to ipfs
//
// 5) update list of unfulfilled options
//
// 6) update list of 'my options' tab



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

    // update list of unfulfilled options

    //update my options tab
  });

});


class optionSmartContractOperation {

  constructor(optionObj) {
    this.optionObj = optionObj;
    smartContractAddress = instantiateOptionSmartContract(optionObj);

    if (!smartContractAddress) {
      console.log("ERROR DEPLOYING Contract");
    }
    else {
      // desposit funds
      if (optionObj.optionCreatorType == "holder") {
        const transactionObj = {from: optionObj.optionCreatorAddress,
          to:smartContractAddress, value: web3.toWei(premiumPrice, 'ether'),
          gas: 21000, gasPrice: 20000000000}
        web3.eth.sendTransaction(transactionObj, (err, result) => {
          if (!err) {
            console.log(JSON.stringify(result));
          }
          else {
            console.error(err);
          }
        });

      }


      if (optionObj.optionCreatorType == "writer") {









      }




    }

  }

  function desposit() {

  }


  //TODO add myContract.options.address = '0x1234..' (address of smart contract)

  function instantiateOptionSmartContract(optionObj) {
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
    return smartContractAddress;

  }


  function addSmartContractAddress(optionObj, address, optionSmartContract) {
    // add address of smart contract
    const deployedContract = optionSmartContract.at(address);
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
