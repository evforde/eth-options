var OptionContract;

var contractAddresses = [
  "0x3ab30d2f61848c43d77ddcdda0204bedce0b2baf",
  "0x20ddfa6251940966d5fb2f35c8f69524736c91e5",
  "0xabc4e26ba55455d0c38f71ffb567cb9e061491c0",
  "0xb85dd51c9010250802175cbfcbe62f3c956758c5",
  "0xc35e6630aa1fd2b7220ed06ecaf47dc5901ca755",
  "0x747499bbd6d0cd86649c7b7ad0c057e7a4bd3397",
  "0x46a0406b97385821023685a02cf34f353ae0dc3a",
  "0x59cd4ba50f5f58f2ce8fad28d28a00cd918221b6",
  "0xce1beaa8911647359e3e9dfb97f032c7f4826ef9",
  "0xbf1adb9c16559cb45e65c6dc26396bd2e38df7bc",
  "0x9e950c72d7c65b99b2f7f40ab0cc7ca0d24c2580",
  "0xff0c08135d48b85e0531eb715dcfe3ff9a14db5d",
  "0xb81a35257bb3a9bf54b6903c3c12f560d3a25eae",
  "0x7506dfb9d5e73ca774ec47bbbb79f3ae31b364b2",
];

// We can test canceling with these
var oldContractsToCancel = [
  "0x3ba3c661223fc73b00ac553a8ba0f1180536c54b",
  "0x26503dd1f4118f572ebb46bb8b46afd29ce666c0",
  "0x7aa7629dd24a9335aed05a24df802b6d3f0346c0",
  "0xcb501c2109f2017205e418fb8e0b6904d07a3341",
  "0xff37acd39f1d49ed8cf4a9fa11c87e5d3e9b221e"
];

var bidAskTemplate;
// const orderBookAddress = "0x743EfAD0CC1c2BB75704671fe6B2F6911E9d1eAE";

function renderOption(contractAddress) {
  loadOption(contractAddress, (option) => {
    // Insertion sort contract into DOM
    let currentTime = new Date().getTime() / 1000;
    if (option.isActive || option.cancellationTime <= currentTime) {
      console.log("Omitting canceled or activated contract: ", option);
      return;  // Don't include already active options or cancelled contracts
    }
    let bidOrAsk = option.optionCreatorType;
    let optionItem = {
      partyAddress: bidOrAsk ? option.optionBuyer : option.optionSeller,
      partyType: bidOrAsk,
      contractAddress: option.addr,
      premium: option.premiumAmount / 1e18
    }
    insertByPrice(bidOrAsk, optionItem);
    bindEventHandlers();
  });
}

$(document).ready(function() {
  OptionContract = web3.eth.contract(OptionContractABI);

  $.get('/static/ejs/bid-ask-item.ejs', function (template) {
    bidAskTemplate = ejs.compile(template);
    for (let i in contractAddresses) {
      renderOption(contractAddresses[i]);
    }
  });

  $("#new-bid-button").click(function() {
    showPopup(
      "Buy " + date + " $" + strike + " call",
      "You will immediately pay the premium, but you may cancel your order " +
      "any time before another user takes the sell side. If your " +
      "order remains unfufilled, it will be canceled in 24 hours. Once your " +
      "order is activated, you will have the right to exercise your option " +
      " if it is in the money before expiry.",
      "premium (eth)",
      function(input) {
        return parseFloat(input);
      },
      function(resp) {
        if (!resp.success)
          return;
          deployOptionContract(parseFloat(resp.input), true);
      }
    );
  });

  $("#new-ask-button").click(function() {
    showPopup(
      "Sell " + date + " $" + strike + " call",
      "You will immediately pay the underlying 1 ETH as collateral, but you " +
      "may cancel your order any time before another user takes the buy side " +
      ". If your order remains unfufilled, it will be canceled in 24 hours.",
      "premium (eth)",
      function(input) {
        return parseFloat(input);
      },
      function(resp) {
        if (!resp.success)
          return;
        deployOptionContract(parseFloat(resp.input), false);
      }
    )
  });
});

