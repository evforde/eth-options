class Option {
  constructor(maturity, ETHStrikePrice, ETHcurrent, optionPrice, user) {
      this.maturity = maturity
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



$(document).ready(function() {

$("#optionOffer").click(function() {
  // use jQueryc to get option params

  maturity = "2019:01:01";
  ETHStrikePrice = "$1000"
  ETHcurrent = "$500";
  optionPrice = "$10";
  console.log('writing to ipfs');
  const curOption = new Option(maturity, ETHStrikePrice, ETHcurrent, optionPrice, 'ricky')

  sendToIPFS(curOption);
});

});
