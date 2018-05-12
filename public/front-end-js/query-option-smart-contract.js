function querySC(scAddress) {

  //TODO(moezinia) can create differnet method for querying
  //TODO inactive contracts
  const optionContract = web3.eth.contract(OptionContractABI, null);
  const optionSmartContract = optionContract.at(scAddress);
  var curOption = {};
  curOption.scAddress = scAddress;


  //TODO(moezinia) batch not working...
  // var batch = web3.createBatch();
  // batch.add(myContractInstance.doSomething(arg1, arg2, {from: account, gas: 4000000}));
  // batch.execute()

  isActive = optionSmartContract.isActive.call(
    (err, res) => {
      if (err) {
        console.log("error retrieving from ", scAddress);
      }
      else {
        curOption.isActive = res;
      }
    }
  );

  optionBuyer = optionSmartContract.optionBuyer.call(
    (err, res) => {
      if (err) {
        console.log("error retrieving from ", scAddress);
      }
      else {
        curOption.optionBuyer = res;
      }
    }
  );

  // address public optionSeller;

  optionSeller = optionSmartContract.optionSeller.call(
    (err, res) => {
      if (err) {
        console.log("error retrieving from ", scAddress);
      }
      else {
        curOption.optionSeller = res;
      }
    }
  );
  // inTheMoney - bool

  inTheMoney = optionSmartContract.inTheMoney.call(
    (err, res) => {
      if (err) {
        console.log("error retrieving from ", scAddress);
      }
      else {
        curOption.inTheMoney = res;
      }
    }
  );

  // bool public optionType;          // put = True, call = False.

  optionType = optionSmartContract.optionType.call(
    (err, res) => {
      if (err) {
        console.log("error retrieving from ", scAddress);
      }
      else {
        curOption.optionType = res;
      }
    }
  );


  // bool public optionCreatorType;   // buyer = True, seller = False.


  optionCreatorType = optionSmartContract.optionCreatorType.call(
    (err, res) => {
      if (err) {
        console.log("error retrieving from ", scAddress);
      }
      else {
        curOption.optionCreatorType = res;
      }
    }
  );


  // uint public strikePriceUSD;

  strikePriceUSD = optionSmartContract.strikePriceUSD.call(
    (err, res) => {
      if (err) {
        console.log("error retrieving from ", scAddress);
      }
      else {
        curOption.strikePriceUSD = res;
      }
    }
  );


  // uint public premiumAmount;

  premiumAmount = optionSmartContract.premiumAmount.call(
    (err, res) => {
      if (err) {
        console.log("error retrieving from ", scAddress);
      }
      else {
        curOption.premiumAmount = res;
      }
    }
  );


  // uint public cancellationTime;
  cancellationTime = optionSmartContract.cancellationTime.call(
    (err, res) => {
      if (err) {
        console.log("error retrieving from ", scAddress);
      }
      else {
        curOption.cancellationTime = res;
      }
    }
  );

//
// uint public maturityTime;

maturityTime = optionSmartContract.maturityTime.call(
  (err, res) => {
    if (err) {
      console.log("error retrieving from ", scAddress);
    }
    else {
      curOption.maturityTime = res;
    }
  }
);

  return curObj;
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















// should only be called with contracts from order book
// that are inactive, since activated contracts are removed
// from order book..
function queryInactiveSC(scAddress) {

  const optionContract = web3.eth.contract(OptionContractABI, null);
  const optionSmartContract = optionContract.at(scAddress);
  var curOption = {};
  curOption.scAddress = scAddress;

  optionBuyer = optionSmartContract.optionBuyer.call(
    (err, res) => {
      if (err) {
        console.log("error retrieving from ", scAddress);
      }
      else {
        curOption.optionBuyer = res;
      }
    }
  );

  optionSeller = optionSmartContract.optionSeller.call(
    (err, res) => {
      if (err) {
        console.log("error retrieving from ", scAddress);
      }
      else {
        curOption.optionSeller = res;
      }
    }
  );


  // put = True, call = False.

  optionType = optionSmartContract.optionType.call(
    (err, res) => {
      if (err) {
        console.log("error retrieving from ", scAddress);
      }
      else {
        curOption.optionType = res;
      }
    }
  );


  // bool public optionCreatorType;   // buyer = True, (BID) seller = False. (ASK!)
  optionCreatorType = optionSmartContract.optionCreatorType.call(
    (err, res) => {
      if (err) {
        console.log("error retrieving from ", scAddress);
      }
      else {
        curOption.optionCreatorType = res;
      }
    }
  );


  // uint public strikePriceUSD;
  // TODO(moezinia) strike and maturity priors
  // strikePriceUSD = optionSmartContract.strikePriceUSD.call(
  //   (err, res) => {
  //     if (err) {
  //       console.log("error retrieving from ", scAddress);
  //     }
  //     else {
  //       curOption.strikePriceUSD = res;
  //     }
  //   }
  // );

  // uint public maturityTime;

  // maturityTime = optionSmartContract.maturityTime.call(
  //   (err, res) => {
  //     if (err) {
  //       console.log("error retrieving from ", scAddress);
  //     }
  //     else {
  //       curOption.maturityTime = res;
  //     }
  //   }
  // );


  // uint public premiumAmount;

  premiumAmount = optionSmartContract.premiumAmount.call(
    (err, res) => {
      if (err) {
        console.log("error retrieving from ", scAddress);
      }
      else {
        curOption.premiumAmount = res;
      }
    }
  );


  // uint public cancellationTime;
  cancellationTime = optionSmartContract.cancellationTime.call(
    (err, res) => {
      if (err) {
        console.log("error retrieving from ", scAddress);
      }
      else {
        curOption.cancellationTime = res;
      }
    }
  );


  return curObj;
}
