// Smart Contract API Routes
const express = require('express');
const router = express.Router();
const { bountyEscrow, repoRegistry, combinedOperations, utils } = require('../contracts');

// Middleware for error handling
const handleAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Middleware for validating addresses
const validateAddress = (req, res, next) => {
  const { address } = req.body;
  if (address && !utils.isValidAddress(address)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid Ethereum address format'
    });
  }
  next();
};

// =============================================================================
// BOUNTY ESCROW ROUTES
// =============================================================================

/**
 * @route POST /api/contracts/donate
 * @desc Get transaction data for donating MATIC to a project pool (MetaMask signing)
 * @body {number} repoId - Repository ID
 * @body {string} amount - Amount in MATIC
 * @body {string} userAddress - User's wallet address
 */
router.post('/donate', validateAddress, handleAsync(async (req, res) => {
  const { repoId, amount, userAddress } = req.body;

  if (!repoId || !amount || !userAddress) {
    return res.status(400).json({
      success: false,
      error: 'Repository ID, amount, and user address are required'
    });
  }

  if (parseFloat(amount) <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Amount must be greater than 0'
    });
  }

  try {
    // Return transaction data for MetaMask signing instead of executing
    const amountWei = utils.etherToWei(amount);
    const contractAddress = bountyEscrow.contractAddress;
    const transactionData = bountyEscrow.contract.methods.donateToProject(repoId).encodeABI();
    
    res.status(200).json({
      success: true,
      message: 'Transaction data prepared for MetaMask signing',
      data: {
        to: contractAddress,
        data: transactionData,
        value: amountWei,
        from: userAddress,
        repoId: repoId,
        amount: amount
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}));

/**
 * @route POST /api/contracts/fund-bounty
 * @desc Fund a bounty from project pool
 * @body {number} repoId - Repository ID
 * @body {number} issueId - Issue ID
 * @body {string} amount - Amount in MATIC
 * @body {string} orgAddress - Organization address
 */
router.post('/fund-bounty', validateAddress, handleAsync(async (req, res) => {
  const { repoId, issueId, amount, orgAddress } = req.body;

  if (!repoId || !issueId || !amount || !orgAddress) {
    return res.status(400).json({
      success: false,
      error: 'Repository ID, issue ID, amount, and organization address are required'
    });
  }

  const result = await bountyEscrow.fundBountyFromPool(repoId, issueId, amount, orgAddress);
  
  if (result.success) {
    res.status(200).json({
      success: true,
      message: 'Bounty funded successfully!',
      data: result
    });
  } else {
    res.status(400).json({
      success: false,
      error: result.error
    });
  }
}));

/**
 * @route POST /api/contracts/release-bounty
 * @desc Release bounty to contributor
 * @body {number} repoId - Repository ID
 * @body {number} issueId - Issue ID
 * @body {string} solverAddress - Contributor's address
 */
router.post('/release-bounty', validateAddress, handleAsync(async (req, res) => {
  const { repoId, issueId, solverAddress } = req.body;

  if (!repoId || !issueId || !solverAddress) {
    return res.status(400).json({
      success: false,
      error: 'Repository ID, issue ID, and solver address are required'
    });
  }

  const result = await bountyEscrow.releaseBounty(repoId, issueId, solverAddress);
  
  if (result.success) {
    res.status(200).json({
      success: true,
      message: 'Bounty released successfully!',
      data: result
    });
  } else {
    res.status(400).json({
      success: false,
      error: result.error
    });
  }
}));

/**
 * @route GET /api/contracts/bounty/:repoId/:issueId
 * @desc Get bounty details
 */
router.get('/bounty/:repoId/:issueId', handleAsync(async (req, res) => {
  const { repoId, issueId } = req.params;

  const result = await bountyEscrow.getBounty(parseInt(repoId), parseInt(issueId));
  
  if (result.success) {
    res.status(200).json({
      success: true,
      data: result
    });
  } else {
    res.status(404).json({
      success: false,
      error: result.error
    });
  }
}));

/**
 * @route GET /api/contracts/pool/:repoId
 * @desc Get project pool balance
 */
router.get('/pool/:repoId', handleAsync(async (req, res) => {
  const { repoId } = req.params;

  const result = await bountyEscrow.getProjectPool(parseInt(repoId));
  
  if (result.success) {
    res.status(200).json({
      success: true,
      data: result
    });
  } else {
    res.status(404).json({
      success: false,
      error: result.error
    });
  }
}));

// =============================================================================
// REPO REGISTRY ROUTES  
// =============================================================================

/**
 * @route POST /api/contracts/stake
 * @desc Get transaction data for staking MATIC for organization (MetaMask signing)
 * @body {string} amount - Amount in MATIC
 * @body {string} userAddress - User's wallet address
 */
router.post('/stake', validateAddress, handleAsync(async (req, res) => {
  const { amount, userAddress } = req.body;

  if (!amount || !userAddress) {
    return res.status(400).json({
      success: false,
      error: 'Amount and user address are required'
    });
  }

  try {
    // Return transaction data for MetaMask signing
    const amountWei = utils.etherToWei(amount);
    const contractAddress = repoRegistry.contractAddress;
    const transactionData = repoRegistry.contract.methods.stakeForOrg().encodeABI();
    
    res.status(200).json({
      success: true,
      message: 'Transaction data prepared for MetaMask signing',
      data: {
        to: contractAddress,
        data: transactionData,
        value: amountWei,
        from: userAddress,
        amount: amount
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}));

/**
 * @route POST /api/contracts/register-repo
 * @desc Register a new repository
 * @body {string} cid - IPFS CID for repo metadata
 * @body {boolean} isPublic - Whether repo is public
 * @body {number[]} issueIds - Array of issue IDs
 * @body {string} ownerAddress - Optional owner address
 */
router.post('/register-repo', validateAddress, handleAsync(async (req, res) => {
  const { cid, isPublic, issueIds, ownerAddress } = req.body;

  if (!cid || typeof isPublic !== 'boolean' || !Array.isArray(issueIds)) {
    return res.status(400).json({
      success: false,
      error: 'CID, isPublic flag, and issueIds array are required'
    });
  }

  const result = await repoRegistry.registerRepo(cid, isPublic, issueIds, ownerAddress);
  
  if (result.success) {
    res.status(201).json({
      success: true,
      message: 'Repository registered successfully!',
      data: result
    });
  } else {
    res.status(400).json({
      success: false,
      error: result.error
    });
  }
}));

/**
 * @route POST /api/contracts/assign-bounty
 * @desc Assign bounty to an issue
 * @body {number} repoId - Repository ID
 * @body {number} issueId - Issue ID
 * @body {string} bountyAmount - Bounty amount in MATIC
 * @body {string} creatorAddress - Optional creator address
 */
router.post('/assign-bounty', validateAddress, handleAsync(async (req, res) => {
  const { repoId, issueId, bountyAmount, creatorAddress } = req.body;

  if (!repoId || !issueId || !bountyAmount) {
    return res.status(400).json({
      success: false,
      error: 'Repository ID, issue ID, and bounty amount are required'
    });
  }

  const result = await repoRegistry.assignBounty(repoId, issueId, bountyAmount, creatorAddress);
  
  if (result.success) {
    res.status(200).json({
      success: true,
      message: 'Bounty assigned successfully!',
      data: result
    });
  } else {
    res.status(400).json({
      success: false,
      error: result.error
    });
  }
}));

/**
 * @route GET /api/contracts/repo/:repoId
 * @desc Get repository details
 */
router.get('/repo/:repoId', handleAsync(async (req, res) => {
  const { repoId } = req.params;

  const result = await repoRegistry.getRepo(parseInt(repoId));
  
  if (result.success) {
    res.status(200).json({
      success: true,
      data: result
    });
  } else {
    res.status(404).json({
      success: false,
      error: result.error
    });
  }
}));

/**
 * @route GET /api/contracts/repo/:repoId/complete
 * @desc Get complete repository information including bounties and pool
 */
router.get('/repo/:repoId/complete', handleAsync(async (req, res) => {
  const { repoId } = req.params;

  const result = await combinedOperations.getCompleteRepoInfo(parseInt(repoId));
  
  if (result.success) {
    res.status(200).json({
      success: true,
      data: result
    });
  } else {
    res.status(404).json({
      success: false,
      error: result.error
    });
  }
}));

/**
 * @route GET /api/contracts/repos/owner/:address
 * @desc Get all repositories for an owner
 */
router.get('/repos/owner/:address', handleAsync(async (req, res) => {
  const { address } = req.params;

  if (!utils.isValidAddress(address)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid address format'
    });
  }

  const result = await repoRegistry.getReposByOwner(address);
  
  if (result.success) {
    res.status(200).json({
      success: true,
      data: result
    });
  } else {
    res.status(404).json({
      success: false,
      error: result.error
    });
  }
}));

// =============================================================================
// TRANSACTION CONFIRMATION ROUTES
// =============================================================================

/**
 * @route POST /api/contracts/confirm-transaction
 * @desc Confirm a transaction was successful and update local state
 * @body {string} txHash - Transaction hash
 * @body {string} type - Transaction type (donate, stake, register, etc.)
 * @body {object} metadata - Additional transaction metadata
 */
router.post('/confirm-transaction', handleAsync(async (req, res) => {
  const { txHash, type, metadata } = req.body;

  if (!txHash || !type) {
    return res.status(400).json({
      success: false,
      error: 'Transaction hash and type are required'
    });
  }

  try {
    // Wait for transaction confirmation
    const receipt = await utils.waitForTransaction(txHash, 60000);
    
    if (receipt.status) {
      res.status(200).json({
        success: true,
        message: `${type} transaction confirmed!`,
        data: {
          txHash: txHash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed,
          type: type,
          metadata: metadata,
          receipt: receipt
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Transaction failed'
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}));

/**
 * @route GET /api/contracts/transaction/:txHash
 * @desc Get transaction status and details
 */
router.get('/transaction/:txHash', handleAsync(async (req, res) => {
  const { txHash } = req.params;

  try {
    const receipt = await utils.web3Provider.getTransactionReceipt(txHash);
    
    if (receipt) {
      res.status(200).json({
        success: true,
        data: {
          txHash: txHash,
          status: receipt.status ? 'success' : 'failed',
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed,
          receipt: receipt
        }
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Transaction not found or still pending'
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}));

// =============================================================================
// UTILITY ROUTES
// =============================================================================

/**
 * @route GET /api/contracts/network-info
 * @desc Get current network information
 */
router.get('/network-info', (req, res) => {
  const networkInfo = utils.getNetworkInfo();
  res.status(200).json({
    success: true,
    data: networkInfo
  });
});

/**
 * @route GET /api/contracts/balance/:address
 * @desc Get account balance
 */
router.get('/balance/:address', handleAsync(async (req, res) => {
  const { address } = req.params;

  if (!utils.isValidAddress(address)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid address format'
    });
  }

  const result = await utils.getBalance(address);
  
  res.status(200).json({
    success: true,
    data: result
  });
}));

/**
 * @route GET /api/contracts/min-stake
 * @desc Get minimum stake amount
 */
router.get('/min-stake', handleAsync(async (req, res) => {
  const result = await repoRegistry.getMinStake();
  
  if (result.success) {
    res.status(200).json({
      success: true,
      data: result
    });
  } else {
    res.status(400).json({
      success: false,
      error: result.error
    });
  }
}));

// =============================================================================
// COMBINED OPERATIONS
// =============================================================================

/**
 * @route POST /api/contracts/create-complete-bounty
 * @desc Create a complete bounty workflow (register repo + assign bounty + fund if possible)
 * @body {string} cid - IPFS CID
 * @body {boolean} isPublic - Public flag
 * @body {number[]} issueIds - Issue IDs array
 * @body {number} issueId - Specific issue for bounty
 * @body {string} bountyAmount - Bounty amount in MATIC
 */
router.post('/create-complete-bounty', handleAsync(async (req, res) => {
  const { cid, isPublic, issueIds, issueId, bountyAmount } = req.body;

  if (!cid || typeof isPublic !== 'boolean' || !Array.isArray(issueIds) || !issueId || !bountyAmount) {
    return res.status(400).json({
      success: false,
      error: 'All fields are required: cid, isPublic, issueIds, issueId, bountyAmount'
    });
  }

  const result = await combinedOperations.createCompleteBounty(cid, isPublic, issueIds, issueId, bountyAmount);
  
  if (result.success) {
    res.status(201).json({
      success: true,
      message: 'Complete bounty created successfully!',
      data: result
    });
  } else {
    res.status(400).json({
      success: false,
      error: result.error
    });
  }
}));

// Error handling middleware
router.use((error, req, res, next) => {
  console.error('Contract API Error:', error);
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

module.exports = router;