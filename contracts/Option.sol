pragma solidity ^0.4.0;
import "./usingOraclize.sol";

contract Option is usingOraclize{
  uint constant public underlyingAmount = 1000000000000000000; // 1 eth in wei

  address public optionBuyer;
  address public optionSeller;

  bool public optionType;          // put = True, call = False.
  bool public optionCreatorType;   // buyer = True, seller = False.

  uint public strikePriceUSD;
  uint public premiumAmount; // eth - wei in constructor
  uint public cancellationTime;
  uint public maturityTime;

  // balance used on exercise to verify strikePriceUSD

  /* string[] conversion_apis = ["json(https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD).USD"] */
  /* string[] conversion_apis = ["json(https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD).USD", "json(https://api.kraken.com/0/public/Ticker?pair=currentETHPrice).result.XETHZUSD.c.0", "json(https://api.coinbase.com./v2/prices/ETH-USD/buy).data.amount"]; */
  // TODO add back other 2 api's
  string private ETH_PRICE_URL = "json(https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD).USD";
  mapping(bytes32 => bool) public validIds;
  uint public currentETHPrice;
  /* uint[] currentETHPrice = new uint[](1); */


  // inactive -> creator can call cancel()
  // inactive -> active
  // active   -> buyer can call exercise() if not expired
  // active   -> seller can call recalimFunds() if expired
  bool public isActive;

  // BIG TODO(eforde): block.timestamp not secure...

  // events

  event LogTransferMade(address sender, address receiver, uint amount);
  event LogNewOraclizeQuery(string description);

  constructor(bool _optionType, uint _strikePriceUSD,
    uint _maturityTime, uint _cancellationTime,
    uint _premiumAmount, bool _traderType) public payable {
    require(_optionType == false); // Only allow calls
    // set optionBuyer/optionSeller based on optionCreatorType
    if (_traderType) {
      require(msg.value == premiumAmount);
      require(address(this).balance == premiumAmount);
      optionBuyer = msg.sender;
    }
    else {
      require(msg.value == underlyingAmount);
      require(address(this).balance == underlyingAmount);
      optionSeller = msg.sender;
    }

    optionCreatorType = _traderType;
    optionType = _optionType;
    strikePriceUSD = _strikePriceUSD;
    maturityTime = _maturityTime;
    premiumAmount = (_premiumAmount*1000000000000000000);
    cancellationTime = _cancellationTime;

    isActive = false;
  }

  function activateContract(bool traderType) payable public {
    require(!isActive);
    require(traderType == !optionCreatorType);
    require(block.timestamp < cancellationTime); // TODO(eforde): otherwise cancel
    if (traderType) { // buyer
      require(address(this).balance > underlyingAmount);
      require(msg.value == premiumAmount);
      require(optionSeller != 0);
      optionBuyer = msg.sender;
    }
    else { // seller
      require(address(this).balance > premiumAmount);
      require(msg.value == underlyingAmount);
      require(optionBuyer != 0);
      optionSeller = msg.sender;
    }
    isActive = true;
    optionSeller.transfer(premiumAmount);
    emit LogTransferMade(optionBuyer, optionSeller, premiumAmount);

    // TODO(eforde): verify not susceptible to reentry
  }

  // complete exercise if after oracle returns and conditions are met
  function __callback(bytes32 _myid, string _result) public {
    emit LogNewOraclizeQuery(_result);
    if (!validIds[_myid]) revert();
    currentETHPrice = parseInt(_result, 2);

    require(inTheMoney(currentETHPrice));
    /* require(underlyingAmount <= address(this).balance); // should be equal! */

    uint holderSettlementAmout = ((currentETHPrice - strikePriceUSD)/currentETHPrice) * underlyingAmount;
    optionBuyer.transfer(holderSettlementAmout);

    //TODO(moezinia) send rest to seller (is amount of ether equivalent to strike price..) in WEI
    uint writerSettlementAmount = (strikePriceUSD/currentETHPrice) * underlyingAmount;
    /* require(writerSettlementAmount == address(this).balance); */
    /* selfdestruct(optionSeller); */
    optionSeller.transfer(writerSettlementAmount);
    //TODO(moezinia) delete line add back
    delete validIds[_myid];
    isActive = false;
    emit LogNewOraclizeQuery("exercised baby!");

    /* require(msg.sender == oraclize_cbAddress());
    for (uint i = 0; i < conversion_apis.length; i++) {
      if (!)
      if (validIds[myid]) {
        validIds[i] = 0;
        uint result0USD = 0; //TODO(magendanz) convert result to uint
        currentETHPrice[i] = result0USD;
        break;
      }
    }
    if (i != conversion_apis.length) revert(); // callback was not from a request

    uint recieved = 0;
    uint threshold = conversion_apis.length - 1; //TODO(magendanz) set as static and global
    uint currentETHPrice = 0; //TODO(magendanz) find better way to eliminate outlier
    for (uint j = 0; j < conversion_apis.length; j++) {
      if (requests[j] == 0) {
        recieved++;
        currentETHPrice += currentETHPrice[j];
      }
    }
    if (recieved >= threshold) {
      currentETHPrice /= conversion_apis.length;
      require(inTheMoney(currentETHPrice));
      /* require(underlyingAmount <= address(this).balance); // should be equal! */

      // TODO(eforde): be careful about reentry here

      //TODO(moezinia) send underlyingAmount*(currentETHPrice-strikePrice) to optionBuyer in WEI
      //uint holderSettlementAmout = ((currentETHPrice - strikePriceUSD)/currentETHPrice) * underlyingAmount;
      //optionBuyer.transfer(holderSettlementAmout);
      //TODO(moezinia) send rest to seller (is amount of ether equivalent to strike price..) in WEI
      //uint writerSettlementAmount = (strikePriceUSD/currentETHPrice) * underlyingAmount;
      /* require(writerSettlementAmount == address(this).balance); */
      /* selfdestruct(optionSeller); */
      //optionSeller.transfer(writerSettlementAmount);
      //TODO(moezinia) delete line add back
      //delete validIds[myid];
      // TODO(eforde: kill contract
    //} */
  }

  //TODO(moezinia) can oraclize.setCustomGasPrice -> 10Gwei or something
  function exerciseCost() public returns (uint exerciseGasCost) {
    /* exerciseGasCost = (conversion_apis.length * oraclize_getPrice("URL")); */
    exerciseGasCost = oraclize_getPrice("URL");
    emit LogNewOraclizeQuery(uint2str(exerciseGasCost));
    return exerciseGasCost;
  }


  function exercise() public payable {
    require(msg.sender == optionBuyer);
    require(block.timestamp < maturityTime); // TODO(eforde): otherwise expire
    require(optionType == false); // has to be call for now
    /* require((conversion_apis.length * oraclize_getPrice("URL")) <= msg.value); */
    require(msg.value >oraclize_getPrice("URL"));
    bytes32 queryId = oraclize_query("URL", ETH_PRICE_URL);
    validIds[queryId] = true;
    /* for (uint i = 0; i < conversion_apis.length; i++) {
      bytes32 queryID = oraclize_query("URL", conversion_apis[i]);
      validIds[queryID] = true;
    } */
  }

  function exerciseExternalPrice (uint _currentETHPrice) public {
    currentETHPrice = _currentETHPrice;
    require(msg.sender == optionBuyer);
    require(block.timestamp < maturityTime);
    require(optionType == false);
    require(inTheMoney(currentETHPrice));

    //TODO(moezinia) NO DIVISION!!!
    uint writerSettlementAmount = (strikePriceUSD * underlyingAmount)/currentETHPrice;
    optionSeller.transfer(writerSettlementAmount);
    emit LogTransferMade(address(this), optionSeller, writerSettlementAmount);


    /* uint holderSettlementAmout = ((currentETHPrice - strikePriceUSD)/currentETHPrice) * underlyingAmount; */
    uint holderSettlementAmout = address(this).balance; // whatever is left over!
    optionBuyer.transfer(holderSettlementAmout);
    emit LogTransferMade(address(this), optionBuyer, holderSettlementAmout);

    isActive = false;
  }


  function cancel() public {
    require(!isActive);
    // Assert sender created the contract
    require((optionCreatorType && (msg.sender == optionBuyer)) || (!optionCreatorType && (msg.sender == optionSeller)));
    selfdestruct(msg.sender);
  }


  function reclaimFunds() public {
    require(isActive);
    require(msg.sender == optionSeller);
    require(block.timestamp > maturityTime);
    selfdestruct(msg.sender);
  }


  // ===== Utility functions ===== //


  function inTheMoney(uint _currentETHPrice) public view returns (bool) {
    // TODO(eforde): verify price is correct, or fetch price from on-chain
    // fiat contract
    return (optionType && (_currentETHPrice < strikePriceUSD)) || (!optionType && (_currentETHPrice > strikePriceUSD));  // pul || call
  }


  // ======= Log Events ========= //

  // TODO(eforde):
  // _transaction = LogTransferMade(sender, receiver, msg.value);
}
