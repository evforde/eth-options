// if we need more complex log in messages, follow guide here:
// https://medium.com/metamask/scaling-web3-with-signtypeddata-91d6efc8b290
const loginMessage = [
  {
    type: "string",       // Any valid solidity type
    name: "Message",      // Any string label you want
    value: "Logging in!"  // The value to sign
 }
];

$("#login").click(function() {
  getMetamaskAccount(function(account) {
    console.log("Account:", account);
    signMessage(loginMessage, account, function(result) {
      if (!result.success) {
        console.log("Couldn't sign login message: ", result.err);
        return;
      }
      console.log("sig", result.signature)
      $.ajax({
        type: "POST",
        url: "/api/authenticate",
        data: {
          signature: result.signature,
          data: JSON.stringify(loginMessage),
          sender: account
        },
        success: function(res) {
          // TODO(eforde): save jwt
        }
      });
    });
  });
});
