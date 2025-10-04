// Organization Dashboard Service - Smart Contract Integration
class OrganizationService {
  constructor() {
    this.apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
  }

  // ================================
  // DONATION FUNCTIONS
  // ================================

  /**
   * Donate HLUSD to a repository pool
   * @param {string} repoId - Repository ID
   * @param {string} amount - Amount in HLUSD
   * @param {string} donorAddress - Wallet address of donor
   * @returns {Promise<Object>} Transaction result
   */
  async donateToRepository(repoId, amount, donorAddress) {
    try {
      console.log(`💰 Donating ${amount} HLUSD to repository ${repoId}`);

      const response = await fetch(`${this.apiBase}/organization/donate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          repoId,
          amount,
          donorAddress
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Donation failed');
      }

      console.log('✅ Donation successful:', result.data.transactionHash);
      return result;
    } catch (error) {
      console.error('❌ Donation error:', error);
      throw error;
    }
  }

  /**
   * Get repository pool balance
   * @param {string} repoId - Repository ID
   * @returns {Promise<Object>} Pool balance data
   */
  async getRepositoryPool(repoId) {
    try {
      console.log(`📊 Getting pool balance for repository ${repoId}`);

      const response = await fetch(`${this.apiBase}/organization/repo/${repoId}/pool`, {
        method: 'GET',
        credentials: 'include'
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get pool balance');
      }

      return result;
    } catch (error) {
      console.error('❌ Get pool balance error:', error);
      throw error;
    }
  }

  // ================================
  // BOUNTY MANAGEMENT FUNCTIONS
  // ================================

  /**
   * Fund a bounty from repository pool
   * @param {string} repoId - Repository ID
   * @param {string} issueId - Issue ID
   * @param {string} amount - Amount in HLUSD
   * @param {string} orgAddress - Organization wallet address
   * @returns {Promise<Object>} Transaction result
   */
  async fundBountyFromPool(repoId, issueId, amount, orgAddress) {
    try {
      console.log(`🎯 Funding bounty: ${amount} HLUSD for issue ${issueId}`);

      const response = await fetch(`${this.apiBase}/organization/bounty/fund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          repoId,
          issueId,
          amount,
          orgAddress
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Bounty funding failed');
      }

      console.log('✅ Bounty funded successfully:', result.data.transactionHash);
      return result;
    } catch (error) {
      console.error('❌ Bounty funding error:', error);
      throw error;
    }
  }

  /**
   * Release bounty to contributor
   * @param {string} repoId - Repository ID
   * @param {string} issueId - Issue ID
   * @param {string} solverAddress - Contributor's wallet address
   * @returns {Promise<Object>} Transaction result
   */
  async releaseBounty(repoId, issueId, solverAddress) {
    try {
      console.log(`🏆 Releasing bounty for issue ${issueId} to ${solverAddress}`);

      const response = await fetch(`${this.apiBase}/organization/bounty/release`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          repoId,
          issueId,
          solverAddress
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Bounty release failed');
      }

      console.log('✅ Bounty released successfully:', result.data.transactionHash);
      return result;
    } catch (error) {
      console.error('❌ Bounty release error:', error);
      throw error;
    }
  }

  /**
   * Reclaim bounty (organization only)
   * @param {string} repoId - Repository ID
   * @param {string} issueId - Issue ID
   * @returns {Promise<Object>} Transaction result
   */
  async reclaimBounty(repoId, issueId) {
    try {
      console.log(`🔄 Reclaiming bounty for issue ${issueId}`);

      const response = await fetch(`${this.apiBase}/organization/bounty/reclaim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          repoId,
          issueId
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Bounty reclaim failed');
      }

      console.log('✅ Bounty reclaimed successfully:', result.data.transactionHash);
      return result;
    } catch (error) {
      console.error('❌ Bounty reclaim error:', error);
      throw error;
    }
  }

  /**
   * Get bounty details for an issue
   * @param {string} repoId - Repository ID
   * @param {string} issueId - Issue ID
   * @returns {Promise<Object>} Bounty details
   */
  async getBountyDetails(repoId, issueId) {
    try {
      console.log(`📋 Getting bounty details for issue ${issueId}`);

      const response = await fetch(`${this.apiBase}/organization/bounty/${repoId}/${issueId}`, {
        method: 'GET',
        credentials: 'include'
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get bounty details');
      }

      return result;
    } catch (error) {
      console.error('❌ Get bounty details error:', error);
      throw error;
    }
  }

  // ================================
  // ORGANIZATION STAKE FUNCTIONS
  // ================================

  /**
   * Stake HLUSD for organization credibility
   * @param {string} amount - Amount in HLUSD
   * @param {string} userAddress - Organization wallet address
   * @returns {Promise<Object>} Transaction result
   */
  async stakeForOrganization(amount, userAddress) {
    try {
      console.log(`🏛️ Staking ${amount} HLUSD for organization credibility`);

      const response = await fetch(`${this.apiBase}/organization/stake`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          amount,
          userAddress
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Staking failed');
      }

      console.log('✅ Staking successful:', result.data.transactionHash);
      return result;
    } catch (error) {
      console.error('❌ Staking error:', error);
      throw error;
    }
  }

  /**
   * Get organization stake amount
   * @param {string} address - Organization wallet address
   * @returns {Promise<Object>} Stake information
   */
  async getOrganizationStake(address) {
    try {
      console.log(`🔍 Getting stake info for organization ${address}`);

      const response = await fetch(`${this.apiBase}/organization/stake/${address}`, {
        method: 'GET',
        credentials: 'include'
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get stake info');
      }

      return result;
    } catch (error) {
      console.error('❌ Get stake info error:', error);
      throw error;
    }
  }

  // ================================
  // WALLET INTEGRATION
  // ================================

  /**
   * Get user's wallet address from MetaMask
   * @returns {Promise<string>} Wallet address
   */
  async getWalletAddress() {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed');
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('No wallet accounts available');
      }

      return accounts[0];
    } catch (error) {
      console.error('❌ Wallet connection error:', error);
      throw error;
    }
  }

  /**
   * Convert Wei to HLUSD display format
   * @param {string} weiAmount - Amount in Wei
   * @returns {string} Amount in HLUSD
   */
  weiToHLUSD(weiAmount) {
    if (!weiAmount || weiAmount === '0') return '0';
    
    // Convert Wei to HLUSD (similar to ETH conversion)
    const hlusd = parseFloat(weiAmount) / Math.pow(10, 18);
    return hlusd.toFixed(6);
  }

  /**
   * Convert HLUSD to Wei for transactions
   * @param {string} hlusdAmount - Amount in HLUSD
   * @returns {string} Amount in Wei
   */
  hlusdToWei(hlusdAmount) {
    if (!hlusdAmount || hlusdAmount === '0') return '0';
    
    // Convert HLUSD to Wei
    const wei = parseFloat(hlusdAmount) * Math.pow(10, 18);
    return wei.toString();
  }
}

export default new OrganizationService();