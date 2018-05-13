pragma solidity ^0.4.0;

contract OrderBook {

  // date -> strikeprice -> smartContractAddress;
  mapping(uint => mapping(uint => address[])) public orderbookmap;
  // events
  event ConsoleLog(string description);

  constructor() public {
  }

  function addOption(address optionAddr, uint maturityD, uint strike) public {
    /* uint maturityD = Option(optionAddr).maturityTime(); */
    /* uint strike = Option(optionAddr).strikePriceUSD(); */
    orderbookmap[maturityD][strike].push(optionAddr);
  }

  function queryOrderBook (uint maturityDate,
    uint strikePrice) public view returns (address[]) {
      return orderbookmap[maturityDate][strikePrice];
  }

  function deleteActivatedOption(address optionAddr, uint maturityD, uint strike) public {
      /* uint maturityD = Option(msg.sender).maturityTime(); */
      /* uint strike = Option(msg.sender).strikePriceUSD(); */
      for (uint i = 0; i < orderbookmap[maturityD][strike].length; i++) {
        if (orderbookmap[maturityD][strike][i] == optionAddr) {
          delete orderbookmap[maturityD][strike][i];
        }
      }
  }
}
