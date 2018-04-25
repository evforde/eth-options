pragma solidity ^0.4.0;

//kill ? (can it ever be killed by someone)
// TODO keep track of balance?


contract Option {
  uint constant public underlyingAmount = 1000000000000000000; // 1 eth in wei

  address public optionBuyer;
  address public optionSeller;

  bool public optionType;          // put = True, call = False.
  bool public optionCreatorType;   // buyer = True, seller = False.

  uint public strikePriceUSD;
  uint public premiumAmount;
  uint public cacellationTime;
  uint public maturityTime;

  bool public isActive;

  // BIG TODO(eforde): block.timestamp not secure...
  // BIG TODO(eforde): block.timestamp not secure...
  // BIG TODO(eforde): block.timestamp not secure...

  // Nuking enums to get stack depth under control? enum vs bool vs uint memory sizing?
  /* enum OptionType {call, put} */
  // inactive -> creator can call cancel()
  // inactive -> active
  // active   -> buyer can call exercise() if not expired
  // active   -> seller can call recalimFunds() if expired

  // events

  event LogTransferMade(address sender, address receiver, uint amount);


  function Option(bool optionType, uint strikePriceUSD, 
                  uint maturityTime, uint cancellationTime,
                  uint premiumAmount, bool traderType) public payable {
      require(optionType == False); // Only allow calls

      // set optionBuyer/optionSeller based on optionCreatorType
      if (traderType) {
        require(msg.value == premiumAmount);
        optionBuyer = msg.sender;
      }
      else {
        require(msg.value == underlyingAmount);
        optionSeller = msg.sender;
      }

      optionCreatorType = traderType;
      optionType = optionType;
      strikePriceUSD = strikePriceUSD;
      maturityTime = maturityTime;
      premiumAmount = premiumAmount;
      cancellationTime = cancellationTime;

      isActive = false;
  }

  function activateContract(address addr, bool traderType) payable public{
    require(!isActive);
    require(traderType == !optionCreatorType);
    require(block.timestamp < cancellationTime); // TODO(eforde): otherwise cancel
    if (traderType) { // buyer
      require(addr(this).balance == underlyingAmount);
      require(msg.amount == premiumAmount);
      require(optionSeller != 0);
      optionBuyer = msg.sender;
    }
    else { // seller
      require(addr(this).balance == premiumAmount);
      require(msg.amount == underlyingAmount);
      require(optionBuyer != 0);
      optionSeller = msg.sender;
    }
    isActive = true;
    optionSeller.transfer(premiumAmount);
    // TODO(eforde): verify not susceptible to reentry
  }


  function exercise(uint currentETHPrice) public returns (bool) {
    require(msg.sender == optionBuyer);
    require(block.timestamp < maturityTime); // TODO(eforde): otherwise expire
    require(optionType == false); // TODO figure out put
    require(inTheMoney(currentETHPrice));

    require(underlyingAmount <= address(this).balance); // should be equal!
    
    // TODO(eforde): be careful about reentry here

    // suicide(optionBuyer);
    // optionBuyer.transfer(underlyingAmount);

    // We don't want to send all funds to the buyer... just the difference
    // between (strikePrice - currentEthPrice) * eth_amount, and then the
    // rest should go to seller
    // TODO(eforde): transfer and kill contract
  }


  function cancel() public returns (bool) {
    require(!isActive);
    require(msg.sender == optionCreatorAddress);
    suicide(msg.sender);
  }


  function reclaimFunds() public returns (bool) {
    require(isActive);
    require(msg.sender == optionSeller);
    require(block.timestamp > maturityTime);
    suicide(msg.sender);
  }


  // ===== Utility functions ===== //


  function inTheMoney(uint curETHPrice) private returns (bool) {
    // TODO(eforde): verify price is correct, or fetch price from on-chain
    // fiat contract
    return (optionType && (curEthPrice < strikePriceUSD)) || // put
           (!optionType && (curEthPrice > strikePriceUSD));  // call
  }


  // ======= Log Events ========= //

  _transaction = LogTransferMade(sender, receiver, msg.value);
}
