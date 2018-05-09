//---------------Activate/Enter Into Option Contract----------------------//

$(document).ready(function() {
  // # id . class
  $("#acceptOptionOffer").click(function() {


    //TODO(moezinia) no object, just take from UI
    optionObj = $("optionObject"); // use ejs (res.render(optionObj) var client side)
    const testOptionObj = {"underlyingAmount":1000000000000000000,
    "maturityDate":9999999999999,
    "ETHStrikePrice":100,
    "premiumPrice":1, //eth TODO change to 0.69 to differentiate prem vs underying
    "optionCreatorAddress":"0x3ce56307bb3dde4d831170b40f9148b934a778e9",
    "optionCreatorType":false,
    "optionType":false,
    "active":false,
    "smartContractAddress":"0xACf81CD62c1ac1663c8E136f490C22D7dFA0Da0a"};
    optionObj = testOptionObj;


    contractAddress = optionObj.contractAddress;
    optionFulfillerType = !optionObj.optionCreatorType;


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
            txnHash = res.toString();
            console.log(txnHash);
            // txnHash = "0xce425ef72015748509d2914c3e1b6ad742bc3533aa921a1ba0f14602314b7c7d";// successful txn..
            // now txn pending..
            // activateContract(optionSmartContract, optionFulfillerType, fallbackValues);
            prom = getTransactionReceiptMined(txnHash, 2000, 95);
            prom.then(function(receipt) {
              if (receipt.status == "0x1") {
                alert("Option Activated!");
                optionObj.active = true;
                console.log(optionObj.contractAddress, 'bye');
                setBrowserCookie(optionObj);
                //TODO(moezinia) also need to remove from order book contract...
              }
              else {
                console.log("no way to debug on testnet");
                alert("Option Unable to be Activated. Please check Option Details");
              }
            }, function(error) {
              alert("Option Unable to be Activated. Please check Option Details");
              console.log(error);
            });
          }
        });


      });
    });
  });


function getTransactionReceiptMined(txHash, interval, blockLimit) {
  var count = 0;
  var blocks = blockLimit;

  const transactionReceiptAsync = function(resolve, reject) {
      if (count > blocks) {
        reject(blocks + " blocks mined but no txn receipt!");
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
