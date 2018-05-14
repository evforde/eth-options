pragma solidity ^0.4.0;

contract OrderBook {
  function addOption(address optionAddr, uint maturityTime, uint strikePriceUSD) public {}
  function deleteActivatedOption(address optionAddr, uint maturityTime, uint strikePriceUSD) public {}
  function queryOrderBook(uint maturityTime, uint strikePriceUSD) public {}
}

contract Option {
  uint constant public underlyingAmount = 1e18; // 1 eth in wei

  address public optionBuyer;
  address public optionSeller;

  bool public optionType;          // put = True, call = False.
  bool public optionCreatorType;   // buyer = True, seller = False.

  uint public strikePriceUSD;
  uint public premiumAmount; // eth - wei in constructor
  uint public cancellationTime;
  uint public maturityTime;

  uint public currentETHPrice;

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
    uint _premiumAmount, bool _traderType,
    address orderBookAddress) public payable {
    require(_optionType == false); // Only allow calls
    require(_maturityTime > block.timestamp);
    require(_cancellationTime > block.timestamp);
    require(_cancellationTime <= _maturityTime);
    // set optionBuyer/optionSeller based on optionCreatorType
    if (_traderType) {
      require(msg.value >= _premiumAmount);
      optionBuyer = msg.sender;
    }
    else {
      require(msg.value >= underlyingAmount);
      optionSeller = msg.sender;
    }
    optionCreatorType = _traderType;
    optionType = _optionType;
    strikePriceUSD = _strikePriceUSD;
    maturityTime = _maturityTime;
    premiumAmount = _premiumAmount;
    cancellationTime = _cancellationTime;
    isActive = false;
    OrderBook(orderBookAddress).addOption(address(this), maturityTime, strikePriceUSD);
  }

  function activateContract(bool traderType, address orderBookAddress) payable public {
    require(!isActive);
    require(traderType == !optionCreatorType);
    require(block.timestamp < cancellationTime); // TODO(eforde): otherwise cancel
    // TODO(eforde): probably don't let people engage on contracts with themself
    if (traderType) { // buyer
      require(address(this).balance > underlyingAmount);
      require(msg.value >= premiumAmount);
      require(optionSeller != 0);
      optionBuyer = msg.sender;
    }
    else { // seller
      require(address(this).balance > premiumAmount);
      require(msg.value >= underlyingAmount);
      require(optionBuyer != 0);
      optionSeller = msg.sender;
    }
    isActive = true;
    optionSeller.transfer(premiumAmount);
    OrderBook(orderBookAddress).deleteActivatedOption(address(this), maturityTime, strikePriceUSD);
  }

  function exerciseExternalPrice (uint _currentETHPrice) public {
    currentETHPrice = _currentETHPrice;
    require(msg.sender == optionBuyer);
    require(block.timestamp < maturityTime);
    require(optionType == false);
    require(inTheMoney(currentETHPrice));
    uint writerSettlementAmount = (strikePriceUSD * underlyingAmount)/currentETHPrice;
    optionSeller.transfer(writerSettlementAmount);

    /* uint holderSettlementAmout = ((currentETHPrice - strikePriceUSD)/currentETHPrice) * underlyingAmount; */
    uint holderSettlementAmout = address(this).balance; // whatever is left over!
    selfdestruct(optionBuyer); //TODO(moezinia) !!! does this work??
    /* optionBuyer.transfer(holderSettlementAmout); */
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

  function getBalance() public view returns (uint) {
    return address(this).balance; // TODO(eforde): remove this method
  }


  // ===== Utility functions ===== //


  function inTheMoney(uint _currentETHPrice) public view returns (bool) {
    // TODO(eforde): verify price is correct, or fetch price from on-chain
    // fiat contract
    return (optionType && (_currentETHPrice < strikePriceUSD)) || (!optionType && (_currentETHPrice > strikePriceUSD));  // pul || call
  }
}
