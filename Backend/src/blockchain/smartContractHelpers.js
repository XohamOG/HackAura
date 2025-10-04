// Legacy Smart Contract Helpers - Redirects to new contract system
// This file is kept for backwards compatibility

const { bountyEscrow, repoRegistry, combinedOperations, utils } = require('../contracts');

// Legacy compatibility layer
const smartContractHelpers = {
  // Redirect to new contract helpers
  bountyEscrow,
  repoRegistry, 
  combinedOperations,
  utils,

  // Legacy initialize function (now no-op)
  initialize() {
    console.log('⚠️  Legacy initialize() called - using new contract system');
    return Promise.resolve();
  },

  // Legacy method redirects
  async createBounty(repoId, issueId, amount) {
    console.log('⚠️  Legacy createBounty() called - redirecting to new system');
    return await bountyEscrow.fundBountyFromPool(repoId, issueId, amount, utils.web3Provider.getAccount().address);
  },

  async registerRepository(cid, isPublic, issueIds) {
    console.log('⚠️  Legacy registerRepository() called - redirecting to new system');
    return await repoRegistry.registerRepo(cid, isPublic, issueIds);
  },

  async getRepository(repoId) {
    console.log('⚠️  Legacy getRepository() called - redirecting to new system');
    return await repoRegistry.getRepo(repoId);
  }
};

module.exports = smartContractHelpers;