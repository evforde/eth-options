var jwt = require("jsonwebtoken");
const sigUtil = require('eth-sig-util')

// Don't share this
const jwtPrivateKey = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBgQKBgQCZg6sEh7xlBKypfGfTXzfIG5Al3DGvhK/j74D9qX99JGWAB54l4eSjNIkUdeUv036lHv+c4fQbFUpTg9vyKejVFdfnsxnR5DfrIYW9QTTS0znTPyg+B0/Ze8P1BHOUJ9X+nxAU85ElGiAXwDkaF6K7ZSHpjJmCh/936uhNsKGq6wIDAQAB";

function getJWTForSignedMessage(loginMessage, signature, sender) {
  const signedByAddr = sigUtil.recoverTypedSignature({
    data: JSON.parse(loginMessage),
    sig: signature
  });
 
  if (signedByAddr == sender) {
    // If the signature matches the owner supplied, create a
    // JSON web token for the owner that expires in 24 hours.
    var token = jwt.sign({user: sender}, jwtPrivateKey, { expiresIn: "1d" });
    return token;
  }

  return null;
}

// Given a JWT, returns the encoded user in the callback or null if the token
// is invalid or an error occured
function verifyJWT(token, callback) {
  jwt.verify(token, jwtPrivateKey, function(err, decoded) {
    if (err)
      return callback(null);
    return callback(decoded.user);
  });
}

module.exports = {
  getJWTForSignedMessage: getJWTForSignedMessage,
  verifyJWT: verifyJWT
};
