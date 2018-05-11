// ----fetches all options in order book-------

// given date / strike  {date -> {strike -> [OC]}}

// load option info....

// then display in UI

function renderInactiveOptions(maturityDate, strikePriceUSD) {
  allOpt = getInactiveOptionInfo(maturityDate, strikePriceUSD);
  //TODO call populateInactiveOptions..
  for (var i = 0; i < allOpt.length; i++) {
    opt = userOptionInfo[i];

    //TODO(moezinia) DISPLAY in /trade......!!! as bid-ask item.ejs....
    //$.("myoptionsRow") or whatever... in exchange.ejs
    // only display if inactive < cancellation time ,
  }


}


function renderNewlyCreatedOption(option) {
  //TODO how to slot this in to trade.ejs page nicely....
  // bid-ask item....
}


// options is list of all option objects...
function populateInactiveOptions(options) {
  $.get('/static/ejs/bid-ask-item.ejs', function (template) {

    let optionItemTemplate = ejs.compile(template);
    let scrollTop = 0;
    for (let i = 0; i < options.length; i++) {
      $('#options').append(optionItemTemplate(options[i]));
    }
    // rebindEventHandlers();
    // recalcAnimations();
    $("body").animate({ scrollTop: $(document).height() }, 700);
  });
}
