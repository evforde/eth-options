// ---------------Exercising--------------------//

$(document).ready(function() {

  $("#exerciseOptionOffer").click(function() {


    getMetamaskAccount(function(optionExerciser) {

      const maxGasProvided = 1000000; //gas limit max 4665264   860444 used for create/deposit!
      const gasPrice = "30000000000"; // 20 Gwei (next few blocks ~ few seconds)
      const valueToSend = 403550000000000; //TODO(moezinia) = exerciseGasCost + gas in callback..

      const fallbackValues = {
        // data: bytecode,
        // data: OptionContractBinary,
        from: optionExerciser,
        gas: maxGasProvided,
        gasPrice: gasPrice,
        value: valueToSend
      }
      //TODO(moezinia) get from ejs...
      var smartContractAddress = "0xACf81CD62c1ac1663c8E136f490C22D7dFA0Da0a";

      const optionContract = web3.eth.contract(OptionContractABI, null, fallbackValues);
      const optionSmartContract = optionContract.at(smartContractAddress);

      getETHPrice((curEthPrice) => {
        optionSmartContract.exerciseExternalPrice(curEthPrice, fallbackValues,
          (err, res) => {
            if (err) {
              console.log("error exercise");
            }
            else {
              txnHash = res.toString();
              console.log("hash is ", txnHash);

              const interval = 2000;
              const blockLimit = 95;
              prom = getTransactionReceiptMined(txnHash, interval, blockLimit);

              prom.then(function(receipt) {
                if (receipt.status == "0x1") {
                  alert("Option Exercised!");
                  console.log(optionObj.contractAddress, 'contract Address exercising');
                  // TODO(moezinia) remove option from cookie
                }
                else {
                  console.log("no way to debug on testnet");
                  alert("Option Unable to be Exercised but txn mined (ie not in the money..)");
                }
              }, function(error) {
                alert("Option Unable to be Exercised. Txn not mined");
                console.log(error);
              });
            }
          }
        )
      });


      // optionSmartContract.exercise(fallbackValues,
      //   (err, res) => {
      //     if (err) {
      //       console.log(err);
      //       alert("Error with contract activation", err);
      //     }
      //     else {
      //       txnHash = res.toString();
      //       console.log(txnHash);
      //       // now txn pending..
      //       const interval = 2000;
      //       const blockLimit = 95;
      //       prom = getTransactionReceiptMined(txnHash, interval, blockLimit);
      //       prom.then(function(receipt) {
      //         if (receipt.status == "0x1") {
      //           alert("Option Exercised!");
      //           console.log(optionObj.contractAddress, 'contract Address exercising');
      //           // TODO(moezinia) remove option from cookie
      //         }
      //         else {
      //           console.log("no way to debug on testnet");
      //           alert("Option Unable to be Exercised but txn mined (ie not in the money..)");
      //         }
      //       }, function(error) {
      //         alert("Option Unable to be Exercised. Txn not mined");
      //         console.log(error);
      //       });
      //     }
      //   });



    });

  });

});
