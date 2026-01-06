// RepoRegistry Contract Helper Functions
const { getWeb3Provider } = require('./web3Provider');
const { repoRegistryABI } = require('./contractABI');
const contractConfig = require('./config');

class RepoRegistryHelper {
  constructor() {
    this.web3Provider = getWeb3Provider();
    this.web3 = this.web3Provider.getWeb3();
    this.contractAddress = contractConfig.getContractAddress('repoRegistry');
    this.contract = new this.web3.eth.Contract(repoRegistryABI, this.contractAddress);
  }

  /**
   * Stake ETH for organization credibility
   * @param {string} amount - Amount in ETH (as string)
   * @param {string} orgAddress - Organization address (optional, uses default account)
   * @returns {Promise<Object>} Transaction result
   */
  async stakeForOrg(amount, orgAddress = null) {
    try {
      const amountWei = this.web3Provider.etherToWei(amount);
      const fromAddress = orgAddress || this.web3Provider.getAccount().address;

      console.log(`🔒 Staking ${amount} ETH for organization ${fromAddress}`);

      const transaction = {
        to: this.contractAddress,
        data: this.contract.methods.stakeForOrg().encodeABI(),
        value: amountWei,
        from: fromAddress
      };

      const result = await this.web3Provider.sendTransaction(transaction);
      const receipt = await this.web3Provider.waitForTransaction(result.transactionHash);
      
      return {
        success: true,
        transactionHash: result.transactionHash,
        receipt: receipt,
        amount: amount,
        orgAddress: fromAddress
      };
    } catch (error) {
      console.error('❌ Organization staking failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Register a new repository
   * @param {string} cid - IPFS/Filecoin CID for repo metadata
   * @param {boolean} isPublic - Whether the repo is public
   * @param {number[]} issueIds - Array of GitHub issue IDs
   * @param {string} ownerAddress - Repository owner address (optional, uses default account)
   * @returns {Promise<Object>} Transaction result
   */
  async registerRepo(cid, isPublic, issueIds, ownerAddress = null) {
    try {
      const fromAddress = ownerAddress || this.web3Provider.getAccount().address;

      console.log(`📝 Registering repository with CID: ${cid}`);

      const transaction = {
        to: this.contractAddress,
        data: this.contract.methods.registerRepo(cid, isPublic, issueIds).encodeABI(),
        from: fromAddress
      };

      const result = await this.web3Provider.sendTransaction(transaction);
      const receipt = await this.web3Provider.waitForTransaction(result.transactionHash);
      
      // Get the repo ID from the event
      const event = receipt.events?.RepoRegistered;
      const repoId = event?.returnValues?.repoId;
      
      return {
        success: true,
        transactionHash: result.transactionHash,
        receipt: receipt,
        repoId: repoId,
        cid: cid,
        isPublic: isPublic,
        issueIds: issueIds,
        owner: fromAddress
      };
    } catch (error) {
      console.error('❌ Repository registration failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Assign bounty to an issue
   * @param {number} repoId - Repository ID
   * @param {number} issueId - Issue ID
   * @param {string} bountyAmount - Bounty amount in ETH
   * @param {string} creatorAddress - Bounty creator address (optional, uses default account)
   * @returns {Promise<Object>} Transaction result
   */
  async assignBounty(repoId, issueId, bountyAmount, creatorAddress = null) {
    try {
      const bountyWei = this.web3Provider.etherToWei(bountyAmount);
      const fromAddress = creatorAddress || this.web3Provider.getAccount().address;

      console.log(`🎯 Assigning ${bountyAmount} ETH bounty to issue ${issueId}`);

      const transaction = {
        to: this.contractAddress,
        data: this.contract.methods.assignBounty(repoId, issueId, bountyWei).encodeABI(),
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
        bountyAmount: bountyAmount,
        creator: fromAddress
      };
    } catch (error) {
      console.error('❌ Bounty assignment failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get repository details
   * @param {number} repoId - Repository ID
   * @returns {Promise<Object>} Repository details
   */
  async getRepo(repoId) {
    try {
      const result = await this.contract.methods.getRepo(repoId).call();
      
      return {
        success: true,
        repoId: repoId,
        cid: result[0],
        owner: result[1],
        isPublic: result[2],
        issueIds: result[3].map(id => parseInt(id))
      };
    } catch (error) {
      console.error('❌ Failed to get repository:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get issue bounty amount
   * @param {number} issueId - Issue ID
   * @returns {Promise<Object>} Issue bounty details
   */
  async getIssueBounty(issueId) {
    try {
      const result = await this.contract.methods.getIssueBounty(issueId).call();
      
      return {
        success: true,
        issueId: issueId,
        bounty: this.web3Provider.weiToEther(result),
        bountyWei: result
      };
    } catch (error) {
      console.error('❌ Failed to get issue bounty:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get minimum stake amount
   * @returns {Promise<Object>} Minimum stake amount
   */
  async getMinStake() {
    try {
      const result = await this.contract.methods.minStake().call();
      
      return {
        success: true,
        minStake: this.web3Provider.weiToEther(result),
        minStakeWei: result
      };
    } catch (error) {
      console.error('❌ Failed to get minimum stake:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get total repository count
   * @returns {Promise<Object>} Repository count
   */
  async getRepoCount() {
    try {
      const result = await this.contract.methods.repoCount().call();
      
      return {
        success: true,
        repoCount: parseInt(result)
      };
    } catch (error) {
      console.error('❌ Failed to get repo count:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get organization stake
   * @param {string} orgAddress - Organization address
   * @returns {Promise<Object>} Organization stake details
   */
  async getOrgStake(orgAddress) {
    try {
      const result = await this.contract.methods.orgStakes(orgAddress).call();
      
      return {
        success: true,
        orgAddress: orgAddress,
        stake: this.web3Provider.weiToEther(result),
        stakeWei: result,
        isStaked: this.web3Provider.weiToEther(result) >= await this.getMinStake().minStake
      };
    } catch (error) {
      console.error('❌ Failed to get organization stake:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all repositories for an owner
   * @param {string} ownerAddress - Owner address
   * @returns {Promise<Object>} Array of repositories
   */
  async getReposByOwner(ownerAddress) {
    try {
      const repoCountResult = await this.getRepoCount();
      if (!repoCountResult.success) {
        throw new Error('Failed to get repo count');
      }

      const repos = [];
      for (let i = 1; i <= repoCountResult.repoCount; i++) {
        const repo = await this.getRepo(i);
        if (repo.success && repo.owner.toLowerCase() === ownerAddress.toLowerCase()) {
          repos.push(repo);
        }
      }

      return {
        success: true,
        repos: repos,
        count: repos.length,
        ownerAddress: ownerAddress
      };
    } catch (error) {
      console.error('❌ Failed to get repositories by owner:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all bounties for a repository
   * @param {number} repoId - Repository ID
   * @returns {Promise<Object>} Array of bounties
   */
  async getBountiesForRepo(repoId) {
    try {
      const repo = await this.getRepo(repoId);
      if (!repo.success) {
        throw new Error('Failed to get repository details');
      }

      const bounties = [];
      for (const issueId of repo.issueIds) {
        const bounty = await this.getIssueBounty(issueId);
        if (bounty.success && parseFloat(bounty.bounty) > 0) {
          bounties.push({
            issueId: issueId,
            bounty: bounty.bounty,
            bountyWei: bounty.bountyWei
          });
        }
      }

      return {
        success: true,
        repoId: repoId,
        bounties: bounties,
        totalBounties: bounties.length,
        totalAmount: bounties.reduce((sum, b) => sum + parseFloat(b.bounty), 0)
      };
    } catch (error) {
      console.error('❌ Failed to get bounties for repo:', error.message);
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

module.exports = RepoRegistryHelper;