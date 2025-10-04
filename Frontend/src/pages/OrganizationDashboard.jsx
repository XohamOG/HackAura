import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Building2, DollarSign, GitBranch, Users, Plus, ExternalLink, Clock, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"

const mockOrganizationData = {
  name: "TechCorp Solutions",
  totalBountyPool: 15000,
  activeRepositories: 8,
  totalDevelopers: 24,
  repositories: [
    {
      id: "1",
      name: "awesome-react-components",
      description: "A collection of reusable React components",
      bountyPool: 2500,
      activeIssues: 5,
      completedIssues: 12,
      stars: 2340
    },
    {
      id: "2", 
      name: "nextjs-starter-kit",
      description: "Modern Next.js starter template",
      bountyPool: 3200,
      activeIssues: 3,
      completedIssues: 8,
      stars: 1890
    },
    {
      id: "3",
      name: "api-gateway",
      description: "Microservices API gateway",
      bountyPool: 4500,
      activeIssues: 7,
      completedIssues: 15,
      stars: 3210
    }
  ],
  recentActivity: [
    {
      id: "1",
      type: "issue_completed",
      title: "Fix authentication bug",
      developer: "Sarah Chen",
      amount: 300,
      date: "2024-01-20"
    },
    {
      id: "2",
      type: "issue_created",
      title: "Add dark mode support",
      amount: 500,
      date: "2024-01-19"
    },
    {
      id: "3",
      type: "issue_completed",
      title: "Optimize database queries",
      developer: "Alex Rodriguez",
      amount: 400,
      date: "2024-01-18"
    }
  ]
}

export default function OrganizationDashboard() {
  const [selectedRepo, setSelectedRepo] = useState(mockOrganizationData.repositories[0])

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
              <div className="text-2xl font-bold">${mockOrganizationData.totalBountyPool.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Available for bounties</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Repositories</CardTitle>
              <GitBranch className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockOrganizationData.activeRepositories}</div>
              <p className="text-xs text-muted-foreground">With open bounties</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Developers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground group-hover:text-purple-600 transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockOrganizationData.totalDevelopers}</div>
              <p className="text-xs text-muted-foreground">Contributing to projects</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Organization</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground group-hover:text-orange-600 transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{mockOrganizationData.name}</div>
              <p className="text-xs text-muted-foreground">Your organization</p>
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
                {mockOrganizationData.repositories.map((repo, index) => (
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
                          <Button variant="ghost" size="sm">
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
                  {mockOrganizationData.recentActivity.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      className="p-4 border rounded-lg"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {activity.type === 'issue_completed' ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <Plus className="w-4 h-4 text-blue-500" />
                            )}
                            <span className="font-medium">{activity.title}</span>
                          </div>
                          
                          {activity.developer && (
                            <p className="text-sm text-muted-foreground mb-1">
                              Completed by {activity.developer}
                            </p>
                          )}
                          
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.date).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <Badge variant={activity.type === 'issue_completed' ? 'default' : 'secondary'}>
                          <DollarSign className="w-3 h-3 mr-1" />
                          ${activity.amount}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}