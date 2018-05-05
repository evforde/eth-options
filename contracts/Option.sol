pragma solidity ^0.4.0;

contract Option {
  uint constant public underlyingAmount = 1000000000000000000; // 1 eth in wei

  address public optionBuyer;
  address public optionSeller;

  bool public optionType;          // put = True, call = False.
  bool public optionCreatorType;   // buyer = True, seller = False.

  uint public strikePriceUSD;
  uint public premiumAmount;
  uint public cancellationTime;
  uint public maturityTime;

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


  function exercise(uint currentETHPrice) public {
    // TODO(magendanz) discuss inability to decentralize because we are cheap (no oracle),
    // and there is only one USD-ETH contract API on the blockchain and we don't want to
    // create a dependency (FiatContract)
    // TODO(magendanz) do we want some sort of cryptographic authentication that the server
    // is the only one making this function call?
    require(msg.sender == optionBuyer);
    require(block.timestamp < maturityTime); // TODO(eforde): otherwise expire
    require(optionType == false);
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


  function cancel() public {
    require(!isActive);
    // Assert sender created the contract
    require((optionCreatorType && (msg.sender == optionBuyer)) ||
            (!optionCreatorType && (msg.sender == optionSeller)));
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
    return (optionType && (curEthPrice < strikePriceUSD)) || // put
           (!optionType && (curEthPrice > strikePriceUSD));  // call
  }


  // ======= Log Events ========= //

  // TODO(eforde):
  // _transaction = LogTransferMade(sender, receiver, msg.value);
}
