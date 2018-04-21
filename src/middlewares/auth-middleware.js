const metamaskAuth = require("../back-end-js/metamask-auth.js");

function checkAuthentication(req, res, next) {
  var cookie = req.cookies.authtoken;
  if (cookie !== undefined) {
    metamaskAuth.verifyJWT(cookie, function(user) {
      if (user)
        req.user = user;
      next();
    });
  }
  else {
    next();
  }
};

module.exports = function() {
  return checkAuthentication;
}
