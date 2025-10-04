// Frontend IPFS Service - Lighthouse/Filecoin Integration
class IPFSService {
  constructor() {
    // Lighthouse IPFS configuration
    this.lighthouse = {
      uploadUrl: 'https://node.lighthouse.storage/api/v0/add',
      apiUrl: 'https://api.lighthouse.storage'
    };
    
    // Default API key configured
    this.apiKey = 'f552a04f.e7982a54346e44cf9497b86ac967d2ab';
  }

  /**
   * Set Lighthouse API key
   * @param {string} apiKey - Lighthouse API key
   */
  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  /**
   * Upload JSON metadata to Lighthouse IPFS
   * @param {Object} metadata - Repository or bounty metadata
   * @returns {Promise<string>} IPFS hash (CID)
   */
  async uploadJSON(metadata) {
    if (!this.apiKey) {
      throw new Error('LIGHTHOUSE_API_KEY_REQUIRED');
    }

    try {
      return await this.uploadToLighthouse(metadata);
    } catch (error) {
      console.error('Lighthouse IPFS upload failed:', error);
      throw new Error(`IPFS upload failed: ${error.message}`);
    }
  }

  /**
   * Upload to Lighthouse IPFS
   * @param {Object} metadata - JSON metadata to upload
   * @returns {Promise<string>} IPFS hash
   */
  async uploadToLighthouse(metadata) {
    const formData = new FormData();
    const blob = new Blob([JSON.stringify(metadata, null, 2)], { 
      type: 'application/json' 
    });
    formData.append('file', blob, `git-hunters-${Date.now()}.json`);

    const response = await fetch(this.lighthouse.uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Lighthouse upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return result.Hash; // Lighthouse returns the IPFS hash in 'Hash' field
  }

  /**
   * Get file info from Lighthouse
   * @param {string} cid - IPFS Content ID
   * @returns {Promise<Object>} File information
   */
  async getFileInfo(cid) {
    if (!this.apiKey) {
      throw new Error('API key required');
    }

    const response = await fetch(`${this.lighthouse.apiUrl}/api/lighthouse/file_info?cid=${cid}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get file info');
    }

    return await response.json();
  }

  /**
   * Check if API key is configured
   * @returns {boolean} True if API key is set
   */
  isConfigured() {
    return !!this.apiKey;
  }

  /**
   * Upload JSON metadata to IPFS (with fallback handling)
   * @param {Object} metadata - Repository or bounty metadata
   * @returns {Promise<string>} IPFS hash (CID)
   */
  async uploadJSON(metadata) {
    try {
      return await this.uploadToLighthouse(metadata);
    } catch (error) {
      console.error('Lighthouse IPFS upload failed:', error);
      throw new Error(`IPFS upload failed: ${error.message}`);
    }
  }

  /**
   * Retrieve metadata from IPFS
   * @param {string} cid - IPFS Content ID
   * @returns {Promise<Object>} Retrieved metadata
   */
  async retrieveMetadata(cid) {
    const gateways = [
      `https://ipfs.io/ipfs/${cid}`,
      `https://gateway.pinata.cloud/ipfs/${cid}`,
      `https://cloudflare-ipfs.com/ipfs/${cid}`,
      `https://${cid}.ipfs.w3s.link`
    ];

    for (const gateway of gateways) {
      try {
        const response = await fetch(gateway);
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.warn(`Failed to retrieve from ${gateway}:`, error);
      }
    }

    throw new Error('Failed to retrieve metadata from IPFS');
  }

  /**
   * Format repository metadata for IPFS storage
   */
  formatRepositoryMetadata(repoData) {
    return {
      name: repoData.name,
      description: repoData.description,
      owner: repoData.owner,
      githubUrl: repoData.githubUrl,
      tags: repoData.tags || [],
      category: repoData.category || 'general',
      license: repoData.license || 'MIT',
      stars: repoData.stars || 0,
      issues: repoData.issues || [],
      createdAt: new Date().toISOString(),
      version: '1.0.0',
      gitHunters: {
        isPublic: repoData.isPublic !== false,
        bountyEnabled: true,
        minBounty: repoData.minBounty || '0.01',
        maxBounty: repoData.maxBounty || '10'
      }
    };
  }

  /**
   * Format bounty metadata for IPFS storage
   */
  formatBountyMetadata(bountyData) {
    return {
      title: bountyData.title,
      description: bountyData.description,
      requirements: bountyData.requirements || [],
      skills: bountyData.skills || [],
      difficulty: bountyData.difficulty || 'medium',
      estimatedTime: bountyData.estimatedTime || '1-3 days',
      amount: bountyData.amount,
      currency: 'HELA',
      issueUrl: bountyData.issueUrl,
      repositoryId: bountyData.repositoryId,
      createdBy: bountyData.createdBy,
      createdAt: new Date().toISOString(),
      deadline: bountyData.deadline,
      status: 'open'
    };
  }
}

// Export singleton instance
export const ipfsService = new IPFSService();
export default IPFSService;