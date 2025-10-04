// GitHub OAuth Service
class GitHubOAuthService {
  constructor() {
    this.clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    this.redirectUri = import.meta.env.VITE_GITHUB_REDIRECT_URI;
    this.scope = 'user:email,public_repo';
    this.baseURL = 'https://github.com/login/oauth';
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
      // In a real application, this should be done on your backend
      // For demo purposes, we'll simulate the token exchange
      const response = await fetch('/api/auth/github/callback', {
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