// Insert an optionItem into either the bid or ask DOM list
function insertByPrice(bidOrAsk, optionItem) {
  let list = bidOrAsk ? "#bids" : "#asks";
  let comparisonFunc = (a, b) => { return bidOrAsk ? a < b : b < a; };
  let newRow = bidAskTemplate(optionItem);
  let inserted = false;
  $(list + " .bid-ask-item").each(function(i, oldRow) {
    let oldRowPremium = $(oldRow).attr("data-premium");
    // Insert the new row in sorted order in the list
    if (comparisonFunc(oldRowPremium, optionItem.premium)) {
      $(newRow).insertBefore($(oldRow));
      inserted = true;
      return false;
    }
  });
  if (!inserted)
    $(list).append(newRow);
}

// Binds handlers for bid-ask-item clicks
function bindEventHandlers() {
  $("#bids .bid-ask-item").click(function() {
    let contractAddress = $(this).attr("data-contract-address");
    let partyAddress = $(this).attr("data-party-address");
    let premium = $(this).attr("data-premium");
    showPopup(
      "Sell " + date + " $" + strike + " call",
      "You will immediately receive the " + premium + "ETH premium and will " +
      "immediately pay 1 ETH as collateral.",
      // TODO(eforde)
      null,
      null,
      function(resp) {
        if (!resp.success)
          return;
          let optionContract = OptionContract.at(contractAddress);
          // Prompt the user to send the collateral to the smart contract
          optionContract.activateContract(
            false,
            { value: 1e18, gas: 2e5 },
            (err, txnHash) => {
              if (err) {
                showNotifyPopup(
                  "Error activating contract",
                  "Your funds have been returned to your account. Please " +
                  "trade another contract."
                );
                console.log("Couldn't activate contract...", err);
                return;
              }
              showNotifyPopup(
                "Waiting to mine...",
                "Follow progress <a href=\"https://ropsten.etherscan.io/tx/" +
                txnHash + "\" target=\"_blank\">here</a>. Do not " +
                "leave this page.",
                txnHash,
                true
              );
              console.log("Waiting for someone to mine block... txn:", txnHash);
              // Wait for this transaction to be mined
              onMined(txnHash, res => {
                if (!res.success) {
                  showNotifyPopup(
                    "Error activating contract",
                    "Your funds have been returned to your account. Please " +
                    "trade another contract.",
                    txnHash
                  );
                  console.log("Couldn't activate contract...", err);
                  return;
                }
                saveActiveContractAddress(contractAddress);
                showNotifyPopup(
                  "Order activated!",
                  "You can check the status of this order in your dashboard.",
                  txnHash
                );
                console.log("Activated", contractAddress);
              });
            }
          );
      }
    )
  });
  $("#asks .bid-ask-item").click(function() {
    let contractAddress = $(this).attr("data-contract-address");
    let partyAddress = $(this).attr("data-party-address");
    let premium = $(this).attr("data-premium");
    showPopup(
      "Buy " + date + " $" + strike + " call",
      "You will immediately pay the " + premium + "ETH premium " +
      "and will have the right to exercise your option if it is in the money " +
      "before expiry.",
      null,
      null,
      function(resp) {
        if (!resp.success)
          return;
        let optionContract = OptionContract.at(contractAddress);
        // Prompt the user to send the premium to the smart contract
        optionContract.activateContract(
          true,
          0x743EfAD0CC1c2BB75704671fe6B2F6911E9d1eAE,
          { value: premium * 1e18, gas: 2e5 },
          (err, txnHash) => {
            if (err) {
              showNotifyPopup(
                "Error activating contract",
                "Your funds have been returned to your account. Please trade " +
                "another contract."
              );
              console.log("Couldn't activate contract...", err);
              return;
            }
            showNotifyPopup(
              "Waiting to mine...",
              "Follow progress <a href=\"https://ropsten.etherscan.io/tx/" +
              txnHash + "\" target=\"_blank\">here</a>. Do not " +
              "leave this page.",
              txnHash,
              true
            );
            console.log("Waiting for someone to mine block... txn:",
                        txnHash);
            // Wait for this transaction to be mined
            onMined(txnHash, res => {
              if (!res.success) {
                showNotifyPopup(
                  "Error activating contract",
                  "Your funds have been returned to your account. Please " +
                  "trade another contract.",
                  txnHash
                );
                console.log("Couldn't activate contract...", err);
                return;
              }
              saveActiveContractAddress(contractAddress);
              showNotifyPopup(
                "Order activated!",
                "You can check the status of this order in your dashboard.",
                txnHash
              );
              console.log("Activated", contractAddress);
            });
          }
        );
      }
    )
  });
}

