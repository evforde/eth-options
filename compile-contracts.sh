#! /bin/bash
echo "solcjs --abi --bin -o ./public/contracts/ ./contracts/TradingAccount.sol"
solcjs --abi --bin -o ./public/contracts/ ./contracts/TradingAccount.sol || echo "Did you run `npm install -g solc`?"

echo "solcjs --abi --bin -o ./public/contracts/ ./contracts/Option.sol"
solcjs --abi --bin -o ./public/contracts/ ./contracts/Option.sol || echo "Did you run `npm install -g solc`?"

echo "solcjs --abi --bin -o ./public/contracts/ ./contracts/OrderBook.sol"
solcjs --abi --bin -o ./public/contracts/ ./contracts/Option.sol ./contracts/OrderBook.sol || echo "Did you run `npm install -g solc`?"
