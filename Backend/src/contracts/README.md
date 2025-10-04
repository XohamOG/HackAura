# Smart Contract Integration Documentation

## Overview
This folder contains all smart contract integration helper functions and utilities for the Git Hunters platform.

## Contract Addresses (Polygon Network)
- **BountyEscrow**: `0xd9145CCE52D386f254917e481eB44e9943F39138`
- **RepoRegistry**: `[TO_BE_DEPLOYED]`

## Files Structure
- `config.js` - Contract configurations and addresses
- `bountyEscrow.js` - BountyEscrow contract helper functions
- `repoRegistry.js` - RepoRegistry contract helper functions
- `web3Provider.js` - Web3 provider setup and utilities
- `contractABI.js` - Contract ABIs
- `index.js` - Main exports for contract helpers

## Environment Variables Required
```
POLYGON_RPC_URL=https://polygon-rpc.com
POLYGON_TESTNET_RPC_URL=https://rpc-mumbai.maticvigil.com
PRIVATE_KEY=your_private_key_here
BOUNTY_ESCROW_ADDRESS=0xd9145CCE52D386f254917e481eB44e9943F39138
REPO_REGISTRY_ADDRESS=your_repo_registry_address_here
NETWORK=polygon (or polygon-testnet for testing)
```

## Usage
```javascript
const { bountyEscrow, repoRegistry } = require('./contracts');

// Example: Create a bounty
const result = await bountyEscrow.fundBountyFromPool(repoId, issueId, amount, orgAddress);
```