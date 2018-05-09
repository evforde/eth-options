
function getETHPrice(cb) {
  $.get("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD",
  (data, status) => {
      price = int(data.USD);
      // Math.round( floatvalue );
      console.log("price: " + price + ", number type, Status: " + status);
      cb(price);
  });
}
