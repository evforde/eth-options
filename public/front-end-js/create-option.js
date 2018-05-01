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
    this.optionType = false; //call option...
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
    offerExpiry = $("offerExpiry").text();
    optionValue = $("numberETH").text();

    // get tradingAccountAddress for this metamask user address!
    // optionCreatorAddress = web3.eth.contracts[0] //TODO correct? from metamask...


    getMetamaskAccount(function(optionCreatorAddress) {


      const curOption = new callOption(maturityDate, ETHStrikePrice,
         premiumPrice, optionCreatorAddress, optionCreatorType,
        optionValue, offerExpiry);

      $.ajax({
        type: "POST",
        url: "/api/deployOptionSmartContract",
        data: curOption,
        dataType: "json",
        async: true,
        error: (err) => {
          console.log(err, "error from deployOptionSmartContract post");
          // alert("ERROR deploying smart contract");
          return err;
        },
        success: (res) => {
          console.log("result from deployOptionSmartContract post is", res);

          console.log('writing to ipfs');
          sendToIPFS(curOption);

          //TODO(moezinia) NEED to return the smartContractAddress in response from deploying contracts
          // set setSmartContractAddress is set in back end

          // 4) upload the optin to ipfs
          //
          // 5) update list of unfulfilled options
          //
          // 6) update list of 'my options' tab
          // update list of unfulfilled options

          //update my options tab
          return res;
        }
      });


    });

  });

});


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
