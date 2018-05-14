/*
  Used to get and set cookies containg active contract addresses
 */

function getCookie(cookieName="active_contracts") {
  let name = cookieName + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trimLeft();
    if (c.indexOf(name) == 0)
      return c.substring(name.length, c.length);
  }
  return "";
}

// for debugging only
function dedupeCookie() {
  let currentCookie = getCookie("active_contracts");
  let currentAddresses = currentCookie ? JSON.parse(currentCookie) : [];
  let currentAddressSet = {};
  for (let i in currentAddresses) {
    currentAddressSet[currentAddresses[i]] = true;
  }
  let newAddresses = Object.keys(currentAddressSet);
  document.cookie = "active_contracts=" + JSON.stringify(newAddresses) + 
                    "; expires=Wed, 01 Jan 2020 00:00:00 UTC; path=/;";
}

function getActiveContractAddresses() {
  let currentCookie = getCookie("active_contracts");
  return currentCookie ? JSON.parse(currentCookie) : [];
}


function saveActiveContractAddress(addr) {
  // use jquery to set
  // $.cookie('name', 'value', { expires: 7, path: '/' }); // 7 days
  // and read
  // $.cookie('name'); // => "value"
  // https://github.com/carhartl/jquery-cookie


  // set cookie if does not exist
  let currentCookie = getCookie("active_contracts");
  if (currentCookie == "") {
    let newCookie = [addr];
    //TODO(moezinia) change expiration to optionObj.cancellationTime
    document.cookie = "active_contracts=" + JSON.stringify(newCookie) + 
                      "; expires=Wed, 01 Jan 2030 00:00:00 UTC; path=/;";
  }
  // append another option to cookie
  else {
    let newCookie = JSON.parse(currentCookie);
    for (let i in newCookie)
      if (newCookie[i] == addr)
        return;
    newCookie.push(addr);
    document.cookie = "active_contracts=" + JSON.stringify(newCookie) + 
                      "; expires=Wed, 01 Jan 2020 00:00:00 UTC; path=/;";
  }
}
