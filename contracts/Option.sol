pragma solidity ^0.4.0;

//kill ? (can it ever be killed by someone)
// TODO keep track of balance?


contract Option {
  uint constant public numberETH = 1000000000000000000; // in wei

  address public optionBuyer;
  address public optionSeller;

  uint public optionCreationTime;  // what is this needed for?
  bool public optionType;          // put = True, call = False.
  // TODO(eforde): use enums for this?
  bool public optionCreatorType;   // buyer = True, seller = False.

  uint public strikePriceUSD;
  uint public premiumAmount;
  uint public cacellationTime;
  uint public maturityTime;


  // Nuking enums to get stack depth under control? enum vs bool vs uint memory sizing?
  /* enum OptionType {call, put} */
  // inactive -> creator can call cancel()
  // inactive -> active
  // active   -> buyer can call exercise() if not expired
  // active   -> seller can call recalimFunds() if expired
  enum State {inactive, active}

  State public currentState;

  // events

  event LogTransferMade(address sender, address receiver, uint amount);


  function Option(bool traderType, uint optionCreationTime,
                  bool optionType, uint strikePriceUSD, 
                  uint maturityTime, uint premiumAmount,
                  uint cancellationTime) public {
      require(optionType == False); // Only allow calls
      optionCreatorType = traderType;
      optionType = optionType;
      optionCreationTime = optionCreationTime;
      strikePriceUSD = strikePriceUSD;
      maturityTime = maturityTime;
      premiumAmount = premiumAmount;
      cancellationTime = cancellationTime;

      // set optionBuyer/optionSeller based on optionCreatorType
      if (traderType) {
        optionBuyer = msg.sender;
      }
      else {
        optionSeller = msg.sender;
      }
      currentState = State.inactive;
  }


  // call after Option constructed!
  // TODO(eforde): we should have the deposit be on construction if possible
  function initialDeposit(bool optionCreatorType) payable public {
    if (optionCreatorType) { // optionBuyer
      require(amount == premiumAmount);
    }
    else { // optionSeller
      require(amount == numberETH);
    }
  }


  function activateContract(address addr, bool traderType) payable public{
    require(currentState == States.inactive);
    require(traderType == !optionCreatorType);
    require(block.timestamp < cancellationTime); // TODO(eforde): otherwise cancel
    if (traderType) { // buyer
      require(addr(this).balance == numberETH);
      require(msg.amount == premiumAmount);
      require(optionSeller != 0);
      optionBuyer = msg.sender;
    }
    else { // seller
      require(addr(this).balance == premiumAmount);
      require(msg.amount == numberETH);
      require(optionBuyer != 0);
      optionSeller = msg.sender;
    }
    currentState = State.active;
    optionSeller.transfer(premiumAmount);
    // TODO(eforde): verify not susceptible to reentry
  }


  function exercise(uint currentETHPrice) public returns (bool) {
    require(msg.sender == optionBuyer);
    require(block.timestamp < maturityTime); // TODO(eforde): otherwise expire
    require(optionType == false); // TODO figure out put
    require(inTheMoney(currentETHPrice));

    // less gass
    require(numberETH <= address(this).balance); // should be equal!
    
    // TODO(eforde): be careful about reentry here

    // suicide(optionBuyer);
    // optionBuyer.transfer(numberETH);

    // We don't want to send all funds to the buyer... just the difference
    // between (strikePrice - currentEthPrice) * eth_amount, and then the
    // rest should go to seller
    // TODO(eforde): transfer and kill contract
  }


  function cancel(address tradingAccountAddress) public returns (bool) {
    require(currentState == States.inactive);
    require(msg.sender == optionCreatorAddress);
    suicide(msg.sender);
  }


  function reclaimFunds(address tradingAccountAddress) public returns (bool) {
    require(currentState == States.active);
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
