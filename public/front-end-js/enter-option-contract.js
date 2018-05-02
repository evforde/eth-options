$(document).ready(function() {
  // # id . class
  $(".acceptOptionOffer").click(function() {

    optionObj = $("optionObject"); // use ejs (res.render(optionObj) var client side)

    contractAddress = optionObj.contractAddress;
    optionFulfillerType = !optionObj.optionCreatorType;


    //TODO remove, just for testing
    premiumPrice = 0.1;
    offerExpiry = 100;
    ETHStrikePrice = 2;
    maturityDate = 100;
    //TODO

    // TODO unless use tradingaccount ?
    getMetamaskAccount(function(optionFulfillerAddress) {
      const maxGasProvided = 1000000; //gas limit max 4665264   860444 used for create/deposit!
      const gasPrice = "20000000000"; // 20 Gwei (next few blocks ~ few seconds)

      // true is holder/buyer, false writer
      if (optionFulfillerType) {
        const valueToSend = web3.toWei(this.optionObj.premiumPrice, 'ether');
      }
      else {
        const valueToSend = this.optionObj.underlyingAmount; // already in wei
      }


      // const optionContract = web3.eth.contract(OptionContractABI);
      const optionContract = web3.eth.contract(OptionContractABI, null, fallbackValues);
      const optionSmartContract = web3.eth.contract.at(optionObj.smartContractAddress);

      const transactionObj = {
        // data: bytecode,
        data: OptionContractBinary,
        from: this.optionObj.optionFulfillerAddress,
        gas: maxGasProvided,
        gasPrice: gasPrice,
        value: valueToSend
      }

      optionSmartContract.activateContract(optionFulfillerType, true, transactionObj, (res) => {
        if (res == "failure") {
          console.log("FAILURE to Desposit Funds. Abort!");
        }
      });

      // could return success of method call.
      optionObj.active = true;


      
      //TODO(moezinia) change it to active on IPFS somehow...
      // sendToIPFS(curOption);

      // call update-order-book
      // call update - user specific tingz ' my options'
      //update my options tab



    });
  });
});
