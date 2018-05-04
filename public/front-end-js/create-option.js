class callOption {
  constructor(maturityDate, ETHStrikePrice,
    premiumPrice, optionCreatorAddress,
    optionCreatorType, optionValue, offerExpiry) {
    this.underlyingAmount = 1000000000000000000; //1 eth in wei
    this.maturityDate = maturityDate;
    this.ETHStrikePrice = ETHStrikePrice;
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

$(document).ready(function() {

  $("#createOptionOffer").click(function() {
    maturityDate = $("maturity").text();
    ETHStrikePrice = $("ETHStrikePrice").text();
    premiumPrice = $("premiumPrice").text();
    //buyer/holder = True, seller/writer = False.
    optionCreatorType = true;//or writer TODO how to do this nicely in UI - create bid /create ask>?
    offerExpiry = $("offerExpiry").text();

    //TODO remove, just for testing
    premiumPrice = 0.1;
    offerExpiry = 100;
    ETHStrikePrice = 2;
    maturityDate = 100;
    //TODO


    // TODO unless use tradingaccount ?
    getMetamaskAccount(function(optionCreatorAddress) {


      const curOption = new callOption(maturityDate, ETHStrikePrice,
        premiumPrice, optionCreatorAddress, optionCreatorType,
        offerExpiry);

      // instantiateOptionSmartContract
      const interfaceInstance = new optionSmartContractInterface(curOption);
      // smartContractAddress, optionSmartContractInstance = interfaceInstance.instantiateOptionSmartContract(optionObj);
      smartContractAddress = interfaceInstance.instantiateOptionSmartContract(curOption);
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
      // console.log("result from post is", res);
      return res;
    }
  });
}
