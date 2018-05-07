


//---------------Activate/Enter Into Option Contract----------------------//

$(document).ready(function() {
  // # id . class
  $("#acceptOptionOffer").click(function() {


    //TODO(moezinia) no object, just take from UI
    optionObj = $("optionObject"); // use ejs (res.render(optionObj) var client side)
    optionObj = testOptionObj;
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
        var valueToSend = web3.toWei(this.optionObj.premiumPrice, 'ether');
      }
      else {
        var valueToSend = this.optionObj.underlyingAmount; // already in wei
      }

      const fallbackValues = {
        // data: bytecode,
        // data: OptionContractBinary,
        from: this.optionObj.optionFulfillerAddress,
        gas: maxGasProvided,
        gasPrice: gasPrice,
        value: valueToSend
      }

      const optionContract = web3.eth.contract(OptionContractABI, null, fallbackValues);
      const optionSmartContract = optionContract.at(optionObj.smartContractAddress);
      optionSmartContract.activateContract(optionFulfillerType, fallbackValues,
        (err, res) => {
          if (err) {
            console.log(err);
            alert("Error with contract activation", err);
          }
          else {
            console.log(res);
            txnHash = res.toString();
            txnHash = "0xce425ef72015748509d2914c3e1b6ad742bc3533aa921a1ba0f14602314b7c7d";// successful txn..
            // now txn pending..
            // activateContract(optionSmartContract, optionFulfillerType, fallbackValues);
            prom = getTransactionReceiptMined(txnHash, 600, 15);
            prom.then(function(receipt) {
              if (receipt.status == "0x1") {
                alert("Option Activated!")
              }
              else {
                alert("Option Unable to be Activated. Please check Option Details");
              }
            }, function(error) {
              console.log(error);
            });
          }
        });
      });
    });
  });


function activateContract(optionSmartContract, optionFulfillerType, fallbackValues) {
  //TODO(moezinia) fix
  // optionSmartContract.activateContract(optionFulfillerType).send(fallbackValues,
  // (err, res) => {
  //   console.log(res);
  // })

  optionSmartContract.activateContract(optionFulfillerType, fallbackValues,
    (err, res) => {

      console.log(res);
    });
}

  // .on("transactionHash", (txnHash) => console.log(txnHash));

  // optionSmartContract.activateContract(optionFulfillerType, fallbackValues,
    // (err, res) => {
    //   if (err) {
    //     console.log(err);
    //     alert("Error with contract activation", err);
    //   }
    //   else {
    //     console.log(res);
    //     txnHash = res.toString();
    //     // now txn pending..

        // once txn mined, then get receipt to evaluate success of call....

        // web3.eth.getTransactionReceipt(txnHash, (txnErr, txnRes) => {
        //   console.log('givign ', txnErr, txnRes);
        //   if (txnErr) {
        //     console.log("error getting txn receipt");
        //   }
        //   else {
        //     console.log(txnRes);
        //     console.log(txnRes.status);
        //     if (txnRes.status == "0x1") {
        //       optionObj.active = true;
        //       //TODO(moezinia) set cookie with smart contract and account address
        //       //or just optionObj?
        //     }
        //     if (txnRes.status == "0x0") {
        //       console.log("can not activate contract");
        //       alert("No way to debug until using geth");
        //     }
        //   }
        // });



function getTransactionReceiptMined(txHash, interval, blockLimit) {
  var count = 0;
  var blocks = blockLimit;

  const transactionReceiptAsync = function(resolve, reject) {
      if (count > blocks) {
        reject(blocks + " done sorry");
        // reject('Contract transaction couldn\'t be found after ', blocks, ' blocks');
        return;
      }

      web3.eth.getTransactionReceipt(txHash, (error, receipt) => {
          if (error) {
            console.log("promise error", error);
            reject(error);
          } else if (receipt == null) {
              setTimeout(
                  () => transactionReceiptAsync(resolve, reject),
                  interval ? interval : 500);
          } else {
              resolve(receipt);
          }
      });

      count++;
  };

  if (Array.isArray(txHash)) {
      return Promise.all(txHash.map(
          oneTxHash => web3.eth.getTransactionReceiptMined(oneTxHash, interval)));
  } else if (typeof txHash === "string") {
      return new Promise(transactionReceiptAsync);
  } else {
      throw new Error("Invalid Type: " + txHash);
  }
};
