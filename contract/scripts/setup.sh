#!/bin/bash

# Install Scarb (Cairo package manager)
echo "Installing Scarb..."
curl --proto '=https' --tlsv1.2 -sSf https://raw.githubusercontent.com/software-mansion/scarb/main/install.sh | sh

# Install Starkli (StarkNet CLI)
echo "Installing Starkli..."
curl https://get.starkli.sh | sh
starkliup

# Create a new StarkNet account
echo "Setting up StarkNet account..."
starkli account create --network goerli-alpha

echo "Setup complete! Make sure to fund your account with testnet ETH."
echo "You can get testnet ETH from https://faucet.goerli.starknet.io/"
