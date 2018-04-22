pragma solidity ^0.4.17;

// - A user engaging in contractual agreement will create a trading account and
//   deposit funds
// - When they enter into an options contract, they authorize the address of the
//   smart contract to access their funds by calling authorize(addr)
// - The option smart contract will then reserve funds by calling reserve(amt),
//   which enforces that the user does not withdraw funds reserved by an
//   outstanding agreement
// - It is the option smart contract's job after expiry or exercising to either
//   return reserved funds to users' trading accounts or take the funds and
//   distribute accordingly

contract TradingAccount {
  address public owner;

  struct Reservation {
    bool isAuthorized;
    uint amount;
  }

  // Addresses authorized to access the funds of this trading account mapped to
  // the amount of funds each has reserved.
  // Should include all option contracts in which this trading account is an agent.
  mapping(address => Reservation) public authorized_reservations;

  // Should always equal the sum of values in authorized_reservations
  uint reserved_balance;

  constructor() public {
    owner = msg.sender;
    reserved_balance = 0;
  }

  //
  // Getters
  //

  function getBalance() public view returns (uint256) {
    return address(this).balance;
  }

  function amAuthorized() public view returns(bool) { // for testing
    return isAuthorized(msg.sender);
  }

  //
  // Actions performed by client
  //

  function () public payable {
  }

  function withdraw(uint amount) public returns (bool) {
    uint max_amount = address(this).balance - reserved_balance;
    require(amount <= max_amount);
    if (msg.sender == owner) {
      msg.sender.transfer(amount);
      return true;
    }
    return false;
  }

  function authorize(address addr) public {
    require(msg.sender == owner);
    require(addr != owner);
    if (isAuthorized(msg.sender)) {
      return; // do nothing
    }
    else {
      authorized_reservations[msg.sender].isAuthorized = true;
      authorized_reservations[msg.sender].amount = 0;
    }
  }

  //
  // Actions performed by Option smart contract
  //

  function setReservation(uint amount) public {
    require(isAuthorized(msg.sender));
    reserved_balance -= authorized_reservations[msg.sender].amount;
    authorized_reservations[msg.sender].amount = amount;
    reserved_balance += amount;
  }

  function withdrawReservation() public {
    require(isAuthorized(msg.sender));
    uint reservation = authorized_reservations[msg.sender].amount;
    authorized_reservations[msg.sender].amount = 0;
    msg.sender.transfer(reservation);
    reserved_balance -= reservation;
  }

  //
  // Helpers
  //

  function isAuthorized(address addr) public view returns (bool) {
    return authorized_reservations[addr].isAuthorized;
  }
}
