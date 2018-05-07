// ----fetches all options in order book-------

// given date / strike  {date -> {strike -> [OC]}}

// load option info....

// then display in UI

function loadInactiveOptions(maturityDate, strikePriceUSD) {
  allOpt = getAllInactiveOptionInfo(maturityDate, strikePriceUSD);
  for (var i = 0; i < allOpt.length; i++) {
    opt = userOptionInfo[i];

    //TODO(moezinia) DISPLAY SOMEWHERE!!!
    //$.("myoptionsRow") or whatever... in exchange.ejs
    // only display if inactive < cancellation time , 
  }


}
