import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [metamaskConnected, setMetamaskConnected] = useState(false)
  const [githubConnected, setGithubConnected] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
    
    // Listen for MetaMask account changes
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          // User disconnected all accounts
          localStorage.removeItem('metamask_account')
          checkAuthStatus()
        } else if (localStorage.getItem('metamask_account')) {
          // Update the stored account if user switches accounts and was previously connected
          localStorage.setItem('metamask_account', accounts[0])
          checkAuthStatus()
        }
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      
      // Cleanup event listener
      return () => {
        if (window.ethereum && window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        }
      }
    }
  }, [])

  const checkAuthStatus = () => {
    // Check MetaMask connection - only consider it connected if user explicitly connected through our app
    const metamaskAccount = localStorage.getItem('metamask_account')
    const metamaskConnected = !!metamaskAccount
    
    // Check GitHub connection
    const githubToken = localStorage.getItem('github_token')
    const githubConnected = !!githubToken
    
    // Debug logging
    console.log('🔍 Auth Debug Info:')
    console.log('  MetaMask Account (localStorage):', metamaskAccount)
    console.log('  MetaMask Connected:', metamaskConnected)
    console.log('  GitHub Token:', githubToken ? 'EXISTS' : 'NOT FOUND')
    console.log('  GitHub Connected:', githubConnected)
    
    setMetamaskConnected(metamaskConnected)
    setGithubConnected(githubConnected)

    // Set authenticated if both are connected
    const isAuth = !!metamaskAccount && !!githubToken
    console.log('  🔐 Final Auth Status:', isAuth)
    
    setIsAuthenticated(isAuth)
    setLoading(false)
  }

  const logout = () => {
    localStorage.removeItem('metamask_account')
    localStorage.removeItem('github_token')
    setMetamaskConnected(false)
    setGithubConnected(false)
    setIsAuthenticated(false)
    console.log('🚪 User logged out - all storage cleared')
  }

  // Utility functions for storage management
  const getStoredWalletAddress = () => localStorage.getItem('metamask_account')
  const getStoredGithubToken = () => localStorage.getItem('github_token')
  
  const clearMetamaskStorage = () => {
    localStorage.removeItem('metamask_account')
    setMetamaskConnected(false)
    setIsAuthenticated(false)
    checkAuthStatus()
  }
  
  const clearGithubStorage = () => {
    localStorage.removeItem('github_token')
    setGithubConnected(false)
    setIsAuthenticated(false)
    checkAuthStatus()
  }

  const value = {
    isAuthenticated,
    metamaskConnected,
    githubConnected,
    loading,
    checkAuthStatus,
    logout,
    getStoredWalletAddress,
    getStoredGithubToken,
    clearMetamaskStorage,
    clearGithubStorage
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
