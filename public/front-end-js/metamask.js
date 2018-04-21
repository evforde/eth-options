var web3;

if (typeof web3 !== 'undefined') {
  // Metamask found
  web3 = new Web3(web3.currentProvider);
} else {
  alert("Please use Chrome with the metamask extension installed");
}



// Grabs the first metamask account.
// callback should accept one arg, the account address
function getMetamaskAccount(callback) {
  web3.eth.getAccounts(function (err, accounts) {
    if (err) {
      alert("Couldn't fetch your metamask account...");
      console.log("Couldn't fetch metamask account: ", err);
      return;
    }
    if (!accounts || !accounts.length) {
      alert("Please sign in using metamask!");
      return;
    }
    callback(accounts[0]);
  });
}


// Presents a metamask prompt to the user asking them to sign message
// message should be a list of json objects with fields: type, name, value
// sender should be hex address of sender
// callback should accept one arg, which contains fields: success, err, signature
function signMessage(message, sender, callback) {
  web3.currentProvider.sendAsync({
    id: 1,
    method: 'eth_signTypedData',
    params: [message, sender],
    from: sender,
  },
  function (err, result) {
    error = err || result.error;
    if (error) {
      callback({ success: false, err: error });
      return;
    }
    callback({ success: true, signature: result.result });
  });
}

// console.log(web3.eth.getBalance(0x3a99e67c96e546b34b0fd74f5f93f8692bc2eb92))

// contract = web3.eth.getBalance(ABI).at(contractAddress)
