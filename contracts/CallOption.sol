pragma solidity ^0.4.0;
contract Option {

    address public buyer;
    address public seller;
    uint public creationTime;

    // constructor
    function Option(address buyer, address seller) public {
        buyer = msg.sender;
        etc

    }

    function Initialize(uint256 curETHValue) {
        uint256 public totalBet;


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
    // Nuking enums to get stack depth under control
    enum OptionType {call, put}
    enum Stages {outTheMoney, inTheMoney}

    Stages public curStage = Stages.outTheMoney;




    struct OneToOneTransaction {
        address     sender;     // the person putting up the stake
        address     receiver;   // the person who stands to gain the stake
        uint        value;      // the stake
    }

    // State variables
    bool                _isActive;
    bool                _isComplete;
    Conjunction[]       _condition;
    OneToOneTransaction _transaction;
    uint                _maturity;


    // The sender constructs the contract
    function initialize(
        address sender,
        address receiver,
        bytes32 lhsUnderlierType,
        address lhsUnderlierAddress,
        int     lhsUnderlierValue,
        bytes32 rhsUnderlierType,
        address rhsUnderlierAddress,
        int     rhsUnderlierValue,
        bytes32 operator,
        uint    maturity) returns (bool val) {

        _isActive = false;
        _isComplete = false;
        _maturity = maturity;
        _transaction = OneToOneTransaction(sender, receiver, msg.value);

        addCondition('OR',
                     lhsUnderlierType, lhsUnderlierAddress, lhsUnderlierValue,
                     rhsUnderlierType, rhsUnderlierAddress, rhsUnderlierValue,
                     operator);
        return true;
    }



    // The receiver validates the contract with the same parameters
    function validate() returns (bool val) {
        if(_isActive || _isComplete) {
            return false;
        }
        // Just a stub for now
        _isActive = true;
        return true;
    }

    // If not validated, allow sender to withdraw
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



    function checkConjunction(Conditional[] conditionals) private returns (bool) {
        for (uint8 i = 0; i < conditionals.length; ++i) {
            if (checkConditional(conditionals[i]) == false) {
                return false;
            }
        }
        return true;
    }

    function isConditionMet() private returns (bool) {
        if(block.number < _maturity) {
            return false;
        }

        // A condition is a disjunction of conjunctions
        for (uint8 i = 0; i < _condition.length; ++i) {
            Conditional[] conditionals = _condition[i].conditionals;
            bool satisfied = false;
            for (uint8 j = 0; j < conditionals.length; ++j) {
                if (checkConditional(conditionals[j]) == false) {
                    break;
                }
                return true;
            }
        }
        return false;
    }
}
