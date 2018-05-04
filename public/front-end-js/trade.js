// TODO(eforde): rename price -> premium in exchange

$(document).ready(function() {
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