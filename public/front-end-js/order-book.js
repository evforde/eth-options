const maxGasProvided = 1000000; //gas limit max 4665264   860444 used for create/deposit!
const gasPrice = "20000000000"; // 20 Gwei (next few blocks ~ few seconds)
const orderBookAddress = "0x743EfAD0CC1c2BB75704671fe6B2F6911E9d1eAE";
var orderBookContract;
var orderBookContractInstance;

$(document).ready(() => {
  orderBookContract = web3.eth.contract(OrderBookABI, null, fallbackValues);
  orderBookContractInstance = orderBookContract.at(orderBookAddress);
});

const fallbackValues = {
  // data: OptionContractBinary,
  gas: maxGasProvided,
  gasPrice: gasPrice
}

function addToOrderBook(optionSmartContract, maturityDate, strikePrice) {
  // fallbackValues.from = optionSmartContract;
  alert("adding to order book");
  orderBookContractInstance.addOption(optionSmartContract, fallbackValues,
    (err, txnHash) => {
      onMined(txnHash, res => {
        if (res.success) {
          alert("Option Added To Order Book");
        }
        else {
          alert("can't add to OB");
        }
      });
    });
}

function removeFromOrderBook(optionSmartContract) {

  fallbackValues.from = optionSmartContract;
  // can put back args..maturityDate, strikePrice, optionSmartContract
  orderBookContractInstance.deleteActivatedOption(optionSmartContract, fallbackValues,
      (err, txnHash) => {
      onMined(txnHash, res => {
        if (res.success) {
          showNotifyPopup(
            "Option Deleted From Order Book",
            "Done",
            txnHash,
            false
          );
        }
        else {
          alert("can't delete form OB");
        }
      });
  });
}


function getInactiveOptionInfo(maturityDate, strikePriceUSD, cb) {
  //TODO(moezinia) use this
  // isActive = optionSmartContract.isActive.call(
  //   (err, res) => {
  //     if (err) {
  //       console.log("error retrieving from ", scAddress);
  //     }
  //     else {
  //       curOption.isActive = res;
  //     }
  //   }
  // );

  orderBookContractInstance.queryOrderBook.call(maturityDate, strikePriceUSD, fallbackValues,
    (err, res) => {
      if (err) {
        alert('query error');
      }
      else {
        console.log(res);
      }
    }
  )

  // orderBookContractInstance.queryOrderBook(maturityDate, strikePriceUSD, fallbackValues,
  //   (err, res) => {
  //     if (err) {
  //       console.log(err);
  //       alert("Error with querying order book", err);
  //     }
  //     else {
  //       txnHash = res.toString();
  //       console.log(txnHash);
  //       // now txn pending..
  //       prom = getTransactionReceiptMined(txnHash, 2000, 95);
  //       prom.then(function(receipt) {
  //         if (receipt.status == "0x1") {
  //           alert("Option removed from Order Book!");
  //
  //           //TODO(eforde) get addresses then querySC for info...
  //           cb(addresses)
  //         }
  //         else {
  //           console.log("no way to debug on testnet");
  //           alert("querying error.");
  //         }
  //       }, function(error) {
  //         alert("querying error");
  //         console.log(error);
  //       });
  //     }
  //   });


}
