const request = require('request');

var ethPriceUSD;

function fetchEthPrice() {
  request("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD",
   { json: true },
   (err, res, body) => {
     if (err)
      return console.log(err);
     else {
       ethPriceUSD = (body.USD.toFixed(2)).toString();
       // console.log(ethPriceUSD);
     }
  });
}

fetchEthPrice();
setInterval(fetchEthPrice, 10000);

function getEthPrice() {
  return ethPriceUSD;
}

module.exports = {getEthPrice: getEthPrice};
