import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Building2, DollarSign, GitBranch, Users, Plus, ExternalLink, Clock, CheckCircle, Loader2, AlertCircle, Star, Heart } from "lucide-react"
import { motion } from "framer-motion"

export default function OrganizationDashboard() {
  const [repositories, setRepositories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRepo, setSelectedRepo] = useState(null)
  const [donationModal, setDonationModal] = useState({ isOpen: false, repo: null })
  const [donationAmount, setDonationAmount] = useState('')
  const [isDonating, setIsDonating] = useState(false)

  // Donation function
  const handleDonate = async (repo) => {
    setDonationModal({ isOpen: true, repo })
  }

  const processDonation = async () => {
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      alert('Please enter a valid donation amount')
      return
    }

    setIsDonating(true)

    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        alert('MetaMask is not installed. Please install MetaMask to make donations.')
        return
      }

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' })

      // Get the user's account
      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      const fromAccount = accounts[0]

      if (!fromAccount) {
        alert('No account found. Please connect your MetaMask wallet.')
        return
      }

      // Convert donation amount to Wei (ETH to Wei conversion)
      const amountInWei = window.ethereum.utils?.toWei(donationAmount, 'ether') || 
                         (parseFloat(donationAmount) * Math.pow(10, 18)).toString(16)

      // Dummy recipient address (in real app, this would be the repo owner's wallet)
      const recipientAddress = '0x742d35Cc6635C0532925a3b8D0b17A30C6638bF1' // Example address

      // Prepare transaction
      const transactionParameters = {
        to: recipientAddress,
        from: fromAccount,
        value: '0x' + parseInt(amountInWei).toString(16),
        gas: '0x5208', // 21000 gas limit for simple transfers
        gasPrice: '0x9184e72a000', // 10 gwei
      }

      // Send transaction
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      })

      console.log('✅ Donation transaction sent:', txHash)
      
      // Update the repository's bounty pool locally
      setRepositories(prevRepos => 
        prevRepos.map(r => 
          r.id === donationModal.repo.id 
            ? { ...r, bountyPool: r.bountyPool + parseFloat(donationAmount) * 1000 } // Convert ETH to USD equivalent
            : r
        )
      )

      alert(`🎉 Donation successful! Transaction hash: ${txHash}`)
      setDonationModal({ isOpen: false, repo: null })
      setDonationAmount('')

    } catch (error) {
      console.error('❌ Donation failed:', error)
      
      if (error.code === 4001) {
        alert('Transaction was cancelled by user.')
      } else if (error.code === -32603) {
        alert('Transaction failed. Please check your wallet balance and try again.')
      } else {
        alert(`Donation failed: ${error.message}`)
      }
    } finally {
      setIsDonating(false)
    }
  }

  // Fetch repositories from GitHub API
  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('🔄 Fetching repositories from GitHub API...')
        const response = await fetch('/api/auth/repos')
        
        if (!response.ok) {
          throw new Error(`Failed to fetch repositories: ${response.status}`)
        }
        
        const repos = await response.json()
        console.log('✅ Repositories fetched successfully:', repos.length, 'repos')
        
        // Transform GitHub API data to our format
        const transformedRepos = repos.map(repo => ({
          id: repo.id.toString(),
          name: repo.name,
          description: repo.description || 'No description available',
          bountyPool: Math.floor(Math.random() * 5000) + 1000,
          activeIssues: repo.open_issues_count || 0,
          completedIssues: Math.floor(Math.random() * 20),
          stars: repo.stargazers_count || 0,
          language: repo.language,
          updated_at: repo.updated_at,
          html_url: repo.html_url,
          private: repo.private,
          fork: repo.fork,
          forks_count: repo.forks_count || 0,
          watchers_count: repo.watchers_count || 0
        }))
        
        setRepositories(transformedRepos)
        setSelectedRepo(transformedRepos[0] || null)
      } catch (err) {
        console.error('❌ Error fetching repositories:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchRepositories()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold font-heading mb-2">Organization Dashboard</h1>
          <p className="text-muted-foreground text-lg">Manage your repositories and bounties</p>
        </motion.div>

        {loading && (
          <motion.div 
            className="flex items-center justify-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Loader2 className="w-8 h-8 animate-spin mr-3" />
            <span className="text-lg">Loading repositories from GitHub...</span>
          </motion.div>
        )}

        {error && (
          <motion.div 
            className="flex items-center justify-center py-12 text-red-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <AlertCircle className="w-8 h-8 mr-3" />
            <span className="text-lg">Error: {error}</span>
          </motion.div>
        )}

        {!loading && !error && (
          <>
        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bounty Pool</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground group-hover:text-green-600 transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${repositories.reduce((total, repo) => total + repo.bountyPool, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Available for bounties</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Repositories</CardTitle>
              <GitBranch className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{repositories.length}</div>
              <p className="text-xs text-muted-foreground">GitHub repositories</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Developers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground group-hover:text-purple-600 transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {repositories.reduce((total, repo) => total + repo.activeIssues, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Open issues</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stars</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground group-hover:text-yellow-600 transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {repositories.reduce((total, repo) => total + repo.stars, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">GitHub stars</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Tabs defaultValue="repositories" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="repositories" className="flex items-center gap-2">
                <GitBranch className="w-4 h-4" />
                Repositories
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recent Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="repositories" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Your Repositories</h2>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Repository
                </Button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {repositories.map((repo, index) => (
                  <motion.div
                    key={repo.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg group-hover:text-primary transition-colors">
                              {repo.name}
                            </CardTitle>
                            <p className="text-muted-foreground text-sm mt-1">{repo.description}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => window.open(repo.html_url, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            ${repo.bountyPool}
                          </span>
                          <span className="text-muted-foreground">⭐ {repo.stars}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-orange-500" />
                            <span>{repo.activeIssues} active</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>{repo.completedIssues} completed</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="flex-1 gap-1" 
                            onClick={() => handleDonate(repo)}
                          >
                            <Heart className="w-3 h-3" />
                            Donate
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            View Issues
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-12 text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No recent activity</p>
                    <p className="text-sm">Activity from your repositories will appear here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
        </>
        )}
      </div>

      {/* Donation Modal */}
      {donationModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold">Donate to {donationModal.repo?.name}</h3>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Support this repository by donating cryptocurrency. Your donation will help fund development and improvements.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Donation Amount (ETH)
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  placeholder="0.01"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum: 0.001 ETH (~$2.50 USD)
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Repository:</strong> {donationModal.repo?.name}<br />
                  <strong>Current Pool:</strong> ${donationModal.repo?.bountyPool?.toLocaleString()}<br />
                  <strong>Your Donation:</strong> {donationAmount ? `${donationAmount} ETH` : '0 ETH'}
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={processDonation}
                  disabled={isDonating || !donationAmount}
                  className="flex-1 gap-2"
                >
                  {isDonating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4" />
                      Donate Now
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDonationModal({ isOpen: false, repo: null })
                    setDonationAmount('')
                  }}
                  disabled={isDonating}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                <p>⚡ Powered by MetaMask & Ethereum</p>
                <p>🔒 Secure blockchain transaction</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}