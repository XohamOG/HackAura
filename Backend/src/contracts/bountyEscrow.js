// BountyEscrow Contract Helper Functions
const { getWeb3Provider } = require('./web3Provider');
const { bountyEscrowABI } = require('./contractABI');
const contractConfig = require('./config');

class BountyEscrowHelper {
  constructor() {
    this.web3Provider = getWeb3Provider();
    this.web3 = this.web3Provider.getWeb3();
    this.contractAddress = contractConfig.getContractAddress('bountyEscrow');
    this.contract = new this.web3.eth.Contract(bountyEscrowABI, this.contractAddress);
  }

  /**
   * Donate ETH to a project pool
   * @param {number} repoId - Repository ID
   * @param {string} amount - Amount in ETH (as string)
   * @param {string} donorAddress - Address of the donor (optional, uses default account)
   * @returns {Promise<Object>} Transaction result
   */
  async donateToProject(repoId, amount, donorAddress = null) {
    try {
      const amountWei = this.web3Provider.etherToWei(amount);
      const fromAddress = donorAddress || this.web3Provider.getAccount().address;

      console.log(`💰 Donating ${amount} ETH to project ${repoId}`);

      const transaction = {
        to: this.contractAddress,
        data: this.contract.methods.donateToProject(repoId).encodeABI(),
        value: amountWei,
        from: fromAddress
      };

      const result = await this.web3Provider.sendTransaction(transaction);
      
      // Wait for confirmation
      const receipt = await this.web3Provider.waitForTransaction(result.transactionHash);
      
      return {
        success: true,
        transactionHash: result.transactionHash,
        receipt: receipt,
        repoId: repoId,
        amount: amount,
        donor: fromAddress
      };
    } catch (error) {
      console.error('❌ Donation failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Fund a bounty from project pool (owner only)
   * @param {number} repoId - Repository ID
   * @param {number} issueId - Issue ID
   * @param {string} amount - Amount in ETH (as string)
   * @param {string} orgAddress - Organization address
   * @returns {Promise<Object>} Transaction result
   */
  async fundBountyFromPool(repoId, issueId, amount, orgAddress) {
    try {
      const amountWei = this.web3Provider.etherToWei(amount);
      const fromAddress = this.web3Provider.getAccount().address;

      console.log(`🎯 Funding bounty for issue ${issueId} with ${amount} ETH`);

      const transaction = {
        to: this.contractAddress,
        data: this.contract.methods.fundBountyFromPool(repoId, issueId, amountWei, orgAddress).encodeABI(),
        from: fromAddress
      };

      const result = await this.web3Provider.sendTransaction(transaction);
      const receipt = await this.web3Provider.waitForTransaction(result.transactionHash);
      
      return {
        success: true,
        transactionHash: result.transactionHash,
        receipt: receipt,
        repoId: repoId,
        issueId: issueId,
        amount: amount,
        orgAddress: orgAddress
      };
    } catch (error) {
      console.error('❌ Bounty funding failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Release bounty to contributor
   * @param {number} repoId - Repository ID
   * @param {number} issueId - Issue ID
   * @param {string} solverAddress - Contributor's address
   * @returns {Promise<Object>} Transaction result
   */
  async releaseBounty(repoId, issueId, solverAddress) {
    try {
      const fromAddress = this.web3Provider.getAccount().address;

      console.log(`🚀 Releasing bounty for issue ${issueId} to ${solverAddress}`);

      const transaction = {
        to: this.contractAddress,
        data: this.contract.methods.releaseBounty(repoId, issueId, solverAddress).encodeABI(),
        from: fromAddress
      };

      const result = await this.web3Provider.sendTransaction(transaction);
      const receipt = await this.web3Provider.waitForTransaction(result.transactionHash);
      
      return {
        success: true,
        transactionHash: result.transactionHash,
        receipt: receipt,
        repoId: repoId,
        issueId: issueId,
        solver: solverAddress
      };
    } catch (error) {
      console.error('❌ Bounty release failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Reclaim bounty after timeout
   * @param {number} repoId - Repository ID
   * @param {number} issueId - Issue ID
   * @returns {Promise<Object>} Transaction result
   */
  async reclaimBounty(repoId, issueId) {
    try {
      const fromAddress = this.web3Provider.getAccount().address;

      console.log(`⏰ Reclaiming bounty for issue ${issueId}`);

      const transaction = {
        to: this.contractAddress,
        data: this.contract.methods.reclaimBounty(repoId, issueId).encodeABI(),
        from: fromAddress
      };

      const result = await this.web3Provider.sendTransaction(transaction);
      const receipt = await this.web3Provider.waitForTransaction(result.transactionHash);
      
      return {
        success: true,
        transactionHash: result.transactionHash,
        receipt: receipt,
        repoId: repoId,
        issueId: issueId
      };
    } catch (error) {
      console.error('❌ Bounty reclaim failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get bounty details
   * @param {number} repoId - Repository ID
   * @param {number} issueId - Issue ID
   * @returns {Promise<Object>} Bounty details
   */
  async getBounty(repoId, issueId) {
    try {
      const result = await this.contract.methods.getBounty(repoId, issueId).call();
      
      return {
        success: true,
        amount: this.web3Provider.weiToEther(result.amount),
        amountWei: result.amount,
        paid: result.paid,
        org: result.org,
        repoId: repoId,
        issueId: issueId
      };
    } catch (error) {
      console.error('❌ Failed to get bounty:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get project pool balance
   * @param {number} repoId - Repository ID
   * @returns {Promise<Object>} Pool balance
   */
  async getProjectPool(repoId) {
    try {
      const result = await this.contract.methods.getProjectPool(repoId).call();
      
      return {
        success: true,
        balance: this.web3Provider.weiToEther(result),
        balanceWei: result,
        repoId: repoId
      };
    } catch (error) {
      console.error('❌ Failed to get project pool:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if pool has sufficient funds
   * @param {number} repoId - Repository ID
   * @param {string} amount - Amount to check in ETH
   * @returns {Promise<Object>} Sufficiency check result
   */
  async hasSufficientFunds(repoId, amount) {
    try {
      const amountWei = this.web3Provider.etherToWei(amount);
      const result = await this.contract.methods.hasSufficientFunds(repoId, amountWei).call();
      
      return {
        success: true,
        hasSufficientFunds: result,
        repoId: repoId,
        requestedAmount: amount
      };
    } catch (error) {
      console.error('❌ Failed to check funds:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Set reclaim period (owner only)
   * @param {number} periodInDays - Period in days
   * @returns {Promise<Object>} Transaction result
   */
  async setReclaimPeriod(periodInDays) {
    try {
      const periodInSeconds = periodInDays * 24 * 60 * 60;
      const fromAddress = this.web3Provider.getAccount().address;

      const transaction = {
        to: this.contractAddress,
        data: this.contract.methods.setReclaimPeriod(periodInSeconds).encodeABI(),
        from: fromAddress
      };

      const result = await this.web3Provider.sendTransaction(transaction);
      const receipt = await this.web3Provider.waitForTransaction(result.transactionHash);
      
      return {
        success: true,
        transactionHash: result.transactionHash,
        receipt: receipt,
        periodInDays: periodInDays
      };
    } catch (error) {
      console.error('❌ Failed to set reclaim period:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Listen to contract events
   * @param {string} eventName - Event name to listen to
   * @param {Function} callback - Callback function for event
   */
  listenToEvents(eventName, callback) {
    try {
      this.contract.events[eventName]()
        .on('data', callback)
        .on('error', (error) => {
          console.error(`❌ Event listener error for ${eventName}:`, error);
        });
      
      console.log(`👂 Listening to ${eventName} events`);
    } catch (error) {
      console.error(`❌ Failed to setup event listener for ${eventName}:`, error.message);
    }
  }
}

module.exports = BountyEscrowHelper;