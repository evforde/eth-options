var Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
};

// module.exports = function(deployer) {
//   deployer.deploy(web3.toWei(0.1, 'ether'), 100, {gas: 3000000});
// };
// Then, in the .deploy() method we specify the minimum bet, in this case it’s 0.1 ether converted to wei with that function.
// 100 is the max amount of players.
// Finally the gas limit that we are willing to use to deploy the contract.
