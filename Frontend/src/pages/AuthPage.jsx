import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { Github, Wallet, CheckCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AnimatedGrid from '../components/AnimatedGrid'

const AuthPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, checkAuthStatus } = useAuth()
  const [showPage, setShowPage] = useState(false)

  useEffect(() => {
    setShowPage(true)
    checkAuthStatus()
  }, [checkAuthStatus])

  useEffect(() => {
    // If authenticated, redirect to dashboard or intended page
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard'
      setTimeout(() => {
        navigate(from, { replace: true })
      }, 2500) // <-- Increase this value for more time (e.g., 2500ms)
    }
  }, [isAuthenticated, navigate, location])

  // Redirect to backend for wallet connection
  const connectWallet = () => {
    window.location.href = '/api/auth/wallet'
  }

  // Redirect to GitHub OAuth via backend
  const connectGitHub = () => {
    window.location.href = '/api/auth/github'
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
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-150 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
                  whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
                >
                  <Wallet className="w-5 h-5" />
                  Connect Wallet
                </motion.button>

                {/* Connect GitHub Button */}
                <motion.button
                  onClick={connectGitHub}
                  className="w-full bg-gray-800 hover:bg-gray-900 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-150 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
                  whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
                >
                  <Github className="w-5 h-5" />
                  Connect GitHub
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
                      <span className="font-medium">All connected! Redirecting to dashboard...</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default AuthPage