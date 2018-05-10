pragma solidity ^0.4.0;

contract OrderBook {

  // date -> strikeprice -> smartContractAddress;
  mapping(uint => mapping(uint => address[])) public orderbookmap;
  address[](1) noOptions = [];
  // or use struct?

  // events
  event ConsoleLog(string description);

  // just open start
  constructor(uint _constrMaturity,
    uint _constrStrike, address _constrAd) public {
      orderbookmap[1][1] = [0x0];
  }

  /* {
    19th: {
          $130: [0x583, 0x4378],
          $149: [0x8394, 0x8340]
    },
    20th: {
      $130: [0x583, 0x4378],
      $149: [0x8394, 0x8340]
    },
    .
    .
    .
    30th: {
      $130: [0x5832, 0x4378],
      $149: [0x8394, 0x8340]
      $189: [0x3489]
    }
  } */


  // insert an Adrs into dict
  function addOption(uint maturityDate,
    uint strikePrice, address optionSmartContract) public {
    // new option
    if (orderbookmap[maturityDate][strikePrice]) {
      orderbookmap[maturityDate][strikePrice].push(optionSmartContract);
    }
    //new strike price
    else {
      if (orderbookmap[maturityDate]) {
        address[] newAddresses = [optionSmartContract];
        orderbookmap[maturityDate][strikePrice] = newStrike_Option;
      }
      // new maturityDate
      else {
        address[] newAddressesforNewDate = [optionSmartContract];
        mapping(uint => address[]) newDate_Strike_Option[strikePrice] = newAddressesforNewDate;
        orderbookmap[maturityDate] = newDate_Strike_Option;
      }
    }
  }

  /* query with date, price, get array of addresses.... */

  function queryOrderBook(uint maturityDate,
    uint strikePrice) public pure returns (address[]) {
    if (orderbookmap[maturityDate][strikePrice]) {
      return orderbookmap[maturityDate][strikePrice];
    }
    else { //empty[]
      return noOptions;
    }
  }


  // ===== Utility functions ===== //
}
