
function getETHPrice(cb) {
  $.get("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD",
  (data, status) => {
      price = data.USD
      console.log("price: " + price + ", number type, Status: " + status);
      cb(price);
  });
}
