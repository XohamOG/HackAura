# Git Hunters Smart Contract API Documentation

## Overview
This API provides endpoints to interact with the Git Hunters smart contracts deployed on Polygon network. The API operates in **MetaMask mode** by default, returning transaction data for users to sign with their own wallets.

## Base URL
```
http://localhost:4000/api/contracts
```

## Smart Contracts
- **BountyEscrow**: `0xd9145CCE52D386f254917e481eB44e9943F39138`
- **RepoRegistry**: `0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8`

## Transaction Modes
- **MetaMask Mode** (Default): API returns transaction data for user signing
- **Backend Mode**: Server signs transactions (requires private key)
- **Hybrid Mode**: Both approaches supported

## Network
- **Polygon Mainnet** (Chain ID: 137)
- **RPC**: https://polygon-rpc.com
- **Currency**: MATIC

---

## Endpoints

### 🏦 **Bounty Escrow Operations**

#### Prepare Donation Transaction (MetaMask)
```http
POST /api/contracts/donate
```

**Description**: Get transaction data for donating MATIC to a project's funding pool (for MetaMask signing).

**Request Body**:
```json
{
  "repoId": 1,
  "amount": "0.5",
  "userAddress": "0x..." // required - user's wallet address
}
```

**Response** (Transaction Data for MetaMask):
```json
{
  "success": true,
  "message": "Transaction data prepared for MetaMask signing",
  "data": {
    "to": "0xd9145CCE52D386f254917e481eB44e9943F39138",
    "data": "0x...", // encoded function call
    "value": "500000000000000000", // 0.5 MATIC in wei
    "from": "0x...", // user's address
    "repoId": 1,
    "amount": "0.5"
  }
}
```

---

#### Fund Bounty from Pool
```http
POST /api/contracts/fund-bounty
```

**Description**: Fund a bounty using funds from the project pool.

**Request Body**:
```json
{
  "repoId": 1,
  "issueId": 123,
  "amount": "0.1",
  "orgAddress": "0x..."
}
```

**Response**:
```json
{
  "success": true,
  "message": "Bounty funded successfully!",
  "data": {
    "transactionHash": "0x...",
    "repoId": 1,
    "issueId": 123,
    "amount": "0.1",
    "orgAddress": "0x..."
  }
}
```

---

#### Release Bounty
```http
POST /api/contracts/release-bounty
```

**Description**: Release bounty to a contributor who solved the issue.

**Request Body**:
```json
{
  "repoId": 1,
  "issueId": 123,
  "solverAddress": "0x..."
}
```

**Response**:
```json
{
  "success": true,
  "message": "Bounty released successfully!",
  "data": {
    "transactionHash": "0x...",
    "repoId": 1,
    "issueId": 123,
    "solver": "0x..."
  }
}
```

---

#### Get Bounty Details
```http
GET /api/contracts/bounty/:repoId/:issueId
```

**Description**: Get details of a specific bounty.

**Response**:
```json
{
  "success": true,
  "data": {
    "amount": "0.1",
    "amountWei": "100000000000000000",
    "paid": false,
    "org": "0x...",
    "repoId": 1,
    "issueId": 123
  }
}
```

---

#### Get Project Pool Balance
```http
GET /api/contracts/pool/:repoId
```

**Description**: Get the current balance of a project's funding pool.

**Response**:
```json
{
  "success": true,
  "data": {
    "balance": "1.5",
    "balanceWei": "1500000000000000000",
    "repoId": 1
  }
}
```

---

### 📚 **Repository Registry Operations**

#### Prepare Staking Transaction (MetaMask)
```http
POST /api/contracts/stake
```

**Description**: Get transaction data for staking MATIC to establish organization credibility.

**Request Body**:
```json
{
  "amount": "0.1",
  "userAddress": "0x..." // required - user's wallet address
}
```

**Response** (Transaction Data for MetaMask):
```json
{
  "success": true,
  "message": "Transaction data prepared for MetaMask signing",
  "data": {
    "to": "0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8",
    "data": "0x...", // encoded function call
    "value": "100000000000000000", // 0.1 MATIC in wei
    "from": "0x...", // user's address
    "amount": "0.1"
  }
}
```

---

#### Register Repository
```http
POST /api/contracts/register-repo
```

**Description**: Register a new repository on the blockchain.

**Request Body**:
```json
{
  "cid": "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
  "isPublic": true,
  "issueIds": [123, 456, 789],
  "ownerAddress": "0x..." // optional
}
```

