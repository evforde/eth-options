var web3 = new Web3();

if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
  console.log(' using current provider (metmask)')
} else {
  // set the provider you want from Web3.providers
  // should use metamask
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:3000"));
}

console.log(web3.eth.getBalance(0x3ce56307bb3dde4d831170b40f9148b934a778e9))

// contract = web3.eth.getBalance(ABI).at(contractAddress)
