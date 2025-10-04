#!/usr/bin/env node

// Git Hunters Backend Setup Script
const fs = require('fs');
const path = require('path');

console.log('🎯 Git Hunters Backend Setup');
console.log('=============================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!');
  console.log('📋 Please copy .env.example to .env and configure your settings.\n');
} else {
  console.log('✅ .env file found');
}

// Check required environment variables
const requiredEnvVars = [
  'BOUNTY_ESCROW_ADDRESS',
  'PRIVATE_KEY',
  'POLYGON_RPC_URL'
];

let missingVars = [];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName] || process.env[varName].startsWith('PLACEHOLDER_')) {
    missingVars.push(varName);
  }
});

if (missingVars.length > 0) {
  console.log('⚠️  Missing or placeholder environment variables:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\n📝 Please update your .env file with actual values.\n');
} else {
  console.log('✅ All required environment variables configured\n');
}

// Setup instructions
console.log('🚀 Setup Instructions:');
console.log('1. Install dependencies: npm install');
console.log('2. Configure your .env file with:');
console.log('   - Your private key (create new wallet for production)');
console.log('   - RepoRegistry contract address (after deployment)');
console.log('   - Other required settings');
console.log('3. Start the server: npm start');
console.log('\n📖 Documentation: src/api/README.md');
console.log('🔧 Contract helpers: src/contracts/');
console.log('🌐 API endpoints: /api/contracts/*');

console.log('\n✨ Ready to build the future of open source bounties!');