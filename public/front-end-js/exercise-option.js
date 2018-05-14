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
      // var smartContractAddress = "0xACf81CD62c1ac1663c8E136f490C22D7dFA0Da0a";

      const optionContract = web3.eth.contract(OptionContractABI, null, fallbackValues);
      const optionSmartContract = optionContract.at(smartContractAddress);

      optionSmartContract.exerciseExternalPrice(currentETHPriceUSD, fallbackValues,
      (err, res) => {
        onMined(txnHash, res => {
          if (res.success) {
            alert('Exercised');
          }
          else {
            alert("can't exercise");
          }
        });
      });
    });
  });
});
