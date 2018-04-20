var jwt = require("jsonwebtoken");
var ethUtil = require("ethereumjs-util");

function authenticate(body) {
  // Same data as before
  var data = body.data;;
  var message = ethUtil.toBuffer(data);
  var msgHash = ethUtil.hashPersonalMessage(message);

  // Get the address of whoever signed this message  
  var signature = ethUtil.toBuffer(body.signature);
  var sigParams = ethUtil.fromRpcSig(signature);
  var publicKey = ethUtil.ecrecover(msgHash, sigParams.v, sigParams.r, sigParams.s);
  var sender = ethUtil.publicToAddress(publicKey);
  var signedByAddr = ethUtil.bufferToHex(sender);
 
  console.log("addr:", signedByAddr);
  console.log(signedByAddr == body.sender);
  // TODO(eforde): return jwt
  return signedByAddr == body.sender;
}

module.exports = { authenticate: authenticate };