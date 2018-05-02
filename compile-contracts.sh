#! /bin/bash
echo "solcjsolcjs --abi --bin -o ./public/contracts/ ./contracts/Option.sol"
solcjs --abi --bin -o ./public/contracts/ ./contracts/Option.sol || echo "Did you run `npm install -g solc`?"

# echo "solcjsolcjs --abi --bin -o ./public/contracts/ ./contracts/TradingAccount.sol"
# solcjs --abi --bin -o ./public/contracts/ ./contracts/TradingAccount.sol || echo "Did you run `npm install -g solc`?"
