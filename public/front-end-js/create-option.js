class Option {
  constructor(maturity, ETHStrikePrice, ETHcurrent, optionPrice, user) {
      this.maturity = maturity
  }
  // // Getter
  // get area() {
  //   return this.calcArea();
  // }
}

function sendToIPFS(payload) {
  $.ajax({
    type: "POST",
    url: "/api/appendToIPFS",
    data: {
      data: payload,
      maturity: payload.maturity
    },
    error: function(err) {
      console.log(err, "error from post");
      return err;
    },
    success: function(res) {
      console.log("result from post is", res);
      return res;
    }
  });
}



$(document).ready(function() {

$("#optionOffer").click(function() {
  // use jQuery to get option params

  maturity = "2019:01:01";
  ETHStrikePrice = "$1000"
  ETHcurrent = "$500";
  optionPrice = "$10";
  console.log('writing to ipfs');
  const curOption = new Option(maturity, ETHStrikePrice, ETHcurrent, optionPrice, 'ricky')

  sendToIPFS(curOption);
});

});