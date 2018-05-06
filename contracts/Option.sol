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
    if (myid == requests[0]) {
      requests[0] = 0;
      uint result0USD = 0; //TODO(magendanz) parse response from different APIs
      ETHUSD[0] = result0USD;

    } else if(myid == requests[1]) {
      requests[1] = 0;
      uint result1USD = 0; //TODO(magendanz) parse response from different APIs
      ETHUSD[2] = result1USD;

    } else if(myid == requests[2]) {
      requests[2] = 0;
      uint result2USD = 0; //TODO(magendanz) parse response from different APIs
      ETHUSD[3] = result2USD;

    } else revert();

    // do we have all the exchange rates?
    if (requests[0] == 0 && requests[1] == 0 && requests[2] == 0) {
      uint currentETHPrice = (ETHUSD[0] + ETHUSD[1] + ETHUSD[2])/3; //TODO(magendanz) find better way to eliminate outlier
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
  function exercise(uint currentETHPrice) public {
    //TODO(magendanz) can seller exercise?
    require(msg.sender == optionBuyer);
    require(block.timestamp < maturityTime); // TODO(eforde): otherwise expire
    require(optionType == false);

    // Need ETH in this.balance to request current ETH price. Return error string if insufficient funds
    require((3*oraclize_getPrice("URL")) > address(this).balance); //TODO(magendanz) make sure this balance var is not used for anything else
    requests[0] = oraclize_query("URL", "json(https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD).USD");
    requests[1] = oraclize_query("URL", "json(https://api.kraken.com/0/public/Ticker?pair=ETHUSD).result.XETHZUSD.c.0");
    requests[2] = oraclize_query("URL", "json(https://api.coinbase.com./v2/prices/ETH-USD/buy).data.amount");
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
