// GitHub OAuth Service with HelaChain Integration
import { ipfsService } from './ipfsService.js';

class GitHubOAuthService {
  constructor() {
    this.clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    this.redirectUri = import.meta.env.VITE_GITHUB_REDIRECT_URI;
    this.scope = 'user:email,public_repo';
    this.baseURL = 'https://github.com/login/oauth';
    this.apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
    
    // HelaChain network configuration
    this.helaChainConfig = {
      chainId: '0x21dc', // 8668 in hex
      chainName: 'HelaChain Mainnet',
      nativeCurrency: {
        name: 'HELA',
        symbol: 'HELA',
        decimals: 18
      },
      rpcUrls: ['https://mainnet-rpc.helachain.com'],
      blockExplorerUrls: ['https://helascan.com']
    };
  }

  // Check if MetaMask is available
  isMetaMaskAvailable() {
    return typeof window.ethereum !== 'undefined';
  }

  // Connect to MetaMask and ensure HelaChain network
  async connectMetaMask() {
    if (!this.isMetaMaskAvailable()) {
      throw new Error('MetaMask not installed');
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      // Check current network
      const chainId = await window.ethereum.request({
        method: 'eth_chainId'
      });

      // Switch to HelaChain if not already connected
      if (chainId !== this.helaChainConfig.chainId) {
        await this.switchToHelaChain();
      }

      return accounts[0];
    } catch (error) {
      console.error('MetaMask connection failed:', error);
      throw error;
    }
  }

  // Switch to HelaChain network
  async switchToHelaChain() {
    try {
      // Try to switch to HelaChain
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: this.helaChainConfig.chainId }]
      });
    } catch (switchError) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [this.helaChainConfig]
        });
      } else {
        throw switchError;
      }
    }
  }

  // Generate OAuth URL
  getAuthURL() {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scope,
      state: this.generateState()
    });

    return `${this.baseURL}/authorize?${params.toString()}`;
  }

  // Generate a random state for security
  generateState() {
    const state = Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15);
    localStorage.setItem('github_oauth_state', state);
    return state;
  }

  // Verify state parameter
  verifyState(receivedState) {
    const storedState = localStorage.getItem('github_oauth_state');
    localStorage.removeItem('github_oauth_state');
    return storedState === receivedState;
  }

  // Start OAuth flow
  initiateAuth() {
    const authURL = this.getAuthURL();
    window.location.href = authURL;
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(code) {
    try {
      const response = await fetch(`${this.apiBase}/auth/github/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw error;
    }
  }

  // Register repository with HelaChain smart contract
  async registerRepository(repoData, ipfsCredentials = null) {
    try {
      // Ensure MetaMask is connected
      const walletAddress = await this.connectMetaMask();

      // Upload metadata to IPFS
      const metadata = ipfsService.formatRepositoryMetadata(repoData);
      const ipfsHash = await ipfsService.uploadJSON(metadata, ipfsCredentials);

      // Get transaction data from backend
      const response = await fetch(`${this.apiBase}/contracts/register-repository`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          repoName: repoData.name,
          ipfsHash: ipfsHash,
          isPublic: repoData.isPublic !== false,
          from: walletAddress
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to prepare transaction');
      }

      const { transactionData } = await response.json();

      // Send transaction via MetaMask
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionData]
      });

      return {
        success: true,
        txHash,
        ipfsHash,
        repositoryId: `${repoData.owner}/${repoData.name}`
      };

    } catch (error) {
      console.error('Repository registration failed:', error);
      throw error;
    }
  }

  // Create bounty with HelaChain smart contract
  async createBounty(bountyData, ipfsCredentials = null) {
    try {
      // Ensure MetaMask is connected
      const walletAddress = await this.connectMetaMask();

      // Upload bounty metadata to IPFS
      const metadata = ipfsService.formatBountyMetadata(bountyData);
      const ipfsHash = await ipfsService.uploadJSON(metadata, ipfsCredentials);

      // Get transaction data from backend
      const response = await fetch(`${this.apiBase}/contracts/create-bounty`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          repositoryId: bountyData.repositoryId,
          amount: bountyData.amount,
          ipfsHash: ipfsHash,
          deadline: bountyData.deadline,
          from: walletAddress
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to prepare bounty transaction');
      }

      const { transactionData } = await response.json();

      // Send transaction via MetaMask
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionData]
      });

      return {
        success: true,
        txHash,
        ipfsHash,
        bountyId: `${bountyData.repositoryId}-${Date.now()}`
      };

    } catch (error) {
      console.error('Bounty creation failed:', error);
      throw error;
    }
  }

  // Get user information from GitHub API
  async getUserInfo(accessToken) {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }

      const userData = await response.json();
      return userData;
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  }

  // Store authentication data
  storeAuthData(authData) {
    localStorage.setItem('github_auth', JSON.stringify(authData));
  }

  // Get stored authentication data
  getStoredAuthData() {
    const stored = localStorage.getItem('github_auth');
    return stored ? JSON.parse(stored) : null;
  }

  // Clear authentication data
  clearAuthData() {
    localStorage.removeItem('github_auth');
    localStorage.removeItem('github_oauth_state');
  }

  // Check if user is authenticated
  isAuthenticated() {
    const authData = this.getStoredAuthData();
    return authData && authData.accessToken && authData.user;
  }
}

export default new GitHubOAuthService();