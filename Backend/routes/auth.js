const express = require('express');
const router = express.Router();
const axios = require('axios');
const { ethers } = require('ethers');

// Metamask wallet verification
router.post('/wallet', (req, res) => {
  const { address, signature, message } = req.body;
  try {
    const signer = ethers.utils.verifyMessage(message, signature);
    if (signer.toLowerCase() === address.toLowerCase()) {
      req.session.walletAddress = address;
      return res.json({ success: true });
    }
    return res.status(401).json({ error: 'Invalid signature' });
  } catch (err) {
    return res.status(400).json({ error: 'Verification failed' });
  }
});

// GitHub OAuth
const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

// Debug logging
console.log('🔑 GitHub OAuth Config:');
console.log('  CLIENT_ID:', CLIENT_ID ? 'Loaded ✅' : 'Missing ❌');
console.log('  CLIENT_SECRET:', CLIENT_SECRET ? 'Loaded ✅' : 'Missing ❌');

router.get('/github', (req, res) => {
  console.log('🚀 GitHub OAuth initiated with CLIENT_ID:', CLIENT_ID);
  const redirect_uri = process.env.GITHUB_REDIRECT_URI || 'http://localhost:4000/api/auth/github/callback';
  console.log('🔗 Using redirect_uri:', redirect_uri);
  res.redirect(`https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirect_uri}&scope=repo user`);
});

router.get('/github/callback', async (req, res) => {
  const code = req.query.code;
  try {
    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code
      },
      { headers: { Accept: 'application/json' } }
    );
    
    // Store the token and redirect to frontend with token
    req.session.githubToken = tokenRes.data.access_token;
    
    // Also store it in a way frontend can access
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth?token=${tokenRes.data.access_token}`);
  } catch (err) {
    res.status(400).send('GitHub authentication failed');
  }
});

router.get('/repos', async (req, res) => {
  const token = process.env.GITHUB_BEARER_TOKEN || req.session.githubToken;
  if (!token) return res.status(401).json({ error: 'Not authenticated with GitHub' });
  try {
    const reposRes = await axios.get('https://api.github.com/user/repos', {
      headers: { Authorization: `Bearer ${token}` }
    });
    res.json(reposRes.data);
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch repositories' });
  }
});

module.exports = router;
