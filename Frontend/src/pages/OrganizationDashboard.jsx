import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Building2, DollarSign, GitBranch, Users, Plus, ExternalLink, Clock, CheckCircle, Loader2, AlertCircle, Star } from "lucide-react"
import { motion } from "framer-motion"

export default function OrganizationDashboard() {
  const [repositories, setRepositories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRepo, setSelectedRepo] = useState(null)

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
                          <Button size="sm" className="flex-1">
                            Add Bounty
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
    </div>
  )
}