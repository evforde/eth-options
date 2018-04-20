var jwt = require("jsonwebtoken");
const sigUtil = require('eth-sig-util')

function authenticate(body) {
  console.log(body, JSON.parse(body.data));
  const signedByAddr = sigUtil.recoverTypedSignature({
    data: JSON.parse(body.data),
    sig: body.signature 
  });
 
  console.log("addr:", signedByAddr);
  console.log(signedByAddr == body.sender);
  // TODO(eforde): return jwt
  return signedByAddr == body.sender;
}

module.exports = { authenticate: authenticate };