// get cookies from user (using account address), to see traderType

// get smart contract address of option

// get option information



function getCookie(cookieName="optionInfo") {
    var name = cookieName + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function retrieveUserSpecificSCAddresses() {

  existingCookie = JSON.parse(getCookie("optionInfo"));
  scAddressesToQuery = []
  optionObjs = existingCookie["optionInformation"].optionInformation;
  // for now query smart contract..
  for (var i = 0; i < optionObjs.length; i++) {
    scAddressesToQuery.push(optionObjs[i]["contractAddress"]);
  }
  return scAddressesToQuery;
}


function setBrowserCookie(optionObj) {

  // use jquery to set
  // $.cookie('name', 'value', { expires: 7, path: '/' }); // 7 days
  // and read
  // $.cookie('name'); // => "value"
  // https://github.com/carhartl/jquery-cookie


  // set cookie if does not exist
  if (getCookie("optionInfo") == "") {
    cookieInfo = {optionInformation: new Array(optionObj)}
    document.cookie = "optionInfo="+JSON.stringify(cookieInfo)+"; expires=Wed, 01 Jan 2020 00:00:00 UTC; path=/dashboard;";
  }
  // append another option to cookie
  else {
    existingCookie = JSON.parse(getCookie("optionInfo"));
    existingCookie["optionInformation"].push(optionObj);
    cookieInfo = {optionInformation: existingCookie}
    document.cookie = "optionInfo="+JSON.stringify(cookieInfo)+"; expires=Wed, 01 Jan 2020 00:00:00 UTC; path=/dashboard;";
  }

}
