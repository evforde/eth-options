// if we need more complex log in messages, follow guide here:
// https://medium.com/metamask/scaling-web3-with-signtypeddata-91d6efc8b290
const loginMessage = [
  {
    type: "string",       // Any valid solidity type
    name: "Message",      // Any string label you want
    value: "Logging in!"  // The value to sign
 }
];

$("window").ready(function() {

$("#login").click(function() {
  getMetamaskAccount(function(account) {
    signMessage(loginMessage, account, function(result) {
      if (!result.success) {
        alert("Could not authenticate");
        return;
      }

      $.ajax({
        type: "POST",
        url: "/api/authenticate",
        data: {
          signature: result.signature,
          data: JSON.stringify(loginMessage),
          sender: account
        },
        success: function(res) {
          if (res.success) {
            $("#container").addClass("collapsed");
            setTimeout(function() {
              window.location = "/dashboard";
            }, 200);
          }
          else
            alert("Could not authenticate");
        }
      });
    });
  });
});

});
