pragma solidity ^0.4.0;

//kill ? (can it ever be killed by someone)

/* exercise option function -> send ether if strike price */
/* pay premium function -> transfer to seller */

/* For example, calling suicide(address) sends all of the contract's current balance to address. */
// uses less GAS!


contract Option {

    address public buyer; // address returned from TradingAccount.sol
    address public seller;
    uint public creationTime;
    bytes32 public optionType; // put/call
    uint public numberETH;
    uint public timeOptionCreated;
    uint public curETHPrice;
    uint public ETHStrikePrice;
    uint public maturityDate;

    // Nuking enums to get stack depth under control
    enum OptionType {call, put}
    enum Stages {outTheMoney, inTheMoney}

    Stages public curStage = Stages.outTheMoney;

    // events

    event LogTransferMade(address sender, address receiver, uint amount);

    // constructor
    function Option(
      address buyer, address seller, uint creationTime,
      bytes32 optionType, uint numberETH, uint timeOptionCreated,
      uint curETHPrice, uint ETHStrikePrice, uint maturityDate, uint premium) public {
        buyer = msg.sender;
        seller = seller;
        creationTime = creationTime;
        optionType = optionType;
        numberETH = numberETH;
        timeOptionCreated = timeOptionCreated;
        curETHPrice = curETHPrice;
        ETHStrikePrice = ETHStrikePrice;
        maturityDate = maturityDate;

        payPremium(premium);
    }

    function payPremium(uint premium) {


    }


    function inTheMoney() public constant returns (bool) {

        if ....
        return true;
    }


    function exerciseOption(){
    // require = assert
    require(!checkPlayerExists(msg.sender));

    transfer()

    }



        _isActive = false;
        _isComplete = false;
        _maturity = maturity;
        _transaction = OneToOneTransaction(sender, receiver, msg.value);



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

    // ===== Utility functions ===== //

}