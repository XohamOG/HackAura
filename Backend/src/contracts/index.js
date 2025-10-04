// Main exports for smart contract helpers
const BountyEscrowHelper = require('./bountyEscrow');
const RepoRegistryHelper = require('./repoRegistry');
const { getWeb3Provider } = require('./web3Provider');
const contractConfig = require('./config');

// Initialize helper instances
const bountyEscrow = new BountyEscrowHelper();
const repoRegistry = new RepoRegistryHelper();
const web3Provider = getWeb3Provider();

// Utility functions
const utils = {
  // Convert Wei to MATIC
  weiToMatic: (wei) => web3Provider.weiToEther(wei),
  
  // Convert MATIC to Wei
  maticToWei: (matic) => web3Provider.etherToWei(matic),
  
  // Validate address
  isValidAddress: (address) => web3Provider.isValidAddress(address),
  
  // Get current network info
  getNetworkInfo: () => web3Provider.getNetworkInfo(),
  
  // Get account balance
  getBalance: async (address) => await web3Provider.getBalance(address),
  
  // Wait for transaction
  waitForTransaction: async (txHash, timeout) => await web3Provider.waitForTransaction(txHash, timeout)
};

// Combined operations that use both contracts
const combinedOperations = {
  /**
   * Create a complete bounty workflow
   * @param {string} cid - IPFS CID for repo metadata
   * @param {boolean} isPublic - Whether repo is public
   * @param {number[]} issueIds - Array of issue IDs
   * @param {number} issueId - Specific issue ID for bounty
   * @param {string} bountyAmount - Bounty amount in MATIC
   * @returns {Promise<Object>} Complete bounty creation result
   */
  async createCompleteBounty(cid, isPublic, issueIds, issueId, bountyAmount) {
    try {
      console.log('🚀 Starting complete bounty creation workflow...');
      
      // Step 1: Register repository
      const repoResult = await repoRegistry.registerRepo(cid, isPublic, issueIds);
      if (!repoResult.success) {
        throw new Error(`Repository registration failed: ${repoResult.error}`);
      }
      
      console.log(`✅ Repository registered with ID: ${repoResult.repoId}`);
      
      // Step 2: Assign bounty
      const bountyResult = await repoRegistry.assignBounty(repoResult.repoId, issueId, bountyAmount);
      if (!bountyResult.success) {
        throw new Error(`Bounty assignment failed: ${bountyResult.error}`);
      }
      
      console.log(`✅ Bounty assigned to issue ${issueId}`);
      
      // Step 3: Fund bounty from pool (if pool has funds)
      const poolResult = await bountyEscrow.getProjectPool(repoResult.repoId);
      if (poolResult.success && parseFloat(poolResult.balance) >= parseFloat(bountyAmount)) {
        const orgAddress = web3Provider.getAccount().address;
        const fundResult = await bountyEscrow.fundBountyFromPool(repoResult.repoId, issueId, bountyAmount, orgAddress);
        
        return {
          success: true,
          repoId: repoResult.repoId,
          issueId: issueId,
          bountyAmount: bountyAmount,
          repoTxHash: repoResult.transactionHash,
          bountyTxHash: bountyResult.transactionHash,
          fundTxHash: fundResult.success ? fundResult.transactionHash : null,
          fullyFunded: fundResult.success
        };
      }
      
      return {
        success: true,
        repoId: repoResult.repoId,
        issueId: issueId,
        bountyAmount: bountyAmount,
        repoTxHash: repoResult.transactionHash,
        bountyTxHash: bountyResult.transactionHash,
        fullyFunded: false,
        message: 'Bounty created but not funded. Pool needs more donations.'
      };
      
    } catch (error) {
      console.error('❌ Complete bounty creation failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Get complete repository information including bounties and pool
   * @param {number} repoId - Repository ID
   * @returns {Promise<Object>} Complete repository information
   */
  async getCompleteRepoInfo(repoId) {
    try {
      // Get repository details
      const repo = await repoRegistry.getRepo(repoId);
      if (!repo.success) {
        throw new Error(`Failed to get repository: ${repo.error}`);
      }
      
      // Get project pool
      const pool = await bountyEscrow.getProjectPool(repoId);
      
      // Get bounties for all issues
      const bounties = await repoRegistry.getBountiesForRepo(repoId);
      
      // Get funded bounties from escrow
      const fundedBounties = [];
      if (bounties.success) {
        for (const bounty of bounties.bounties) {
          const escrowBounty = await bountyEscrow.getBounty(repoId, bounty.issueId);
          if (escrowBounty.success && parseFloat(escrowBounty.amount) > 0) {
            fundedBounties.push({
              issueId: bounty.issueId,
              assignedAmount: bounty.bounty,
              fundedAmount: escrowBounty.amount,
              paid: escrowBounty.paid,
              org: escrowBounty.org
            });
          }
        }
      }
      
      return {
        success: true,
        repoId: repoId,
        repository: repo,
        projectPool: pool.success ? pool : { balance: '0', error: pool.error },
        assignedBounties: bounties.success ? bounties : { bounties: [], error: bounties.error },
        fundedBounties: fundedBounties,
        totalAssignedValue: bounties.success ? bounties.totalAmount : 0,
        totalFundedValue: fundedBounties.reduce((sum, b) => sum + parseFloat(b.fundedAmount), 0)
      };
      
    } catch (error) {
      console.error('❌ Failed to get complete repo info:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

module.exports = {
  // Contract helpers
  bountyEscrow,
  repoRegistry,
  web3Provider,
  
  // Configuration
  config: contractConfig,
  
  // Utilities
  utils,
  
  // Combined operations
  combinedOperations,
  
  // Direct access to classes for advanced usage
  BountyEscrowHelper,
  RepoRegistryHelper
};