# Git Hunters Smart Contract API Documentation

This document provides comprehensive information about the blockchain integration layer for the Git Hunters platform.

## Table of Contents

1. [Setup & Configuration](#setup--configuration)
2. [Repository Registry Functions](#repository-registry-functions)
3. [Bounty Escrow Functions](#bounty-escrow-functions)
4. [Utility Functions](#utility-functions)
5. [Error Handling](#error-handling)
6. [Usage Examples](#usage-examples)

## Setup & Configuration

### Environment Variables

Create a `.env` file in your backend root with the following variables:

```env
# Blockchain Configuration
POLYGON_RPC_URL=https://polygon-rpc.com/
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com/
BLOCKCHAIN_PRIVATE_KEY=your_private_key_here

# Contract Addresses (Production)
REPO_REGISTRY_ADDRESS=0x...
BOUNTY_ESCROW_ADDRESS=0x...

# Contract Addresses (Development)
DEV_REPO_REGISTRY_ADDRESS=0x...
DEV_BOUNTY_ESCROW_ADDRESS=0x...

# Environment
NODE_ENV=development
```

### Installation

```bash
npm install ethers dotenv
```

### Initialization

```javascript
const blockchainService = require('./blockchain/smartContractHelpers');

// Initialize the service
await blockchainService.initialize();
```

## Repository Registry Functions

### registerRepository(cid, isPublic, issueIds, userAddress)

Register a new repository on-chain.

**Parameters:**
- `cid` (string): IPFS/Filecoin CID for repo metadata
- `isPublic` (boolean): Whether the repo is public
- `issueIds` (number[]): Array of GitHub issue IDs
- `userAddress` (string): User's wallet address

**Returns:**
```javascript
{
  success: true,
  transactionHash: "0x...",
  repoId: "1",
  gasUsed: "285000"
}
```

**Usage Example:**
```javascript
const result = await blockchainService.registerRepository(
  "QmX...", // IPFS CID
  true, // Public repo
  [1, 2, 3], // Issue IDs
  "0x..." // User address
);
```

### stakeForOrganization(amount, userAddress)

Stake MATIC for organization credibility.

**Parameters:**
- `amount` (string): Amount to stake in MATIC
- `userAddress` (string): User's wallet address

**Returns:**
```javascript
{
  success: true,
  transactionHash: "0x...",
  stakedAmount: "0.1",
  gasUsed: "65000"
}
```

### assignBounty(repoId, issueId, bountyAmount)

Assign bounty to an issue.

**Parameters:**
- `repoId` (number): Repository ID
- `issueId` (number): GitHub issue ID
- `bountyAmount` (string): Bounty amount in MATIC

**Returns:**
```javascript
{
  success: true,
  transactionHash: "0x...",
  repoId: "1",
  issueId: "123",
  bountyAmount: "1.0",
  gasUsed: "120000"
}
```

### getRepository(repoId)

Get repository information.

**Parameters:**
- `repoId` (number): Repository ID

**Returns:**
```javascript
{
  success: true,
  data: {
    repoId: "1",
    cid: "QmX...",
    owner: "0x...",
    isPublic: true,
    issueIds: ["1", "2", "3"]
  }
}
```

### getIssueBounty(issueId)

Get issue bounty amount.

**Parameters:**
- `issueId` (number): GitHub issue ID

**Returns:**
```javascript
{
  success: true,
  data: {
    issueId: "123",
    bountyAmount: "1.0",
    bountyWei: "1000000000000000000"
  }
}
```

### getOrganizationStake(orgAddress)

Get organization stake amount.

**Parameters:**
- `orgAddress` (string): Organization wallet address

**Returns:**
```javascript
{
  success: true,
  data: {
    address: "0x...",
    stakeAmount: "0.1",
    stakeWei: "100000000000000000",
    hasMinimumStake: true
  }
}
```

### getRepositoryCount()

Get total repository count.

**Returns:**
```javascript
{
  success: true,
  data: {
    totalRepos: "42"
  }
}
```

## Bounty Escrow Functions

### donateToProject(repoId, amount)

Donate MATIC to project pool.

**Parameters:**
- `repoId` (number): Repository ID
- `amount` (string): Amount to donate in MATIC

**Returns:**
```javascript
{
  success: true,
  transactionHash: "0x...",
  repoId: "1",
  donationAmount: "5.0",
  gasUsed: "85000"
}
```

### fundBountyFromPool(repoId, issueId, amount, orgAddress)

Fund bounty from project pool (owner only).

**Parameters:**
- `repoId` (number): Repository ID
- `issueId` (number): GitHub issue ID
- `amount` (string): Amount to fund in MATIC
- `orgAddress` (string): Organization address

**Returns:**
```javascript
{
  success: true,
  transactionHash: "0x...",
  repoId: "1",
  issueId: "123",
  fundAmount: "1.0",
  orgAddress: "0x...",
  gasUsed: "150000"
}
```

### releaseBounty(repoId, issueId, solverAddress)

Release bounty to contributor.

**Parameters:**
- `repoId` (number): Repository ID
- `issueId` (number): GitHub issue ID
- `solverAddress` (string): Contributor's wallet address

**Returns:**
```javascript
{
  success: true,
  transactionHash: "0x...",
  repoId: "1",
  issueId: "123",
  solverAddress: "0x...",
  gasUsed: "95000"
}
```

### reclaimBounty(repoId, issueId)

Reclaim bounty (organization only).

**Parameters:**
- `repoId` (number): Repository ID
- `issueId` (number): GitHub issue ID

**Returns:**
```javascript
{
  success: true,
  transactionHash: "0x...",
  repoId: "1",
  issueId: "123",
  gasUsed: "85000"
}
```

### getBountyDetails(repoId, issueId)

Get bounty details.

**Parameters:**
- `repoId` (number): Repository ID
- `issueId` (number): GitHub issue ID

**Returns:**
```javascript
{
  success: true,
  data: {
    repoId: "1",
    issueId: "123",
    amount: "1.0",
    amountWei: "1000000000000000000",
    isPaid: false,
    fundingOrg: "0x..."
  }
}
```

### getProjectPool(repoId)

Get project pool balance.

**Parameters:**
- `repoId` (number): Repository ID

**Returns:**
```javascript
{
  success: true,
  data: {
    repoId: "1",
    poolBalance: "10.5",
    poolBalanceWei: "10500000000000000000"
  }
}
```

### hasSufficientFunds(repoId, amount)

Check if project has sufficient funds for bounty.

**Parameters:**
- `repoId` (number): Repository ID
- `amount` (string): Required amount in MATIC

**Returns:**
```javascript
{
  success: true,
  data: {
    repoId: "1",
    requiredAmount: "1.0",
    hasSufficientFunds: true
  }
}
```

### getReclaimPeriod()

Get reclaim period.

**Returns:**
```javascript
{
  success: true,
  data: {
    reclaimPeriod: "2592000",
    reclaimPeriodDays: 30
  }
}
```

## Utility Functions

### maticToWei(matic)

Convert MATIC to Wei.

**Parameters:**
- `matic` (string): Amount in MATIC

**Returns:** (string) Amount in Wei

### weiToMatic(wei)

Convert Wei to MATIC.

**Parameters:**
- `wei` (string): Amount in Wei

**Returns:** (string) Amount in MATIC

### getCurrentGasPrice()

Get current gas price.

**Returns:**
```javascript
{
  success: true,
  data: {
    gasPrice: "30000000000",
    maxFeePerGas: "40000000000",
    maxPriorityFeePerGas: "2000000000"
  }
}
```

### getNetworkInfo()

Get network information.

**Returns:**
```javascript
{
  success: true,
  data: {
    chainId: "137",
    name: "matic",
    ensAddress: null
  }
}
```

### getAccountBalance(address)

Get account balance.

**Parameters:**
- `address` (string): Wallet address

**Returns:**
```javascript
{
  success: true,
  data: {
    address: "0x...",
    balance: "15.5",
    balanceWei: "15500000000000000000"
  }
}
```

## Error Handling

All functions return a consistent error structure:

```javascript
{
  success: false,
  error: "Error message describing what went wrong"
}
```

Common error scenarios:
- **Not initialized**: Service not initialized, call `initialize()` first
- **Insufficient funds**: Not enough MATIC in wallet or project pool
- **Invalid address**: Provided address is not valid
- **Contract not found**: Contract address not configured
- **Transaction failed**: Blockchain transaction failed

## Usage Examples

### Complete Repository Setup Flow

```javascript
const blockchainService = require('./blockchain/smartContractHelpers');

async function setupRepository() {
  // 1. Initialize service
  await blockchainService.initialize();
  
  // 2. Stake for organization
  const stakeResult = await blockchainService.stakeForOrganization(
    "0.1", // 0.1 MATIC
    "0x..." // User address
  );
  
  if (stakeResult.success) {
    // 3. Register repository
    const repoResult = await blockchainService.registerRepository(
      "QmRepositoryMetadata...", // IPFS CID
      true, // Public
      [1, 2, 3], // Issue IDs
      "0x..." // User address
    );
    
    if (repoResult.success) {
      console.log('Repository registered with ID:', repoResult.repoId);
      
      // 4. Fund project pool
      const donationResult = await blockchainService.donateToProject(
        repoResult.repoId,
        "5.0" // 5 MATIC
      );
      
      if (donationResult.success) {
        // 5. Assign bounty to issue
        const bountyResult = await blockchainService.assignBounty(
          repoResult.repoId,
          1, // Issue ID
          "1.0" // 1 MATIC bounty
        );
        
        console.log('Bounty assigned:', bountyResult.success);
      }
    }
  }
}
```

### Bounty Release Flow

```javascript
async function releaseBountyFlow(repoId, issueId, contributorAddress) {
  // 1. Check bounty details
  const bountyDetails = await blockchainService.getBountyDetails(repoId, issueId);
  
  if (bountyDetails.success && !bountyDetails.data.isPaid) {
    // 2. Release bounty to contributor
    const releaseResult = await blockchainService.releaseBounty(
      repoId,
      issueId,
      contributorAddress
    );
    
    if (releaseResult.success) {
      console.log('Bounty released successfully!');
      console.log('Transaction:', releaseResult.transactionHash);
    } else {
      console.error('Failed to release bounty:', releaseResult.error);
    }
  }
}
```

### Project Analytics

```javascript
async function getProjectAnalytics(repoId) {
  const [repoInfo, poolBalance, repoCount] = await Promise.all([
    blockchainService.getRepository(repoId),
    blockchainService.getProjectPool(repoId),
    blockchainService.getRepositoryCount()
  ]);
  
  return {
    repository: repoInfo.data,
    poolBalance: poolBalance.data.poolBalance,
    totalRepositories: repoCount.data.totalRepos
  };
}
```

## Integration with Express Routes

```javascript
const express = require('express');
const blockchainService = require('./blockchain/smartContractHelpers');
const router = express.Router();

// Initialize blockchain service
blockchainService.initialize();

// Create bounty endpoint
router.post('/bounties', async (req, res) => {
  try {
    const { repoId, issueId, bountyAmount } = req.body;
    
    const result = await blockchainService.assignBounty(
      repoId,
      issueId,
      bountyAmount
    );
    
    if (result.success) {
      res.json({
        success: true,
        bounty: {
          transactionHash: result.transactionHash,
          repoId: result.repoId,
          issueId: result.issueId,
          amount: result.bountyAmount
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
```

This documentation provides a complete reference for integrating the Git Hunters smart contracts with your backend API. All functions include proper error handling and return consistent response formats for easy integration with your existing codebase.