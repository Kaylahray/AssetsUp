#!/bin/bash

# Build the contract
echo "Building contract..."
scarb build

# Deploy the contract to StarkNet
echo "Deploying contract..."
starkli declare ./target/dev/manage_assets_AssetManager.sierra.json --account $STARKNET_ACCOUNT --rpc $STARKNET_RPC_URL

# Get the class hash from the output
CLASS_HASH=$(starkli class-hash ./target/dev/manage_assets_AssetManager.sierra.json)
echo "Class hash: $CLASS_HASH"

# Deploy the contract instance
echo "Deploying contract instance..."
starkli deploy $CLASS_HASH --account $STARKNET_ACCOUNT --rpc $STARKNET_RPC_URL

echo "Deployment complete!"
