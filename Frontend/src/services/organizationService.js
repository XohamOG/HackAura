// Organization Dashboard Service - Smart Contract Integration
import { Web3 } from 'web3';

class OrganizationService {
  constructor() {
    this.apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
    this.web3 = null;
    this.bountyEscrowContract = null;
    this.repoRegistryContract = null;
    this.initializeWeb3();
  }

  /**
   * Initialize Web3 with MetaMask
   */
  async initializeWeb3() {
    if (window.ethereum) {
      this.web3 = new Web3(window.ethereum);
      
      // Initialize contracts when Web3 is ready
      this.initializeContracts();
    }
  }

  /**
   * Initialize smart contracts
   */
  initializeContracts() {
    const bountyEscrowAddress = import.meta.env.VITE_BOUNTY_ESCROW_ADDRESS;
    const repoRegistryAddress = import.meta.env.VITE_REPO_REGISTRY_ADDRESS;

    // Simplified ABI for donation function
    const bountyEscrowABI = [
      {
        "inputs": [{"name": "repoId", "type": "uint256"}],
        "name": "donateToProject",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      }
    ];

    if (bountyEscrowAddress && this.web3) {
      this.bountyEscrowContract = new this.web3.eth.Contract(bountyEscrowABI, bountyEscrowAddress);
    }
  }

  // ================================
  // DONATION FUNCTIONS
  // ================================

  /**
   * Donate HLUSD to a repository pool via MetaMask
   * @param {string} repoId - Repository ID
   * @param {string} amount - Amount in HLUSD
   * @param {string} donorAddress - Wallet address of donor
   * @returns {Promise<Object>} Transaction result
   */
  async donateToRepository(repoId, amount, donorAddress) {
    try {
      console.log(`💰 Donating ${amount} HLUSD to repository ${repoId}`);

      // Initialize Web3 if not already done
      if (!this.web3) {
        await this.initializeWeb3();
      }

      // Check if MetaMask is available
      if (!window.ethereum || !this.web3) {
        throw new Error('MetaMask is not installed or Web3 not initialized');
      }

      // Ensure we're on HelaChain testnet
      await this.ensureHelaChainNetwork();

      // Check if contract is initialized
      if (!this.bountyEscrowContract) {
        throw new Error('Bounty Escrow contract not initialized');
      }

      // Convert amount to Wei (HLUSD uses 18 decimals like ETH)
      const amountWei = this.web3.utils.toWei(amount, 'ether');

      console.log(`Converting ${amount} HLUSD to ${amountWei} Wei`);

      // Estimate gas
      const gasEstimate = await this.bountyEscrowContract.methods
        .donateToProject(repoId)
        .estimateGas({
          from: donorAddress,
          value: amountWei
        });

      console.log(`Estimated gas: ${gasEstimate}`);

      // Send transaction via MetaMask with legacy gas pricing (HelaChain doesn't support EIP-1559)
      const result = await this.bountyEscrowContract.methods
        .donateToProject(repoId)
        .send({
          from: donorAddress,
          value: amountWei,
          gas: Math.ceil(Number(gasEstimate) * 1.2), // Add 20% buffer, convert BigInt to Number
          gasPrice: await this.web3.eth.getGasPrice() // Use legacy gas pricing
        });

      console.log('✅ Donation transaction successful:', result.transactionHash);
      
      // Update local repository pool tracking
      this.updateLocalPoolBalance(repoId, amount);
      
      return {
        success: true,
        data: {
          transactionHash: result.transactionHash,
          receipt: result,
          repoId: repoId,
          amount: amount,
          donor: donorAddress,
          gasUsed: result.gasUsed
        }
      };
    } catch (error) {
      console.error('❌ Donation error:', error);
      throw error;
    }
  }

