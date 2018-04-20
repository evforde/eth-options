class Option {
  constructor(maturity, ETHStrikePrice, ETHcurrent, optionPrice, user) {
      this.maturity = maturity
  }
  // // Getter
  // get area() {
  //   return this.calcArea();
  // }
}

// const square = new Rectangle(10, 10);




function triggerCreateOption() {

    const createOptionButton = document.getElementById("optionOffer");
    createOptionButton.addEventListener("click", function() {

        createdOptionRow = createOptionButton.parentElement.childNodes;

        // use to get option params

        maturity = "2019:01:01";
        ETHStrikePrice = "$1000"
        ETHcurrent = "$500";
        optionPrice = "$10";
        console.log('writing to ipfs');
        const curOption = new Option(maturity, ETHStrikePrice, ETHcurrent, optionPrice, 'ricky')

        sendToIPFS(curOption);
})
}

triggerCreateOption();


function sendToIPFS(payload) {

    post("/api/appendToIPFS", {
        data: payload,
        maturity: payload.maturity
        // ETHStrikePrice: ETHStrikePrice,
        // ETHcurrent: ETHcurrent,
        // optionPrice: optionPrice,


    }, function(result) {
        console.log("result from post is", result);
        return result;
    },
        function(err) {
            console.log(err, "error from post");
            return err;
        }
    );
}
