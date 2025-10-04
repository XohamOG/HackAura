// Legacy Blockchain API Routes (redirects to new contract system)
const express = require('express');
const router = express.Router();

// Import the new contract system  
const { bountyEscrow, repoRegistry, combinedOperations } = require('../contracts');

console.log('📋 Legacy blockchain routes loaded - redirecting to new contract system');

// ================================
// REPOSITORY REGISTRY ENDPOINTS
// ================================

/**
 * POST /api/blockchain/repos
 * Register a new repository on-chain
 */
router.post('/repos', async (req, res) => {
  try {
    const { cid, isPublic, issueIds, userAddress } = req.body;

    // Validate required fields
    if (!cid || typeof isPublic !== 'boolean' || !Array.isArray(issueIds) || !userAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: cid, isPublic, issueIds, userAddress'
      });
    }

    const result = await blockchainService.registerRepository(cid, isPublic, issueIds, userAddress);

    if (result.success) {
      res.json({
        success: true,
        data: {
          repoId: result.repoId,
          transactionHash: result.transactionHash,
          gasUsed: result.gasUsed
        }
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/blockchain/repos/:repoId
 * Get repository information
 */
router.get('/repos/:repoId', async (req, res) => {
  try {
    const { repoId } = req.params;
    const result = await blockchainService.getRepository(parseInt(repoId));

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/blockchain/repos/count
 * Get total repository count
 */
router.get('/repos/count', async (req, res) => {
  try {
    const result = await blockchainService.getRepositoryCount();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/blockchain/stake
 * Stake MATIC for organization credibility
 */
router.post('/stake', async (req, res) => {
  try {
    const { amount, userAddress } = req.body;

    if (!amount || !userAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: amount, userAddress'
      });
    }

    const result = await blockchainService.stakeForOrganization(amount, userAddress);

    if (result.success) {
      res.json({
        success: true,
        data: {
          stakedAmount: result.stakedAmount,
          transactionHash: result.transactionHash,
          gasUsed: result.gasUsed
        }
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/blockchain/stake/:address
 * Get organization stake amount
 */
router.get('/stake/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const result = await blockchainService.getOrganizationStake(address);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/blockchain/bounties/assign
 * Assign bounty to an issue
 */
router.post('/bounties/assign', async (req, res) => {
  try {
    const { repoId, issueId, bountyAmount } = req.body;

    if (!repoId || !issueId || !bountyAmount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: repoId, issueId, bountyAmount'
      });
    }

    const result = await blockchainService.assignBounty(
      parseInt(repoId), 
      parseInt(issueId), 
      bountyAmount
    );

    if (result.success) {
      res.json({
        success: true,
        data: {
          repoId: result.repoId,
          issueId: result.issueId,
          bountyAmount: result.bountyAmount,
          transactionHash: result.transactionHash,
          gasUsed: result.gasUsed
        }
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/blockchain/bounties/issue/:issueId
 * Get issue bounty amount
 */
router.get('/bounties/issue/:issueId', async (req, res) => {
  try {
    const { issueId } = req.params;
    const result = await blockchainService.getIssueBounty(parseInt(issueId));
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ================================
// BOUNTY ESCROW ENDPOINTS
// ================================

/**
 * POST /api/blockchain/donate
 * Donate MATIC to project pool
 */
router.post('/donate', async (req, res) => {
  try {
    const { repoId, amount } = req.body;

    if (!repoId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: repoId, amount'
      });
    }

    const result = await blockchainService.donateToProject(parseInt(repoId), amount);

    if (result.success) {
      res.json({
        success: true,
        data: {
          repoId: result.repoId,
          donationAmount: result.donationAmount,
          transactionHash: result.transactionHash,
          gasUsed: result.gasUsed
        }
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/blockchain/bounties/fund
 * Fund bounty from project pool
 */
router.post('/bounties/fund', async (req, res) => {
  try {
    const { repoId, issueId, amount, orgAddress } = req.body;

    if (!repoId || !issueId || !amount || !orgAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: repoId, issueId, amount, orgAddress'
      });
    }

    const result = await blockchainService.fundBountyFromPool(
      parseInt(repoId),
      parseInt(issueId),
      amount,
      orgAddress
    );

    if (result.success) {
      res.json({
        success: true,
        data: {
          repoId: result.repoId,
          issueId: result.issueId,
          fundAmount: result.fundAmount,
          orgAddress: result.orgAddress,
          transactionHash: result.transactionHash,
          gasUsed: result.gasUsed
        }
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/blockchain/bounties/release
 * Release bounty to contributor
 */
router.post('/bounties/release', async (req, res) => {
  try {
    const { repoId, issueId, solverAddress } = req.body;

    if (!repoId || !issueId || !solverAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: repoId, issueId, solverAddress'
      });
    }

    const result = await blockchainService.releaseBounty(
      parseInt(repoId),
      parseInt(issueId),
      solverAddress
    );

    if (result.success) {
      res.json({
        success: true,
        data: {
          repoId: result.repoId,
          issueId: result.issueId,
          solverAddress: result.solverAddress,
          transactionHash: result.transactionHash,
          gasUsed: result.gasUsed
        }
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/blockchain/bounties/reclaim
 * Reclaim bounty (organization only)
 */
router.post('/bounties/reclaim', async (req, res) => {
  try {
    const { repoId, issueId } = req.body;

    if (!repoId || !issueId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: repoId, issueId'
      });
    }

    const result = await blockchainService.reclaimBounty(parseInt(repoId), parseInt(issueId));

    if (result.success) {
      res.json({
        success: true,
        data: {
          repoId: result.repoId,
          issueId: result.issueId,
          transactionHash: result.transactionHash,
          gasUsed: result.gasUsed
        }
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/blockchain/bounties/:repoId/:issueId
 * Get bounty details
 */
router.get('/bounties/:repoId/:issueId', async (req, res) => {
  try {
    const { repoId, issueId } = req.params;
    const result = await blockchainService.getBountyDetails(parseInt(repoId), parseInt(issueId));
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/blockchain/pool/:repoId
 * Get project pool balance
 */
router.get('/pool/:repoId', async (req, res) => {
  try {
    const { repoId } = req.params;
    const result = await blockchainService.getProjectPool(parseInt(repoId));
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/blockchain/pool/:repoId/sufficient/:amount
 * Check if project has sufficient funds
 */
router.get('/pool/:repoId/sufficient/:amount', async (req, res) => {
  try {
    const { repoId, amount } = req.params;
    const result = await blockchainService.hasSufficientFunds(parseInt(repoId), amount);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/blockchain/reclaim-period
 * Get reclaim period
 */
router.get('/reclaim-period', async (req, res) => {
  try {
    const result = await blockchainService.getReclaimPeriod();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ================================
// UTILITY ENDPOINTS
// ================================

/**
 * GET /api/blockchain/gas-price
 * Get current gas price
 */
router.get('/gas-price', async (req, res) => {
  try {
    const result = await blockchainService.getCurrentGasPrice();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/blockchain/network
 * Get network information
 */
router.get('/network', async (req, res) => {
  try {
    const result = await blockchainService.getNetworkInfo();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/blockchain/balance/:address
 * Get account balance
 */
router.get('/balance/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const result = await blockchainService.getAccountBalance(address);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/blockchain/convert/matic-to-wei
 * Convert MATIC to Wei
 */
router.post('/convert/matic-to-wei', (req, res) => {
  try {
    const { matic } = req.body;
    if (!matic) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: matic'
      });
    }

    const wei = blockchainService.maticToWei(matic);
    res.json({
      success: true,
      data: {
        matic,
        wei
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/blockchain/convert/wei-to-matic
 * Convert Wei to MATIC
 */
router.post('/convert/wei-to-matic', (req, res) => {
  try {
    const { wei } = req.body;
    if (!wei) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: wei'
      });
    }

    const matic = blockchainService.weiToMatic(wei);
    res.json({
      success: true,
      data: {
        wei,
        matic
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ================================
// ANALYTICS ENDPOINTS
// ================================

/**
 * GET /api/blockchain/analytics/:repoId
 * Get comprehensive repository analytics
 */
router.get('/analytics/:repoId', async (req, res) => {
  try {
    const { repoId } = req.params;
    const repoIdInt = parseInt(repoId);

    const [repoInfo, poolBalance] = await Promise.all([
      blockchainService.getRepository(repoIdInt),
      blockchainService.getProjectPool(repoIdInt)
    ]);

    if (repoInfo.success && poolBalance.success) {
      // Get bounties for all issues in the repo
      const issuePromises = repoInfo.data.issueIds.map(issueId => 
        blockchainService.getBountyDetails(repoIdInt, parseInt(issueId))
      );
      
      const bountyResults = await Promise.all(issuePromises);
      const bounties = bountyResults
        .filter(result => result.success)
        .map(result => result.data);

      const totalBounties = bounties.reduce((sum, bounty) => 
        sum + parseFloat(bounty.amount), 0
      );

      const paidBounties = bounties.filter(bounty => bounty.isPaid);
      const activeBounties = bounties.filter(bounty => !bounty.isPaid && parseFloat(bounty.amount) > 0);

      res.json({
        success: true,
        data: {
          repository: repoInfo.data,
          poolBalance: parseFloat(poolBalance.data.poolBalance),
          totalBounties,
          totalBountyCount: bounties.length,
          paidBountyCount: paidBounties.length,
          activeBountyCount: activeBounties.length,
          bounties: bounties
        }
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Repository not found or pool data unavailable'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/blockchain/health
 * Health check for blockchain service
 */
router.get('/health', async (req, res) => {
  try {
    const networkInfo = await blockchainService.getNetworkInfo();
    const gasPrice = await blockchainService.getCurrentGasPrice();

    res.json({
      success: true,
      data: {
        initialized: blockchainService.isInitialized,
        network: networkInfo.success ? networkInfo.data : null,
        gasPrice: gasPrice.success ? gasPrice.data : null,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;