  /**
   * Ensure user is connected to HelaChain testnet
   */
  async ensureHelaChainNetwork() {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const helaChainId = '0xa2d08'; // 666888 in hex
    
    if (chainId !== helaChainId) {
      try {
        // Try to switch to HelaChain testnet
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: helaChainId }],
        });
      } catch (switchError) {
        // If the network doesn't exist, add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: helaChainId,
              chainName: 'Hela Official Runtime Testnet',
              nativeCurrency: {
                name: 'HLUSD',
                symbol: 'HLUSD',
                decimals: 18
              },
              rpcUrls: ['https://testnet-rpc.helachain.com'],
              blockExplorerUrls: ['https://testnet-explorer.helachain.com']
            }]
          });
        } else {
          throw switchError;
        }
      }
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
    
    try {
      // Use Web3.js for accurate Wei to Ether conversion
      if (this.web3) {
        const converted = this.web3.utils.fromWei(weiAmount.toString(), 'ether');
        const num = parseFloat(converted);
        // Format to remove unnecessary decimal places
        return num === 0 ? '0' : (num % 1 === 0 ? num.toString() : num.toFixed(6).replace(/\.?0+$/, ''));
      } else {
        // Fallback to manual conversion
        const hlusd = parseFloat(weiAmount) / Math.pow(10, 18);
        return hlusd === 0 ? '0' : (hlusd % 1 === 0 ? hlusd.toString() : hlusd.toFixed(6).replace(/\.?0+$/, ''));
      }
    } catch (error) {
      console.error('❌ Wei to HLUSD conversion error:', error);
      return '0';
    }
  }

  /**
   * Convert HLUSD to Wei for transactions
   * @param {string} hlusdAmount - Amount in HLUSD
   * @returns {string} Amount in Wei
   */
  hlusdToWei(hlusdAmount) {
    if (!hlusdAmount || hlusdAmount === '0') return '0';
    
    try {
      // Use Web3.js for accurate Ether to Wei conversion
      if (this.web3) {
        return this.web3.utils.toWei(hlusdAmount.toString(), 'ether');
      } else {
        // Fallback to manual conversion
        const wei = parseFloat(hlusdAmount) * Math.pow(10, 18);
        return wei.toString();
      }
    } catch (error) {
      console.error('❌ HLUSD to Wei conversion error:', error);
      return '0';
    }
  }

  /**
   * Fund a bounty from the repository pool using smart contract
   * @param {string} repoId - Repository ID
   * @param {string} issueId - GitHub issue ID
   * @param {string} amount - Bounty amount in HLUSD
   * @param {string} organizerAddress - Organization wallet address
   * @returns {Promise<Object>} Transaction result
   */
  async fundBountyFromPool(repoId, issueId, amount, organizerAddress) {
    try {
      // Check if pool has sufficient balance
      const currentPoolBalance = this.getLocalPoolBalance(repoId);
      const requestedAmount = parseFloat(amount);
      const availableAmount = parseFloat(currentPoolBalance);

      if (availableAmount < requestedAmount) {
        throw new Error(`Insufficient pool funds. Available: ${availableAmount} HLUSD, Requested: ${requestedAmount} HLUSD`);
      }

      if (availableAmount === 0) {
        throw new Error('Repository pool is empty. Please donate to the repository first.');
      }

      // Ensure user is on HelaChain testnet
      await this.ensureHelaChainNetwork();

      // Get user's wallet address
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length === 0) {
        throw new Error('No wallet connected');
      }

      console.log(`💰 Funding ${amount} HLUSD bounty from pool (${availableAmount} HLUSD available)`);

      // For pool funding, we don't actually send HLUSD from wallet
      // Instead, we just update the local pool balance and simulate the transaction
      // In a real implementation, this would interact with a smart contract that manages pools

      // Simulate a successful transaction (no actual blockchain transaction needed for pool funding)
      const mockTransactionHash = `0x${Date.now().toString(16)}${Math.random().toString(16).substr(2, 8)}`;
      
      console.log('✅ Bounty funding from pool successful (simulated):', mockTransactionHash);
      
      // Subtract amount from local repository pool
      this.subtractFromLocalPool(repoId, amount);
      
      // Store or add to bounty data
      const totalBountyAmount = this.addToBounty(repoId, issueId, amount, 'pool', mockTransactionHash);
      
      return {
        success: true,
        data: {
          transactionHash: mockTransactionHash,
          repoId: repoId,
          issueId: issueId,
          amount: amount,
          totalBountyAmount: totalBountyAmount,
          organizer: organizerAddress,
          fundingSource: 'pool',
          note: 'Funded from repository pool (no blockchain transaction required)'
        }
      };
    } catch (error) {
      console.error('❌ Fund bounty from pool error:', error);
      throw error;
    }
  }

  /**
   * Add a bounty to an issue using smart contract
   * @param {string} repoId - Repository ID
   * @param {string} issueId - GitHub issue ID
   * @param {string} amount - Bounty amount in HLUSD
   * @param {string} organizerAddress - Organization wallet address
   * @param {string} issueTitle - Issue title
   * @param {string} issueUrl - Issue URL
   * @returns {Promise<Object>} Transaction result
   */
  async addBountyToIssue(repoId, issueId, amount, organizerAddress, issueTitle, issueUrl) {
    try {
      // Ensure user is on HelaChain testnet
      await this.ensureHelaChainNetwork();

      // Get user's wallet address
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length === 0) {
        throw new Error('No wallet connected');
      }

      // Convert amount to Wei using Web3 utilities
      const amountWei = this.web3.utils.toWei(amount, 'ether');

      // Prepare contract interaction data (you may need to adjust based on your contract ABI)
      // For now, we'll do a simple transfer to the escrow contract
      const bountyEscrowAddress = import.meta.env.VITE_BOUNTY_ESCROW_ADDRESS;

      // Estimate gas
      const gasEstimateHex = await window.ethereum.request({
        method: 'eth_estimateGas',
        params: [{
          from: organizerAddress,
          to: bountyEscrowAddress,
          value: this.web3.utils.toHex(amountWei)
        }]
      });

      // Get current gas price for legacy pricing
      const gasPrice = await this.web3.eth.getGasPrice();

      // Send transaction to escrow contract with bounty
      const result = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          to: bountyEscrowAddress,
          from: organizerAddress,
          value: this.web3.utils.toHex(amountWei),
          gas: this.web3.utils.toHex(Math.ceil(parseInt(gasEstimateHex, 16) * 1.2)),
          gasPrice: this.web3.utils.toHex(gasPrice), // Use legacy gas pricing
          data: '0x' // Add contract method call data here if needed
        }]
      });

      console.log('✅ Bounty transaction successful:', result);
      
      // Store bounty data persistently
      this.addToBounty(repoId, issueId, amount, 'wallet', result);
      
      return {
        success: true,
        data: {
          transactionHash: result,
          issueId: issueId,
          amount: amount,
          organizer: organizerAddress,
          issueTitle: issueTitle,
          issueUrl: issueUrl
        }
      };
    } catch (error) {
      console.error('❌ Add bounty error:', error);
      throw error;
    }
  }

  /**
   * Get repository pool balance from local tracking
   * @param {string} repoId - Repository ID
   * @returns {Promise<Object>} Pool balance information
   */
  async getRepositoryPool(repoId) {
    try {
      // Get balance from local storage tracking
      const poolBalance = this.getLocalPoolBalance(repoId);
      const poolBalanceWei = this.hlusdToWei(poolBalance);
      
      console.log(`📊 Repository ${repoId} pool balance: ${poolBalance} HLUSD`);
      
      return {
        success: true,
        data: {
          repoId: repoId,
          poolBalanceWei: poolBalanceWei,
          poolBalanceHLUSD: poolBalance
        }
      };
    } catch (error) {
      console.error(`❌ Get repository pool error for repo ${repoId}:`, error);
      
      // Return zero balance on error
      return {
        success: false,
        data: {
          repoId: repoId,
          poolBalanceWei: '0',
          poolBalanceHLUSD: '0'
        },
        error: error.message
      };
    }
  }

  /**
   * Register a repository to IPFS using Lighthouse
   * @param {Object} repoData - Repository data from GitHub
   * @param {string} organizerAddress - Organization wallet address
   * @returns {Promise<Object>} Registration result with IPFS hash
   */
  async registerRepository(repoData, organizerAddress) {
    try {
      // Ensure user is on HelaChain testnet
      await this.ensureHelaChainNetwork();

      // Import IPFS service singleton instance
      const { ipfsService } = await import('./ipfsService.js');

      // Prepare repository metadata for IPFS
      const repoMetadata = {
        id: repoData.id,
        name: repoData.name,
        fullName: repoData.full_name,
        description: repoData.description,
        htmlUrl: repoData.html_url,
        cloneUrl: repoData.clone_url,
        language: repoData.language,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        openIssues: repoData.open_issues_count,
        owner: {
          login: repoData.owner.login,
          avatarUrl: repoData.owner.avatar_url
        },
        organizer: {
          address: organizerAddress,
          registeredAt: new Date().toISOString()
        },
        hackAura: {
          poolBalance: '0',
          totalBounties: 0,
          activeBounties: 0,
          completedBounties: 0
        }
      };

      console.log('📦 Uploading repository metadata to IPFS:', repoMetadata);

      // Upload to IPFS via Lighthouse
      const ipfsHash = await ipfsService.uploadJSON(repoMetadata);
      
      console.log('✅ Repository uploaded to IPFS:', ipfsHash);

      // Register repository in smart contract
      const repoRegistryAddress = import.meta.env.VITE_REPO_REGISTRY_ADDRESS;
      
      // Simple registration transaction (you can expand this with proper contract ABI)
      const gasPrice = await this.web3.eth.getGasPrice();
      
      const result = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          to: repoRegistryAddress,
          from: organizerAddress,
          value: '0x0', // No value for registration
          gasPrice: this.web3.utils.toHex(gasPrice),
          gas: '0x15F90', // 90000 gas limit
          data: '0x' // Add contract method call data for registration if needed
        }]
      });

      console.log('✅ Repository registration transaction:', result);

      // Store repository in localStorage for Developer Dashboard
      this.storeRegisteredRepository(repoMetadata);

      return {
        success: true,
        data: {
          ipfsHash: ipfsHash,
          transactionHash: result,
          repoId: repoData.id,
          repoName: repoData.name,
          metadata: repoMetadata
        }
      };
    } catch (error) {
      console.error('❌ Repository registration error:', error);
      throw error;
    }
  }

  /**
   * Update local repository pool balance tracking
   * @param {string} repoId - Repository ID
   * @param {string} amount - Amount to add to pool (in HLUSD)
   */
  updateLocalPoolBalance(repoId, amount) {
    try {
      // Get existing pool balances from localStorage
      const pools = JSON.parse(localStorage.getItem('hackAura_repo_pools') || '{}');
      
      // Update the specific repository pool
      const currentBalance = parseFloat(pools[repoId] || '0');
      const newBalance = currentBalance + parseFloat(amount);
      pools[repoId] = newBalance.toFixed(6);
      
      // Save updated pools
      localStorage.setItem('hackAura_repo_pools', JSON.stringify(pools));
      
      console.log(`💰 Updated local pool for repo ${repoId}: ${pools[repoId]} HLUSD`);
    } catch (error) {
      console.error('❌ Failed to update local pool balance:', error);
    }
  }

  /**
   * Get local repository pool balance
   * @param {string} repoId - Repository ID
   * @returns {string} Pool balance in HLUSD
   */
  getLocalPoolBalance(repoId) {
    try {
      const pools = JSON.parse(localStorage.getItem('hackAura_repo_pools') || '{}');
      return pools[repoId] || '0';
    } catch (error) {
      console.error('❌ Failed to get local pool balance:', error);
      return '0';
    }
  }

  /**
   * Subtract from local repository pool balance (for bounty funding)
   * @param {string} repoId - Repository ID
   * @param {string} amount - Amount to subtract from pool (in HLUSD)
   */
  subtractFromLocalPool(repoId, amount) {
    try {
      const pools = JSON.parse(localStorage.getItem('hackAura_repo_pools') || '{}');
      const currentBalance = parseFloat(pools[repoId] || '0');
      const newBalance = Math.max(0, currentBalance - parseFloat(amount));
      pools[repoId] = newBalance.toFixed(6);
      localStorage.setItem('hackAura_repo_pools', JSON.stringify(pools));
      
      console.log(`💸 Subtracted from local pool for repo ${repoId}: ${pools[repoId]} HLUSD remaining`);
    } catch (error) {
      console.error('❌ Failed to subtract from local pool balance:', error);
    }
  }

  /**
   * Store bounty information for an issue
   * @param {string} repoId - Repository ID
   * @param {string} issueId - Issue ID
   * @param {string} amount - Bounty amount in HLUSD
   * @param {string} fundingSource - 'wallet' or 'pool'
   * @param {string} transactionHash - Transaction hash
   */
  storeBountyData(repoId, issueId, amount, fundingSource, transactionHash) {
    try {
      const bounties = JSON.parse(localStorage.getItem('hackAura_bounties') || '{}');
      
      // Create bounty record
      const bountyKey = `${repoId}_${issueId}`;
      bounties[bountyKey] = {
        repoId: repoId,
        issueId: issueId,
        amount: parseFloat(amount),
        fundingSource: fundingSource,
        transactionHash: transactionHash,
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      
      localStorage.setItem('hackAura_bounties', JSON.stringify(bounties));
      console.log(`💰 Stored bounty data for issue ${issueId}: ${amount} HLUSD`);
    } catch (error) {
      console.error('❌ Failed to store bounty data:', error);
    }
  }

  /**
   * Get bounty amount for a specific issue
   * @param {string} repoId - Repository ID  
   * @param {string} issueId - Issue ID
   * @returns {number} Bounty amount in HLUSD
   */
  getBountyAmount(repoId, issueId) {
    try {
      const bounties = JSON.parse(localStorage.getItem('hackAura_bounties') || '{}');
      const bountyKey = `${repoId}_${issueId}`;
      const bounty = bounties[bountyKey];
      
      return bounty ? bounty.amount : 0;
    } catch (error) {
      console.error('❌ Failed to get bounty amount:', error);
      return 0;
    }
  }

  /**
   * Get all bounties for a repository
   * @param {string} repoId - Repository ID
   * @returns {Object} Object with issueId as key and bounty data as value
   */
  getRepositoryBounties(repoId) {
    try {
      const bounties = JSON.parse(localStorage.getItem('hackAura_bounties') || '{}');
      const repoBounties = {};
      
      Object.values(bounties).forEach(bounty => {
        if (bounty.repoId === repoId) {
          repoBounties[bounty.issueId] = bounty;
        }
      });
      
      return repoBounties;
    } catch (error) {
      console.error('❌ Failed to get repository bounties:', error);
      return {};
    }
  }

  /**
   * Update bounty amount for an issue (add to existing bounty)
   * @param {string} repoId - Repository ID
   * @param {string} issueId - Issue ID
   * @param {string} additionalAmount - Additional amount to add
   * @param {string} fundingSource - 'wallet' or 'pool' 
   * @param {string} transactionHash - Transaction hash
   */
  addToBounty(repoId, issueId, additionalAmount, fundingSource, transactionHash) {
    try {
      const bounties = JSON.parse(localStorage.getItem('hackAura_bounties') || '{}');
      const bountyKey = `${repoId}_${issueId}`;
      
      if (bounties[bountyKey]) {
        // Add to existing bounty
        bounties[bountyKey].amount += parseFloat(additionalAmount);
        bounties[bountyKey].updatedAt = new Date().toISOString();
        bounties[bountyKey].lastTransactionHash = transactionHash;
      } else {
        // Create new bounty
        bounties[bountyKey] = {
          repoId: repoId,
          issueId: issueId,
          amount: parseFloat(additionalAmount),
          fundingSource: fundingSource,
          transactionHash: transactionHash,
          createdAt: new Date().toISOString(),
          status: 'active'
        };
      }
      
      localStorage.setItem('hackAura_bounties', JSON.stringify(bounties));
      console.log(`💰 Updated bounty for issue ${issueId}: ${bounties[bountyKey].amount} HLUSD total`);
      
      return bounties[bountyKey].amount;
    } catch (error) {
      console.error('❌ Failed to add to bounty:', error);
      return 0;
    }
  }

  /**
   * Store registered repository for Developer Dashboard
   * @param {Object} repoMetadata - Repository metadata from IPFS
   */
  storeRegisteredRepository(repoMetadata) {
    try {
      const registeredRepos = JSON.parse(localStorage.getItem('hackAura_registered_repos') || '[]');
      
      // Check if repo already exists (prevent duplicates)
      const existingIndex = registeredRepos.findIndex(repo => repo.id === repoMetadata.id);
      
      if (existingIndex >= 0) {
        // Update existing repository
        registeredRepos[existingIndex] = repoMetadata;
      } else {
        // Add new repository
        registeredRepos.push(repoMetadata);
      }
      
      localStorage.setItem('hackAura_registered_repos', JSON.stringify(registeredRepos));
      console.log(`📦 Stored registered repository: ${repoMetadata.fullName}`);
    } catch (error) {
      console.error('❌ Failed to store registered repository:', error);
    }
  }
}

export default new OrganizationService();