**Response**:
```json
{
  "success": true,
  "message": "Repository registered successfully!",
  "data": {
    "transactionHash": "0x...",
    "repoId": 1,
    "cid": "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
    "isPublic": true,
    "issueIds": [123, 456, 789],
    "owner": "0x..."
  }
}
```

---

#### Assign Bounty to Issue
```http
POST /api/contracts/assign-bounty
```

**Description**: Assign a bounty amount to a specific issue.

**Request Body**:
```json
{
  "repoId": 1,
  "issueId": 123,
  "bountyAmount": "0.1",
  "creatorAddress": "0x..." // optional
}
```

**Response**:
```json
{
  "success": true,
  "message": "Bounty assigned successfully!",
  "data": {
    "transactionHash": "0x...",
    "repoId": 1,
    "issueId": 123,
    "bountyAmount": "0.1",
    "creator": "0x..."
  }
}
```

---

#### Get Repository Details
```http
GET /api/contracts/repo/:repoId
```

**Description**: Get basic repository information.

**Response**:
```json
{
  "success": true,
  "data": {
    "repoId": 1,
    "cid": "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
    "owner": "0x...",
    "isPublic": true,
    "issueIds": [123, 456, 789]
  }
}
```

---

#### Get Complete Repository Information
```http
GET /api/contracts/repo/:repoId/complete
```

**Description**: Get comprehensive repository information including bounties and pool.

**Response**:
```json
{
  "success": true,
  "data": {
    "repoId": 1,
    "repository": {
      "cid": "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
      "owner": "0x...",
      "isPublic": true,
      "issueIds": [123, 456]
    },
    "projectPool": {
      "balance": "1.5",
      "balanceWei": "1500000000000000000"
    },
    "assignedBounties": {
      "bounties": [
        {
          "issueId": 123,
          "bounty": "0.1",
          "bountyWei": "100000000000000000"
        }
      ],
      "totalAmount": 0.1
    },
    "fundedBounties": [
      {
        "issueId": 123,
        "assignedAmount": "0.1",
        "fundedAmount": "0.1",
        "paid": false,
        "org": "0x..."
      }
    ],
    "totalAssignedValue": 0.1,
    "totalFundedValue": 0.1
  }
}
```

---

#### Get Repositories by Owner
```http
GET /api/contracts/repos/owner/:address
```

**Description**: Get all repositories owned by a specific address.

**Response**:
```json
{
  "success": true,
  "data": {
    "repos": [
      {
        "repoId": 1,
        "cid": "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
        "owner": "0x...",
        "isPublic": true,
        "issueIds": [123, 456]
      }
    ],
    "count": 1,
    "ownerAddress": "0x..."
  }
}
```

---

### � **Transaction Management**

#### Confirm Transaction
```http
POST /api/contracts/confirm-transaction
```

**Description**: Confirm a MetaMask transaction was successful and update local state.

**Request Body**:
```json
{
  "txHash": "0x...",
  "type": "donate", // donate, stake, register, assign-bounty, etc.
  "metadata": {
    "repoId": 1,
    "amount": "0.5"
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "donate transaction confirmed!",
  "data": {
    "txHash": "0x...",
    "blockNumber": 12345,
    "gasUsed": "21000",
    "type": "donate",
    "metadata": {...},
    "receipt": {...}
  }
}
```

---

#### Get Transaction Status
```http
GET /api/contracts/transaction/:txHash
```

**Description**: Get the status and details of a transaction.

**Response**:
```json
{
  "success": true,
  "data": {
    "txHash": "0x...",
    "status": "success", // success, failed, pending
    "blockNumber": 12345,
    "gasUsed": "21000",
    "receipt": {...}
  }
}
```

### �🔧 **Utility Operations**

#### Get Network Information
```http
GET /api/contracts/network-info
```

**Response**:
```json
{
  "success": true,
  "data": {
    "rpcUrl": "https://polygon-rpc.com",
    "chainId": 137,
    "name": "Polygon Mainnet"
  }
}
```

---

#### Get Account Balance
```http
GET /api/contracts/balance/:address
```

**Response**:
```json
{
  "success": true,
  "data": {
    "wei": "1500000000000000000",
    "ether": "1.5"
  }
}
```

---

#### Get Minimum Stake Amount
```http
GET /api/contracts/min-stake
```

**Response**:
```json
{
  "success": true,
  "data": {
    "minStake": "0.1",
    "minStakeWei": "100000000000000000"
  }
}
```

