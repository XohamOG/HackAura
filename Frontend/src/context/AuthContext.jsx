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
  }, [])

  const checkAuthStatus = () => {
    // Check MetaMask connection
    const metamaskAccount = localStorage.getItem('metamask_account')
    const metamaskStatus = window.ethereum && window.ethereum.selectedAddress
    setMetamaskConnected(!!metamaskAccount || !!metamaskStatus)

    // Check GitHub connection
    const githubToken = localStorage.getItem('github_token')
    setGithubConnected(!!githubToken)

    // Set authenticated if both are connected
    setIsAuthenticated(!!(metamaskStatus || metamaskAccount) && !!githubToken)
    setLoading(false)
  }

  const logout = () => {
    localStorage.removeItem('metamask_account')
    localStorage.removeItem('github_token')
    setMetamaskConnected(false)
    setGithubConnected(false)
    setIsAuthenticated(false)
  }

  const value = {
    isAuthenticated,
    metamaskConnected,
    githubConnected,
    loading,
    checkAuthStatus,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
