pragma solidity ^0.4.0;
import "./usingOraclize.sol";

contract Option is usingOraclize{
  uint constant public underlyingAmount = 1000000000000000000; // 1 eth in wei

  address public optionBuyer;
  address public optionSeller;

  bool public optionType;          // put = True, call = False.
  bool public optionCreatorType;   // buyer = True, seller = False.

  uint public strikePriceUSD;
  uint public premiumAmount;
  uint public cancellationTime;
  uint public maturityTime;

  // balance used on exercise to verify strikePriceUSD 
  uint public balance;
  string[] conversion_apis = ["json(https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD).USD", "json(https://api.kraken.com/0/public/Ticker?pair=ETHUSD).result.XETHZUSD.c.0", "json(https://api.coinbase.com./v2/prices/ETH-USD/buy).data.amount"];
  bytes32[] requests = new bytes32[](3);
  uint[] ETHUSD = new uint[](3);


  // inactive -> creator can call cancel()
  // inactive -> active
  // active   -> buyer can call exercise() if not expired
  // active   -> seller can call recalimFunds() if expired
  bool public isActive;

  // BIG TODO(eforde): block.timestamp not secure...
  // BIG TODO(eforde): block.timestamp not secure...
  // BIG TODO(eforde): block.timestamp not secure...

  // events

  event LogTransferMade(address sender, address receiver, uint amount);


  constructor(bool _optionType, uint _strikePriceUSD,
    uint _maturityTime, uint _cancellationTime,
    uint _premiumAmount, bool _traderType) public payable {
    require(_optionType == false); // Only allow calls
    // set optionBuyer/optionSeller based on optionCreatorType
    if (_traderType) {
      require(msg.value == premiumAmount);
      optionBuyer = msg.sender;
    }
    else {
      require(msg.value == underlyingAmount);
      optionSeller = msg.sender;
    }

    optionCreatorType = _traderType;
    optionType = _optionType;
    strikePriceUSD = _strikePriceUSD;
    maturityTime = _maturityTime;
    premiumAmount = _premiumAmount;
    cancellationTime = _cancellationTime;

    isActive = false;
  }

  function activateContract(bool traderType) payable public {
    require(!isActive);
    require(traderType == !optionCreatorType);
    require(block.timestamp < cancellationTime); // TODO(eforde): otherwise cancel
    if (traderType) { // buyer
      require(address(this).balance == underlyingAmount);
      require(msg.value == premiumAmount);
      require(optionSeller != 0);
      optionBuyer = msg.sender;
    }
    else { // seller
      require(address(this).balance == premiumAmount);
      require(msg.value == underlyingAmount);
      require(optionBuyer != 0);
      optionSeller = msg.sender;
    }
    isActive = true;
    optionSeller.transfer(premiumAmount);
    // TODO(eforde): verify not susceptible to reentry
  }

  // complete exercise if after oracle returns and conditions are met
  function __callback(bytes32 myid, string result, bytes proof) public {
    if (msg.sender != oraclize_cbAddress()) revert();
    for (uint i = 0; i < conversion_apis.length; i++) {
      if (myid == requests[0]) {
        requests[i] = 0;
        uint result0USD = 0; //TODO(magendanz) convert result to uint
        ETHUSD[i] = result0USD;
        break;
      }
    }
    if (i != conversion_apis.length) revert(); // callback was not from a request

    // do we have all the exchange rates?
    bool recieved = true;
    for (uint j = 0; j < conversion_apis.length; j++) {
      if (requests[j] != 0) {
        recieved = false;
        break;
      }
    }
    if (recieved) { //TODO(magendanz) this relies on getting a response from all requests
      uint currentETHPrice = 0; //TODO(magendanz) find better way to eliminate outlier
      for (uint k = 0; j < conversion_apis.length; j++) {
        currentETHPrice += ETHUSD[k];
      }
      currentETHPrice /= conversion_apis.length;
      require(inTheMoney(currentETHPrice));
      require(underlyingAmount <= address(this).balance); // should be equal!

      // TODO(eforde): be careful about reentry here

      //TODO(moezinia) send underlyingAmount*(currentETHPrice-strikePrice) to optionBuyer in WEI
      uint holderSettlementAmout = ((currentETHPrice - strikePriceUSD)/currentETHPrice) * underlyingAmount;
      optionBuyer.transfer(holderSettlementAmout);
      //TODO(moezinia) send rest to seller (is amount of ether equivalent to strike price..) in WEI
      uint writerSettlementAmount = (strikePriceUSD/currentETHPrice) * underlyingAmount;
      require(writerSettlementAmount == address(this).balance);
      selfdestruct(optionSeller); // less gass

      // TODO(eforde: kill contract
    }
  }

  // initialize exercise
  function exercise() public {
    //TODO(magendanz) can seller exercise?
    require(msg.sender == optionBuyer);
    require(block.timestamp < maturityTime); // TODO(eforde): otherwise expire
    require(optionType == false);

    // Need ETH in this.balance to request current ETH price. Return error string if insufficient funds
    require((conversion_apis.length * oraclize_getPrice("URL")) > address(this).balance); //TODO(magendanz) make sure this balance var is not used for anything else
    for (uint i = 0; i < conversion_apis.length; i++) {
      requests[i] = oraclize_query("URL", conversion_apis[i]);
    }
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


  function inTheMoney(uint curEthPrice) public view returns (bool) {
    // TODO(eforde): verify price is correct, or fetch price from on-chain
    // fiat contract
    return (optionType && (curEthPrice < strikePriceUSD)) || (!optionType && (curEthPrice > strikePriceUSD));  // pul || call
  }


  // ======= Log Events ========= //

  // TODO(eforde):
  // _transaction = LogTransferMade(sender, receiver, msg.value);
}
