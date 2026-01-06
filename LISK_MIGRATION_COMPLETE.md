# 🔄 Lisk Sepolia Migration Complete

## Migration Summary

GitHunters has been successfully migrated from Hela Chain to **Lisk Sepolia Testnet** for the Lisk Builders Challenge #3 Hackathon.

---

## 🎯 Network Details

| Parameter | Value |
|-----------|-------|
| **Network Name** | Lisk Sepolia Testnet |
| **Chain ID** | 4202 (0x106a in hex) |
| **RPC URL** | https://rpc.sepolia-api.lisk.com |
| **Currency Symbol** | ETH |
| **Block Explorer** | https://sepolia-blockscout.lisk.com |

---

## 📜 Smart Contract Addresses

### BountyEscrow Contract
**Address:** `0xCc47A9e11De3aA189cD801fD54054493C5e11a68`

**Functions:**
- `donateToProject(uint256 repoId)` - Donate ETH to a repository pool
- `fundBountyFromPool(...)` - Fund a bounty from repository pool
- `releaseBounty(...)` - Release bounty payment to solver
- `reclaimBounty(...)` - Reclaim unclaimed bounty after reclaim period
- `getBounty(...)` - Get bounty details
- `getProjectPool(...)` - Get repository pool balance
- `hasSufficientFunds(...)` - Check if pool has sufficient funds
- `setReclaimPeriod(...)` - Set reclaim period (admin only)

### RepoRegistry Contract
**Address:** `0xa50C8481E6a39681b7B881e9884e8a03567BAdFF`

**Functions:**
- `stakeForOrg()` - Stake ETH to register as organization (min 0.01 ETH)
- `registerRepo(...)` - Register a new repository
- `assignBounty(...)` - Assign bounty to an issue
- `getRepo(...)` - Get repository details
- `orgStakes(address)` - Get organization stake amount
- `minStake()` - Get minimum stake requirement
- `repoCount()` - Get total registered repositories

---

## 🔧 Configuration Changes

### Backend Configuration

File: `Backend/src/contracts/config.js`
```javascript
networks: {
  lisk: {
    rpcUrl: 'https://rpc.sepolia-api.lisk.com',
    chainId: 4202,
    name: 'Lisk Sepolia Testnet',
    symbol: 'ETH',
    explorer: 'https://sepolia-blockscout.lisk.com'
  }
}

contracts: {
  bountyEscrow: {
    address: '0xCc47A9e11De3aA189cD801fD54054493C5e11a68',
    network: 'lisk'
  },
  repoRegistry: {
    address: '0xa50C8481E6a39681b7B881e9884e8a03567BAdFF',
    network: 'lisk'
  }
}
```

### Frontend Configuration

File: `.env` (use `.env.example` as template)
```env
VITE_CHAIN_ID=4202
VITE_RPC_URL=https://rpc.sepolia-api.lisk.com
VITE_BOUNTY_ESCROW_ADDRESS=0xCc47A9e11De3aA189cD801fD54054493C5e11a68
VITE_REPO_REGISTRY_ADDRESS=0xa50C8481E6a39681b7B881e9884e8a03567BAdFF
```

---

## 📝 Key Changes Made

### 1. Contract Addresses Updated
- ✅ BountyEscrow: `0xCc47A9e11De3aA189cD801fD54054493C5e11a68`
- ✅ RepoRegistry: `0xa50C8481E6a39681b7B881e9884e8a03567BAdFF`

### 2. Network Configuration
- ✅ Chain ID: 666888 (Hela) → 4202 (Lisk Sepolia)
- ✅ RPC URL: Updated to Lisk Sepolia endpoint
- ✅ Block Explorer: Updated to Lisk Sepolia Blockscout

### 3. Currency Changes
- ✅ HLUSD → ETH across all files
- ✅ Updated UI labels and messages
- ✅ Updated transaction handling code

### 4. Files Modified
```
✅ README.md
✅ package.json
✅ Backend/src/contracts/config.js
✅ Backend/src/contracts/contractABI.js (new ABIs)
✅ Backend/src/api/organizationRoutes.js
✅ Frontend/src/pages/LeaderboardPage.jsx
✅ Contracts/test.js
✅ test_integration.html
✅ Backend/.env.example (created)
✅ Frontend/.env.example (created)
```