---

### 🚀 **Combined Operations**

#### Create Complete Bounty
```http
POST /api/contracts/create-complete-bounty
```

**Description**: Complete workflow to register repo, assign bounty, and fund if possible.

**Request Body**:
```json
{
  "cid": "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
  "isPublic": true,
  "issueIds": [123, 456],
  "issueId": 123,
  "bountyAmount": "0.1"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Complete bounty created successfully!",
  "data": {
    "repoId": 1,
    "issueId": 123,
    "bountyAmount": "0.1",
    "repoTxHash": "0x...",
    "bountyTxHash": "0x...",
    "fundTxHash": "0x...",
    "fullyFunded": true
  }
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

### Common Error Codes:
- `400` - Bad Request (invalid parameters)
- `404` - Not Found (resource doesn't exist) 
- `500` - Internal Server Error

---

## Environment Setup

### Required Environment Variables:
```env
# Network Configuration
NETWORK=polygon
POLYGON_RPC_URL=https://polygon-rpc.com
POLYGON_TESTNET_RPC_URL=https://rpc-mumbai.maticvigil.com

# Contract Addresses (DEPLOYED)
BOUNTY_ESCROW_ADDRESS=0xd9145CCE52D386f254917e481eB44e9943F39138
REPO_REGISTRY_ADDRESS=0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8

# Transaction Mode
TRANSACTION_MODE=metamask
# Options: 'metamask' (user signs), 'backend' (server signs), 'hybrid' (both)

# Private Key (ONLY needed for backend/hybrid mode)
PRIVATE_KEY=PLACEHOLDER_PRIVATE_KEY
```

### Health Check Response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-04T21:44:00.000Z",
  "network": "polygon",
  "mode": "read-only", // or "read-write" if private key set
  "contracts": {
    "bountyEscrow": "0xd9145CCE52D386f254917e481eB44e9943F39138",
    "repoRegistry": "0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8"
  },
  "setup": {
    "privateKey": "⚠️ Not set (read-only mode)",
    "contracts": "✅ Addresses configured",
    "rpc": "✅ Polygon RPC configured"
  }
}
```

---

## Integration Examples

### MetaMask Transaction Flow:

#### 1. Frontend/Extension (Get Transaction Data):
```javascript
// Step 1: Get transaction data from API
const prepareTransaction = async (repoId, amount, userAddress) => {
  const response = await fetch('/api/contracts/donate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      repoId: repoId,
      amount: amount,
      userAddress: userAddress
    })
  });
  
  return await response.json();
};

// Step 2: Send via MetaMask
const sendTransaction = async (transactionData) => {
  const txHash = await window.ethereum.request({
    method: 'eth_sendTransaction',
    params: [transactionData]
  });
  
  return txHash;
};

// Step 3: Confirm with backend
const confirmTransaction = async (txHash, type, metadata) => {
  const response = await fetch('/api/contracts/confirm-transaction', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      txHash: txHash,
      type: type,
      metadata: metadata
    })
  });
  
  return await response.json();
};

// Complete donation flow
const donateToProject = async (repoId, amount) => {
  try {
    // Get user's wallet address
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    const userAddress = accounts[0];
    
    // Step 1: Prepare transaction
    const txData = await prepareTransaction(repoId, amount, userAddress);
    if (!txData.success) throw new Error(txData.error);
    
    // Step 2: Send via MetaMask
    const txHash = await sendTransaction(txData.data);
    
    // Step 3: Confirm with backend
    const confirmation = await confirmTransaction(txHash, 'donate', {
      repoId: repoId,
      amount: amount
    });
    
    return confirmation;
  } catch (error) {
    console.error('Donation failed:', error);
    throw error;
  }
};
```

#### 2. Read-Only Operations (No MetaMask Required):
```javascript
// Get repository info
const getRepoInfo = async (repoId) => {
  const response = await fetch(`/api/contracts/repo/${repoId}/complete`);
  return await response.json();
};

// Get project pool balance
const getPoolBalance = async (repoId) => {
  const response = await fetch(`/api/contracts/pool/${repoId}`);
  return await response.json();
};

// Get bounty details
const getBountyDetails = async (repoId, issueId) => {
  const response = await fetch(`/api/contracts/bounty/${repoId}/${issueId}`);
  return await response.json();
};
```

