import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Building2, DollarSign, GitBranch, Users, Plus, ExternalLink, Clock, CheckCircle, Loader2, AlertCircle, Star, FileText, Tag } from "lucide-react"
import { motion } from "framer-motion"

export default function OrganizationDashboard() {
  const [repositories, setRepositories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRepo, setSelectedRepo] = useState(null)
  const [issuesModal, setIssuesModal] = useState({ isOpen: false, repo: null, issues: [] })
  const [bountyModal, setBountyModal] = useState({ isOpen: false, issue: null })
  const [bountyAmount, setBountyAmount] = useState('')
  const [isAddingBounty, setIsAddingBounty] = useState(false)

  // Mock issues data (in real app, this would come from GitHub API)
  const mockIssues = [
    {
      id: 1,
      title: "Add dark mode support",
      description: "Implement dark mode toggle with theme persistence across the application",
      state: "open",
      labels: ["enhancement", "ui"],
      created_at: "2024-01-15",
      bounty_amount: 0,
      html_url: "https://github.com/example/repo/issues/1"
    },
    {
      id: 2,
      title: "Fix responsive layout bug",
      description: "Mobile layout breaks on small screens, need to fix CSS grid issues",
      state: "open",
      labels: ["bug", "css"],
      created_at: "2024-01-10",
      bounty_amount: 0,
      html_url: "https://github.com/example/repo/issues/2"
    },
    {
      id: 3,
      title: "Add accessibility features",
      description: "Implement ARIA labels and keyboard navigation for better accessibility",
      state: "open",
      labels: ["accessibility", "enhancement"],
      created_at: "2024-01-08",
      bounty_amount: 0,
      html_url: "https://github.com/example/repo/issues/3"
    },
    {
      id: 4,
      title: "Update documentation",
      description: "API documentation needs to be updated with latest changes",
      state: "open",
      labels: ["documentation"],
      created_at: "2024-01-05",
      bounty_amount: 0,
      html_url: "https://github.com/example/repo/issues/4"
    }
  ]

  // Function to handle viewing issues
  const handleViewIssues = (repo) => {
    setIssuesModal({ isOpen: true, repo, issues: mockIssues })
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

    setIsAddingBounty(true)

    try {
      // Simulate API call to add bounty
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update the issue with the bounty amount
      const updatedIssues = issuesModal.issues.map(issue => 
        issue.id === bountyModal.issue.id 
          ? { ...issue, bounty_amount: parseFloat(bountyAmount) }
          : issue
      )
      
      setIssuesModal(prev => ({ ...prev, issues: updatedIssues }))
      
      alert(`✅ Bounty of $${bountyAmount} added successfully!`)
      setBountyModal({ isOpen: false, issue: null })
      setBountyAmount('')

    } catch (error) {
      console.error('❌ Failed to add bounty:', error)
      alert('Failed to add bounty. Please try again.')
    } finally {
      setIsAddingBounty(false)
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
                            className="flex-1"
                            onClick={() => handleViewIssues(repo)}
                          >
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
                  {issuesModal.issues.length} open issues
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
              {issuesModal.issues.map((issue, index) => (
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
                            ${issue.bounty_amount} bounty
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
              ))}
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
                <strong>Current Bounty:</strong> ${bountyModal.issue?.bounty_amount || 0}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Bounty Amount (USD)
                </label>
                <input
                  type="number"
                  step="10"
                  min="10"
                  placeholder="100"
                  value={bountyAmount}
                  onChange={(e) => setBountyAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum: $10 USD
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={processAddBounty}
                  disabled={isAddingBounty || !bountyAmount}
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
                      Add Bounty
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
                <p>💰 Bounties help attract skilled developers</p>
                <p>🚀 Higher bounties get faster results</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}