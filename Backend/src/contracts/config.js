// Smart Contract Configuration
require('dotenv').config();

const contractConfig = {
  // Network Configuration
  networks: {
    helalabs: {
      rpcUrl: process.env.NETWORK_RPC_URL || 'https://testnet-rpc.helachain.com',
      chainId: parseInt(process.env.NETWORK_CHAIN_ID) || 666888,
      name: process.env.NETWORK_NAME || 'Hela Official Runtime Testnet',
      symbol: process.env.NETWORK_SYMBOL || 'HLUSD',
      explorer: process.env.NETWORK_EXPLORER || 'https://testnet-blockscout.helachain.com'
    },
    'helalabs-testnet': {
      rpcUrl: 'https://testnet-rpc.helachain.com',
      chainId: 666888,
      name: 'Hela Official Runtime Testnet',
      symbol: 'HLUSD',
      explorer: 'https://testnet-blockscout.helachain.com'
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
      address: process.env.BOUNTY_ESCROW_ADDRESS || '0xd9145CCE52D386f254917e481eB44e9943F39138',
      network: process.env.NETWORK || 'polygon'
    },
    repoRegistry: {
      address: process.env.REPO_REGISTRY_ADDRESS || '0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8',
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