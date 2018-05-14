// can play around in js console with this
var account;

var orderItemTemplate;
var OptionContract;

function setAccount(acc) {
  account = acc;
}


$(document).ready(function() {
  OptionContract = web3.eth.contract(OptionContractABI);

  let userContracts = getActiveContractAddresses();
  getMetamaskAccount(function(account) {
    $.get('/static/ejs/order-item.ejs', function (template) {
      orderItemTemplate = ejs.compile(template);
      for (let i in userContracts) {
        loadOption(userContracts[i], (option) => {
          // Insert options into the list sorted by maturity
          let currentTime = new Date().getTime() / 1000;
          option.premiumAmount = option.premiumAmount / 1e18;
          option.maturityTimeSeconds = option.maturityTime;
          option.maturityTime = new Date(option.maturityTimeSeconds * 1000).toLocaleDateString();
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
          option.canExercise = currentETHPriceUSD >= (option.strikePriceUSD*100);
          let list = option.isActive ? "#active-orders" : "#pending-orders";
          insertByPrice(list, option);
          bindEventHandlers();
        });
      }
    });
  });

  //TODO(moezinia) turn on!
  // const OrderBook = web3.eth.contract(OrderBookABI);
});

function insertByPrice(list, option) {
  let newRow = orderItemTemplate(option);
  let inserted = false;
  $(list + " .order-item").each(function(i, oldRow) {
    let oldRowMaturity = parseInt($(oldRow).attr("data-maturity"));
    let oldRowStrike = parseInt($(oldRow).attr("data-strike"));
    // Insert the new row in sorted order in the list
    if (oldRowMaturity + oldRowStrike > option.maturityTimeSeconds + option.strikePriceUSD) {
      $(newRow).insertBefore($(oldRow));
      inserted = true;
      return false;
    }
  });
  if (!inserted)
    $(list).append(newRow);
}

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
