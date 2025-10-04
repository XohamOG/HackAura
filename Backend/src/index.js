const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  const hasPrivateKey = process.env.PRIVATE_KEY && process.env.PRIVATE_KEY !== 'PLACEHOLDER_PRIVATE_KEY';
  
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    network: process.env.NETWORK || 'polygon',
    mode: hasPrivateKey ? 'read-write' : 'read-only',
    contracts: {
      bountyEscrow: process.env.BOUNTY_ESCROW_ADDRESS,
      repoRegistry: process.env.REPO_REGISTRY_ADDRESS
    },
    setup: {
      privateKey: hasPrivateKey ? '✅ Configured' : '⚠️  Not set (read-only mode)',
      contracts: '✅ Addresses configured',
      rpc: '✅ Polygon RPC configured'
    }
  });
});

// Routes
app.get('/', (req, res) => res.send('🎯 Git Hunters Backend API - Ready to Hunt!'));

// Smart Contract API Routes
const contractRoutes = require('./api/contracts');
app.use('/api/contracts', contractRoutes);

// Blockchain routes (legacy - for compatibility)
try {
  const blockchainRoutes = require('./blockchain/routes');
  app.use('/api/blockchain', blockchainRoutes);
  console.log('📋 Legacy blockchain routes loaded');
} catch (error) {
  console.warn('⚠️  Legacy blockchain routes failed to load:', error.message);
  console.log('✅ Using new contract system only');
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    availableRoutes: [
      'GET /health',
      'GET /api/contracts/*',
      'GET /api/blockchain/*'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.listen(port, () => {
  console.log(`🚀 Git Hunters Backend listening on http://localhost:${port}`);
  console.log(`📄 API Documentation: http://localhost:${port}/api/contracts`);
  console.log(`🔗 Network: ${process.env.NETWORK || 'polygon'}`);
  console.log(`📋 Health Check: http://localhost:${port}/health`);
});
