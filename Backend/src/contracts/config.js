// Smart Contract Configuration
require('dotenv').config();

const contractConfig = {
  // Network Configuration
  networks: {
    polygon: {
      rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
      chainId: 137,
      name: 'Polygon Mainnet'
    },
    'polygon-testnet': {
      rpcUrl: process.env.POLYGON_TESTNET_RPC_URL || 'https://rpc-mumbai.maticvigil.com',
      chainId: 80001,
      name: 'Polygon Mumbai Testnet'
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