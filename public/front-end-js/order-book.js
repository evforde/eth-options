function addToOrderBook(optionSmartContract) {

    // OrderBookABI
    // get contract address

    // call the method to add to orderbook.






}


function getInactiveOptionInfo(maturityDate, strikePriceUSD) {
  //TODO(moezinia) from order book smart contract with this maturity and strike...
  scAddress = "0xORDERBOOK!";
  inactiveOptionInfo = queryOrderBook(scAddress);
  return inactiveOptionInfo;
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
