//------ Workflow- On Listed Options page
//
// 1) button listener when pressed fulfill
//
// 2) get buyer/seller status and trading account address
//
// 3) verify bytecode of both trading accounts (using web3 https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html)
//
// 4) TradingAccount address is going to have to send to SC (web3.sendTransaction (either depsoti collateral or the premium))
//
// 5) make sure that order has not already been fulfilled (call buyOption/sellOption on SC)
//



// Workflow Exercising option

// 1) convert time now to datetime uint for option method exercise........
//
// 2) ask for update conversion rate




// Workflow Deleting an Option

// 1) need to retrieve ETH from smart contract
//
// 2) delete from IPFS
//
// 3) update listed unfulfilled options
