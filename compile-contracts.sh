#! /bin/bash
echo "solcjsolcjs --abi --bin -o ./public/contracts/ ./contracts/TradingAccount.sol"
solcjs --abi --bin -o ./public/contracts/ ./contracts/TradingAccount.sol || echo "Did you run `npm install -g solc`?"
