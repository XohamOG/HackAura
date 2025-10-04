// GitHub Issues Integration - Content Script
class GitHuntersIssuesIntegration {
  constructor() {
    this.apiBase = 'http://localhost:4000'; // Your backend API
    this.githubToken = null;
    this.currentRepo = null;
    this.currentUser = null;
    this.bounties = new Map();
    
    this.init();
  }

  async init() {
    console.log('🎯 Git Hunters extension loaded on GitHub Issues');
    
    // Get GitHub token from storage
    this.githubToken = await this.getStoredGitHubToken();
    
    // Extract repo info from URL
    this.extractRepoInfo();
    
    // Setup message listeners for popup communication
    this.setupMessageListeners();
    
    // Wait for page to load completely
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupIntegration());
    } else {
      this.setupIntegration();
    }
    
    // Handle GitHub's AJAX navigation
    this.observePageChanges();
  }

  setupMessageListeners() {
    // Listen for messages from popup or background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'AUTH_CHANGED') {
        this.handleAuthChange();
      }
    });

    // Listen for MetaMask connection from injected scripts
    window.addEventListener('message', (event) => {
      if (event.data.source === 'git-hunters-extension' && event.data.type === 'METAMASK_CONNECTED') {
        chrome.runtime.sendMessage({
          type: 'METAMASK_CONNECTED',
          account: event.data.account
        });
      }
    });
  }

  async handleAuthChange() {
    // Reload token and update UI
    this.githubToken = await this.getStoredGitHubToken();
    this.setupIntegration();
  }

  extractRepoInfo() {
    const path = window.location.pathname;
    const parts = path.split('/').filter(p => p);
    
    if (parts.length >= 2) {
      this.currentUser = parts[0];
      this.currentRepo = parts[1];
    }
  }

  async getStoredGitHubToken() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['github_token'], (result) => {
        resolve(result.github_token || null);
      });
    });
  }

  async setupIntegration() {
    // Add bounty indicators to issue list
    this.addBountyIndicators();
    
    // Add bounty details to individual issue pages
    if (this.isIndividualIssuePage()) {
      await this.addIssuePageBountySection();
    }
    
    // Add "Add Bounty" button for repo owners
    this.addBountyManagementButtons();
  }

  async addBountyIndicators() {
    const issueItems = document.querySelectorAll('.js-issue-row, [data-hovercard-type="issue"]');
    
    if (issueItems.length === 0) {
      // Retry after a short delay if issues haven't loaded yet
      setTimeout(() => this.addBountyIndicators(), 1000);
      return;
    }

    // Fetch bounties for this repo
    const bounties = await this.fetchRepoBounties();
    
    issueItems.forEach(issueItem => {
      const issueNumber = this.extractIssueNumber(issueItem);
      if (issueNumber && bounties.has(issueNumber)) {
        this.addBountyBadge(issueItem, bounties.get(issueNumber));
      }
    });
  }

  async fetchRepoBounties() {
    try {
      const response = await fetch(`${this.apiBase}/api/bounties/${this.currentUser}/${this.currentRepo}`);
      const data = await response.json();
      
      const bountyMap = new Map();
      data.bounties?.forEach(bounty => {
        bountyMap.set(bounty.issueNumber, bounty);
      });
      
      return bountyMap;
    } catch (error) {
      console.warn('Failed to fetch bounties:', error);
      return new Map();
    }
  }

  extractIssueNumber(issueElement) {
    const link = issueElement.querySelector('a[href*="/issues/"]');
    if (link) {
      const match = link.href.match(/\/issues\/(\d+)/);
      return match ? parseInt(match[1]) : null;
    }
    return null;
  }

  addBountyBadge(issueItem, bounty) {
    // Check if badge already exists
    if (issueItem.querySelector('.git-hunters-bounty-badge')) {
      return;
    }

    const badge = document.createElement('span');
    badge.className = 'git-hunters-bounty-badge';
    badge.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"/>
      </svg>
      $${bounty.amount}
    `;
    
    // Find the best place to insert the badge
    const titleElement = issueItem.querySelector('.js-navigation-open');
    if (titleElement) {
      titleElement.appendChild(badge);
    }
  }

  isIndividualIssuePage() {
    return window.location.pathname.match(/\/issues\/\d+$/);
  }

  async addIssuePageBountySection() {
    const issueNumber = this.extractIssueNumberFromURL();
    if (!issueNumber) return;

    const bounty = await this.fetchIssueBounty(issueNumber);
    const isRepoOwner = await this.checkIfRepoOwner();
    
    // Find the issue sidebar
    const sidebar = document.querySelector('.js-issue-sidebar');
    if (!sidebar) return;

    const bountySection = this.createBountySection(bounty, isRepoOwner, issueNumber);
    sidebar.appendChild(bountySection);
  }

  extractIssueNumberFromURL() {
    const match = window.location.pathname.match(/\/issues\/(\d+)/);
    return match ? parseInt(match[1]) : null;
  }

  async fetchIssueBounty(issueNumber) {
    try {
      const response = await fetch(`${this.apiBase}/api/bounties/${this.currentUser}/${this.currentRepo}/${issueNumber}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Failed to fetch issue bounty:', error);
    }
    return null;
  }

  async checkIfRepoOwner() {
    // This would need to be implemented based on your authentication system
    // For now, we'll check if the current GitHub user matches the repo owner
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${this.githubToken}`
        }
      });
      
      if (response.ok) {
        const user = await response.json();
        return user.login === this.currentUser;
      }
    } catch (error) {
      console.warn('Failed to check repo ownership:', error);
    }
    return false;
  }

  createBountySection(bounty, isOwner, issueNumber) {
    const section = document.createElement('div');
    section.className = 'git-hunters-bounty-section';
    
    if (bounty) {
      // Existing bounty display
      section.innerHTML = `
        <div class="discussion-sidebar-item">
          <div class="discussion-sidebar-heading text-bold">
            <svg class="octicon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"/>
            </svg>
            Git Hunters Bounty
          </div>
          <div class="git-hunters-bounty-details">
            <div class="bounty-amount">$${bounty.amount}</div>
            <div class="bounty-status status-${bounty.status}">${bounty.status}</div>
            <div class="bounty-description">${bounty.description || 'No description'}</div>
            ${isOwner ? '<button class="btn btn-sm git-hunters-manage-bounty">Manage Bounty</button>' : ''}
            <div class="bounty-actions">
              <a href="http://localhost:3000/dashboard" target="_blank" class="btn btn-sm btn-primary">
                View on Git Hunters
              </a>
            </div>
          </div>
        </div>
      `;
    } else if (isOwner) {
      // Add bounty option for repo owners
      section.innerHTML = `
        <div class="discussion-sidebar-item">
          <div class="discussion-sidebar-heading text-bold">
            <svg class="octicon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"/>
            </svg>
            Git Hunters
          </div>
          <div class="git-hunters-bounty-controls">
            <button class="btn btn-sm btn-primary git-hunters-add-bounty" data-issue="${issueNumber}">
              Add Bounty
            </button>
            <p class="note">Add a bounty to incentivize contributions</p>
          </div>
        </div>
      `;
      
      // Add event listener for the add bounty button
      section.querySelector('.git-hunters-add-bounty').addEventListener('click', () => {
        this.showAddBountyModal(issueNumber);
      });
    }
    
    return section;
  }

  showAddBountyModal(issueNumber) {
    // Create and show modal for adding bounty
    const modal = document.createElement('div');
    modal.className = 'git-hunters-modal-overlay';
    modal.innerHTML = `
      <div class="git-hunters-modal">
        <div class="git-hunters-modal-header">
          <h3>Add Bounty to Issue #${issueNumber}</h3>
          <button class="git-hunters-modal-close">&times;</button>
        </div>
        <div class="git-hunters-modal-body">
          <form class="git-hunters-bounty-form">
            <div class="form-group">
              <label>Bounty Amount ($USD)</label>
              <input type="number" name="amount" min="1" required>
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea name="description" rows="3" placeholder="Describe what needs to be done..."></textarea>
            </div>
            <div class="form-group">
              <label>Deadline (Optional)</label>
              <input type="date" name="deadline">
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">Create Bounty</button>
              <button type="button" class="btn git-hunters-modal-cancel">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.git-hunters-modal-close').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    modal.querySelector('.git-hunters-modal-cancel').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    modal.querySelector('.git-hunters-bounty-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      await this.createBounty(issueNumber, formData);
      document.body.removeChild(modal);
      location.reload(); // Refresh to show new bounty
    });
  }

  async createBounty(issueNumber, formData) {
    try {
      const bountyData = {
        repoOwner: this.currentUser,
        repoName: this.currentRepo,
        issueNumber: issueNumber,
        amount: parseFloat(formData.get('amount')),
        description: formData.get('description'),
        deadline: formData.get('deadline') || null
      };
      
      const response = await fetch(`${this.apiBase}/api/bounties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.githubToken}`
        },
        body: JSON.stringify(bountyData)
      });
      
      if (response.ok) {
        console.log('Bounty created successfully');
      } else {
        console.error('Failed to create bounty');
      }
    } catch (error) {
      console.error('Error creating bounty:', error);
    }
  }

  observePageChanges() {
    // GitHub uses AJAX navigation, so we need to observe URL changes
    let currentURL = window.location.href;
    
    const observer = new MutationObserver(() => {
      if (window.location.href !== currentURL) {
        currentURL = window.location.href;
        this.extractRepoInfo();
        
        // Re-setup integration after navigation
        setTimeout(() => this.setupIntegration(), 1000);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// Initialize the extension
new GitHuntersIssuesIntegration();