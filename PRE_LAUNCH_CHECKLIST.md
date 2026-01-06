# ✅ Pre-Launch Checklist for Lisk Migration

## Critical Items to Verify Before Running

### 1. Environment Variables ⚙️

#### Backend (.env)
Create `Backend/.env` with these values:
```env
PORT=4000
GITHUB_CLIENT_ID=your_actual_github_client_id
GITHUB_CLIENT_SECRET=your_actual_github_client_secret
GITHUB_BEARER_TOKEN=your_actual_github_token
GEMINI_API_KEY=your_actual_gemini_api_key
PRIVATE_KEY=your_wallet_private_key_for_contract_interactions
NETWORK=lisk
NETWORK_CHAIN_ID=4202
NETWORK_RPC_URL=https://rpc.sepolia-api.lisk.com
BOUNTY_ESCROW_ADDRESS=0xCc47A9e11De3aA189cD801fD54054493C5e11a68
REPO_REGISTRY_ADDRESS=0xa50C8481E6a39681b7B881e9884e8a03567BAdFF
```

#### Frontend (.env)
Create `Frontend/.env` with these values:
```env
VITE_API_BASE_URL=http://localhost:4000
VITE_GITHUB_CLIENT_ID=your_actual_github_client_id
VITE_GITHUB_REDIRECT_URI=http://localhost:3000/auth/callback
VITE_CHAIN_ID=4202
VITE_RPC_URL=https://rpc.sepolia-api.lisk.com
VITE_BOUNTY_ESCROW_ADDRESS=0xCc47A9e11De3aA189cD801fD54054493C5e11a68
VITE_REPO_REGISTRY_ADDRESS=0xa50C8481E6a39681b7B881e9884e8a03567BAdFF
```

### 2. Contract Verification 🔍

Verify your contracts are deployed and working:

```bash
# Test in Node.js or browser console
const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider('https://rpc.sepolia-api.lisk.com');

// Check BountyEscrow
const bountyEscrow = '0xCc47A9e11De3aA189cD801fD54054493C5e11a68';
const code = await provider.getCode(bountyEscrow);
console.log('BountyEscrow deployed:', code !== '0x');

// Check RepoRegistry
const repoRegistry = '0xa50C8481E6a39681b7B881e9884e8a03567BAdFF';
const code2 = await provider.getCode(repoRegistry);
console.log('RepoRegistry deployed:', code2 !== '0x');
```

### 3. Dependencies Installation 📦

```bash
# Root
npm install

# Backend
cd Backend && npm install

# Frontend
cd ../Frontend && npm install
```

### 4. Testing Contract Interactions 🧪

Test basic contract reads:

```bash
cd Backend
node -e "
const { bountyEscrow, repoRegistry } = require('./src/contracts');

// Test reading from contracts
(async () => {
  try {
    const owner = await bountyEscrow.contract.methods.owner().call();
    console.log('✅ BountyEscrow Owner:', owner);
    
    const minStake = await repoRegistry.contract.methods.minStake().call();
    console.log('✅ Min Stake:', minStake);
    
    const repoCount = await repoRegistry.contract.methods.repoCount().call();
    console.log('✅ Total Repos:', repoCount);
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
})();
"
```

### 5. Key Differences from HelaChain ⚠️

| Aspect | HelaChain (Old) | Lisk Sepolia (New) |
|--------|----------------|-------------------|
| Chain ID | 666888 (0xa2d08) | 4202 (0x106a) |
| Currency | HLUSD | ETH |
| RPC URL | testnet-rpc.helachain.com | rpc.sepolia-api.lisk.com |
| Explorer | testnet-blockscout.helachain.com | sepolia-blockscout.lisk.com |
| Default Network | `polygon` | `lisk` |

### 6. Potential Issues & Solutions 🔧

#### Issue: "Web3 not initialized"
**Solution:** Check `NETWORK_RPC_URL` in Backend/.env

#### Issue: "No account configured"
**Solution:** Set `PRIVATE_KEY` in Backend/.env (without 0x prefix)

#### Issue: "Contract not deployed"
**Solution:** Verify contract addresses on Lisk Sepolia explorer

#### Issue: "Network mismatch"
**Solution:** Ensure MetaMask is connected to Lisk Sepolia (Chain ID: 4202)

#### Issue: "Transaction fails"
**Solution:** 
- Ensure wallet has Lisk Sepolia ETH
- Check gas settings
- Verify contract permissions (owner-only functions)

### 7. What Should Work Immediately ✅

Since everything worked on HelaChain:
- ✅ Contract ABI compatibility (updated to match your new contracts)
- ✅ Web3 provider configuration
- ✅ Transaction signing and sending
- ✅ MetaMask integration
- ✅ Frontend network switching
- ✅ Backend API routes

### 8. What Needs Testing 🧪

- [ ] GitHub OAuth (same as before)
- [ ] Gemini AI integration (same as before)
- [ ] Contract write operations (need Lisk Sepolia ETH)
- [ ] Donation flow
- [ ] Bounty creation
- [ ] Bounty release
- [ ] Organization staking

### 9. Getting Lisk Sepolia ETH 💰

You'll need testnet ETH for:
1. **Backend wallet** (for contract interactions)
2. **Organization wallets** (for staking)
3. **User wallets** (for donations/bounties)

**Faucet:** https://sepolia-faucet.lisk.com

Or bridge from Ethereum Sepolia.

### 10. Quick Start Commands 🚀

```bash
# Start backend
cd Backend
npm start

# In another terminal, start frontend
cd Frontend
npm run dev
```

### 11. Verify Everything Works 🎯

1. **Backend Health Check:**
   ```
   curl http://localhost:4000/api/health
   ```

2. **Frontend Loads:**
   ```
   Open http://localhost:3000
   ```

3. **MetaMask Connection:**
   - Should prompt to add Lisk Sepolia network
   - Chain ID should show 4202

4. **Contract Interaction:**
   - Try reading pool balance
   - Try viewing registered repos

### 12. What's Different in Code 🔄

**Updated Files:**
- ✅ All MATIC → ETH references
- ✅ All HelaChain → Lisk references  
- ✅ Contract addresses updated
- ✅ Chain ID updated (4202)
- ✅ Default network changed to 'lisk'
- ✅ ABIs updated to match new contract structure

**NOT Changed (should still work):**
- GitHub OAuth flow
- Gemini AI integration
- IPFS storage
- JWT authentication
- API route structure
- Frontend React components (except network config)

## Final Answer: Will It Work Directly? 🤔

**Almost, but you need to:**

1. ✅ **Copy .env files** (from .env.example templates)
2. ✅ **Add your API keys and secrets**
3. ✅ **Get Lisk Sepolia ETH** for testing transactions
4. ✅ **Test contract interactions** first
5. ✅ **Verify MetaMask can connect** to Lisk Sepolia

**Then YES, it should work!** 🎉

The core blockchain integration code is identical, just:
- Different network endpoints
- Different contract addresses
- Different chain ID
- ETH instead of HLUSD

Everything else (GitHub, AI, IPFS, UI) remains the same.
