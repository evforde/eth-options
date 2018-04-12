const ipfs = require('./src/back-end-js/IPFS');

function triggerCreateOption() {

    const createOptionButton = document.getElementById("optionOffer");
    createOptionButton.addEventListener("click", function() {

        createdOptionRow = createOptionButton.parentElement.childNodes;

        // use to get option params

        maturity = "2019:01:01";
        ETHStrikePrice = "$1000"
        ETHcurrent = "$500";
        optionPrice = "$10";


})
}

triggerCreateOption();


function sendToIPF(payload) {



}
