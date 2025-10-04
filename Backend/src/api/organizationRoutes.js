// Organization Dashboard API Routes
const express = require('express');
const router = express.Router();
const { bountyEscrow, repoRegistry } = require('../contracts');

console.log('🏢 Organization Dashboard API routes loaded');

// ================================
// DONATION ENDPOINTS
// ================================

/**
 * POST /api/organization/donate
 * Donate HLUSD to a repository pool
 */
router.post('/donate', async (req, res) => {
  try {
    const { repoId, amount, donorAddress } = req.body;

    // Validate required fields
    if (!repoId || !amount || !donorAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: repoId, amount, donorAddress'
      });
    }

    console.log(`💰 Processing donation: ${amount} HLUSD to repo ${repoId}`);

    const result = await bountyEscrow.donateToProject(repoId, amount, donorAddress);

    if (result.success) {
      res.json({
        success: true,
        data: {
          transactionHash: result.transactionHash,
          repoId: result.repoId,
          amount: result.amount,
          donor: result.donor
        }
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ Donation API error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ================================
// BOUNTY MANAGEMENT ENDPOINTS
// ================================

/**
 * POST /api/organization/bounty/fund
 * Fund a bounty from repository pool
 */
router.post('/bounty/fund', async (req, res) => {
  try {
    const { repoId, issueId, amount, orgAddress } = req.body;

    // Validate required fields
    if (!repoId || !issueId || !amount || !orgAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: repoId, issueId, amount, orgAddress'
      });
    }

    console.log(`🎯 Funding bounty: ${amount} HLUSD for issue ${issueId} in repo ${repoId}`);

    const result = await bountyEscrow.fundBountyFromPool(repoId, issueId, amount, orgAddress);

    if (result.success) {
      res.json({
        success: true,
        data: {
          transactionHash: result.transactionHash,
          repoId: result.repoId,
          issueId: result.issueId,
          amount: result.amount,
          orgAddress: result.orgAddress
        }
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ Bounty funding API error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/organization/bounty/release
 * Release bounty to contributor
 */
router.post('/bounty/release', async (req, res) => {
  try {
    const { repoId, issueId, solverAddress } = req.body;

    // Validate required fields
    if (!repoId || !issueId || !solverAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: repoId, issueId, solverAddress'
      });
    }

    console.log(`🏆 Releasing bounty for issue ${issueId} to ${solverAddress}`);

    const result = await bountyEscrow.releaseBounty(repoId, issueId, solverAddress);

    if (result.success) {
      res.json({
        success: true,
        data: {
          transactionHash: result.transactionHash,
          repoId: result.repoId,
          issueId: result.issueId,
          solverAddress: result.solverAddress
        }
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ Bounty release API error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/organization/bounty/reclaim
 * Reclaim bounty (organization only)
 */
router.post('/bounty/reclaim', async (req, res) => {
  try {
    const { repoId, issueId } = req.body;

    // Validate required fields
    if (!repoId || !issueId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: repoId, issueId'
      });
    }

    console.log(`🔄 Reclaiming bounty for issue ${issueId} in repo ${repoId}`);

    const result = await bountyEscrow.reclaimBounty(repoId, issueId);

    if (result.success) {
      res.json({
        success: true,
        data: {
          transactionHash: result.transactionHash,
          repoId: result.repoId,
          issueId: result.issueId
        }
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ Bounty reclaim API error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ================================
// REPOSITORY POOL ENDPOINTS
// ================================

/**
 * GET /api/organization/repo/:repoId/pool
 * Get repository pool balance
 */
router.get('/repo/:repoId/pool', async (req, res) => {
  try {
    const { repoId } = req.params;

    console.log(`📊 Getting pool balance for repo ${repoId}`);

    const result = await bountyEscrow.getProjectPool(repoId);

    if (result.success) {
      res.json({
        success: true,
        data: {
          repoId: repoId,
          poolBalance: result.data.poolBalance,
          poolBalanceWei: result.data.poolBalanceWei
        }
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ Pool balance API error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/organization/bounty/:repoId/:issueId
 * Get bounty details for an issue
 */
router.get('/bounty/:repoId/:issueId', async (req, res) => {
  try {
    const { repoId, issueId } = req.params;

    console.log(`📋 Getting bounty details for issue ${issueId} in repo ${repoId}`);

    const result = await bountyEscrow.getBountyDetails(repoId, issueId);

    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ Bounty details API error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ================================
// ORGANIZATION STAKE ENDPOINTS
// ================================

/**
 * POST /api/organization/stake
 * Stake HLUSD for organization credibility
 */
router.post('/stake', async (req, res) => {
  try {
    const { amount, userAddress } = req.body;

    // Validate required fields
    if (!amount || !userAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: amount, userAddress'
      });
    }

    console.log(`🏛️ Processing stake: ${amount} HLUSD from ${userAddress}`);

    const result = await repoRegistry.stakeForOrganization(amount, userAddress);

    if (result.success) {
      res.json({
        success: true,
        data: {
          transactionHash: result.transactionHash,
          stakedAmount: result.stakedAmount,
          userAddress: result.userAddress
        }
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ Stake API error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/organization/stake/:address
 * Get organization stake amount
 */
router.get('/stake/:address', async (req, res) => {
  try {
    const { address } = req.params;

    console.log(`🔍 Getting stake info for organization ${address}`);

    const result = await repoRegistry.getOrganizationStake(address);

    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ Get stake API error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;