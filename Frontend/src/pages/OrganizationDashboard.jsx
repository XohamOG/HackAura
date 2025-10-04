import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Building2, DollarSign, GitBranch, Users, Plus, ExternalLink, Clock, CheckCircle, Loader2, AlertCircle, Star, FileText, Tag, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"
import organizationService from "../services/organizationService"

export default function OrganizationDashboard() {
  // Helper function to format HLUSD amounts cleanly
  const formatHLUSD = (amount) => {
    const num = parseFloat(amount || 0);
    return num === 0 ? '0' : (num % 1 === 0 ? num.toString() : num.toFixed(6).replace(/\.?0+$/, ''));
  };

  const [repositories, setRepositories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRepo, setSelectedRepo] = useState(null)
  const [issuesModal, setIssuesModal] = useState({ isOpen: false, repo: null, issues: [] })
  const [bountyModal, setBountyModal] = useState({ isOpen: false, issue: null })
  const [bountyAmount, setBountyAmount] = useState('')
  const [isAddingBounty, setIsAddingBounty] = useState(false)
  const [issuesLoading, setIssuesLoading] = useState(false)
  
  // Smart Contract Integration States
  const [donationModal, setDonationModal] = useState({ isOpen: false, repo: null })
  const [donationAmount, setDonationAmount] = useState('')
  const [isDonating, setIsDonating] = useState(false)
  const [walletAddress, setWalletAddress] = useState(null)
  const [poolBalances, setPoolBalances] = useState({}) // Store pool balances for each repo
  const [isLoadingPools, setIsLoadingPools] = useState(false)
  const [registerModal, setRegisterModal] = useState({ isOpen: false })
  const [repoUrl, setRepoUrl] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [registeredRepos, setRegisteredRepos] = useState(new Set())

  // Check if a repository is already registered
  const isRepoRegistered = (repoId) => {
    const registeredReposData = JSON.parse(localStorage.getItem('hackAura_registered_repos') || '[]')
    return registeredReposData.some(repo => repo.id.toString() === repoId.toString())
  }

  // Load registered repositories on component mount
  useEffect(() => {
    const registeredReposData = JSON.parse(localStorage.getItem('hackAura_registered_repos') || '[]')
    const registeredIds = new Set(registeredReposData.map(repo => repo.id.toString()))
    setRegisteredRepos(registeredIds)
  }, [])

  // Function to handle viewing issues - now fetches from GitHub API
  const handleViewIssues = async (repo) => {
    setIssuesLoading(true)
    setIssuesModal({ isOpen: true, repo, issues: [] })
    
    try {
      console.log(`🔄 Fetching issues for repository: ${repo.full_name}`)
      const response = await fetch(`/api/auth/repos/${repo.owner}/${repo.name}/issues`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch issues: ${response.status}`)
      }
      
      const issues = await response.json()
      console.log(`✅ Successfully fetched ${issues.length} issues for ${repo.full_name}`)
      
      // Load bounty amounts for each issue
      const issuesWithBounties = issues.map(issue => ({
        ...issue,
        bounty_amount: organizationService.getBountyAmount(repo.id.toString(), issue.id.toString())
      }))
      
      setIssuesModal(prev => ({ ...prev, issues: issuesWithBounties }))
    } catch (error) {
      console.error('❌ Failed to fetch issues:', error)
      setError(`Failed to load issues: ${error.message}`)
      // Keep modal open but show error state
    } finally {
      setIssuesLoading(false)
    }
  }

  // Function to handle adding bounty to an issue
  const handleAddBounty = (issue) => {
    setBountyModal({ isOpen: true, issue })
  }

  // Function to process bounty addition
  const processAddBounty = async () => {
    if (!bountyAmount || parseFloat(bountyAmount) <= 0) {
      alert('Please enter a valid bounty amount')
      return
    }

    if (!walletAddress) {
      try {
        await connectWallet()
      } catch (error) {
        return
      }
    }

    setIsAddingBounty(true)

    try {
      console.log(`💰 Adding bounty of ${bountyAmount} HLUSD to issue ${bountyModal.issue.id}`)

      const result = await organizationService.addBountyToIssue(
        issuesModal.repo.id, // Pass repository ID
        bountyModal.issue.id,
        bountyAmount,
        walletAddress,
        bountyModal.issue.title,
        bountyModal.issue.html_url
      )

      if (result.success) {
        // Update the issue with the new total bounty amount
        const totalBountyAmount = organizationService.getBountyAmount(issuesModal.repo.id.toString(), bountyModal.issue.id.toString());
        const updatedIssues = issuesModal.issues.map(issue => 
          issue.id === bountyModal.issue.id 
            ? { ...issue, bounty_amount: totalBountyAmount }
            : issue
        )
        
        setIssuesModal(prev => ({ ...prev, issues: updatedIssues }))
        
        alert(`✅ Bounty of ${bountyAmount} HLUSD added successfully!\nTotal bounty: ${formatHLUSD(totalBountyAmount)} HLUSD\nTransaction: ${result.data.transactionHash}`)
        setBountyModal({ isOpen: false, issue: null })
        setBountyAmount('')
      } else {
        throw new Error(result.error || 'Failed to add bounty')
      }

    } catch (error) {
      console.error('❌ Failed to add bounty:', error)
      alert(`Failed to add bounty: ${error.message}`)
    } finally {
      setIsAddingBounty(false)
    }
  }

  // ================================
  // SMART CONTRACT INTEGRATION FUNCTIONS
  // ================================

  // Connect wallet and get address
  const connectWallet = async () => {
    try {
      const address = await organizationService.getWalletAddress()
      setWalletAddress(address)
      console.log('✅ Wallet connected:', address)
      return address
    } catch (error) {
      console.error('❌ Wallet connection failed:', error)
      alert('Failed to connect wallet. Please make sure MetaMask is installed and connected to HelaChain testnet.')
      throw error
    }
  }

  // Handle donation to repository pool
  const handleDonation = (repo) => {
    setDonationModal({ isOpen: true, repo })
  }

  // Process donation to repository
  const processDonation = async () => {
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      alert('Please enter a valid donation amount')
      return
    }

    if (!walletAddress) {
      try {
        await connectWallet()
      } catch (error) {
        return
      }
    }

    setIsDonating(true)

    try {
      console.log(`💰 Donating ${donationAmount} HLUSD to repository ${donationModal.repo.id}`)

      const result = await organizationService.donateToRepository(
        donationModal.repo.id,
        donationAmount,
        walletAddress
      )

      if (result.success) {
        alert(`✅ Successfully donated ${donationAmount} HLUSD to ${donationModal.repo.name}!\nTransaction: ${result.data.transactionHash}`)
        
        // Refresh pool balance for this repo
        await loadPoolBalance(donationModal.repo.id)
        
        // Close modal and reset
        setDonationModal({ isOpen: false, repo: null })
        setDonationAmount('')
      }
    } catch (error) {
      console.error('❌ Donation failed:', error)
      alert(`Failed to donate: ${error.message}`)
    } finally {
      setIsDonating(false)
    }
  }

  // Load pool balance for a specific repository
  const loadPoolBalance = async (repoId) => {
    try {
      const result = await organizationService.getRepositoryPool(repoId)
      if (result.success) {
        const balance = organizationService.weiToHLUSD(result.data.poolBalanceWei)
        setPoolBalances(prev => ({
          ...prev,
          [repoId]: balance
        }))
      }
    } catch (error) {
      console.error(`❌ Failed to load pool balance for repo ${repoId}:`, error)
      // Set to 0 if failed to load
      setPoolBalances(prev => ({
        ...prev,
        [repoId]: '0'
      }))
    }
  }

  // Load pool balances for all repositories
  const loadAllPoolBalances = async (repos) => {
    setIsLoadingPools(true)
    try {
      const balancePromises = repos.map(repo => loadPoolBalance(repo.id))
      await Promise.all(balancePromises)
    } catch (error) {
      console.error('❌ Failed to load pool balances:', error)
    } finally {
      setIsLoadingPools(false)
    }
  }

  // Process bounty funding from pool (updated to use smart contract)
  const processAddBountyFromPool = async () => {
    if (!bountyAmount || parseFloat(bountyAmount) <= 0) {
      alert('Please enter a valid bounty amount')
      return
    }

    // Check pool balance before proceeding
    const currentPoolBalance = parseFloat(poolBalances[issuesModal.repo.id] || '0');
    const requestedAmount = parseFloat(bountyAmount);

    if (currentPoolBalance === 0) {
      alert('❌ Repository pool is empty!\n\nPlease donate to this repository first to create a pool for bounty funding.');
      return;
    }

    if (currentPoolBalance < requestedAmount) {
      alert(`❌ Insufficient pool funds!\n\nAvailable: ${formatHLUSD(currentPoolBalance)} HLUSD\nRequested: ${formatHLUSD(requestedAmount)} HLUSD\n\nPlease donate more or reduce the bounty amount.`);
      return;
    }

    if (!walletAddress) {
      try {
        await connectWallet()
      } catch (error) {
        return
      }
    }

    setIsAddingBounty(true)

    try {
      console.log(`🎯 Funding bounty from pool: ${bountyAmount} HLUSD for issue ${bountyModal.issue.id}`)

      const result = await organizationService.fundBountyFromPool(
        issuesModal.repo.id,
        bountyModal.issue.id,
        bountyAmount,
        walletAddress
      )

      if (result.success) {
        // Update the issue with the new total bounty amount
        const totalBountyAmount = result.data.totalBountyAmount || organizationService.getBountyAmount(issuesModal.repo.id.toString(), bountyModal.issue.id.toString());
        const updatedIssues = issuesModal.issues.map(issue => 
          issue.id === bountyModal.issue.id 
            ? { ...issue, bounty_amount: totalBountyAmount }
            : issue
        )
        
        setIssuesModal(prev => ({ ...prev, issues: updatedIssues }))
        
        const message = result.data.note 
          ? `✅ Bounty of ${bountyAmount} HLUSD funded from repository pool!\nTotal bounty: ${formatHLUSD(totalBountyAmount)} HLUSD\n\n${result.data.note}`
          : `✅ Bounty of ${bountyAmount} HLUSD funded successfully!\nTotal bounty: ${formatHLUSD(totalBountyAmount)} HLUSD\nTransaction: ${result.data.transactionHash}`;
        
        alert(message);
        
        // Refresh pool balance
        await loadPoolBalance(issuesModal.repo.id)
        
        setBountyModal({ isOpen: false, issue: null })
        setBountyAmount('')
      }
    } catch (error) {
      console.error('❌ Failed to fund bounty:', error)
      
      // Better error messages
      let errorMessage = 'Failed to fund bounty';
      if (error.message.includes('Insufficient pool funds')) {
        errorMessage = `❌ ${error.message}\n\nPlease donate to the repository or reduce the bounty amount.`;
      } else if (error.message.includes('pool is empty')) {
        errorMessage = `❌ ${error.message}\n\nUse the 💰 Donate button to add funds to the repository pool.`;
      } else {
        errorMessage = `❌ ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setIsAddingBounty(false)
    }
  }

  // Repository Registration Functions
  const handleRegisterRepository = () => {
    setRegisterModal({ isOpen: true })
  }

  // Handle direct repository registration from card
  const handleQuickRegister = async (repo) => {
    if (!walletAddress) {
      try {
        await connectWallet()
      } catch (error) {
        return
      }
    }

    setIsRegistering(true)

    try {
      console.log(`📦 Registering repository: ${repo.full_name}`)

      // Create repository data object in the format expected by registerRepository
      const repoData = {
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        html_url: repo.html_url,
        clone_url: `${repo.html_url}.git`,
        language: repo.language,
        stargazers_count: repo.stars,
        forks_count: repo.forks || 0,
        open_issues_count: repo.activeIssues,
        owner: {
          login: repo.owner,
          avatar_url: `https://github.com/${repo.owner}.png`
        }
      }

      // Register repository with IPFS and smart contract
      const result = await organizationService.registerRepository(repoData, walletAddress)

      if (result.success) {
        alert(`✅ Repository "${repo.name}" registered successfully!\nIPFS Hash: ${result.data.ipfsHash}\nTransaction: ${result.data.transactionHash}`)
        
        // Update registered repos state
        setRegisteredRepos(prev => new Set([...prev, repo.id.toString()]))
        
        // Refresh pool balances
        await loadAllPoolBalances(repositories)
      } else {
        throw new Error(result.error || 'Failed to register repository')
      }
    } catch (error) {
      console.error('❌ Repository registration error:', error)
      alert(`❌ Failed to register repository: ${error.message}`)
    } finally {
      setIsRegistering(false)
    }
  }

  const processRepositoryRegistration = async () => {
    if (!repoUrl.trim()) {
      alert('Please enter a GitHub repository URL')
      return
    }

    if (!walletAddress) {
      try {
        await connectWallet()
      } catch (error) {
        return
      }
    }

    setIsRegistering(true)

    try {
      // Extract repo info from GitHub URL
      const repoMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
      if (!repoMatch) {
        throw new Error('Invalid GitHub repository URL. Please use format: https://github.com/owner/repo')
      }

      const [, owner, repo] = repoMatch
      
      console.log(`📦 Registering repository: ${owner}/${repo}`)

      // Fetch repository data from GitHub API
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`)
      if (!response.ok) {
        throw new Error('Repository not found or not accessible')
      }

      const repoData = await response.json()

      // Register repository with IPFS and smart contract
      const result = await organizationService.registerRepository(repoData, walletAddress)

      if (result.success) {
        alert(`✅ Repository registered successfully!\nIPFS Hash: ${result.data.ipfsHash}\nTransaction: ${result.data.transactionHash}`)
        
        // Refresh repositories list
        const response = await fetch('/api/auth/repos')
        if (response.ok) {
          const data = await response.json()
          if (data.repositories && Array.isArray(data.repositories)) {
            const transformedRepos = data.repositories.map(repo => ({
              ...repo,
              activeIssues: repo.open_issues_count || 0,
              totalPool: 0,
              stars: repo.stargazers_count || 0
            }))
            
            setRepositories(transformedRepos)
            await loadAllPoolBalances(transformedRepos)
          }
        }
        
        // Close modal and reset
        setRegisterModal({ isOpen: false })
        setRepoUrl('')
      }
    } catch (error) {
      console.error('❌ Repository registration failed:', error)
      alert(`Registration failed: ${error.message}`)
    } finally {
      setIsRegistering(false)
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
          owner: repo.owner.login,
          full_name: repo.full_name,
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
        
        // Load pool balances for all repositories
        await loadAllPoolBalances(transformedRepos)
        
        // Try to connect wallet (non-blocking)
        try {
          await connectWallet()
        } catch (error) {
          console.log('⚠️ Wallet not connected yet, user can connect manually')
        }
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
                {isLoadingPools ? (
                  <div className="flex items-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Loading...
                  </div>
                ) : (
                  <>
                    {formatHLUSD(Object.values(poolBalances).reduce((sum, balance) => sum + parseFloat(balance || 0), 0))} HLUSD
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground">HelaChain pool balance</p>
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
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-semibold">Your Repositories</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      Click "Register" on any repository to make it available in the Developer Dashboard with bounty support.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={() => loadAllPoolBalances(repositories)}
                    disabled={isLoadingPools}
                  >
                    {isLoadingPools ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    Refresh Pools
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={handleRegisterRepository}
                  >
                    <Plus className="w-4 h-4" />
                    Register by URL
                  </Button>
                </div>
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
                            {isLoadingPools ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              `${formatHLUSD(poolBalances[repo.id])} HLUSD`
                            )}
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

                        <div className="space-y-2">
                          {/* Registration Status */}
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Registration Status:</span>
                            {isRepoRegistered(repo.id) ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Registered
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                                <Clock className="w-3 h-3 mr-1" />
                                Not Registered
                              </Badge>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            {!isRepoRegistered(repo.id) ? (
                              <Button 
                                size="sm" 
                                className="flex-1"
                                onClick={() => handleQuickRegister(repo)}
                                disabled={isRegistering}
                              >
                                {isRegistering ? (
                                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                ) : (
                                  <Plus className="w-4 h-4 mr-1" />
                                )}
                                Register
                              </Button>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="flex-1"
                                onClick={() => handleDonation(repo)}
                              >
                                <DollarSign className="w-4 h-4 mr-1" />
                                Donate
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="flex-1"
                              onClick={() => handleViewIssues(repo)}
                            >
                              View Issues
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
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

      {/* Issues Modal */}
      {issuesModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Issues for {issuesModal.repo?.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {issuesLoading ? 'Loading...' : `${issuesModal.issues.length} open issues`}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setIssuesModal({ isOpen: false, repo: null, issues: [] })}
              >
                Close
              </Button>
            </div>
            
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {issuesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mr-3" />
                  <span>Loading issues from GitHub...</span>
                </div>
              ) : issuesModal.issues.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No open issues found for this repository</p>
                </div>
              ) : (
                issuesModal.issues.map((issue, index) => (
                <motion.div
                  key={issue.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-lg">{issue.title}</h4>
                        <Badge variant={issue.state === 'open' ? 'default' : 'secondary'}>
                          {issue.state}
                        </Badge>
                        {issue.bounty_amount > 0 && (
                          <Badge className="bg-green-100 text-green-800">
                            ${formatHLUSD(issue.bounty_amount)} bounty
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        {issue.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>Created: {new Date(issue.created_at).toLocaleDateString()}</span>
                        <div className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {issue.labels.join(', ')}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(issue.html_url, '_blank')}
                        className="gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View on GitHub
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAddBounty(issue)}
                        className="gap-1"
                      >
                        <DollarSign className="w-3 h-3" />
                        Add Bounty
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Bounty Modal */}
      {bountyModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold">Add Bounty</h3>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Add a bounty to incentivize developers to work on this issue:
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Issue:</strong> {bountyModal.issue?.title}<br />
                <strong>Current Bounty:</strong> {formatHLUSD(bountyModal.issue?.bounty_amount || 0)} HLUSD<br />
                <strong>Repository Pool:</strong> {formatHLUSD(poolBalances[issuesModal?.repo?.id])} HLUSD
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Bounty Amount (HLUSD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="1.0"
                  value={bountyAmount}
                  onChange={(e) => setBountyAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum: 0.01 HLUSD (will be deducted from repository pool)
                </p>
                {(() => {
                  const poolBalance = parseFloat(poolBalances[issuesModal?.repo?.id] || '0');
                  const requestedAmount = parseFloat(bountyAmount || '0');
                  
                  if (poolBalance === 0) {
                    return (
                      <p className="text-xs text-red-600 mt-1">
                        ⚠️ Repository pool is empty. Please donate first.
                      </p>
                    );
                  } else if (bountyAmount && requestedAmount > poolBalance) {
                    return (
                      <p className="text-xs text-red-600 mt-1">
                        ⚠️ Insufficient pool funds. Available: {formatHLUSD(poolBalance)} HLUSD
                      </p>
                    );
                  } else if (poolBalance > 0) {
                    return (
                      <p className="text-xs text-green-600 mt-1">
                        ✅ Pool balance: {formatHLUSD(poolBalance)} HLUSD available
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={processAddBountyFromPool}
                  disabled={
                    isAddingBounty || 
                    !bountyAmount || 
                    parseFloat(bountyAmount || 0) <= 0 ||
                    parseFloat(poolBalances[issuesModal?.repo?.id] || '0') < parseFloat(bountyAmount || 0) ||
                    parseFloat(poolBalances[issuesModal?.repo?.id] || '0') === 0
                  }
                  className="flex-1 gap-2"
                >
                  {isAddingBounty ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4" />
                      Add Bounty from Pool
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setBountyModal({ isOpen: false, issue: null })
                    setBountyAmount('')
                  }}
                  disabled={isAddingBounty}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                <p>💰 Bounties are funded from repository pool</p>
                <p>🚀 Higher bounties attract more developers</p>
                <p>⚡ Uses HLUSD on HelaChain testnet</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Donation Modal */}
      {donationModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold">Donate to Repository</h3>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Support this repository by donating HLUSD to its pool:
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Repository:</strong> {donationModal.repo?.name}<br />
                <strong>Current Pool:</strong> {formatHLUSD(poolBalances[donationModal.repo?.id])} HLUSD
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Donation Amount (HLUSD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="1.0"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum: 0.01 HLUSD
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
                      Donating...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4" />
                      Donate HLUSD
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
                <p>💰 Donations help fund bounties</p>
                <p>🚀 Support open source development</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Repository Registration Modal */}
      {registerModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-background rounded-lg p-6 w-full max-w-md"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Register Repository</h3>
              <p className="text-sm text-muted-foreground">
                Enter a GitHub repository URL to register it with HackAura and store metadata on IPFS.
              </p>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">GitHub Repository URL</label>
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/owner/repository"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isRegistering}
                />
                <p className="text-xs text-muted-foreground">
                  Example: https://github.com/facebook/react
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={processRepositoryRegistration}
                  disabled={isRegistering || !repoUrl.trim()}
                  className="flex-1 gap-2"
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Register Repository
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setRegisterModal({ isOpen: false })
                    setRepoUrl('')
                  }}
                  disabled={isRegistering}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}