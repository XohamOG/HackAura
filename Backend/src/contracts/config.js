// Smart Contract Configuration
require('dotenv').config();

const contractConfig = {
  // Network Configuration
  networks: {
    helalabs: {
      rpcUrl: process.env.NETWORK_RPC_URL || 'https://mainnet-rpc.helachain.com',
      chainId: parseInt(process.env.NETWORK_CHAIN_ID) || 8668,
      name: process.env.NETWORK_NAME || 'HelaChain Mainnet',
      symbol: process.env.NETWORK_SYMBOL || 'HELA',
      explorer: process.env.NETWORK_EXPLORER || 'https://explorer.helachain.com'
    },
    'helalabs-testnet': {
      rpcUrl: 'https://testnet-rpc.helachain.com',
      chainId: 666888,
      name: 'HelaChain Testnet',
      symbol: 'HELA',
      explorer: 'https://testnet-explorer.helachain.com'
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
      network: process.env.NETWORK || 'polygon'
    },
    repoRegistry: {
      address: process.env.REPO_REGISTRY_ADDRESS || 'PLACEHOLDER_REPO_REGISTRY_ADDRESS',
      network: process.env.NETWORK || 'polygon'
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
    const networkName = process.env.NETWORK || 'polygon';
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