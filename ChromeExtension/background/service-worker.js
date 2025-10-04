// Git Hunters Chrome Extension Background Service Worker
class GitHuntersBackground {
  constructor() {
    this.apiBase = 'http://localhost:4000';
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Handle extension installation
    chrome.runtime.onInstalled.addListener((details) => {
      this.handleInstallation(details);
    });

    // Handle messages from content scripts and popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async responses
    });

    // Handle tab updates to inject content scripts dynamically
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      this.handleTabUpdate(tabId, changeInfo, tab);
    });

    // Handle storage changes
    chrome.storage.onChanged.addListener((changes, namespace) => {
      this.handleStorageChange(changes, namespace);
    });
  }

  handleInstallation(details) {
    console.log('Git Hunters extension installed:', details);
    
    if (details.reason === 'install') {
      // First installation
      this.showWelcomeNotification();
      this.setDefaultSettings();
    } else if (details.reason === 'update') {
      // Extension updated
      this.handleUpdate(details);
    }
  }

  showWelcomeNotification() {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '../images/icon-48.png',
      title: 'Git Hunters Extension Installed!',
      message: 'Start earning bounties on GitHub. Click to get started.'
    }, (notificationId) => {
      // Handle notification click
      chrome.notifications.onClicked.addListener((clickedId) => {
        if (clickedId === notificationId) {
          chrome.tabs.create({ url: 'http://localhost:3000/' });
        }
      });
    });
  }

  setDefaultSettings() {
    const defaultSettings = {
      notifications_enabled: true,
      auto_check_bounties: true,
      show_bounty_badges: true,
      api_endpoint: 'http://localhost:4000'
    };

    chrome.storage.sync.set(defaultSettings, () => {
      console.log('Default settings applied');
    });
  }

  handleUpdate(details) {
    console.log('Extension updated from', details.previousVersion);
    
    // Handle any migration logic here
    this.migrateSettings(details.previousVersion);
  }

  migrateSettings(previousVersion) {
    // Add migration logic for different versions
    chrome.storage.sync.get(null, (items) => {
      let needsUpdate = false;
      const updates = {};

      // Example migration: add new setting if it doesn't exist
      if (!items.hasOwnProperty('show_bounty_badges')) {
        updates.show_bounty_badges = true;
        needsUpdate = true;
      }

      if (needsUpdate) {
        chrome.storage.sync.set(updates, () => {
          console.log('Settings migrated successfully');
        });
      }
    });
  }

  async handleMessage(message, sender, sendResponse) {
    try {
      switch (message.type) {
        case 'GET_AUTH_STATUS':
          const authStatus = await this.getAuthStatus();
          sendResponse({ success: true, data: authStatus });
          break;

        case 'FETCH_BOUNTIES':
          const bounties = await this.fetchBounties(message.owner, message.repo);
          sendResponse({ success: true, data: bounties });
          break;

        case 'CREATE_BOUNTY':
          const result = await this.createBounty(message.bountyData);
          sendResponse({ success: true, data: result });
          break;

        case 'ADD_REPOSITORY':
          const repoResult = await this.addRepository(message.repoData);
          sendResponse({ success: true, data: repoResult });
          break;

        case 'METAMASK_CONNECTED':
          await this.handleMetaMaskConnection(message.account);
          sendResponse({ success: true });
          break;

        case 'CHECK_API_CONNECTION':
          const apiStatus = await this.checkApiConnection();
          sendResponse({ success: true, data: apiStatus });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  handleTabUpdate(tabId, changeInfo, tab) {
    // Only process complete tab loads on GitHub
    if (changeInfo.status === 'complete' && tab.url?.includes('github.com')) {
      // Check if this is a repository page that needs our integration
      this.checkForBountyIntegration(tab);
    }
  }

  async checkForBountyIntegration(tab) {
    try {
      // Extract repo info from URL
      const url = new URL(tab.url);
      const pathParts = url.pathname.split('/').filter(p => p);
      
      if (pathParts.length >= 2) {
        const owner = pathParts[0];
        const repo = pathParts[1];
        
        // Check if this repo has bounties
        const bounties = await this.fetchBounties(owner, repo);
        
        if (bounties && bounties.length > 0) {
          // Show notification about available bounties
          this.showBountyNotification(owner, repo, bounties.length);
        }
      }
    } catch (error) {
      console.warn('Error checking bounty integration:', error);
    }
  }

  showBountyNotification(owner, repo, bountyCount) {
    chrome.storage.sync.get(['notifications_enabled'], (items) => {
      if (items.notifications_enabled) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: '../images/icon-48.png',
          title: 'Bounties Available!',
          message: `${bountyCount} bounties found in ${owner}/${repo}`
        });
      }
    });
  }

  handleStorageChange(changes, namespace) {
    console.log('Storage changed:', changes, namespace);
    
    // React to auth changes
    if (changes.github_token || changes.metamask_account) {
      this.notifyAuthChange();
    }
  }

  notifyAuthChange() {
    // Notify all content scripts about auth changes
    chrome.tabs.query({ url: "https://github.com/*" }, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          type: 'AUTH_CHANGED'
        }).catch(() => {
          // Tab might not have content script loaded
        });
      });
    });
  }

  async getAuthStatus() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['github_token', 'metamask_account'], (result) => {
        resolve({
          githubConnected: !!result.github_token,
          metamaskConnected: !!result.metamask_account
        });
      });
    });
  }

  async fetchBounties(owner, repo) {
    try {
      const response = await fetch(`${this.apiBase}/api/bounties/${owner}/${repo}`);
      if (response.ok) {
        const data = await response.json();
        return data.bounties || [];
      }
    } catch (error) {
      console.error('Error fetching bounties:', error);
    }
    return [];
  }

  async createBounty(bountyData) {
    try {
      const authData = await this.getStoredAuthData();
      
      const response = await fetch(`${this.apiBase}/api/bounties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.github_token}`
        },
        body: JSON.stringify(bountyData)
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to create bounty');
      }
    } catch (error) {
      console.error('Error creating bounty:', error);
      throw error;
    }
  }

  async addRepository(repoData) {
    try {
      const authData = await this.getStoredAuthData();
      
      const response = await fetch(`${this.apiBase}/api/repos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.github_token}`
        },
        body: JSON.stringify(repoData)
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to add repository');
      }
    } catch (error) {
      console.error('Error adding repository:', error);
      throw error;
    }
  }

  async handleMetaMaskConnection(account) {
    chrome.storage.sync.set({ metamask_account: account }, () => {
      console.log('MetaMask account stored:', account);
      
      // Notify content scripts
      this.notifyAuthChange();
    });
  }

  async checkApiConnection() {
    try {
      const response = await fetch(`${this.apiBase}/health`);
      return {
        connected: response.ok,
        status: response.status
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message
      };
    }
  }

  async getStoredAuthData() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['github_token', 'metamask_account'], (result) => {
        resolve(result);
      });
    });
  }
}

// Initialize background service
new GitHuntersBackground();