// Smart Contract Configuration
require('dotenv').config();

const contractConfig = {
  // Network Configuration
  networks: {
    lisk: {
      rpcUrl: process.env.NETWORK_RPC_URL || 'https://rpc.sepolia-api.lisk.com',
      chainId: parseInt(process.env.NETWORK_CHAIN_ID) || 4202,
      name: process.env.NETWORK_NAME || 'Lisk Sepolia Testnet',
      symbol: process.env.NETWORK_SYMBOL || 'ETH',
      explorer: process.env.NETWORK_EXPLORER || 'https://sepolia-blockscout.lisk.com'
    },
    'lisk-sepolia': {
      rpcUrl: 'https://rpc.sepolia-api.lisk.com',
      chainId: 4202,
      name: 'Lisk Sepolia Testnet',
      symbol: 'ETH',
      explorer: 'https://sepolia-blockscout.lisk.com'
    },
    // Legacy Polygon support
    polygon: {
      rpcUrl: 'https://polygon-rpc.com',
      chainId: 137,
      name: 'Polygon Mainnet'
    }
  },

  // Contract Addresses
  contracts: {
    bountyEscrow: {
      address: process.env.BOUNTY_ESCROW_ADDRESS || '0xCc47A9e11De3aA189cD801fD54054493C5e11a68',
      network: process.env.NETWORK || 'lisk'
    },
    repoRegistry: {
      address: process.env.REPO_REGISTRY_ADDRESS || '0xa50C8481E6a39681b7B881e9884e8a03567BAdFF',
      network: process.env.NETWORK || 'lisk'
    }
  },

  // Gas Configuration
  gas: {
    limit: 3000000,
    price: '30000000000' // 30 gwei
  },

  // Private Key for Contract Interactions
  privateKey: process.env.PRIVATE_KEY || 'PLACEHOLDER_PRIVATE_KEY',

  // Utility Functions
  getCurrentNetwork() {
    const networkName = process.env.NETWORK || 'lisk';
    return this.networks[networkName];
  },

  getContractAddress(contractName) {
    return this.contracts[contractName]?.address;
  },

  isValidNetwork(networkName) {
    return Object.keys(this.networks).includes(networkName);
  }
};

module.exports = contractConfig;