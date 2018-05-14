const request = require('request');



function getETHPrice() {
  request("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD",
   { json: true },
   (err, res, body) => {
   if (err) { return console.log(err); }
   else {
     return body;
     // return price = int(data.USD);
   }
  });

}


module.exports = {getETHPrice: getETHPrice};
