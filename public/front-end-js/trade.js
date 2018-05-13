var OptionContract;

var contractAddresses = [
  "0x500e05b522a32c3a422b24d19d7daab1bf57cd8b",
  "0x2715f8e4937a931740623af376aeece2d73f16fb",
  "0x48778dbc5e4d0c926e3df4f51fc7e344cea35d81",
  "0xaaf4e7e42bb0adecb35f501bad8dd0c0035bc870",
  "0x6b476e0b83140a25c141427732513124e6c5171d",
  "0xafc8845d4a717f2bd42834a9d09ea650c221d22e",
  "0x15ec8ad83d4d985117eef9d1419ddf380446a4a0",
  "0xbc0ca4e74cba96e55c2b97dce739d3b467b2393c",
  "0xa8bf717b276bcee5f438c9a4d5cc056c5186c68b",
  "0x2b09092a8690f3c55c62eb9186c2b1ee6c5de319",
  "0x722ae5125287ab52968c9ff25205dc0741f96f5c",
  "0xedadb1b3f0181f190a7fd6c9ce360c5f469a5d11",
  "0x61db6c0139beda77aca37474889a90a3600308c9",
  "0x421b39b33c7432f4f3122a569d21132764713f1d",
  "0xd6fae588aa8ea986ee4b2cfb6b7059d14fa036a8",
  "0x1223edff95308973dc92e9e711046e3fdeb8d121",
  "0xf617dcd952f77d552165d3eed87f9121719f940b",
  "0xa6e96b48f3f67df8cd00d9d9d50cdc9df80450d3",
  "0xc6e85589c3cc7bc371a95abd7ebb79f8899b3fd7",
  "0xe26eafedc2322e773f7b0d8d62558c53f17a5a8a",
  "0x270145bdf0921884c1c2902ec67e241b8643d566",
  "0x3d4c5b811542603efe5f2a7594590ff1c6827031",
  "0x8aaf69dddffc8ca1cfb0faea5489dcc9eb982894",
  "0x9337aefe88171badf438f0ca163e056bb02221b0",
  "0x40ccb21d59cb79a3accdbbd7fb66175b1477f5e4",
  "0xf09c80dca93ac3a78c69ba940a3369e38eda5a6b",
  "0xdde23dee545b49c8f4097b27e2a49f39086e7f25",
  "0xa7b92bc31a624d7fe2bc432dee7fa61141d239a8",
  "0x389e05bd011e965df7a5f2614461c9845247002c",
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
      partyType: bidOrAsk ? "buyer" : "seller",
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
      "immediately pay 1 ETH as collateral. The contract is deployed at " +
      contractAddress + ".",
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
      "before expiry. The contract is deployed at " + contractAddress + ".",
      null,
      null,
      function(resp) {
        if (!resp.success)
          return;
        let optionContract = OptionContract.at(contractAddress);
        // Prompt the user to send the premium to the smart contract
        optionContract.activateContract(
          true,
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
  // buyer must send premium, seller must send 1 eth
  let msgValue = traderType ? premiumWei : 1e18;
  getMetamaskAccount(function(account) {
    var contractInstance = OptionContract.new(
      false,
      strike,
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
