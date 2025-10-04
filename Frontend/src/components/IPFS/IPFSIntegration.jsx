import React, { useState, useContext, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { AuthContext } from '../../context/AuthContext';
import { ipfsService } from '../../services/ipfsService';
import githubOAuth from '../../services/githubOAuth';

const IPFSIntegration = () => {
  const { user } = useContext(AuthContext);
  const [lighthouseApiKey, setLighthouseApiKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [showApiKeyForm, setShowApiKeyForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  // Load saved API key on component mount
  useEffect(() => {
    // Default API key (configured in background)
    const defaultApiKey = 'f552a04f.e7982a54346e44cf9497b86ac967d2ab';
    
    const savedApiKey = localStorage.getItem('lighthouse_api_key') || defaultApiKey;
    
    setLighthouseApiKey(savedApiKey);
    ipfsService.setApiKey(savedApiKey);
    setIsConfigured(true);
    
    // Save default key if none exists
    if (!localStorage.getItem('lighthouse_api_key')) {
      localStorage.setItem('lighthouse_api_key', defaultApiKey);
    }
  }, []);

  const handleApiKeySubmit = (e) => {
    e.preventDefault();
    
    if (!lighthouseApiKey.trim()) {
      setUploadStatus({ type: 'error', message: 'Please enter a valid API key' });
      return;
    }

    // Save API key locally and configure service
    localStorage.setItem('lighthouse_api_key', lighthouseApiKey);
    ipfsService.setApiKey(lighthouseApiKey);
    setIsConfigured(true);
    setShowApiKeyForm(false);
    setUploadStatus({ type: 'success', message: '✅ Lighthouse API key configured!' });
  };

  const testIPFSConnection = async () => {
    if (!isConfigured) {
      setUploadStatus({ type: 'error', message: 'Please configure Lighthouse API key first' });
      return;
    }

    setIsUploading(true);
    setUploadStatus({ type: 'info', message: 'Testing Lighthouse IPFS connection...' });
    
    try {
      const testData = {
        test: true,
        timestamp: new Date().toISOString(),
        message: 'Lighthouse IPFS connection test from Git Hunters',
        network: 'HelaChain',
        version: '1.0.0'
      };

      const hash = await ipfsService.uploadJSON(testData);
      setUploadStatus({ 
        type: 'success', 
        message: `✅ Lighthouse connection successful!`,
        hash 
      });
    } catch (error) {
      if (error.message === 'LIGHTHOUSE_API_KEY_REQUIRED') {
        setUploadStatus({ 
          type: 'error', 
          message: 'API key required. Please configure your Lighthouse API key.' 
        });
      } else {
        setUploadStatus({ 
          type: 'error', 
          message: `Connection failed: ${error.message}` 
        });
      }
    } finally {
      setIsUploading(false);
    }
  };

  const registerCurrentRepository = async () => {
    if (!user) {
      setUploadStatus({ type: 'error', message: 'Please login with GitHub first' });
      return;
    }

    if (!isConfigured) {
      setUploadStatus({ type: 'error', message: 'Please configure Lighthouse API key first' });
      setShowApiKeyForm(true);
      return;
    }

    setIsUploading(true);
    setUploadStatus({ type: 'info', message: 'Uploading to Lighthouse IPFS and registering on HelaChain...' });
    
    try {
      // Get current repository info from URL or GitHub API
      const repoData = await getCurrentRepoData();
      
      if (!repoData) {
        throw new Error('Could not detect repository information');
      }

      // Upload to Lighthouse IPFS first
      const metadata = ipfsService.formatRepositoryMetadata(repoData);
      const ipfsHash = await ipfsService.uploadJSON(metadata);

      // Register on HelaChain (this will use your friend's auth logic)
      const result = await githubOAuth.registerRepository(repoData, { ipfsHash });
      
      setUploadStatus({ 
        type: 'success', 
        message: `🎉 Repository registered on HelaChain!`,
        hash: ipfsHash,
        txHash: result.txHash
      });
    } catch (error) {
      if (error.message === 'LIGHTHOUSE_API_KEY_REQUIRED') {
        setShowApiKeyForm(true);
        setUploadStatus({ 
          type: 'error', 
          message: 'Lighthouse API key required. Please configure it first.' 
        });
      } else {
        setUploadStatus({ type: 'error', message: error.message });
      }
    } finally {
      setIsUploading(false);
    }
  };

  const getCurrentRepoData = async () => {
    // Try to extract repo info from current URL or GitHub API
    const url = window.location.href;
    
    if (url.includes('github.com')) {
      const pathMatch = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (pathMatch) {
        return {
          name: pathMatch[2],
          owner: pathMatch[1],
          githubUrl: `https://github.com/${pathMatch[1]}/${pathMatch[2]}`,
          isPublic: true
        };
      }
    }
    
    // Fallback: ask user to provide repository info
    return null;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            IPFS Integration
            <Badge variant={ipfsCredentials ? 'default' : 'secondary'}>
              {ipfsCredentials ? 'Configured' : 'Not Configured'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600">
            🌐 <strong>IPFS Integration</strong> - Repository metadata stored on decentralized IPFS network.
          </div>

          <div className="space-y-3">
            {/* Action Buttons */}
            <div className="space-y-2">
              <Button 
                onClick={testIPFSConnection}
                disabled={isUploading}
                variant="outline"
                className="w-full"
              >
                {isUploading ? 'Testing...' : '🔗 Test IPFS Connection'}
              </Button>

              <Button 
                onClick={registerCurrentRepository}
                disabled={isUploading || !user}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {isUploading ? 'Uploading...' : '🚀 Register Repository on HelaChain'}
              </Button>
            </div>
          </div>


          {/* Status Messages */}
          {uploadStatus && (
            <div className={`p-3 rounded-md ${
              uploadStatus.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
              uploadStatus.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
              'bg-yellow-50 text-yellow-800 border border-yellow-200'
            }`}>
              <div className="font-medium">{uploadStatus.message}</div>
              {uploadStatus.hash && (
                <div className="text-xs mt-1">
                  IPFS Hash: <code>{uploadStatus.hash}</code>
                </div>
              )}
              {uploadStatus.txHash && (
                <div className="text-xs mt-1">
                  <a 
                    href={`https://testnet-blockscout.helachain.com/tx/${uploadStatus.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    View on HelaChain Testnet Explorer
                  </a>
                </div>
              )}
            </div>
          )}

          {/* How It Works */}
          <div className="bg-blue-50 p-4 rounded-lg text-sm">
            <div className="font-medium text-blue-800 mb-2">🌐 HelaChain + IPFS Integration:</div>
            <div className="text-blue-700 space-y-1">
              <div>📡 <strong>IPFS Storage:</strong> Metadata stored on decentralized IPFS network</div>
              <div>⛓️ <strong>Smart Contracts:</strong> Deployed on HelaChain testnet</div>
              <div>🔐 <strong>Secure:</strong> Direct blockchain interactions via MetaMask</div>
              <div>🚀 <strong>Decentralized:</strong> No centralized servers required</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IPFSIntegration;