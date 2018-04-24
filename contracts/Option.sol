pragma solidity ^0.4.0;

//kill ? (can it ever be killed by someone)
// TODO keep track of balance?


contract Option {

  address public optionBuyer; // address returned from TradingAccount.sol
  address public optionSeller;
  uint public optionCreationTime;
  bool public optionType; // put = True, call = False
  bool public optionCreatorType; // optionBuyer = True, optionSeller = False
  bool public traderType; // optionBuyer = True, optionSeller = False
  uint public numberETH;
  /* uint public optionFulfilledTime;TODO remove? */
  uint public curETHPrice;
  uint public strikePriceUSD;
  uint public maturityDate;
  uint public premiumAmount;

  uint public contractBalance;


  // Nuking enums to get stack depth under control? enum vs bool vs uint memory sizing?
  /* enum OptionType {call, put} */
  enum Stages {outTheMoney, inTheMoney, unfulfilled, exercised}

  // events

  event LogTransferMade(address sender, address receiver, uint amount);

  // constructor
  function Option(
    address optionCreatorAddress, bool optionCreatorType,
    uint optionCreationTime, bool optionType, uint numberETH,
    uint strikePriceUSD, uint maturityDate, uint premiumAmount) public {

      require(msg.sender == optionCreatorAddress);
      optionCreatorAddress = msg.sender;
      optionCreatorType = optionCreatorType; //optionBuyer = True, optionSeller = False
      optionType = optionType; // put = True, call = False
      numberETH = numberETH; // option value
      optionCreationTime = optionCreationTime;
      strikePriceUSD = strikePriceUSD;
      maturityDate = maturityDate;
      premiumAmount = premiumAmount;

      contractBalance = address(this).balance;

      // set optionBuyer/optionSeller based on optionCreatorType
      if (optionCreatorType) {
        optionBuyer = optionCreatorAddress;
      }
      else {
        optionSeller = optionCreatorAddress;
      }
      Stages public currentStage = Stages.unfulfilled;
  }


  // call after Option constructed!
  function initialDeposit(uint amount, bool optionCreatorType) payable public {
    // TODO wei vs ether
    require(msg.value == amount);
    // optionBuyer
    if (optionCreatorType) {
      require(amount == premiumAmount);
    }
    else {
      // optionSeller
      require(amount == numberETH);
    }

  }

  function attemptFulfillment(address tradingAccountAddress, bool traderType, uint amount, uint curETHPrice) payable public returns (bool) {
    if (currentStage == Stages.unfulfilled) {
      fulfillOption(tradingAccountAddress, traderType, amount, curETHPrice);
      return true;
    }
    return false;
  }

  function fulfillOption(address tradingAccountAddress, bool traderType, uint curETHPrice) payable private {
    // TODO wei vs ether
    require(msg.value == amount);
    curETHPrice = curETHPrice;

    if (traderType) {
      require(amount == premiumAmount);
      optionBuyer = tradingAccountAddress;
    }
    else {
      require(amount == numberETH);
      optionSeller = tradingAccountAddress;
    }
    // option fulfilled !
    Stages currentStage = Stages.outTheMoney;

    // transfer premiumAmount to optionSeller
    optionSeller.transfer(uint premiumAmount);
  }

  function exerciseOption(uint currentETHPrice) public returns (bool) {

    require(msg.sender == optionBuyer);
    // TODO figure out put
    if (optionType) {
      return false;
    }
    // call
    else {
      if (inTheMoney(currentETHPrice)) {
        //less gass
        require(numberETH == address(this).balance); //should be equal!
        suicide(optionBuyer);
        /* optionBuyer.transfer(numberETH); */
        Stages currentStage = Stages.exercised;
        return true;
      }
      else {
        return false;
      }
    }
  }



  function deleteOption(address tradingAccountAddress) public returns (bool) {
    if (currentStage = Stages.unfulfilled) {
      if (tradingAccountAddress == optionCreatorAddress) {
        // suicide less gas!
        suicide(tradingAccountAddress);
        /* tradingAccountAddress.transfer(address(this).balance); */
      }
    }

    else {
      return false;
    }
  }



  // ===== Utility functions ===== //

  function checkPlayerExists(address tradingAccountAddress) private returns (bool) {
    if (tradingAccountAddress == optionBuyer) || (tradingAccountAddress == optionSeller) {
      return true;
    }
    else {
      return false;
    }
  }



  /* Stages public currentStage = Stages.outTheMoney; */

  function inTheMoney(uint curETHPrice) private returns (bool) {
    // put
    if (optionType) {
      if (curETHPrice < strikePriceUSD) {
        Stages currentStage = Stages.inTheMoney;
        return true;
      }
      else {
        Stages currentStage = Stages.outTheMoney;
        return false;
      }
    }
    // call
    else {
      if (curETHPrice > strikePriceUSD) {
        Stages currentStage = Stages.inTheMoney;
        return true;
      }
      else {
        Stages currentStage = Stages.outTheMoney;
        return false;
      }
    }
    return false;
  }





  // ======= Log Events ========= //

  _transaction = LogTransferMade(sender, receiver, msg.value);


}
