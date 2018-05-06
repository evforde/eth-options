function querySC(scAddress) {

  const optionContract = web3.eth.contract(OptionContractABI, null);
  const optionSmartContract = optionContract.at(scAddress);
  const curOption = {};
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

}

//-----------main function------------//
function getAllInactiveOptionInfo() {
  scAddresses = //TODO(moezinia) from order book smart contract

  inactiveOptionInfo = getOptionInfo(scAddresses);
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
