import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { DollarSign, CheckCircle, Clock, ExternalLink, GitBranch, TrendingUp, Sparkles, Store, Star, Tag, RefreshCw } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "../context/AuthContext"
import githubOAuth from "../services/githubOAuth"
import organizationService from "../services/organizationService"

export default function DeveloperDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  // Helper function to format HLUSD amounts cleanly (same as Organization Dashboard)
  const formatHLUSD = (amount) => {
    const num = parseFloat(amount || 0);
    return num === 0 ? '0' : (num % 1 === 0 ? num.toString() : num.toFixed(6).replace(/\.?0+$/, ''));
  };

  const [repositories, setRepositories] = useState([]) // Start with empty array
  const [bounties, setBounties] = useState([])
  const [completedBounties, setCompletedBounties] = useState([])
  const [isLoading, setIsLoading] = useState(true) // Start with loading true
  const [selectedRepo, setSelectedRepo] = useState(null) // No default selection
  const [stats, setStats] = useState({
    totalRepos: 0,
    activeBounties: 0,
    totalRewards: '0',
    completedBounties: 0
  })
  
  // Same state variables as Organization Dashboard
  const [donationModal, setDonationModal] = useState({ isOpen: false, repo: null })
  const [donationAmount, setDonationAmount] = useState('')
  const [isDonating, setIsDonating] = useState(false)
  const [walletAddress, setWalletAddress] = useState(null)
  const [poolBalances, setPoolBalances] = useState({}) // Store pool balances for each repo
  const [isLoadingPools, setIsLoadingPools] = useState(false)

  useEffect(() => {
    loadDashboardData()
    
    // Set a maximum loading time of 3 seconds
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false)
    }, 3000)

    return () => clearTimeout(loadingTimeout)
  }, [])

  // Recalculate stats when repositories or completed bounties change
  useEffect(() => {
    if (repositories.length > 0) {
      loadStats()
    }
  }, [repositories, completedBounties])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      // Load repositories first
      await loadRepositories()
      
      // Then load bounties and completed bounties in parallel
      await Promise.all([
        loadBounties(),
        loadCompletedBounties()
      ])
      
      // Finally calculate stats after all data is loaded
      loadStats()
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      setRepositories([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadRepositories = async () => {
    try {
      console.log('🔄 Loading repositories from backend API...')
      
      // First, try to get all repositories from backend API (same as Organization Dashboard)
      let allRepos = []
      
      try {
        const response = await fetch('/api/auth/repos')
        if (response.ok) {
          allRepos = await response.json()
          console.log('📋 Fetched all repositories from backend:', allRepos.length)
        } else if (response.status === 401) {
          console.log('🔄 Backend auth failed, falling back to localStorage only')
          // Fall back to localStorage data only
          const registeredRepos = JSON.parse(localStorage.getItem('hackAura_registered_repos') || '[]')
          
          if (registeredRepos.length === 0) {
            console.log('📦 No registered repositories found in localStorage')
            setRepositories([])
            setIsLoading(false)
            return
          }
          
          // Transform localStorage data to match backend format
          allRepos = registeredRepos.map(repo => ({
            id: repo.id,
            name: repo.name,
            owner: { login: repo.owner?.login || repo.full_name?.split('/')[0] },
            full_name: repo.full_name || repo.fullName,
            description: repo.description,
            html_url: repo.html_url || repo.htmlUrl,
            language: repo.language,
            stargazers_count: repo.stars || repo.stargazers_count || 0,
            forks_count: repo.forks || repo.forks_count || 0,
            watchers_count: repo.watchers_count || 0,
            open_issues_count: repo.open_issues_count || 0,
            updated_at: repo.updated_at,
            private: repo.private || false,
            fork: repo.fork || false
          }))
        } else {
          throw new Error(`Failed to fetch repositories: ${response.status}`)
        }
      } catch (error) {
        console.error('❌ Error fetching repositories from backend:', error)
        // Complete fallback to localStorage
        const registeredRepos = JSON.parse(localStorage.getItem('hackAura_registered_repos') || '[]')
        allRepos = registeredRepos.map(repo => ({
          id: repo.id,
          name: repo.name,
          owner: { login: repo.owner?.login || repo.full_name?.split('/')[0] },
          full_name: repo.full_name || repo.fullName,
          description: repo.description,
          html_url: repo.html_url || repo.htmlUrl,
          language: repo.language,
          stargazers_count: repo.stars || repo.stargazers_count || 0,
          forks_count: repo.forks || repo.forks_count || 0
        }))
      }
      
      // If we got repos from backend API, filter to only registered ones
      let filteredRepos = allRepos
      
      if (allRepos.length > 0) {
        const registeredRepos = JSON.parse(localStorage.getItem('hackAura_registered_repos') || '[]')
        const registeredIds = new Set(registeredRepos.map(repo => repo.id.toString()))
        
        // Only filter if we have backend data (otherwise we already have filtered localStorage data)
        if (registeredIds.size > 0) {
          filteredRepos = allRepos.filter(repo => registeredIds.has(repo.id.toString()))
          console.log('🎯 Filtered to registered repositories:', filteredRepos.length)
        }
      }
      
      if (filteredRepos.length === 0) {
        console.log('📦 No registered repositories found')
        setRepositories([])
        setIsLoading(false)
        return
      }

      // Enhanced repository loading with GitHub issues
      const reposWithFullData = await Promise.all(filteredRepos.map(async (repo) => {
        try {
          // Get all bounties for this repository from local storage
          const repoBounties = organizationService.getRepositoryBounties(repo.id.toString())
          const bountyValues = Object.values(repoBounties)
          
          // Calculate repository bounty statistics
          const totalBounty = bountyValues.reduce((sum, bounty) => sum + bounty.amount, 0)
          const activeBounties = bountyValues.filter(bounty => bounty.status === 'active').length
          
          // Fetch live GitHub issues for this repository
          let githubIssues = []
          if (repo.fullName || repo.full_name) {
            const repoFullName = repo.fullName || repo.full_name
            console.log(`🔍 Fetching GitHub issues for ${repoFullName}`)
            
            try {
              // Try backend API first (same as Organization Dashboard)
              console.log(`🔄 Fetching issues for repository: ${repo.full_name}`)
              const issuesResponse = await fetch(`/api/auth/repos/${repo.owner.login}/${repo.name}/issues`)
              
              if (issuesResponse.ok) {
                const issues = await issuesResponse.json()
                console.log(`✅ Successfully fetched ${issues.length} issues from backend API for ${repo.full_name}`)
                
                // Load bounty amounts for each issue (exactly like Organization Dashboard)
                githubIssues = issues.map(issue => ({
                  ...issue,
                  bounty_amount: organizationService.getBountyAmount(repo.id.toString(), issue.id.toString())
                }))
              } else if (issuesResponse.status === 401) {
                // If backend auth fails, fall back to direct GitHub API
                console.log(`🔄 Backend auth failed, trying direct GitHub API for ${repo.full_name}`)
                const directResponse = await fetch(`https://api.github.com/repos/${repo.full_name}/issues?state=all&per_page=100`)
                
                if (directResponse.ok) {
                  const issues = await directResponse.json()
                  console.log(`✅ Successfully fetched ${issues.length} issues from GitHub API for ${repo.full_name}`)
                  
                  // Transform to match backend format and add bounties
                  githubIssues = issues
                    .filter(issue => !issue.pull_request) // Filter out pull requests
                    .map(issue => ({
                      id: issue.id,
                      number: issue.number,
                      title: issue.title,
                      body: issue.body,
                      state: issue.state,
                      labels: issue.labels.map(label => label.name),
                      created_at: issue.created_at,
                      html_url: issue.html_url,
                      user: {
                        login: issue.user.login,
                        avatar_url: issue.user.avatar_url
                      },
                      bounty_amount: organizationService.getBountyAmount(repo.id.toString(), issue.id.toString())
                    }))
                } else {
                  throw new Error(`GitHub API failed: ${directResponse.status}`)
                }
              } else {
                throw new Error(`Backend API failed: ${issuesResponse.status}`)
              }
              
              console.log(`💰 Issues with bounties loaded for ${repo.full_name}: ${githubIssues.length} issues`)
            } catch (issueError) {
              console.error('❌ Failed to fetch issues:', issueError)
              // Keep repo data but with empty issues
              githubIssues = []
            }
          }

          // Transform to match Organization Dashboard format exactly
          return {
            id: repo.id.toString(),
            name: repo.name,
            owner: repo.owner.login,
            full_name: repo.full_name,
            description: repo.description || 'No description available',
            html_url: repo.html_url,
            language: repo.language,
            stars: repo.stargazers_count || 0,
            stargazers_count: repo.stargazers_count || 0,
            forks_count: repo.forks_count || 0,
            watchers_count: repo.watchers_count || 0,
            open_issues_count: repo.open_issues_count || 0,
            updated_at: repo.updated_at,
            private: repo.private,
            fork: repo.fork,
            // Enhanced data with issues and bounties
            issues: githubIssues,
            activeIssues: githubIssues.filter(issue => issue.state === 'open').length,
            totalBounties: githubIssues.reduce((sum, issue) => sum + (issue.bounty_amount || 0), 0),
            activeBountiesCount: githubIssues.filter(issue => issue.bounty_amount > 0).length,
            poolBalance: '0' // Will be updated by loadAllPoolBalances
          }
        } catch (repoError) {
          console.error(`❌ Error processing repository ${repo.name}:`, repoError)
          // Return basic repo data if detailed loading fails (same format as Organization Dashboard)
          return {
            id: repo.id.toString(),
            name: repo.name,
            owner: repo.owner.login,
            full_name: repo.full_name,
            description: repo.description || 'No description available',
            html_url: repo.html_url,
            language: repo.language,
            stars: repo.stargazers_count || 0,
            stargazers_count: repo.stargazers_count || 0,
            forks_count: repo.forks_count || 0,
            issues: [],
            totalBounties: 0,
            activeBountiesCount: 0,
            poolBalance: '0' // Will be updated by loadAllPoolBalances
          }
        }
      }))

      console.log(`✅ Loaded ${reposWithFullData.length} repositories with GitHub issues and bounty data`)
      setRepositories(reposWithFullData)
      
      // Load pool balances for all repositories (same as Organization Dashboard)
      await loadAllPoolBalances(reposWithFullData)
      
      // Set first repository as selected if none selected
      if (reposWithFullData.length > 0 && !selectedRepo) {
        setSelectedRepo(reposWithFullData[0])
      }
      
      // Try to connect wallet (non-blocking, same as Organization Dashboard)
      try {
        await connectWallet()
      } catch (error) {
        console.log('⚠️ Wallet not connected yet, user can connect manually')
      }
      
    } catch (error) {
      console.error('❌ Failed to load repositories:', error)
      setRepositories([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadBounties = async () => {
    try {
      // Load bounties from localStorage instead of API
      const allBounties = JSON.parse(localStorage.getItem('hackAura_bounties') || '{}')
      const bountyArray = Object.entries(allBounties).map(([key, bounty]) => ({
        id: key,
        ...bounty,
        repoId: key.split('_')[0],
        issueId: key.split('_')[1]
      }))
      setBounties(bountyArray)
      console.log('📋 Loaded bounties from localStorage:', bountyArray)
    } catch (error) {
      console.error('Failed to load bounties:', error)
      setBounties([])
    }
  }

  const loadCompletedBounties = async () => {
    try {
      // Load completed bounties from localStorage
      const completedBountiesData = JSON.parse(localStorage.getItem('hackAura_completed_bounties') || '[]')
      const userLogin = user?.login || 'anonymous'
      
      // Filter completed bounties for this user
      const userCompletedBounties = completedBountiesData.filter(bounty => 
        bounty.developer === userLogin
      )
      
      setCompletedBounties(userCompletedBounties)
      console.log(`🏆 Loaded ${userCompletedBounties.length} completed bounties for ${userLogin}`)
    } catch (error) {
      console.error('Failed to load completed bounties:', error)
      setCompletedBounties([])
    }
  }

  const loadStats = async () => {
    try {
      // Calculate stats from localStorage data
      const totalRepos = repositories.length
      const activeBounties = repositories.reduce((sum, repo) => 
        sum + repo.issues.filter(issue => issue.bounty_amount > 0).length, 0)
      const totalRewards = repositories.reduce((sum, repo) => 
        sum + repo.issues.reduce((issueSum, issue) => issueSum + (issue.bounty_amount || 0), 0), 0)
      const completedCount = completedBounties.length
      
      setStats({
        totalRepos,
        activeBounties,
        totalRewards: totalRewards.toString(),
        completedBounties: completedCount
      })
      
      console.log('📊 Calculated stats:', {
        totalRepos,
        activeBounties,
        totalRewards,
        completedBounties: completedCount
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  // Same functions as Organization Dashboard
  const connectWallet = async () => {
    try {
      const address = await organizationService.getWalletAddress()
      if (address) {
        setWalletAddress(address)
        console.log('✅ Connected to wallet:', address)
        return address
      }
    } catch (error) {
      console.error('❌ Failed to connect wallet:', error)
      throw error
    }
  }

  // Load pool balance for a specific repository (same as Organization Dashboard)
  const loadPoolBalance = async (repoId) => {
    try {
      console.log(`💰 Loading pool balance for repository ${repoId}`)
      const result = await organizationService.getRepositoryPool(repoId)
      if (result.success && result.data.poolBalanceWei) {
        const balance = organizationService.weiToHLUSD(result.data.poolBalanceWei)
        setPoolBalances(prev => ({ ...prev, [repoId]: balance }))
        console.log(`✅ Pool balance loaded for repo ${repoId}: ${balance} HLUSD`)
        return balance
      } else {
        // Fallback to local pool balance
        const localBalance = organizationService.getLocalPoolBalance(repoId) || '0'
        setPoolBalances(prev => ({ ...prev, [repoId]: localBalance }))
        console.log(`✅ Using local pool balance for repo ${repoId}: ${localBalance} HLUSD`)
        return localBalance
      }
    } catch (error) {
      console.error(`❌ Failed to load pool balance for repo ${repoId}:`, error)
      // Fallback to local pool balance
      const localBalance = organizationService.getLocalPoolBalance(repoId) || '0'
      setPoolBalances(prev => ({ ...prev, [repoId]: localBalance }))
      return localBalance
    }
  }

  // Load pool balances for all repositories (same as Organization Dashboard)
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

  // Process donation to repository (same as Organization Dashboard)
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
      } else {
        alert(`❌ Donation failed: ${result.error}`)
      }
    } catch (error) {
      console.error('❌ Donation failed:', error)
      alert(`❌ Donation failed: ${error.message}`)
    } finally {
      setIsDonating(false)
    }
  }

  const handleMetaMaskConnect = async () => {
    try {
      await githubOAuth.connectMetaMask()
      // Refresh data after connecting
      loadDashboardData()
    } catch (error) {
      console.error('Failed to connect MetaMask:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const totalEarnings = completedBounties.reduce((sum, bounty) => sum + bounty.bounty_amount, 0)
  const totalCompleted = completedBounties.length

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold font-heading mb-2">Developer Dashboard</h1>
          <p className="text-muted-foreground text-lg">Find issues, earn bounties, and build your reputation</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground group-hover:text-green-600 transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalEarnings}</div>
              <p className="text-xs text-muted-foreground">Lifetime bounty earnings</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Issues</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCompleted}</div>
              <p className="text-xs text-muted-foreground">Successfully resolved</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <GitBranch className="h-4 w-4 text-muted-foreground group-hover:text-purple-600 transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{repositories.length}</div>
              <p className="text-xs text-muted-foreground">Available repositories</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Tabs defaultValue="browse" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="browse" className="flex items-center gap-2">
                <Store className="w-4 h-4" />
                Browse Issues
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Completed
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Repository List */}
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5" />
                          Available Repositories
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadAllPoolBalances(repositories)}
                          disabled={isLoadingPools}
                        >
                          {isLoadingPools ? (
                            <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isLoading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                          <p className="text-muted-foreground">Loading repositories from IPFS...</p>
                        </div>
                      ) : repositories.length === 0 ? (
                        <div className="text-center py-8">
                          <GitBranch className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="font-semibold mb-2">No Repositories Yet</h3>
                          <p className="text-muted-foreground text-sm mb-4">
                            No repositories have been registered on HackAura yet.
                          </p>
                          <Button
                            variant="outline"
                            onClick={() => navigate('/org/dashboard')}
                          >
                            Register Repository
                          </Button>
                        </div>
                      ) : (
                        repositories.map((repo, index) => (
                          <motion.div
                            key={repo.id}
                            className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 hover:shadow-md ${
                              selectedRepo?.id === repo.id
                                ? "border-primary bg-primary/5 shadow-lg"
                                : "border-border hover:border-primary/50 hover:bg-accent/50"
                            }`}
                            onClick={() => setSelectedRepo(repo)}
                            whileHover={{ scale: 1.02 }}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h3 className="font-semibold text-sm mb-1 line-clamp-1">{repo.name}</h3>
                                <p className="text-muted-foreground text-xs mb-1">{repo.owner?.login}</p>
                                {repo.language && (
                                  <div className="flex items-center gap-1 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    <span className="text-xs text-muted-foreground">{repo.language}</span>
                                  </div>
                                )}
                              </div>
                              <div className="text-right text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3" />
                                  {repo.stars || 0}
                                </div>
                              </div>
                            </div>
                            
                            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                              {repo.description || 'No description available'}
                            </p>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3 text-green-600" />
                                <span className="font-medium">{formatHLUSD(repo.totalBounties || 0)} HLUSD</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-orange-500" />
                                <span>{repo.issues?.length || 0} issues</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-blue-500" />
                                <span>{repo.activeBountiesCount || 0} bounties</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <GitBranch className="w-3 h-3 text-purple-500" />
                                <span>{formatHLUSD(poolBalances[repo.id] || 0)} pool</span>
                              </div>
                            </div>
                            
                            {/* Donate Button - Same as Organization Dashboard */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full text-xs"
                              onClick={(e) => {
                                e.stopPropagation()
                                setDonationModal({ isOpen: true, repo })
                              }}
                            >
                              <DollarSign className="w-3 h-3 mr-1" />
                              Donate to Pool
                            </Button>
                          </motion.div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Issues List */}
                <div className="lg:col-span-2">
                  {selectedRepo ? (
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            {selectedRepo.name || selectedRepo.repo_name} Issues
                          </CardTitle>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(selectedRepo.html_url || selectedRepo.github_repo_url, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Repo
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">{selectedRepo.description}</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {(selectedRepo.issues || []).length === 0 ? (
                          <div className="text-center py-8">
                            <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="font-semibold mb-2">No Issues Available</h3>
                            <p className="text-muted-foreground text-sm">
                              This repository doesn't have any issues with bounties yet.
                            </p>
                          </div>
                        ) : (
                          (selectedRepo.issues || []).map((issue, index) => (
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
                                    {issue.body || issue.description || 'No description provided'}
                                  </p>
                                  <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <span>Created: {new Date(issue.created_at).toLocaleDateString()}</span>
                                    {issue.labels && issue.labels.length > 0 && (
                                      <div className="flex items-center gap-1">
                                        <Tag className="w-3 h-3" />
                                        {issue.labels.slice(0, 3).join(', ')}
                                        {issue.labels.length > 3 && ` +${issue.labels.length - 3} more`}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex flex-col gap-2 ml-4">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(issue.html_url || issue.github_issue_url, '_blank')}
                                    className="gap-1"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    View on GitHub
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="gap-1"
                                  >
                                    <DollarSign className="w-3 h-3" />
                                    Start Working
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          Select a Repository
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8">
                          <GitBranch className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="font-semibold mb-2">No Repository Selected</h3>
                          <p className="text-muted-foreground text-sm">
                            {repositories.length === 0 
                              ? "Register a repository first to see available bounties." 
                              : "Select a repository from the list to view its issues and bounties."
                            }
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="completed" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Completed Bounties
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {completedBounties.map((bounty, index) => (
                    <motion.div
                      key={bounty.id}
                      className="p-6 border rounded-lg bg-green-50/50 border-green-200/50"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-lg">{bounty.title}</h3>
                        <Badge className="bg-green-600">
                          <DollarSign className="w-3 h-3 mr-1" />
                          ${bounty.bounty_amount}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {bounty.tech_stack.map((tech) => (
                          <Badge key={tech} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Repository: {bounty.repo}</span>
                        <span>Completed: {new Date(bounty.completed_date).toLocaleDateString()}</span>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Developer Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* MetaMask Connection */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Wallet Connection</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Connect your MetaMask wallet to interact with HelaChain smart contracts.
                    </p>
                    <Button onClick={handleMetaMaskConnect}>
                      Connect MetaMask to HelaChain
                    </Button>
                  </div>

                  {/* Account Information */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Account Information</h3>
                    <div className="space-y-2">
                      <div><strong>GitHub:</strong> {user?.login || 'Not connected'}</div>
                      <div><strong>Email:</strong> {user?.email || 'Not available'}</div>
                      <div><strong>Member Since:</strong> {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Not available'}</div>
                    </div>
                  </div>

                  {/* Notification Preferences */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Notifications</h3>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        Email notifications for new bounty opportunities
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        Browser notifications for bounty updates
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        Weekly summary emails
                      </label>
                    </div>
                  </div>

                  {/* Refresh Data */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Data Management</h3>
                    <div className="space-y-2">
                      <Button onClick={loadDashboardData} variant="outline">
                        Refresh All Data
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Donation Modal - Same as Organization Dashboard */}
      {donationModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-background rounded-lg shadow-xl p-6 w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <h3 className="text-lg font-semibold mb-4">
              Donate to {donationModal.repo?.name}
            </h3>
            <p className="text-muted-foreground mb-4">
              Support this repository by donating to its bounty pool. 
              Your donation will be used to fund bounties for open issues.
            </p>
            <div className="text-sm text-muted-foreground mb-4">
              <strong>Current Pool:</strong> {formatHLUSD(poolBalances[donationModal.repo?.id] || '0')} HLUSD
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Donation Amount (HLUSD)
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-md"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="0"
                  step="0.000001"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={processDonation}
                  disabled={isDonating || !donationAmount}
                  className="flex-1"
                >
                  {isDonating ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4 mr-2" />
                      Donate
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