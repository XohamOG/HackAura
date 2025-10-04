import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { Github, Wallet, CheckCircle, Loader2, Trash2, Eye } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AnimatedGrid from '../components/AnimatedGrid'

const AuthPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, metamaskConnected, githubConnected, checkAuthStatus, logout } = useAuth()
  const [showPage, setShowPage] = useState(false)
  const [isConnectingWallet, setIsConnectingWallet] = useState(false)
  const [isConnectingGitHub, setIsConnectingGitHub] = useState(false)
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    setShowPage(true)
    checkAuthStatus()
    
    // Check if we're being redirected back from GitHub OAuth
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    if (token) {
      localStorage.setItem('github_token', token)
      checkAuthStatus()
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [checkAuthStatus])

  useEffect(() => {
    // If authenticated, redirect to role selection page
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/info'
      setTimeout(() => {
        navigate(from, { replace: true })
      }, 2500)
    }
  }, [isAuthenticated, navigate, location, metamaskConnected, githubConnected])

  // Connect to MetaMask wallet
  const connectWallet = async () => {
    setIsConnectingWallet(true)
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        alert('Please install MetaMask to connect your wallet')
        return
      }

      // Always clear existing connection state first (this is what force disconnect was doing)
      localStorage.removeItem('metamask_account')
      localStorage.removeItem('github_token') // Clear this too to reset auth state
      checkAuthStatus() // Update UI to show disconnected state
      
      // Small delay to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Method 1: Try to force permission request (this should always open popup)
      let accounts = null
      try {
        // Request permissions first - this forces MetaMask popup
        const permissions = await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }]
        })
        
        console.log('Permissions granted:', permissions)
        
        // Then get accounts
        accounts = await window.ethereum.request({ 
          method: 'eth_accounts' 
        })
      } catch (permissionError) {
        console.log('Permission request failed, trying direct account request:', permissionError)
        
        // Fallback: Direct account request
        accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        })
      }
      
      if (accounts && accounts.length > 0) {
        // Store the connected account
        localStorage.setItem('metamask_account', accounts[0])
        console.log('MetaMask connected with account:', accounts[0])
        
        // Update auth status
        checkAuthStatus()
      } else {
        alert('No accounts found. Please unlock MetaMask and try connecting again.')
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
      
      // Handle specific error cases
      if (error.code === 4001) {
        // User rejected the request
        console.log('User rejected MetaMask connection')
      } else if (error.code === -32002) {
        // Request already pending
        alert('MetaMask connection request is already pending. Please check your MetaMask extension.')
      } else if (error.code === 4100) {
        // Unauthorized - account not connected
        alert('Please unlock MetaMask and try again.')
      } else {
        console.log('MetaMask connection error:', error.message)
      }
    } finally {
      setIsConnectingWallet(false)
    }
  }

  // Redirect to GitHub OAuth via backend
  const connectGitHub = () => {
    // Set loading state
    setIsConnectingGitHub(true)
    
    // Simulate GitHub connection
    console.log('🔗 GitHub connection started...')
    
    // Store GitHub token to simulate successful connection
    localStorage.setItem('github_token', 'github_token_for_testing')
    
    // Update auth status to reflect the connection
    checkAuthStatus()
    
    // Redirect to role selection page after 3 seconds
    setTimeout(() => {
      console.log('🎯 Redirecting to role selection page...')
      setIsConnectingGitHub(false)
      navigate('/info', { replace: true })
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Animated Grid Background */}
      <AnimatedGrid />

      <div className="relative z-20 max-w-2xl mx-auto">
        <AnimatePresence>
          {showPage && (
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Title */}
              <motion.h1 
                className="text-4xl md:text-5xl font-bold text-foreground mb-4"
                style={{ fontFamily: 'Aston Script, cursive' }}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                Connect Your Accounts
              </motion.h1>
              
              <motion.p
                className="text-lg text-muted-foreground mb-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Connect both MetaMask and GitHub to get started with Git Hunters
              </motion.p>

              {/* Connection Buttons */}
              <div className="space-y-4">
                {/* Connect Wallet Button */}
                <motion.button
                  onClick={connectWallet}
                  disabled={isConnectingWallet}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-colors duration-150 flex items-center justify-center gap-2 ${
                    metamaskConnected 
                      ? 'bg-green-500 hover:bg-green-600 text-white' 
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
                  whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
                  whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
                >
                  {isConnectingWallet ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : metamaskConnected ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Wallet className="w-5 h-5" />
                  )}
                  {metamaskConnected ? 'Wallet Connected' : 'Connect Wallet'}
                </motion.button>

                {/* Connect GitHub Button */}
                <motion.button
                  onClick={connectGitHub}
                  disabled={githubConnected || isConnectingGitHub}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-colors duration-150 flex items-center justify-center gap-2 ${
                    githubConnected 
                      ? 'bg-green-500 text-white cursor-not-allowed' 
                      : isConnectingGitHub
                      ? 'bg-blue-500 text-white cursor-not-allowed'
                      : 'bg-gray-800 hover:bg-gray-900 text-white'
                  }`}
                  whileHover={!githubConnected && !isConnectingGitHub ? { scale: 1.02, transition: { duration: 0.15 } } : {}}
                  whileTap={!githubConnected && !isConnectingGitHub ? { scale: 0.98, transition: { duration: 0.1 } } : {}}
                >
                  {isConnectingGitHub ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : githubConnected ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Github className="w-5 h-5" />
                  )}
                  {isConnectingGitHub ? 'Connecting to GitHub...' : githubConnected ? 'GitHub Connected' : 'Connect GitHub'}
                </motion.button>
              </div>

              {/* Success Message */}
              <AnimatePresence>
                {isAuthenticated && (
                  <motion.div
                    className="mt-8 p-4 bg-green-500/10 border border-green-500/20 rounded-lg"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">All connected! Redirecting to role selection...</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Debug and Management Section */}
              <div className="mt-8 space-y-4">
                {/* Debug Toggle */}
                <button
                  onClick={() => setShowDebug(!showDebug)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  {showDebug ? 'Hide' : 'Show'} Storage Debug
                </button>

                {/* Debug Panel */}
                <AnimatePresence>
                  {showDebug && (
                    <motion.div
                      className="p-4 bg-muted/50 border border-border rounded-lg text-sm"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h4 className="font-medium mb-2">Storage Contents:</h4>
                      <div className="space-y-1 font-mono text-xs">
                        <div>
                          <span className="text-muted-foreground">MetaMask Account:</span>{' '}
                          <span className="text-foreground">
                            {localStorage.getItem('metamask_account') || 'Not stored'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">GitHub Token:</span>{' '}
                          <span className="text-foreground">
                            {localStorage.getItem('github_token') ? 'Stored ✅' : 'Not stored ❌'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Auth Status:</span>{' '}
                          <span className="text-foreground">
                            {isAuthenticated ? 'Authenticated ✅' : 'Not authenticated ❌'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Signout Button */}
                {(metamaskConnected || githubConnected) && (
                  <motion.button
                    onClick={() => {
                      logout()
                      setShowDebug(false)
                    }}
                    className="w-full px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-600 dark:text-red-400 rounded-lg font-medium transition-colors duration-150 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
                    whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All Storage & Sign Out
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default AuthPage