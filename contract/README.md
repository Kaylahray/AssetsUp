# ManageAssets StarkNet Smart Contracts

This directory contains the StarkNet smart contracts for the ManageAssets application, written in Cairo 1.0.

## Structure

- `src/asset_registry.cairo`: Handles asset registration and tracking
- `src/asset_transfer.cairo`: Manages ownership transfers
- `src/asset_lifecycle.cairo`: Tracks asset lifecycle events (maintenance, decommissioning)
- `src/interfaces.cairo`: Contains contract interfaces and shared types
- `src/asset_manager.cairo`: Main contract that combines all components

## Development Setup

1. Install dependencies:

\`\`\`bash
./scripts/setup.sh
\`\`\`

2. Build the contracts:

\`\`\`bash
scarb build
\`\`\`

3. Test the contracts:

\`\`\`bash
scarb test
\`\`\`

4. Deploy the contracts:

\`\`\`bash
./scripts/deploy.sh
\`\`\`

## Contract Functionality

### Asset Registration

- Register new assets with unique identifiers
- Store asset metadata on-chain
- Verify asset existence

### Asset Transfer

- Transfer ownership between users
- Track ownership history
- Verify ownership for operations

### Asset Lifecycle

- Record maintenance events
- Decommission assets
- Retrieve complete asset history

## Environment Variables

Create a `.env` file with the following variables:

\`\`\`
STARKNET_ACCOUNT=your_account_address
STARKNET_PRIVATE_KEY=your_private_key
STARKNET_RPC_URL=https://alpha4.starknet.io
\`\`\`

## Integration with Backend

The NestJS backend interacts with these contracts through the StarkNet.js library, providing a bridge between the application and the blockchain.
