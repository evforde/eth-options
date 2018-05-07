function querySC(scAddress) {

  const optionContract = web3.eth.contract(OptionContractABI, null);
  const optionSmartContract = optionContract.at(scAddress);
  var curOption = {};
  isActive = optionSmartContract.isActive.call(
    (err, res) => {
      if (err) {
        console.log("error retrieving from ", scAddress);
      }
      else {
        isActive = res;
        curOption.isActive = isActive;
        console.log(curOption);
      }
    }
  );

//TODO(moezinia) --- other info needed to display
// address public optionBuyer;
// address public optionSeller;
// inTheMoney - bool
// bool public optionType;          // put = True, call = False.
// bool public optionCreatorType;   // buyer = True, seller = False.
//
// uint public strikePriceUSD;
// uint public premiumAmount;
// uint public cancellationTime;
// uint public maturityTime;
// bool public isActive;


  // return some object with all these values..
}

//TODO(moezinia)
function queryOrderBook(scAddress) {
  const orderBookContract = web3.eth.contract(OrderBookContractABI, null).at(scAddress);
  // const curOption = {};
  const inactiveOptionInfo = [];
  inActiveOptions = orderBookContract.allOptions.call(
    (err, res) => {
      if (err) {
        console.log("error retrieving from ", scAddress);
      }
      else {
        //TODO get res....
      }
    }
  );
  return inactiveOptionInfo;
}

//-----------main function------------//
function getAllInactiveOptionInfo(maturityDate, strikePriceUSD) {
  //TODO(moezinia) from order book smart contract with this maturity and strike...
  scAddress = "0xORDERBOOK!";
  inactiveOptionInfo = queryOrderBook(scAddress);
  return inactiveOptionInfo;
}


function getUserOptionInfo() {
  scAddresses = retrieveUserSpecificSCAddresses()
  userOptionInfo = getOptionInfo(scAddresses);
  return userOptionInfo;
}

function getOptionInfo(scAddresses) {
  userOptionInfo = [];
  for (var i = 0; i < scAddresses.length; i++) {
    info = querySC(scAddresses[i]);
    userOptionInfo.push(info);
  }
  return userOptionInfo;
}