### Chrome Extension Integration:
```javascript
// From popup.js - MetaMask transaction helper
class MetaMaskTransactionHandler {
  constructor(apiBase) {
    this.apiBase = apiBase;
  }

  async sendTransaction(transactionData, type, metadata = {}) {
    try {
      // Send transaction via MetaMask
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionData]
      });

      // Confirm with backend
      const confirmResponse = await fetch(`${this.apiBase}/api/contracts/confirm-transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          txHash: txHash,
          type: type,
          metadata: metadata
        })
      });

      if (confirmResponse.ok) {
        const result = await confirmResponse.json();
        return { success: true, data: result.data };
      }
      
      return { success: true, txHash: txHash };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async donateToProject(repoId, amount, userAddress) {
    // Get transaction data
    const response = await fetch(`${this.apiBase}/api/contracts/donate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        repoId: repoId,
        amount: amount,
        userAddress: userAddress
      })
    });

    if (response.ok) {
      const result = await response.json();
      return await this.sendTransaction(
        result.data, 
        'donate',
        { repoId, amount }
      );
    }
    
    throw new Error('Failed to prepare transaction');
  }
}

// Usage in popup
const txHandler = new MetaMaskTransactionHandler('http://localhost:4000');
const result = await txHandler.donateToProject(1, '0.5', userAddress);
```

---

## Development Notes

1. **MetaMask First**: Primary mode uses user's MetaMask for signing
2. **Gas Fees**: Users pay their own gas fees with MATIC
3. **Network**: Automatically switches users to Polygon mainnet
4. **Confirmation**: Backend waits for transaction confirmation
5. **Error Handling**: Comprehensive error handling with detailed messages
6. **Validation**: Address and parameter validation on all endpoints
7. **Logging**: Detailed logging for debugging and monitoring

---

## Frontend Integration Components

### Required Frontend Dependencies:
```bash
npm install ethers # or web3 for blockchain interactions
```

### MetaMask Detection:
```javascript
// Check if MetaMask is installed
const isMetaMaskInstalled = () => {
  return typeof window.ethereum !== 'undefined';
};

// Switch to Polygon network
const switchToPolygon = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x89' }], // Polygon mainnet
    });
  } catch (switchError) {
    // Network not added, add it
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: '0x89',
        chainName: 'Polygon Mainnet',
        nativeCurrency: {
          name: 'MATIC',
          symbol: 'MATIC',
          decimals: 18
        },
        rpcUrls: ['https://polygon-rpc.com'],
        blockExplorerUrls: ['https://polygonscan.com']
      }]
    });
  }
};
```

---

## Next Steps

1. ✅ **Contracts Deployed**: Both contracts are live on Polygon
2. ✅ **API Ready**: All endpoints configured for MetaMask mode
3. 🔄 **Frontend Integration**: Create React components for transactions
4. 🔄 **Chrome Extension**: Update popup for new transaction flow
5. 📝 **IPFS Integration**: For storing repository metadata
6. 🔒 **Rate Limiting**: Add API rate limiting and authentication
7. 📊 **Analytics**: Set up event listeners for real-time updates

---

## API Endpoint Summary

### 🔄 **Transaction Endpoints** (MetaMask Required):
- `POST /api/contracts/donate` - Prepare donation transaction
- `POST /api/contracts/stake` - Prepare staking transaction  
- `POST /api/contracts/register-repo` - Prepare repo registration
- `POST /api/contracts/assign-bounty` - Prepare bounty assignment
- `POST /api/contracts/confirm-transaction` - Confirm transaction success

### 📖 **Read-Only Endpoints** (No MetaMask Required):
- `GET /api/contracts/bounty/:repoId/:issueId` - Get bounty details
- `GET /api/contracts/pool/:repoId` - Get project pool balance
- `GET /api/contracts/repo/:repoId` - Get repository details
- `GET /api/contracts/repo/:repoId/complete` - Get complete repo info
- `GET /api/contracts/repos/owner/:address` - Get repos by owner
- `GET /api/contracts/balance/:address` - Get account balance
- `GET /api/contracts/network-info` - Get network information
- `GET /api/contracts/min-stake` - Get minimum stake amount
- `GET /api/contracts/transaction/:txHash` - Get transaction status

### 🏥 **System Endpoints**:
- `GET /health` - System health and configuration status

---

## Support

For issues or questions:
- GitHub Issues: [HackAura Issues](https://github.com/XohamOG/HackAura/issues)
- API Documentation: `src/api/README.md`
- Contract Documentation: `src/contracts/README.md`
- Live Contracts: View on [Polygonscan](https://polygonscan.com/)