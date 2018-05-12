pragma solidity ^0.4.0;
import './Option.sol';

contract OrderBook {

  // date -> strikeprice -> smartContractAddress;
  mapping(uint => mapping(uint => address[])) public orderbookmap;
  // events
  event ConsoleLog(string description);

  constructor() public {
      orderbookmap[1][1] = [0x0];
  }

  /* function addOption(uint maturityDate,
    uint strikePrice, address optionSmartContract) public { */

    function addOption() public {
    uint maturityD = Option(msg.sender).maturityTime();
    uint strike = Option(msg.sender).strikePriceUSD();
    orderbookmap[maturityD][strike].push(msg.sender);
  }

  function queryOrderBook(uint maturityDate,
    uint strikePrice) public view returns (address[]) {
      return orderbookmap[maturityDate][strikePrice];
  }

  function deleteActivatedOption() public {
      uint maturityD = Option(msg.sender).maturityTime();
      uint strike = Option(msg.sender).strikePriceUSD();
      for (uint i = 0; i < orderbookmap[maturityD][strike].length; i++) {
        if (orderbookmap[maturityD][strike][i] == msg.sender) {
          delete orderbookmap[maturityD][strike][i];
        }
      }
  }
}
