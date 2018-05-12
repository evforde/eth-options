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
      "New bid",
      "Create a bid for " + date + " $" + strike + " call? You will " +
      "immediately pay the premium, but you may cancel your order any " +
      "time before another user takes the sell side.",
      "premium",
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
      "New ask",
      "Create a ask for " + date + " $" + strike + " call? You will " +
      "immediately pay the underlying amount in ethereum, but you may cancel " +
      "your order any time before another user takes the buy side.",
      "premium",
      function(input) {
        return parseFloat(input);
      },
      function(resp) {
        if (!resp.success)
          return;
        console.log("make a ask!");
        // TODO(eforde): take the buy side!
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
  getMetamaskAccount(function(account) {
    console.log("deploying option contract for ", account);
    let maturityTimeSeconds = new Date(date).getTime() / 1000;
    let cancellationTime = maturityTimeSeconds; // TODO(eforde)!!!!!
    let premiumWei = premium * 1e18;
    console.log([false, strike, maturityTimeSeconds, cancellationTime, premiumWei, traderType]);
    var contractInstance = OptionContract.new({
      data: OptionContractBinary,
      from: account,
      gas: 4000000,
      arguments: [false, strike, maturityTimeSeconds, cancellationTime, premiumWei, traderType]
    }, function(err, data) {
      if (err) {
        showNotifyPopup("Error", err);
        console.log(err);
        return;
      }
      if (data && data.address === undefined) {
        showNotifyPopup(
          "Waiting to mine...",
          "Follow progress <a href=\"https://ropsten.etherscan.io/tx/" +
          data.transactionHash + "\" target=\"_blank\">here</a>"
        );
        console.log("waiting for someone to mine block...");
        console.log("txn ", data.transactionHash, );
        return;
      }
      if (data.address) {
        showNotifyPopup("Deployed!", "at address " + data.address);
        console.log("successfully deployed contract at ", data.address);
        console.log(data);
        // data.owner(function(err, data) {
        //   console.log("owner of contract is ", err || data);
        // });
      }
    });
  });

}