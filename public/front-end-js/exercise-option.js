// ---------------Exercising--------------------//

$(document).ready(function() {

  $("#exerciseOptionOffer").click(function() {


    getMetamaskAccount(function(optionExerciser) {

      const maxGasProvided = 1000000; //gas limit max 4665264   860444 used for create/deposit!
      const gasPrice = "20000000000"; // 20 Gwei (next few blocks ~ few seconds)
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
      var smartContractAddress = "TODO";

      const optionContract = web3.eth.contract(OptionContractABI, null, fallbackValues);
      const optionSmartContract = optionContract.at(smartContractAddress);
      optionSmartContract.exercise(fallbackValues,
        (err, res) => {
          if (err) {
            console.log(err);
            alert("Error with contract activation", err);
          }
          else {
            txnHash = res.toString();
            console.log(txnHash);
            // txnHash = "0xce425ef72015748509d2914c3e1b6ad742bc3533aa921a1ba0f14602314b7c7d";// successful txn..
            // now txn pending..
            const interval = 600;
            const blockLimit = 5;
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
        });

    });

  });

});
