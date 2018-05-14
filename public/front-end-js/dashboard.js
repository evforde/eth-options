// can play around in js console with this
var account;

var OptionContract;

function setAccount(acc) {
  account = acc;
}



$(document).ready(function() {
  OptionContract = web3.eth.contract(OptionContractABI);

  // getETHPrice((priceCents) => {
  //   $("#eth-price-usd").text("The current price is $" + (priceCents/100).toString());
  // });

  let userContracts = getActiveContractAddresses();
  getMetamaskAccount(function(account) {
    $.get('/static/ejs/order-item.ejs', function (template) {
      orderItemTemplate = ejs.compile(template);
      for (let i in userContracts) {
        loadOption(userContracts[i], (option) => {
          // Insert options into the list sorted by maturity
          let currentTime = new Date().getTime() / 1000;
          option.premiumAmount = option.premiumAmount / 1e18;
          option.maturityTime = new Date(option.maturityTime * 1000).toLocaleDateString();
          option.cancellationTime = new Date(option.cancellationTime * 1000).toLocaleString();
          if (option.optionSeller == account)
            option.position = "sell";
          else if (option.optionBuyer == account)
            option.position = "buy";
          else {
            console.log("Address in cookie, but account not a buyer or seller...",
              option.addr,
              option.optionBuyer,
              option.optionSeller
            );
            return;
          }

          $.ajax()
          getETHPrice((CURRENT_ETH_PRICE) => {
            option.canExercise = CURRENT_ETH_PRICE >= (option.strikePriceUSD*100);
            // TODO(eforde): insert options by maturity date
            let list = option.isActive ? "#active-orders" : "#pending-orders";
            $(list).append(orderItemTemplate(option));
            bindEventHandlers();
          });
        });
      }
    });
  });

  //TODO(moezinia) turn on!
  // const OrderBook = web3.eth.contract(OrderBookABI);
});

function bindEventHandlers() {
  $(".order-item").unbind("click");
  $(".order-item:not(.pending)").click(function(e) {
    if ($(this).attr("data-can-exercise"))
      showPopup(
        "Exercise option?",
        "The the settlement in ethereum will be sent to your address.",
        null,
        null,
        function(resp) {
          if (!resp.success)
            return;
          // TODO(eforde): excercise contract
        },
        150
      );
  });
  $(".order-item.pending").click(function(e) {
    showPopup(
      "Cancel order?",
      "Your investment will be returned to you.",
      null,
      null,
      function(resp) {
        if (!resp.success)
          return;
        // TODO(eforde): cancel contract
      },
      150
    );
  });
}



// Loads fields of option and returns fields as a dictionary if all loads are
// successful
function loadOption(addr, callback) {
  let option = { addr }
  let optionContract = OptionContract.at(addr);
  let totalFields = 9; // total number of fields we're loading + 1
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
  optionContract.maturityTime.call(callbackProducer("maturityTime"));
  optionContract.strikePriceUSD.call(callbackProducer("strikePriceUSD"));
}
