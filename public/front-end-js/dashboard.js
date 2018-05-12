// can play around in js console with this
var account;

function setAccount(acc) {
  account = acc;
}

$(document).ready(function() {

  const TradingAccount = web3.eth.contract(TradingAccountABI);
  //TODO(moezinia) turn on!
  // renderUserOptions();
  // const OrderBook = web3.eth.contract(OrderBookABI);

  $("#make-account").click(function() {
    // TODO(eforde): contract instantiation should probably be done on server
    // since we're gonna have to store mappings from address -> trading account
    getMetamaskAccount(function(account) {
      console.log("making trading account for ", account);
      var contractInstance = TradingAccount.new({
        data: TradingAccountBinary,
        from: account,
        gas: 1000000
      }, function(err, data) {
        if (err) {
          console.log(err);
          return;
        }
        if (data && data.address === undefined) {
          console.log("waiting for someone to mine block...");
          console.log("txn ", data.transactionHash, "follow progress at https://ropsten.etherscan.io/tx/" + data.transactionHash);
          return;
        }
        if (data.address) {
          console.log("successfully deployed contract at ", data.address);
          console.log(data);
          data.owner(function(err, data) {
            console.log("owner of contract is ", err || data);
          });
          setAccount(data);
        }
      });
    });


  });
});
