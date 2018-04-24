pragma solidity ^0.4.0;

//kill ? (can it ever be killed by someone)

/* exercise option function -> send ether if strike price */
/* pay premium function -> transfer to seller */

/* For example, calling suicide(address) sends all of the contract's current balance to address. */
// uses less GAS!


contract Option {

    address public buyer; // address returned from TradingAccount.sol
    address public seller;
    uint public optionCreationTime;
    bytes32 public optionType; // put/call
    uint public numberETH;
    uint public optionFulfilledTime;
    uint public curETHPrice;
    uint public ETHStrikePrice;
    uint public maturityDate;
    string public optionCreatorType
    uint public premiumAmount;

    // Nuking enums to get stack depth under control
    enum OptionType {call, put}
    enum Stages {outTheMoney, inTheMoney}

    Stages public curStage = Stages.outTheMoney;

    // events

    event LogTransferMade(address sender, address receiver, uint amount);

    // constructor
    function Option(
      address optionCreatorAddress, string optionCreatorType, uint optionCreationTime,
      bytes32 optionType, uint numberETH,
      uint curETHPrice, uint ETHStrikePrice, uint maturityDate, uint premium) public {


        // set buyer/seller based on optionCreatorType

        optionCreatorAddress = msg.sender;
        optionCreatorType = optionCreatorType; //buyer/seller
        optionType = optionType; // put/call
        numberETH = numberETH; // option value
        optionCreationTime = optionCreationTime;
        ETHStrikePrice = ETHStrikePrice;
        maturityDate = maturityDate;
    }


    // call after Option constructed!
    function initialDeposit(amount, optionCreatorType) payable public {
      // either premium or collateral
      require(msg.value == amount);
      // deposits mapping? bookeeping if necessary
      if optionCreatorType == "buyer" {
        premiumAmount = amount;
      }
      else {
        require(msg.value == numberETH);
      }

    }



    function attemptFulfillment() {
      // see if there's another dude


    }

    function fulfillOption() {

      uint public optionFulfilledTime;
      curETHPrice = curETHPrice;




    }





    function exerciseOption(){
    // require = assert
    require(!checkPlayerExists(msg.sender));

    transfer()

    }





    // ===== Utility functions ===== //


    function inTheMoney() public constant returns (bool) {

        if ....
        return true;
    }


    // If SOME INVLALIDITY??, allow sender to withdraw
    function withdraw() returns (bool val) {
        if(_isActive || _isComplete) {
            return false;
        }
        _transaction.sender.send(this.balance);
        // suicide(_transaction.sender);
        _isActive = false;
        _isComplete = true;
        return true;
    }

    // If condition is met on maturity, allow receiver to claim from escrow
    function trigger() returns (bool val) {
        if (!_isActive || _isComplete || !isConditionMet()) {
            return false;
        }
        _transaction.receiver.send(this.balance);
        // suicide(_transaction.receiver);
        _isActive = false;
        _isComplete = true;
        return true;
    }

    // If condition is not met on maturity, allow sender to reclaim from escrow
    function recall() returns (bool val) {
        if (!_isActive || _isComplete || isConditionMet()) {
            return false;
        }
        _transaction.sender.send(this.balance);
        // suicide(_transaction.sender);
        _isActive = false;
        _isComplete = true;
        return true;
    }


    // ======= Log Events ========= //

    _transaction = OneToOneTransaction(sender, receiver, msg.value);


}
