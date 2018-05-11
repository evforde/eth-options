pragma solidity ^0.4.0;

contract OrderBook {

  // date -> strikeprice -> smartContractAddress;
  mapping(uint => mapping(uint => address[])) public orderbookmap;
  address[] noOptions = new address[](0);
  // or use struct?

  // events
  event ConsoleLog(string description);

  // just open start
  constructor(uint _constrMaturity,
    uint _constrStrike, address _constrAd) public {
      TODO, maybe prepopulate all possible mappings since happens anyway with empty []?
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
    if (orderbookmap[maturityDate][strikePrice].length > 0) {
      orderbookmap[maturityDate][strikePrice].push(optionSmartContract);
    }
    //new strike price
    else {
      //TODO(moezinia) basically no way to check if this date mapping has strike entries already...!
      if (orderbookmap[maturityDate] > 0) {
        //TODO(moezinia) does this have to be in memory or something?
        address[] newAddresses = [optionSmartContract];
        orderbookmap[maturityDate][strikePrice] = newAddresses;
      }
      // new maturityDate and strike needed.
      else {
        address[] newAddressesforNewDate = [optionSmartContract];
        //TODO(moezinia) do these both? have to be in memory or something?
        /* mapping(uint => address[]) newDate_Strike_Option[strikePrice] = newAddressesforNewDate; */
        orderbookmap[maturityDate][strikePrice] = newAddressesforNewDate;
      }
    }
  }

  /* query with date, price, get array of addresses.... */

  function queryOrderBook(uint maturityDate,
    uint strikePrice) public pure returns (address[]) {
    if (orderbookmap[maturityDate][strikePrice].length > 0) {
      return orderbookmap[maturityDate][strikePrice];
    }
    else { //empty[]
      return noOptions;
    }
  }

  function deleteActivatedOption(uint maturityDate,
    uint strikePrice, address optionSmartContract) {
      options = orderbookmap[maturityDate][strikePrice];
      for (uint i = 0; i < options.length; i++) {
        if (options[i] == optionSmartContract) {
          delete options[i];
        }
    }


  // ===== Utility functions ===== //
}
