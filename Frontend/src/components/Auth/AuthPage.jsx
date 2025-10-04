import React, { useState, useEffect } from 'react';
import './AuthPage.css';
import githubOAuth from '../../services/githubOAuth';

const AuthPage = () => {
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isGitHubConnecting, setIsGitHubConnecting] = useState(false);
  const [isGitHubConnected, setIsGitHubConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [githubUser, setGithubUser] = useState(null);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window.ethereum !== 'undefined';
  };

  // Connect to MetaMask
  const connectMetaMask = async () => {
    if (!isMetaMaskInstalled()) {
      alert('Please install MetaMask to continue');
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsMetaMaskConnected(true);
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      alert('Failed to connect to MetaMask');
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect GitHub
  const disconnectGitHub = () => {
    githubOAuth.clearAuthData();
    setGithubUser(null);
    setIsGitHubConnected(false);
  };

  // Disconnect MetaMask (request user to disconnect manually)
  const disconnectMetaMask = () => {
    // MetaMask doesn't have a programmatic way to disconnect
    // We can only clear our local state
    setWalletAddress('');
    setIsMetaMaskConnected(false);
    alert('Please disconnect MetaMask manually from the extension');
  };

  // Connect to GitHub using OAuth
  const connectGitHub = () => {
    if (!isMetaMaskConnected) {
      alert('Please connect MetaMask first');
      return;
    }

    setIsGitHubConnecting(true);
    
    try {
      // Check if we have environment variables configured
      if (!import.meta.env.VITE_GITHUB_CLIENT_ID) {
        // Simulate OAuth for demo purposes
        setTimeout(() => {
          const mockGithubUser = {
            id: Math.floor(Math.random() * 10000),
            login: 'demo_user',
            name: 'Demo User',
            email: 'demo@example.com',
            avatar_url: 'https://github.com/github.png',
            html_url: 'https://github.com/demo_user'
          };
          
          setGithubUser(mockGithubUser);
          setIsGitHubConnected(true);
          setIsGitHubConnecting(false);
          
          // Store mock auth data
          const mockAuthData = {
            accessToken: 'mock_access_token_' + Date.now(),
            user: mockGithubUser,
            timestamp: Date.now()
          };
          githubOAuth.storeAuthData(mockAuthData);
        }, 2000);
        return;
      }

      // Real OAuth flow
      githubOAuth.initiateAuth();
    } catch (error) {
      console.error('Error initiating GitHub OAuth:', error);
      alert('Failed to start GitHub authentication');
      setIsGitHubConnecting(false);
    }
  };

  // Check for existing connections on page load
  useEffect(() => {
    // Check MetaMask connection
    if (isMetaMaskInstalled()) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setIsMetaMaskConnected(true);
          }
        })
        .catch(console.error);
    }

    // Check GitHub authentication
    const githubAuthData = githubOAuth.getStoredAuthData();
    if (githubAuthData && githubAuthData.user) {
      setGithubUser(githubAuthData.user);
      setIsGitHubConnected(true);
    }
  }, []);

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Avatar/Logo */}
        <div className="auth-avatar">
          <div className="avatar-character">🚀</div>
        </div>

        {/* Title and Subtitle */}
        <h1 className="auth-title">Welcome to GitBountys</h1>
        <p className="auth-subtitle">Connect your wallet first, then authorize with GitHub</p>

        {/* Authentication Steps */}
        <div className="auth-steps">
          {/* Step 1: MetaMask Connection */}
          <button
            className={`auth-step ${isMetaMaskConnected ? 'connected' : ''} ${isConnecting ? 'connecting' : ''}`}
            onClick={connectMetaMask}
            disabled={isConnecting || isMetaMaskConnected}
          >
            <div className="step-icon metamask-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22.46 2.91L13.51 9.38L15.35 5.09L22.46 2.91Z"
                  fill="#E17726"
                />
                <path
                  d="M1.54 2.91L10.42 9.44L8.65 5.09L1.54 2.91Z"
                  fill="#E27625"
                />
                <path
                  d="M19.25 17.23L16.97 20.97L21.91 22.24L23.23 17.33L19.25 17.23Z"
                  fill="#E27625"
                />
                <path
                  d="M0.78 17.33L2.09 22.24L7.03 20.97L4.75 17.23L0.78 17.33Z"
                  fill="#E27625"
                />
              </svg>
            </div>
            <div className="step-content">
              <div className="step-title">
                1. Connect MetaMask
                {isMetaMaskConnected && <span className="connected-indicator">✓</span>}
              </div>
              <div className="step-subtitle">
                {isConnecting 
                  ? 'Connecting...' 
                  : isMetaMaskConnected 
                    ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                    : 'Connect your wallet for payments'
                }
              </div>
            </div>
            {isConnecting && <div className="loading-spinner"></div>}
          </button>

          {/* Step 2: GitHub Authorization */}
          <button
            className={`auth-step ${!isMetaMaskConnected ? 'disabled' : ''} ${isGitHubConnecting ? 'connecting' : ''} ${isGitHubConnected ? 'connected' : ''}`}
            onClick={connectGitHub}
            disabled={!isMetaMaskConnected || isGitHubConnecting || isGitHubConnected}
          >
            <div className="step-icon github-icon">
              {isGitHubConnected && githubUser?.avatar_url ? (
                <img 
                  src={githubUser.avatar_url} 
                  alt="GitHub Avatar"
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%'
                  }}
                />
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
                  />
                </svg>
              )}
            </div>
            <div className="step-content">
              <div className="step-title">
                2. Authorize with GitHub
                {isGitHubConnected && <span className="connected-indicator">✓</span>}
              </div>
              <div className="step-subtitle">
                {isGitHubConnecting 
                  ? 'Connecting...' 
                  : isGitHubConnected
                    ? `Connected: ${githubUser?.name || githubUser?.login}`
                  : !isMetaMaskConnected 
                    ? 'Connect MetaMask first'
                    : 'Authorize your GitHub account'
                }
              </div>
            </div>
            {isGitHubConnecting && <div className="loading-spinner"></div>}
          </button>
        </div>

        {/* Debug Info Toggle */}
        <details className="debug-info">
          <summary>🔍 Debug Info</summary>
          <div className="debug-content">
            <p>MetaMask Connected: {isMetaMaskConnected ? 'Yes' : 'No'}</p>
            {walletAddress && <p>Wallet: {walletAddress}</p>}
            <p>MetaMask Installed: {isMetaMaskInstalled() ? 'Yes' : 'No'}</p>
            <p>GitHub Connected: {isGitHubConnected ? 'Yes' : 'No'}</p>
            {githubUser && (
              <>
                <p>GitHub User: {githubUser.login}</p>
                <p>GitHub Name: {githubUser.name}</p>
                <p>GitHub Email: {githubUser.email}</p>
              </>
            )}
            <p>GitHub Client ID: {import.meta.env.VITE_GITHUB_CLIENT_ID ? 'Configured' : 'Not configured (using demo mode)'}</p>
          </div>
        </details>

        {/* Action Buttons */}
        {(isMetaMaskConnected || isGitHubConnected) && (
          <div className="action-buttons">
            {isGitHubConnected && (
              <button 
                className="disconnect-button"
                onClick={disconnectGitHub}
              >
                Disconnect GitHub
              </button>
            )}
            {isMetaMaskConnected && (
              <button 
                className="disconnect-button"
                onClick={disconnectMetaMask}
              >
                Disconnect Wallet
              </button>
            )}
          </div>
        )}

        {/* Back to Home Button */}
        <button className="back-to-home" onClick={() => window.location.href = '/'}>
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default AuthPage;