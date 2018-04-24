const fs = require('fs');
const solc = require('solc');
const web3 = require('web3');

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
  // // Getter
  // get area() {
  //   return this.calcArea();
  // }
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
    optionCreatorType = "buyer or seller";
    optionCreatorAddress = "0x......";
    offerExpiry = $("offerExpiry").text();
    optionValue = $("numberETH").text();



    console.log('writing to ipfs');

    const curOption = new Option(maturityDate, ETHStrikePrice,
       premiumPrice, optionCreatorAddress, optionCreatorType,
      optionValue, offerExpiry)



    sendToIPFS(curOption);
  });

});



function instantiateOptionSmartContract(optionObj) {
  // Compile the source code
  const input = fs.readFileSync('Token.sol');
  const output = solc.compile(input.toString(), 1);
  const bytecode = output.contracts['Token'].bytecode;
  const abi = JSON.parse(output.contracts['Token'].interface);

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
