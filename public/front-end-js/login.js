function toHex(s) {
  var hex = "";
  for(var i = 0; i < s.length; i++) {
    hex += "" + s.charCodeAt(i).toString(16);
  }
  return `0x${hex}`;
}

// if we need more complex log in messages, follow guide here:
// https://medium.com/metamask/scaling-web3-with-signtypeddata-91d6efc8b290
const loginMessage = toHex("Logging in!");

$("#login").click(function() {
  getMetamaskAccount(function(account) {
    console.log("Account:", account);
    signMessage(loginMessage, account, function(result) {
      if (!result.success) {
        console.log("Couldn't sign login message: ", result.err);
        return;
      }
      $.ajax({
        type: "POST",
        url: "/api/authenticate",
        data: {
          signature: result.result,
          data: loginMessage,
          sender: account
        },
        success: function(res) {
          // TODO(eforde): save jwt
        }
      });
    });
  });
});
