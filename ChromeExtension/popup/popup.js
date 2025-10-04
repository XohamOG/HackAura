// Git Hunters Chrome Extension Popup Script
class GitHuntersPopup {
  constructor() {
    this.apiBase = 'http://localhost:4000';
    this.webAppBase = 'http://localhost:3000';
    this.githubToken = null;
    this.metamaskConnected = false;
    this.currentTab = null;
    
    this.init();
  }

  async init() {
    // Get current tab info
    this.currentTab = await this.getCurrentTab();
    
    // Load stored authentication data
    await this.loadAuthData();
    
    // Update UI
    this.updateAuthStatus();
    this.updateRepoSection();
    this.checkApiConnection();
    
    // Setup event listeners
    this.setupEventListeners();
  }

  async getCurrentTab() {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        resolve(tabs[0]);
      });
    });
  }

  async loadAuthData() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['github_token', 'metamask_account'], (result) => {
        this.githubToken = result.github_token || null;
        this.metamaskConnected = !!result.metamask_account;
        resolve();
      });
    });
  }

  updateAuthStatus() {
    // Update GitHub status
    const githubStatus = document.getElementById('github-status');
    const githubBtn = document.getElementById('github-connect-btn');
    const githubStatusText = githubStatus.querySelector('.status-text');
    
    if (this.githubToken) {
      githubStatusText.textContent = 'Connected';
      githubStatusText.classList.add('connected');
      githubBtn.textContent = 'Connected';
      githubBtn.classList.add('connected');
      githubBtn.disabled = true;
    } else {
      githubStatusText.textContent = 'Not Connected';
      githubStatusText.classList.remove('connected');
      githubBtn.textContent = 'Connect';
      githubBtn.classList.remove('connected');
      githubBtn.disabled = false;
    }

    // Update MetaMask status
    const metamaskStatus = document.getElementById('metamask-status');
    const metamaskBtn = document.getElementById('metamask-connect-btn');
    const metamaskStatusText = metamaskStatus.querySelector('.status-text');
    
    if (this.metamaskConnected) {
      metamaskStatusText.textContent = 'Connected';
      metamaskStatusText.classList.add('connected');
      metamaskBtn.textContent = 'Connected';
      metamaskBtn.classList.add('connected');
      metamaskBtn.disabled = true;
    } else {
      metamaskStatusText.textContent = 'Not Connected';
      metamaskStatusText.classList.remove('connected');
      metamaskBtn.textContent = 'Connect';
      metamaskBtn.classList.remove('connected');
      metamaskBtn.disabled = false;
    }
  }

  async updateRepoSection() {
    const repoSection = document.getElementById('repo-section');
    const repoInfo = document.getElementById('repo-info');
    
    if (this.isGitHubPage()) {
      const repoData = this.extractRepoInfo();
      if (repoData) {
        repoSection.style.display = 'block';
        
        // Update repo info
        const repoName = repoInfo.querySelector('.repo-name');
        const repoStats = repoInfo.querySelector('.repo-stats');
        const repoActions = repoInfo.querySelector('.repo-actions');
        
        repoName.textContent = `${repoData.owner}/${repoData.repo}`;
        
        // Fetch repo stats from API
        try {
          const stats = await this.fetchRepoStats(repoData.owner, repoData.repo);
          repoStats.innerHTML = `
            <span>Bounties: ${stats.bounties || 0}</span>
            <span>Rewards: $${stats.totalRewards || 0}</span>
            <span>Contributors: ${stats.contributors || 0}</span>
          `;
          
          // Update actions
          if (stats.isActive) {
            repoActions.innerHTML = `
              <button class="connect-btn" onclick="window.open('${this.webAppBase}/dashboard', '_blank')">
                View Dashboard
              </button>
            `;
          } else {
            repoActions.innerHTML = `
              <button class="connect-btn" id="add-repo-btn">
                Add to Git Hunters
              </button>
            `;
            
            document.getElementById('add-repo-btn')?.addEventListener('click', () => {
              this.openAddRepoModal(repoData);
            });
          }
        } catch (error) {
          repoStats.innerHTML = '<span>Unable to load stats</span>';
        }
      }
    } else {
      repoSection.style.display = 'none';
    }
  }

  isGitHubPage() {
    return this.currentTab?.url?.includes('github.com');
  }

  extractRepoInfo() {
    if (!this.currentTab?.url) return null;
    
    const url = new URL(this.currentTab.url);
    const pathParts = url.pathname.split('/').filter(p => p);
    
    if (pathParts.length >= 2) {
      return {
        owner: pathParts[0],
        repo: pathParts[1]
      };
    }
    
    return null;
  }

  async fetchRepoStats(owner, repo) {
    const response = await fetch(`${this.apiBase}/api/repos/${owner}/${repo}`);
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to fetch repo stats');
  }

  async checkApiConnection() {
    const apiStatus = document.getElementById('api-status');
    
    try {
      const response = await fetch(`${this.apiBase}/health`);
      if (response.ok) {
        apiStatus.textContent = 'Connected';
        apiStatus.classList.add('connected');
        apiStatus.classList.remove('error');
      } else {
        throw new Error('API not responding');
      }
    } catch (error) {
      apiStatus.textContent = 'Disconnected';
      apiStatus.classList.add('error');
      apiStatus.classList.remove('connected');
    }
  }

  setupEventListeners() {
    // GitHub Connect Button
    document.getElementById('github-connect-btn')?.addEventListener('click', () => {
      this.connectGitHub();
    });

    // MetaMask Connect Button
    document.getElementById('metamask-connect-btn')?.addEventListener('click', () => {
      this.connectMetaMask();
    });

    // Refresh Button
    document.getElementById('refresh-btn')?.addEventListener('click', () => {
      this.refresh();
    });

    // Settings Button
    document.getElementById('settings-btn')?.addEventListener('click', () => {
      this.openSettings();
    });

    // Support Link
    document.getElementById('support-link')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.openSupport();
    });
  }

  async connectGitHub() {
    try {
      // Open GitHub OAuth flow in a new tab
      const authUrl = `https://github.com/login/oauth/authorize?client_id=YOUR_CLIENT_ID&scope=repo,user&redirect_uri=http://localhost:3000/auth/github/callback`;
      
      // For now, use GitHub Personal Access Token method
      const useToken = confirm('Would you like to use a Personal Access Token? (Click OK for Token, Cancel to go to GitHub OAuth)');
      
      if (useToken) {
        const token = prompt('Enter your GitHub Personal Access Token:\n\n1. Go to https://github.com/settings/tokens\n2. Create new token with "repo" and "user" scopes\n3. Copy and paste the token here');
        
        if (token && token.trim()) {
          // Validate token by making a test API call
          const response = await fetch('https://api.github.com/user', {
            headers: {
              'Authorization': `token ${token.trim()}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          });
          
          if (response.ok) {
            const user = await response.json();
            chrome.storage.sync.set({ 
              github_token: token.trim(),
              github_user: user.login 
            }, () => {
              this.githubToken = token.trim();
              this.updateAuthStatus();
              this.showMessage(`GitHub connected as ${user.login}!`, 'success');
            });
          } else {
            this.showMessage('Invalid GitHub token. Please check and try again.', 'error');
          }
        }
      } else {
        // Open GitHub OAuth in web app
        window.open(`${this.webAppBase}/auth`, '_blank');
        this.showMessage('Complete GitHub authorization in the opened tab', 'info');
      }
    } catch (error) {
      console.error('GitHub connection error:', error);
      this.showMessage('Failed to connect GitHub. Please try again.', 'error');
    }
  }

  async connectMetaMask() {
    try {
      // Check if we can access ethereum directly in popup context
      if (typeof window.ethereum !== 'undefined') {
        // Direct MetaMask connection in popup
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        if (accounts.length > 0) {
          const account = accounts[0];
          
          // Verify we're on Polygon network
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          if (chainId !== '0x89') { // Polygon mainnet chain ID
            try {
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x89' }],
              });
            } catch (switchError) {
              // Network not added, add it
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0x89',
                  chainName: 'Polygon Mainnet',
                  nativeCurrency: {
                    name: 'MATIC',
                    symbol: 'MATIC',
                    decimals: 18
                  },
                  rpcUrls: ['https://polygon-rpc.com'],
                  blockExplorerUrls: ['https://polygonscan.com']
                }]
              });
            }
          }
          
          chrome.storage.sync.set({ 
            metamask_account: account 
          }, () => {
            this.metamaskConnected = true;
            this.updateAuthStatus();
            this.showMessage(`MetaMask connected: ${account.substring(0, 6)}...${account.substring(38)}`, 'success');
          });
        }
      } else {
        // Fallback: inject script into current tab
        try {
          await chrome.scripting.executeScript({
            target: { tabId: this.currentTab.id },
            func: this.injectMetaMaskConnection
          });
          
          this.showMessage('Connecting MetaMask...', 'info');
        } catch (scriptError) {
          // Final fallback: open web app for MetaMask connection
          window.open(`${this.webAppBase}/auth`, '_blank');
          this.showMessage('Complete MetaMask connection in the opened tab', 'info');
        }
      }
    } catch (error) {
      console.error('MetaMask connection error:', error);
      
      if (error.code === 4001) {
        this.showMessage('MetaMask connection rejected by user', 'error');
      } else if (error.code === -32002) {
        this.showMessage('MetaMask connection already pending', 'warning');
      } else {
        this.showMessage('MetaMask not found. Please install MetaMask extension.', 'error');
        // Open MetaMask installation page
        setTimeout(() => {
          window.open('https://metamask.io/download/', '_blank');
        }, 2000);
      }
    }
  }

  // Function to inject into web page for MetaMask connection
  injectMetaMaskConnection() {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_requestAccounts' })
        .then(accounts => {
          if (accounts.length > 0) {
            // Send message to extension
            window.postMessage({
              type: 'METAMASK_CONNECTED',
              account: accounts[0],
              source: 'git-hunters-extension'
            }, '*');
          }
        })
        .catch(error => {
          console.error('MetaMask connection error:', error);
          window.postMessage({
            type: 'METAMASK_ERROR',
            error: error.message,
            source: 'git-hunters-extension'
          }, '*');
        });
    } else {
      alert('MetaMask not found. Please install MetaMask extension.');
    }
  }

  refresh() {
    this.loadAuthData().then(() => {
      this.updateAuthStatus();
      this.updateRepoSection();
      this.checkApiConnection();
      this.showMessage('Extension refreshed!', 'success');
    });
  }

  openSettings() {
    window.open(`${this.webAppBase}/settings`, '_blank');
  }

  openSupport() {
    window.open('https://github.com/XohamOG/HackAura/issues', '_blank');
  }

  openAddRepoModal(repoData) {
    // This would open the web app to add the repository
    window.open(`${this.webAppBase}/add-repo?owner=${repoData.owner}&repo=${repoData.repo}`, '_blank');
  }

  // Send transaction via MetaMask
  async sendTransaction(transactionData, type, metadata = {}) {
    try {
      if (!this.metamaskConnected) {
        throw new Error('MetaMask not connected');
      }

      // Send transaction via MetaMask
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionData]
      });

      this.showMessage(`Transaction sent! Hash: ${txHash.substring(0, 10)}...`, 'success');

      // Confirm transaction with backend
      const confirmResponse = await fetch(`${this.apiBase}/api/contracts/confirm-transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          txHash: txHash,
          type: type,
          metadata: metadata
        })
      });

      if (confirmResponse.ok) {
        const result = await confirmResponse.json();
        this.showMessage(`${type} confirmed on blockchain!`, 'success');
        return { success: true, data: result.data };
      } else {
        this.showMessage('Transaction sent but confirmation failed', 'warning');
        return { success: true, txHash: txHash };
      }

    } catch (error) {
      console.error('Transaction error:', error);
      
      if (error.code === 4001) {
        this.showMessage('Transaction rejected by user', 'warning');
      } else {
        this.showMessage(`Transaction failed: ${error.message}`, 'error');
      }
      
      return { success: false, error: error.message };
    }
  }

  // Create bounty via MetaMask
  async createBountyWithMetaMask(repoData, bountyAmount) {
    try {
      const account = (await chrome.storage.sync.get(['metamask_account'])).metamask_account;
      
      if (!account) {
        throw new Error('MetaMask not connected');
      }

      // Get transaction data from backend
      const response = await fetch(`${this.apiBase}/api/contracts/create-complete-bounty`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cid: repoData.cid,
          isPublic: true,
          issueIds: repoData.issueIds,
          issueId: repoData.currentIssue,
          bountyAmount: bountyAmount,
          userAddress: account
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.data.transactionData) {
          // Send via MetaMask
          return await this.sendTransaction(
            result.data.transactionData, 
            'create-bounty',
            { repoData, bountyAmount }
          );
        } else {
          return result;
        }
      } else {
        throw new Error('Failed to prepare transaction');
      }

    } catch (error) {
      console.error('Create bounty error:', error);
      return { success: false, error: error.message };
    }
  }

  showMessage(text, type) {
    // Create message element
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    
    // Insert at top of content area
    const content = document.querySelector('.content');
    content.insertBefore(message, content.firstChild);
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (message.parentNode) {
        message.parentNode.removeChild(message);
      }
    }, 3000);
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new GitHuntersPopup();
});

// Listen for messages from content scripts and web pages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'METAMASK_CONNECTED') {
    chrome.storage.sync.set({ metamask_account: message.account }, () => {
      // Reload popup to update status
      window.location.reload();
    });
  } else if (message.type === 'GITHUB_CONNECTED') {
    chrome.storage.sync.set({ 
      github_token: message.token,
      github_user: message.user 
    }, () => {
      // Reload popup to update status
      window.location.reload();
    });
  }
});

// Listen for messages from injected scripts
window.addEventListener('message', (event) => {
  if (event.data.source === 'git-hunters-extension') {
    if (event.data.type === 'METAMASK_CONNECTED') {
      chrome.storage.sync.set({ metamask_account: event.data.account }, () => {
        window.location.reload();
      });
    }
  }
});