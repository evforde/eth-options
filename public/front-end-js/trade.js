var OptionContract;

$(document).ready(function() {
  OptionContract = web3.eth.contract(OptionContractABI);

  // TODO(eforde): fill with real bids and asks for this contract
  let bids = [];
  for (let i = 0; i < 8; i++) {
    bids.push({
      address: "0x3a99e67c96e546b34b0fd74f5f93f8692bc2eb92",
      partyType: "bidder",
      premium: .1 + i * .1,
      contractAddress: "0x743a704687E0C42f823911932B77E54700AD1f63"
    });
  }
  let asks = [];
  for (let i = 0; i < 8; i++) {
    asks.push({
      address: "0x3a99e67c96e546b34b0fd74f5f93f8692bc2eb92",
      partyType: "asker",
      premium: 1.40 - i * .1,
      contractAddress: "0x743a704687E0C42f823911932B77E54700AD1f63"
    });
  }
  populateBidAsk(bids, asks);

  $("#new-bid-button").click(function() {
    showPopup(
      "Buy " + date + " $" + strike + " call",
      "You will immediately pay the premium, but you may cancel your order " +
      "any time before another user takes the sell side. If your " +
      "order remains unfufilled, it will be canceled in 24 hours.",
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
      "You will immediately pay the underlying 1 ETH, but you may cancel " +
      "your order any time before another user takes the buy side. If your " +
      "order remains unfufilled, it will be canceled in 24 hours.",
      "premium (eth)",
      function(input) {
        return parseFloat(input);
      },
      function(resp) {
        if (!resp.success)
          return;
        console.log("make an ask!");
        deployOptionContract(parseFloat(resp.input), false);
      }
    )
  });
});

function populateBidAsk(bids, asks) {
  bids = bids.sort(function(item1, item2) {
    return item2.premium - item1.premium;
  });
  asks = asks.sort(function(item1, item2) {
    return item1.premium - item2.premium;
  });
  $.get('/static/ejs/bid-ask-item.ejs', function (template) {
    let bidAskTemplate = ejs.compile(template);
    bids.forEach(function(bid) {
      $('#bids').append(bidAskTemplate(bid));
    });
    asks.forEach(function(ask) {
      $('#asks').append(bidAskTemplate(ask));
    });
    bindEventHandlers();
  });
};

function bindEventHandlers() {
  $("#asks .bid-ask-item").click(function() {
    let contractAddress = $(this).attr("data-contract-address");
    let partyAddress = $(this).attr("data-party-address");
    let premium = $(this).attr("data-premium");
    showPopup(
      "Confirm order",
      "Do you want to take the buy side of this " + date + " $" + strike +
      " call? The contract seller is " + partyAddress + " and the contract is" +
      " deployed at " + contractAddress + ".\n\n" +
      "You will immediately pay a premium of $" + premium + " and will have " +
      " the right to exercise your option at any time if it is in the money " +
      "before expiry.",
      null,
      null,
      function(resp) {
        if (!resp.success)
          return;
        console.log("take the buy side!");
        // TODO(eforde): take the buy side!
      }
    )
  });
  $("#bids .bid-ask-item").click(function() {
    let contractAddress = $(this).attr("data-contract-address");
    let partyAddress = $(this).attr("data-party-address");
    showPopup(
      "Confirm order",
      "Do you want to take the sell side of this " + date + " $" + strike +
      " call? The contract buyer is " + partyAddress + " and the contract is" +
      " deployed at " + contractAddress + ".",
      // TODO(eforde)
      null,
      null,
      function(resp) {
        if (!resp.success)
          return;
          console.log("take the sell side!");
        // TODO(eforde): take the sell side!
      }
    )
  });
}

function deployOptionContract(premium, traderType) { // true = buyer, false = seller
  // buyer must send premium, seller must send 1 eth
  let msgValue = traderType ? premium * 1e18 : 1e18;
  let maturityTimeSeconds = new Date(date).getTime() / 1000;
  // TODO(eforde)!!!!!
  // cancel orders after a day
  let cancellationTime = new Date().getTime() / 1000;
  let premiumWei = premium * 1e18;
  getMetamaskAccount(function(account) {
    var contractInstance = OptionContract.new(
      false,
      strike,
      maturityTimeSeconds,
      cancellationTime,
      premiumWei,
      traderType,
      {
        data: OptionContractBinary,
        from: account,
        gas: 4e6,
        value: msgValue
      }, function(err, data) {
        if (err) {
          showNotifyPopup("Error", err);
          console.log("Error while creating contract: ", err);
          return;
        }
        if (data && data.address === undefined) {
          showNotifyPopup(
            "Waiting to mine...",
            "Follow progress <a href=\"https://ropsten.etherscan.io/tx/" +
            data.transactionHash + "\" target=\"_blank\">here</a>",
            true
          );
          console.log("waiting for someone to mine block... txn:",
                      data.transactionHash);
          return;
        }
        if (data.address) {
          showNotifyPopup("Order created!", "Your contract is live at address " + data.address);
          console.log("successfully deployed contract at ", data.address);
        }
    });
  });

}