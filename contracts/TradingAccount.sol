pragma solidity ^0.4.17;

contract TradingAccount {
  address public owner;

  // Balance reserved for existing, active option contracts
  uint public reserved_balance;

  // Addresses authorized to access the funds of this trading account.
  // Should include all option contracts in which this trading account is an agent.
  address[] public authorized_addresses;

  function TradingAccount() public {
    owner = msg.sender;
  }

  function verify(address p, bytes32 hash, uint8 v, bytes32 r, bytes32 s) private pure returns(bool) {
    // Note: this only verifies that signer is correct.
    // You'll also need to verify that the hash of the data
    // is also correct.
    return ecrecover(hash, v, r, s) == p;
  }

  function authorize(address addr) public {
    // TODO: verify message signature
    authorized_addresses.push(addr);
  }

  function withdraw(uint amount) public returns (bool) {
    if (amount > this.balance) {
      amount = this.balance;
    }
    if (msg.sender == owner || isAuthorized(msg.sender)) {
      msg.sender.transfer(amount);
      return true;
    }
    return false;
  }

  function isAuthorized(address addr) private constant returns (bool) {
    // Check if address is authorized
    for (uint i = 0; i < authorized_addresses.length; i++) {
      if (addr == authorized_addresses[i])
        return true;
    }
    return false;
  }

}
