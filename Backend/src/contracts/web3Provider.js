// Web3 Provider Setup and Utilities
const { Web3 } = require('web3');
const contractConfig = require('./config');

class Web3Provider {
  constructor() {
    this.web3 = null;
    this.account = null;
    this.networkConfig = null;
    this.init();
  }

  init() {
    try {
      this.networkConfig = contractConfig.getCurrentNetwork();
      this.web3 = new Web3(this.networkConfig.rpcUrl);
      
      // Setup account from private key
      if (contractConfig.privateKey && contractConfig.privateKey !== 'PLACEHOLDER_PRIVATE_KEY') {
        this.account = this.web3.eth.accounts.privateKeyToAccount(contractConfig.privateKey);
        this.web3.eth.accounts.wallet.add(this.account);
        this.web3.eth.defaultAccount = this.account.address;
        console.log(`� Default account: ${this.account.address}`);
      } else {
        console.log(`⚠️  No private key configured - read-only mode`);
        console.log(`📝 Set PRIVATE_KEY in .env for transaction capabilities`);
      }

      console.log(`� Web3 connected to ${this.networkConfig.name}`);
      console.log(`📍 RPC URL: ${this.networkConfig.rpcUrl}`);
    } catch (error) {
      console.error('❌ Web3 initialization failed:', error.message);
      throw error;
    }
  }

  // Get Web3 instance
  getWeb3() {
    if (!this.web3) {
      throw new Error('Web3 not initialized');
    }
    return this.web3;
  }

  // Get current account
  getAccount() {
    if (!this.account) {
      throw new Error('No account configured. Please set PRIVATE_KEY in .env file for transaction capabilities. Currently in read-only mode.');
    }
    return this.account;
  }

  // Get network info
  getNetworkInfo() {
    return this.networkConfig;
  }

  // Convert Wei to Ether
  weiToEther(wei) {
    return this.web3.utils.fromWei(wei.toString(), 'ether');
  }

  // Convert Ether to Wei
  etherToWei(ether) {
    return this.web3.utils.toWei(ether.toString(), 'ether');
  }

  // Get current gas price
  async getCurrentGasPrice() {
    try {
      const gasPrice = await this.web3.eth.getGasPrice();
      return gasPrice;
    } catch (error) {
      console.warn('Failed to get current gas price, using default');
      return contractConfig.gas.price;
    }
  }

  // Estimate gas for transaction
  async estimateGas(transaction) {
    try {
      const gas = await this.web3.eth.estimateGas(transaction);
      return gas;
    } catch (error) {
      console.warn('Failed to estimate gas, using default limit');
      return contractConfig.gas.limit;
    }
  }

  // Get account balance
  async getBalance(address = null) {
    const accountAddress = address || this.account?.address;
    if (!accountAddress) {
      throw new Error('No account address provided');
    }

    const balance = await this.web3.eth.getBalance(accountAddress);
    return {
      wei: balance,
      ether: this.weiToEther(balance)
    };
  }

  // Check if address is valid
  isValidAddress(address) {
    return this.web3.utils.isAddress(address);
  }

  // Get transaction receipt
  async getTransactionReceipt(txHash) {
    return await this.web3.eth.getTransactionReceipt(txHash);
  }

  // Wait for transaction confirmation
  async waitForTransaction(txHash, timeout = 60000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkTransaction = async () => {
        try {
          const receipt = await this.getTransactionReceipt(txHash);
          
          if (receipt) {
            if (receipt.status) {
              resolve(receipt);
            } else {
              reject(new Error('Transaction failed'));
            }
          } else if (Date.now() - startTime > timeout) {
            reject(new Error('Transaction timeout'));
          } else {
            setTimeout(checkTransaction, 2000); // Check every 2 seconds
          }
        } catch (error) {
          reject(error);
        }
      };

      checkTransaction();
    });
  }

  // Send transaction with automatic gas estimation
  async sendTransaction(transaction) {
    try {
      if (!this.account) {
        throw new Error('No account configured for sending transactions');
      }

      // Add from address
      transaction.from = this.account.address;

      // Estimate gas if not provided
      if (!transaction.gas) {
        transaction.gas = await this.estimateGas(transaction);
      }

      // Get gas price if not provided
      if (!transaction.gasPrice) {
        transaction.gasPrice = await this.getCurrentGasPrice();
      }

      // Send transaction
      const result = await this.web3.eth.sendTransaction(transaction);
      console.log(`📤 Transaction sent: ${result.transactionHash}`);
      
      return result;
    } catch (error) {
      console.error('❌ Transaction failed:', error.message);
      throw error;
    }
  }
}

// Singleton instance
let web3ProviderInstance = null;

function getWeb3Provider() {
  if (!web3ProviderInstance) {
    web3ProviderInstance = new Web3Provider();
  }
  return web3ProviderInstance;
}

module.exports = {
  Web3Provider,
  getWeb3Provider
};