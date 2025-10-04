import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { DollarSign, CheckCircle, Clock, ExternalLink, GitBranch, TrendingUp, Sparkles, Store } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"

const mockRepositories = [
  {
    id: "1",
    repo_name: "awesome-react-components",
    owner: "ReactMasters",
    github_repo_url: "https://github.com/reactmasters/awesome-react-components",
    description: "A collection of reusable React components with TypeScript support",
    stars: 2340,
    totalBounty: 1800,
    issues: [
      {
        id: "1",
        title: "Add dark mode support",
        description: "Implement dark mode toggle with theme persistence",
        bounty_amount: 500,
        status: "open",
        tech_stack: ["React", "TypeScript", "CSS"],
        github_issue_url: "https://github.com/example/repo/issues/1",
      },
      {
        id: "2",
        title: "Fix responsive layout bug",
        description: "Mobile layout breaks on small screens",
        bounty_amount: 300,
        status: "open",
        tech_stack: ["CSS", "HTML", "React"],
        github_issue_url: "https://github.com/example/repo/issues/2",
      },
      {
        id: "3",
        title: "Add accessibility features",
        description: "Implement ARIA labels and keyboard navigation",
        bounty_amount: 400,
        status: "open",
        tech_stack: ["React", "TypeScript", "Accessibility"],
        github_issue_url: "https://github.com/example/repo/issues/3",
      },
    ],
  },
  {
    id: "2",
    repo_name: "nextjs-starter-kit",
    owner: "WebDevPro",
    github_repo_url: "https://github.com/webdevpro/nextjs-starter-kit",
    description: "Modern Next.js starter template with authentication and database",
    stars: 1890,
    totalBounty: 2400,
    issues: [
      {
        id: "4",
        title: "Integrate Stripe payments",
        description: "Add subscription billing with Stripe",
        bounty_amount: 800,
        status: "open",
        tech_stack: ["Next.js", "Stripe", "TypeScript"],
        github_issue_url: "https://github.com/example/repo/issues/4",
      },
      {
        id: "5",
        title: "Add social login",
        description: "Implement Google and GitHub OAuth",
        bounty_amount: 600,
        status: "open",
        tech_stack: ["Next.js", "OAuth", "Prisma"],
        github_issue_url: "https://github.com/example/repo/issues/5",
      },
    ],
  },
]

const completedBounties = [
  {
    id: "c1",
    title: "Fix API rate limiting",
    repo: "api-gateway",
    bounty_amount: 350,
    completed_date: "2024-01-15",
    tech_stack: ["Node.js", "Express", "Redis"],
  },
  {
    id: "c2",
    title: "Add unit tests",
    repo: "user-service",
    bounty_amount: 250,
    completed_date: "2024-01-10",
    tech_stack: ["Jest", "TypeScript", "Node.js"],
  },
]

export default function DeveloperDashboard() {
  const navigate = useNavigate()
  const [selectedRepo, setSelectedRepo] = useState(mockRepositories[0])

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
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Currently working on</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Tabs defaultValue="browse" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="browse" className="flex items-center gap-2">
                <Store className="w-4 h-4" />
                Browse Issues
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Completed
              </TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Repository List */}
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Available Repositories
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {mockRepositories.map((repo, index) => (
                        <motion.div
                          key={repo.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                            selectedRepo.id === repo.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50 hover:bg-accent/50"
                          }`}
                          onClick={() => setSelectedRepo(repo)}
                          whileHover={{ scale: 1.02 }}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <h3 className="font-semibold text-sm mb-1">{repo.repo_name}</h3>
                          <p className="text-muted-foreground text-xs mb-2">{repo.owner}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              ${repo.totalBounty}
                            </span>
                            <span>{repo.issues.length} issues</span>
                          </div>
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Issues List */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          {selectedRepo.repo_name} Issues
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(selectedRepo.github_repo_url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Repo
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">{selectedRepo.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedRepo.issues.map((issue, index) => (
                        <motion.div
                          key={issue.id}
                          className="p-6 border rounded-lg hover:shadow-md transition-all duration-300 group"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          whileHover={{ scale: 1.01 }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                              {issue.title}
                            </h3>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <DollarSign className="w-3 h-3 mr-1" />
                              ${issue.bounty_amount}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-4">{issue.description}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            {issue.tech_stack.map((tech) => (
                              <Badge key={tech} variant="secondary" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              Open
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(issue.github_issue_url, '_blank')}
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View Issue
                              </Button>
                              <Button size="sm" className="group-hover:shadow-md transition-all">
                                Start Working
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>
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
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}