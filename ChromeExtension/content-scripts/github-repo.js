// GitHub Repository Integration - Content Script
class GitHuntersRepoIntegration {
  constructor() {
    this.apiBase = 'http://localhost:4000';
    this.githubToken = null;
    this.currentRepo = null;
    this.currentUser = null;
    
    this.init();
  }

  async init() {
    console.log('🎯 Git Hunters repo integration loaded');
    
    // Get GitHub token from storage
    this.githubToken = await this.getStoredGitHubToken();
    
    // Extract repo info from URL
    this.extractRepoInfo();
    
    // Only run on main repo pages (not issues, pulls, etc.)
    if (this.isMainRepoPage()) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.setupRepoIntegration());
      } else {
        this.setupRepoIntegration();
      }
    }
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

  isMainRepoPage() {
    const path = window.location.pathname;
    const parts = path.split('/').filter(p => p);
    
    // Check if it's just owner/repo or owner/repo/tree/branch
    return parts.length === 2 || (parts.length >= 3 && parts[2] === 'tree');
  }

  async setupRepoIntegration() {
    const isRepoOwner = await this.checkIfRepoOwner();
    const repoStatus = await this.checkRepoStatus();
    
    this.addGitHuntersSection(isRepoOwner, repoStatus);
  }

  async checkIfRepoOwner() {
    try {
      if (!this.githubToken) return false;
      
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

  async checkRepoStatus() {
    try {
      const response = await fetch(`${this.apiBase}/api/repos/${this.currentUser}/${this.currentRepo}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Failed to check repo status:', error);
    }
    return null;
  }

  addGitHuntersSection(isOwner, repoStatus) {
    // Find the repository header area
    const repoHeader = document.querySelector('.repository-content') || 
                       document.querySelector('#repository-container-header') ||
                       document.querySelector('.js-repo-nav');
    
    if (!repoHeader) {
      setTimeout(() => this.addGitHuntersSection(isOwner, repoStatus), 1000);
      return;
    }

    // Check if section already exists
    if (document.querySelector('.git-hunters-repo-section')) {
      return;
    }

    const section = document.createElement('div');
    section.className = 'git-hunters-repo-section';
    
    if (repoStatus && repoStatus.isActive) {
      // Repo is already on Git Hunters
      section.innerHTML = `
        <div class="git-hunters-status-card active">
          <div class="git-hunters-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"/>
            </svg>
            <span class="git-hunters-title">Git Hunters Integration</span>
            <span class="git-hunters-badge active">Active</span>
          </div>
          <div class="git-hunters-stats">
            <div class="stat">
              <span class="stat-number">${repoStatus.totalBounties || 0}</span>
              <span class="stat-label">Active Bounties</span>
            </div>
            <div class="stat">
              <span class="stat-number">$${repoStatus.totalAmount || 0}</span>
              <span class="stat-label">Total Rewards</span>
            </div>
            <div class="stat">
              <span class="stat-number">${repoStatus.contributors || 0}</span>
              <span class="stat-label">Contributors</span>
            </div>
          </div>
          <div class="git-hunters-actions">
            <a href="http://localhost:3000/dashboard" target="_blank" class="btn btn-sm">
              View Dashboard
            </a>
            ${isOwner ? '<button class="btn btn-sm btn-primary git-hunters-manage">Manage</button>' : ''}
          </div>
        </div>
      `;
    } else if (isOwner) {
      // Repo owner can add their repo
      section.innerHTML = `
        <div class="git-hunters-status-card inactive">
          <div class="git-hunters-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"/>
            </svg>
            <span class="git-hunters-title">Git Hunters</span>
            <span class="git-hunters-badge inactive">Not Active</span>
          </div>
          <div class="git-hunters-description">
            <p>Add your repository to Git Hunters to start earning bounties for contributions!</p>
            <ul>
              <li>Set bounties on issues</li>
              <li>Attract more contributors</li>
              <li>Accelerate development</li>
            </ul>
          </div>
          <div class="git-hunters-actions">
            <button class="btn btn-primary git-hunters-add-repo">
              Add to Git Hunters
            </button>
            <a href="http://localhost:3000/" target="_blank" class="btn btn-sm">
              Learn More
            </a>
          </div>
        </div>
      `;
      
      // Add event listener for adding repo
      section.querySelector('.git-hunters-add-repo').addEventListener('click', () => {
        this.showAddRepoModal();
      });
    } else {
      // For non-owners, show info about Git Hunters
      section.innerHTML = `
        <div class="git-hunters-status-card info">
          <div class="git-hunters-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"/>
            </svg>
            <span class="git-hunters-title">Git Hunters</span>
          </div>
          <div class="git-hunters-description">
            <p>This repository could benefit from Git Hunters bounty system!</p>
            <div class="git-hunters-actions">
              <a href="http://localhost:3000/" target="_blank" class="btn btn-sm btn-primary">
                Visit Git Hunters
              </a>
            </div>
          </div>
        </div>
      `;
    }
    
    // Insert the section at the top of the repository content
    const insertTarget = document.querySelector('.repository-content .Box') || 
                          document.querySelector('.repository-content') ||
                          repoHeader;
    
    if (insertTarget) {
      insertTarget.insertBefore(section, insertTarget.firstChild);
    }
  }

  showAddRepoModal() {
    const modal = document.createElement('div');
    modal.className = 'git-hunters-modal-overlay';
    modal.innerHTML = `
      <div class="git-hunters-modal">
        <div class="git-hunters-modal-header">
          <h3>Add Repository to Git Hunters</h3>
          <button class="git-hunters-modal-close">&times;</button>
        </div>
        <div class="git-hunters-modal-body">
          <div class="repo-info">
            <h4>${this.currentUser}/${this.currentRepo}</h4>
            <p>Add this repository to Git Hunters to start managing bounties and attracting contributors.</p>
          </div>
          <form class="git-hunters-repo-form">
            <div class="form-group">
              <label>Repository Description</label>
              <textarea name="description" rows="3" placeholder="Describe your project and what kind of contributions you're looking for..."></textarea>
            </div>
            <div class="form-group">
              <label>Category</label>
              <select name="category" required>
                <option value="">Select a category</option>
                <option value="web">Web Development</option>
                <option value="mobile">Mobile Development</option>
                <option value="blockchain">Blockchain</option>
                <option value="ai">AI/Machine Learning</option>
                <option value="devtools">Developer Tools</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" name="auto_bounties" checked>
                Enable automatic bounty suggestions for issues
              </label>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">Add Repository</button>
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
    
    modal.querySelector('.git-hunters-repo-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      await this.addRepository(formData);
      document.body.removeChild(modal);
      location.reload(); // Refresh to show new status
    });
  }

  async addRepository(formData) {
    try {
      const repoData = {
        owner: this.currentUser,
        name: this.currentRepo,
        description: formData.get('description'),
        category: formData.get('category'),
        autoBounties: formData.get('auto_bounties') === 'on'
      };
      
      const response = await fetch(`${this.apiBase}/api/repos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.githubToken}`
        },
        body: JSON.stringify(repoData)
      });
      
      if (response.ok) {
        console.log('Repository added successfully');
        // Show success message
        this.showSuccessMessage('Repository added to Git Hunters successfully!');
      } else {
        console.error('Failed to add repository');
        this.showErrorMessage('Failed to add repository. Please try again.');
      }
    } catch (error) {
      console.error('Error adding repository:', error);
      this.showErrorMessage('An error occurred. Please try again.');
    }
  }

  showSuccessMessage(message) {
    const notification = document.createElement('div');
    notification.className = 'git-hunters-notification success';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }

  showErrorMessage(message) {
    const notification = document.createElement('div');
    notification.className = 'git-hunters-notification error';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }
}

// Initialize the repository integration
new GitHuntersRepoIntegration();