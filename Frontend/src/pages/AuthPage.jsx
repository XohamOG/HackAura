import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { Github, Wallet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AnimatedGrid from '../components/AnimatedGrid'

const AuthPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, metamaskConnected, githubConnected, checkAuthStatus } = useAuth()
  const [metamaskLoading, setMetamaskLoading] = useState(false)
  const [githubLoading, setGithubLoading] = useState(false)
  const [showPage, setShowPage] = useState(false)

  useEffect(() => {
    setShowPage(true)
    checkAuthStatus()
  }, [checkAuthStatus])

  useEffect(() => {
    // If both are connected, redirect to dashboard or intended page
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard'
      setTimeout(() => {
        navigate(from, { replace: true })
      }, 1500)
    }
  }, [isAuthenticated, navigate, location])

  const connectMetaMask = async () => {
    setMetamaskLoading(true)
    
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask extension')
        setMetamaskLoading(false)
        return
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      if (accounts.length > 0) {
        localStorage.setItem('metamask_account', accounts[0])
        checkAuthStatus() // Update auth context
      }
    } catch (error) {
      console.error('MetaMask connection failed:', error)
      alert('Failed to connect to MetaMask')
    }
    
    setMetamaskLoading(false)
  }

  const connectGitHub = () => {
    setGithubLoading(true)
    
    // Simulate GitHub OAuth flow
    // In real implementation, redirect to GitHub OAuth
    setTimeout(() => {
      localStorage.setItem('github_token', 'mock_token_' + Date.now())
      checkAuthStatus() // Update auth context
      setGithubLoading(false)
    }, 2000)
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

              {/* Connection Cards */}
              <div className="space-y-6">
                {/* MetaMask Card */}
                <motion.div
                  className={`bg-card/60 backdrop-blur-sm border rounded-xl p-6 transition-all duration-200 ${
                    metamaskConnected 
                      ? 'border-green-500/50 bg-green-500/10' 
                      : 'border-border/50 hover:border-primary/50'
                  }`}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  whileHover={{ 
                    scale: 1.01, 
                    y: -2,
                    transition: { duration: 0.15, ease: "easeOut" }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${
                        metamaskConnected ? 'bg-green-500/20' : 'bg-orange-500/20'
                      }`}>
                        <Wallet className={`w-6 h-6 ${
                          metamaskConnected ? 'text-green-500' : 'text-orange-500'
                        }`} />
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-foreground">MetaMask Wallet</h3>
                        <p className="text-sm text-muted-foreground">
                          {metamaskConnected ? 'Connected successfully' : 'Connect your crypto wallet'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {metamaskConnected ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : (
                        <motion.button
                          onClick={connectMetaMask}
                          disabled={metamaskLoading}
                          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-150 flex items-center gap-2"
                          whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
                          whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
                        >
                          {metamaskLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Connect'
                          )}
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* GitHub Card */}
                <motion.div
                  className={`bg-card/60 backdrop-blur-sm border rounded-xl p-6 transition-all duration-200 ${
                    githubConnected 
                      ? 'border-green-500/50 bg-green-500/10' 
                      : 'border-border/50 hover:border-primary/50'
                  }`}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  whileHover={{ 
                    scale: 1.01, 
                    y: -2,
                    transition: { duration: 0.15, ease: "easeOut" }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${
                        githubConnected ? 'bg-green-500/20' : 'bg-gray-500/20'
                      }`}>
                        <Github className={`w-6 h-6 ${
                          githubConnected ? 'text-green-500' : 'text-gray-500'
                        }`} />
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-foreground">GitHub Account</h3>
                        <p className="text-sm text-muted-foreground">
                          {githubConnected ? 'Connected successfully' : 'Connect your GitHub profile'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {githubConnected ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : (
                        <motion.button
                          onClick={connectGitHub}
                          disabled={githubLoading}
                          className="bg-gray-800 hover:bg-gray-900 dark:bg-white dark:hover:bg-gray-100 dark:text-black disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-150 flex items-center gap-2"
                          whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
                          whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
                        >
                          {githubLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Connect'
                          )}
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Success Message */}
              <AnimatePresence>
                {metamaskConnected && githubConnected && (
                  <motion.div
                    className="mt-8 p-4 bg-green-500/10 border border-green-500/20 rounded-lg"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">All connected! Redirecting to dashboard...</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Progress Indicator */}
              <motion.div
                className="mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
              >
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <span>Progress: </span>
                  <span className="font-medium">
                    {(metamaskConnected ? 1 : 0) + (githubConnected ? 1 : 0)}/2 connected
                  </span>
                </div>
                <div className="w-full bg-border/30 rounded-full h-2 mt-2">
                  <motion.div
                    className="bg-primary dark:bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${((metamaskConnected ? 1 : 0) + (githubConnected ? 1 : 0)) * 50}%` 
                    }}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default AuthPage