const maxGasProvided = 1000000; //gas limit max 4665264   860444 used for create/deposit!
const gasPrice = "20000000000"; // 20 Gwei (next few blocks ~ few seconds)
const orderBookAddress = "0x.."
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
  fallbackValues.from = optionSmartContract;
  // can put back args..maturityDate, strikePrice, optionSmartContract
  orderBookContractInstance.addOption(fallbackValues,
    (err, res) => {
      if (err) {
        console.log(err);
        alert("Error with adding to order book", err);
      }
      else {
        txnHash = res.toString();
        console.log(txnHash);
        // now txn pending..
        prom = getTransactionReceiptMined(txnHash, 2000, 95);
        prom.then(function(receipt) {
          if (receipt.status == "0x1") {
            alert("Option Added to Order Book!");
          }
          else {
            console.log("no way to debug on testnet");
            alert("Option Unable to be added.");
          }
        }, function(error) {
          alert("Option Unable to be added");
          console.log(error);
        });
      }
    });
}

function removeFromOrderBook(optionSmartContract) {

  fallbackValues.from = optionSmartContract;

  // can put back args..maturityDate, strikePrice, optionSmartContract
  orderBookContractInstance.deleteActivatedOption(fallbackValues,
    (err, res) => {
      if (err) {
        console.log(err);
        alert("Error with removing from order book", err);
      }
      else {
        txnHash = res.toString();
        console.log(txnHash);
        // now txn pending..
        prom = getTransactionReceiptMined(txnHash, 2000, 95);
        prom.then(function(receipt) {
          if (receipt.status == "0x1") {
            alert("Option removed from Order Book!");
          }
          else {
            console.log("no way to debug on testnet");
            alert("Option Unable to be removed.");
          }
        }, function(error) {
          alert("Option Unable to be removed");
          console.log(error);
        });
      }
    });

}


function getInactiveOptionInfo(maturityDate, strikePriceUSD, cb) {
  orderBookContractInstance.queryOrderBook(maturityDate, strikePriceUSD, fallbackValues,
    (err, res) => {
      if (err) {
        console.log(err);
        alert("Error with querying order book", err);
      }
      else {
        txnHash = res.toString();
        console.log(txnHash);
        // now txn pending..
        prom = getTransactionReceiptMined(txnHash, 2000, 95);
        prom.then(function(receipt) {
          if (receipt.status == "0x1") {
            alert("Option removed from Order Book!");

            //TODO(eforde) get addresses then querySC for info...
            cb(addresses)
          }
          else {
            console.log("no way to debug on testnet");
            alert("querying error.");
          }
        }, function(error) {
          alert("querying error");
          console.log(error);
        });
      }
    });
}
