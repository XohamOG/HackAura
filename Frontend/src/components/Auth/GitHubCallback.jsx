import React, { useEffect, useState } from 'react';
import githubOAuth from '../../services/githubOAuth';

const GitHubCallback = ({ onAuthSuccess, onAuthError }) => {
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        if (error) {
          throw new Error(`OAuth Error: ${error}`);
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        if (!githubOAuth.verifyState(state)) {
          throw new Error('Invalid state parameter');
        }

        setStatus('exchanging_token');

        // For demo purposes, we'll simulate a successful OAuth flow
        // In a real app, the backend would handle the token exchange
        const mockAuthData = {
          accessToken: 'mock_access_token_' + Date.now(),
          user: {
            id: Math.floor(Math.random() * 10000),
            login: 'demo_user',
            name: 'Demo User',
            email: 'demo@example.com',
            avatar_url: 'https://github.com/github.png',
            html_url: 'https://github.com/demo_user'
          },
          timestamp: Date.now()
        };

        // Store the auth data
        githubOAuth.storeAuthData(mockAuthData);

        setStatus('success');
        
        // Notify parent component
        if (onAuthSuccess) {
          onAuthSuccess(mockAuthData);
        }

        // Redirect back to auth page after a short delay
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);

      } catch (err) {
        console.error('OAuth callback error:', err);
        setError(err.message);
        setStatus('error');
        
        if (onAuthError) {
          onAuthError(err);
        }
      }
    };

    handleCallback();
  }, [onAuthSuccess, onAuthError]);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1a1a1a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '48px 40px',
        textAlign: 'center',
        color: 'white'
      }}>
        {status === 'processing' && (
          <>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>🔄</div>
            <h2>Processing GitHub Authorization...</h2>
            <p style={{ color: '#a0a0a0' }}>Please wait while we complete your authentication.</p>
          </>
        )}

        {status === 'exchanging_token' && (
          <>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>🔗</div>
            <h2>Connecting to GitHub...</h2>
            <p style={{ color: '#a0a0a0' }}>Exchanging authorization code for access token.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>✅</div>
            <h2>Successfully Connected!</h2>
            <p style={{ color: '#22c55e' }}>Your GitHub account has been linked to GitBountys.</p>
            <p style={{ color: '#a0a0a0', fontSize: '14px' }}>Redirecting you back...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>❌</div>
            <h2>Authentication Failed</h2>
            <p style={{ color: '#ef4444' }}>{error}</p>
            <button 
              onClick={() => window.location.href = '/'}
              style={{
                background: '#667eea',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                marginTop: '16px'
              }}
            >
              Back to Auth
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default GitHubCallback;