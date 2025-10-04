# GitHub OAuth Setup Guide for GitBountys

This guide will help you set up GitHub OAuth authentication for your GitBountys application.

## 🔧 Setup Steps

### 1. Create a GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in the application details:
   - **Application name**: `GitBountys` (or your preferred name)
   - **Homepage URL**: `http://localhost:5173` (for development)
   - **Authorization callback URL**: `http://localhost:5173/auth/callback`
   - **Application description**: `GitBountys - Decentralized Bounty Platform`

### 2. Configure Environment Variables

1. Copy your **Client ID** from the GitHub OAuth app
2. Update the `.env` file in the Frontend directory:

```env
# Replace with your actual GitHub OAuth Client ID
VITE_GITHUB_CLIENT_ID=your_actual_client_id_here
VITE_GITHUB_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_APP_URL=http://localhost:5173
```

### 3. Backend Setup (Required for Production)

For production, you'll need to handle the OAuth token exchange on your backend:

```javascript
// Example backend endpoint: /api/auth/github/callback
app.post('/api/auth/github/callback', async (req, res) => {
  const { code } = req.body;
  
  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
      }),
    });
    
    const tokenData = await tokenResponse.json();
    
    // Get user information
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    const userData = await userResponse.json();
    
    res.json({
      accessToken: tokenData.access_token,
      user: userData
    });
  } catch (error) {
    res.status(500).json({ error: 'OAuth exchange failed' });
  }
});
```

## 🚀 Current Implementation

### Demo Mode
- If `VITE_GITHUB_CLIENT_ID` is not configured, the app runs in demo mode
- Demo mode simulates OAuth flow with mock user data
- Perfect for development and testing

### Production Mode
- When `VITE_GITHUB_CLIENT_ID` is configured, real OAuth flow is initiated
- Redirects to GitHub for authorization
- Handles OAuth callback and token exchange

## 🔒 Security Notes

1. **Never expose your Client Secret** in frontend code
2. **Always handle token exchange on the backend** in production
3. **Use HTTPS** in production environments
4. **Validate state parameter** to prevent CSRF attacks
5. **Store tokens securely** (consider using HTTP-only cookies)

## 🧪 Testing

1. **Demo Mode**: Works out of the box without GitHub OAuth setup
2. **Development**: Use `http://localhost:5173/auth/callback` as callback URL
3. **Production**: Update callback URL to your production domain

## 📱 Features Included

- ✅ Real MetaMask integration
- ✅ GitHub OAuth flow (demo + production ready)
- ✅ Persistent authentication state
- ✅ User avatar display
- ✅ Disconnect functionality
- ✅ Loading states and error handling
- ✅ Responsive design
- ✅ Debug information panel

## 🛠 Troubleshooting

### Common Issues:
1. **"Client ID not configured"**: Update `.env` file with your GitHub Client ID
2. **OAuth callback error**: Ensure callback URL matches GitHub app settings
3. **MetaMask not detected**: Install MetaMask browser extension
4. **CORS errors**: Configure your backend to allow requests from frontend domain

### Need Help?
Check the debug panel in the auth page for detailed information about connection states and configuration.