### 5. Smart Contract ABIs
- ✅ Updated BountyEscrow ABI to match new contract structure
- ✅ Updated RepoRegistry ABI to match new contract structure
- ✅ Removed old functions, added new events and functions

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd Backend && npm install
cd ../Frontend && npm install
```

### 2. Configure Environment Variables
```bash
# Backend
cp Backend/.env.example Backend/.env
# Edit Backend/.env with your values

# Frontend
cp Frontend/.env.example Frontend/.env
# Edit Frontend/.env with your values
```

### 3. Add Lisk Sepolia to MetaMask
The application will automatically prompt users to add the network, or add manually:
- **Network Name:** Lisk Sepolia Testnet
- **RPC URL:** https://rpc.sepolia-api.lisk.com
- **Chain ID:** 4202
- **Currency Symbol:** ETH
- **Block Explorer:** https://sepolia-blockscout.lisk.com

### 4. Get Testnet ETH
Get Lisk Sepolia testnet ETH from:
- Lisk Faucet: https://sepolia-faucet.lisk.com
- Or bridge from Ethereum Sepolia

### 5. Run the Application
```bash
# Development mode (runs both frontend and backend)
npm run dev

# Or run separately:
# Backend
cd Backend && npm start

# Frontend
cd Frontend && npm run dev
```

---

## 🔍 Testing Smart Contracts

### Verify Contracts on Block Explorer
- BountyEscrow: https://sepolia-blockscout.lisk.com/address/0xCc47A9e11De3aA189cD801fD54054493C5e11a68
- RepoRegistry: https://sepolia-blockscout.lisk.com/address/0xa50C8481E6a39681b7B881e9884e8a03567BAdFF

### Test Contract Interactions
```javascript
// Using ethers.js
const provider = new ethers.JsonRpcProvider('https://rpc.sepolia-api.lisk.com');
const bountyEscrow = new ethers.Contract(
  '0xCc47A9e11De3aA189cD801fD54054493C5e11a68',
  bountyEscrowABI,
  provider
);

// Check a repository pool
const pool = await bountyEscrow.getProjectPool(123456);
console.log('Pool Balance:', ethers.formatEther(pool), 'ETH');
```

---

## 📊 Contract Features

### BountyEscrow
- **Project Pools:** Organizations and donors can fund repository pools
- **Bounty Management:** Fund bounties from pools, release to solvers
- **Reclaim Mechanism:** 7-day reclaim period for unclaimed bounties
- **Admin Controls:** Owner-only functions for bounty operations

### RepoRegistry
- **Staking System:** Organizations stake 0.01 ETH minimum to register
- **Repository Registration:** Store repo metadata via CID (IPFS)
- **Bounty Assignment:** Link bounties to specific issues
- **Integration:** Automatically calls BountyEscrow for funding

---

## 🎉 Migration Status

| Component | Status |
|-----------|--------|
| Smart Contracts | ✅ Deployed |
| Backend Config | ✅ Updated |
| Frontend Config | ✅ Updated |
| ABIs | ✅ Updated |
| Documentation | ✅ Complete |
| Testing | ⏳ Ready for Testing |
| Deployment | 🔜 Coming Soon |

---

## 🔗 Important Links

- **Lisk Documentation:** https://docs.lisk.com
- **Lisk Sepolia Faucet:** https://sepolia-faucet.lisk.com
- **Block Explorer:** https://sepolia-blockscout.lisk.com
- **Lisk Builders Challenge:** https://lisk-builders-challenge-3.devfolio.co

---

## 📞 Support

For issues or questions about the migration:
1. Check the [README.md](README.md) for setup instructions
2. Review `.env.example` files for required configuration
3. Verify contract addresses on block explorer
4. Test with small amounts first

---

**Migration completed on:** January 6, 2026  
**Target Hackathon:** Lisk Builders Challenge #3  
**Network:** Lisk Sepolia Testnet (Chain ID: 4202)

🎯 **Ready to build on Lisk!**
