// ----fetches all relevant options to display on trade-------

//TODO(eforde)
$(document).ready(function() {

  // call order Book
  getInactiveOptionInfo(date, strike,
    function() {
      // queryInactiveSC(date, strike, callback?) somehow get list of options

      // populate in trade.ejs with trade-options.ejs

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
    });
});


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