// Deploys a new OptionContract
function deployOptionContract(premium, traderType) { // true = buyer, false = seller
  let maturityTimeSeconds = new Date(date).getTime() / 1000;
  // cancel orders after a day
  // TODO(eforde): this is actually a week for demo purposes
  let cancellationTime = (new Date().getTime() / 1000) + (7 * 24 * 60 * 60);
  let premiumWei = premium * 1e18;
  var strikeCents = strike*100;
  // buyer must send premium, seller must send 1 eth
  let msgValue = traderType ? premiumWei : 1e18;
  getMetamaskAccount(function(account) {
    var contractInstance = OptionContract.new(
      false,
      strikeCents,
      maturityTimeSeconds,
      cancellationTime,
      premiumWei,
      traderType,
      orderBookAddress,
      {
        data: OptionContractBinary,
        from: account,
        gas: 4e6,
        value: msgValue
      }, function(err, data) {
        if (err) {
          showNotifyPopup(
            "Error",
            err,
            premiumWei);
          console.log("Error while creating contract: ", err);
          return;
        }
        if (data && data.address === undefined) {
          showNotifyPopup(
            "Waiting to mine...",
            "Follow progress <a href=\"https://ropsten.etherscan.io/tx/" +
            data.transactionHash + "\" target=\"_blank\">here</a>. Do not " +
            "leave this page.",
            premiumWei,
            true
          );
          console.log("Waiting for someone to mine block... txn:",
                      data.transactionHash);
          return;
        }
        if (data.address) {
          showNotifyPopup(
            "Order created!",
            "Your contract is live at address " + data.address,
            premiumWei
          );
          saveActiveContractAddress(data.address);
          renderOption(data.address);
          // store in order book
          // addToOrderBook(data.address, null, null);
          console.log("successfully deployed contract at ", data.address);
        }
    });
  });
}

// Returns transaction receipt and whether transaction was successful upon
// transaction being mined
function onMined(txnHash, callback) {
  const checkMined = function(callback) {
    web3.eth.getTransactionReceipt(txnHash, (error, receipt) => {
      if (error)
        callback({ success: false, error: error });
      else if (receipt == null)
        setTimeout(() => checkMined(callback), 500);
      else if (receipt.status == "0x0") {
        callback({ success: false, error: "Unsuccessful status", result: receipt });
      }
      else
        callback({ success: true, result: receipt })
    });
  };
  checkMined(callback);
}

// Loads fields of option and returns fields as a dictionary if all loads are
// successful
function loadOption(addr, callback) {
  let option = { addr }
  let optionContract = OptionContract.at(addr);
  let totalFields = 7; // total number of fields we're loading + 1
  let callbackProducer = function(fieldName) {
    return function(err, res) {
      if (err)
        console.log("Error loading from ", scAddress);
      else {
        if (typeof(res) === "object" && ("c" in res))
          option[fieldName] = parseInt(res.toString());
        else
          option[fieldName] = res;
        if (Object.keys(option).length == totalFields)
          callback(option);
      }
    }
  }
  optionContract.isActive.call(callbackProducer("isActive"));
  optionContract.cancellationTime.call(callbackProducer("cancellationTime"));
  optionContract.optionBuyer.call(callbackProducer("optionBuyer"));
  optionContract.optionSeller.call(callbackProducer("optionSeller"));
  optionContract.premiumAmount.call(callbackProducer("premiumAmount"));
  optionContract.optionCreatorType.call(callbackProducer("optionCreatorType"));
}
