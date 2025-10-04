import React from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Trophy, Medal, Award, DollarSign, CheckCircle, GitBranch } from "lucide-react"
import { motion } from "framer-motion"

const topDevelopers = [
  {
    user_id: "1",
    name: "Sarah Chen",
    issues_completed: 15,
    total_bounties_earned: 2850,
    avatar: "SC"
  },
  {
    user_id: "2",
    name: "Alex Rodriguez",
    issues_completed: 12,
    total_bounties_earned: 2400,
    avatar: "AR"
  },
  {
    user_id: "3", 
    name: "Jordan Kim",
    issues_completed: 10,
    total_bounties_earned: 1950,
    avatar: "JK"
  },
  {
    user_id: "4",
    name: "Taylor Swift",
    issues_completed: 8,
    total_bounties_earned: 1600,
    avatar: "TS"
  },
  {
    user_id: "5",
    name: "Morgan Freeman",
    issues_completed: 7,
    total_bounties_earned: 1400,
    avatar: "MF"
  }
]

const topOrganizations = [
  {
    user_id: "1",
    name: "TechCorp Solutions",
    total_pool: 15000,
    repo_count: 8,
    avatar: "TC"
  },
  {
    user_id: "2",
    name: "OpenStack Foundation",
    total_pool: 12500,
    repo_count: 12,
    avatar: "OF"
  },
  {
    user_id: "3",
    name: "DevHub Inc",
    total_pool: 10800,
    repo_count: 6,
    avatar: "DI"
  },
  {
    user_id: "4",
    name: "CloudFirst Labs",
    total_pool: 8900,
    repo_count: 5,
    avatar: "CL"
  },
  {
    user_id: "5",
    name: "AI Research Group",
    total_pool: 7200,
    repo_count: 4,
    avatar: "AR"
  }
]

const getRankIcon = (index) => {
  switch (index) {
    case 0:
      return <Trophy className="w-6 h-6 text-yellow-500" />
    case 1:
      return <Medal className="w-6 h-6 text-gray-400" />
    case 2:
      return <Award className="w-6 h-6 text-amber-600" />
    default:
      return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-muted-foreground">#{index + 1}</span>
  }
}

const getRankColor = (index) => {
  switch (index) {
    case 0:
      return "border-yellow-200 bg-yellow-50/50"
    case 1:
      return "border-gray-200 bg-gray-50/50"
    case 2:
      return "border-amber-200 bg-amber-50/50"
    default:
      return "border-border"
  }
}

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold font-heading mb-2">Leaderboard</h1>
          <p className="text-muted-foreground text-lg">Top performers in the Git Hunter community</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs defaultValue="developers" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="developers" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Top Developers
              </TabsTrigger>
              <TabsTrigger value="organizations" className="flex items-center gap-2">
                <GitBranch className="w-4 h-4" />
                Top Organizations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="developers" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                    Top Developers by Earnings
                  </CardTitle>
                  <CardDescription>
                    Developers ranked by total bounty earnings and issues completed
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="space-y-4">
                {topDevelopers.map((developer, index) => (
                  <motion.div
                    key={developer.user_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className={`transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${getRankColor(index)}`}>
                      <div className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3">
                            {getRankIcon(index)}
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                              {developer.avatar}
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold">{developer.name}</h3>
                            <div className="flex items-center gap-6 mt-2 text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4 text-green-600" />
                                <span className="font-medium">${developer.total_bounties_earned}</span>
                                <span className="text-sm">earned</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <CheckCircle className="w-4 h-4 text-blue-600" />
                                <span className="font-medium">{developer.issues_completed}</span>
                                <span className="text-sm">issues completed</span>
                              </div>
                            </div>
                          </div>

                          {index < 3 && (
                            <motion.div
                              className="text-right"
                              animate={{ 
                                scale: [1, 1.1, 1],
                                opacity: [0.7, 1, 0.7]
                              }}
                              transition={{ 
                                duration: 2, 
                                repeat: Infinity, 
                                ease: "easeInOut" 
                              }}
                            >
                              <div className="text-2xl font-bold text-primary">
                                #{index + 1}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="organizations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="w-6 h-6 text-blue-500" />
                    Top Organizations by Bounty Pool
                  </CardTitle>
                  <CardDescription>
                    Organizations ranked by total bounty pool and repository count
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="space-y-4">
                {topOrganizations.map((org, index) => (
                  <motion.div
                    key={org.user_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className={`transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${getRankColor(index)}`}>
                      <div className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3">
                            {getRankIcon(index)}
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-700">
                              {org.avatar}
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold">{org.name}</h3>
                            <div className="flex items-center gap-6 mt-2 text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4 text-green-600" />
                                <span className="font-medium">${org.total_pool.toLocaleString()}</span>
                                <span className="text-sm">total pool</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <GitBranch className="w-4 h-4 text-purple-600" />
                                <span className="font-medium">{org.repo_count}</span>
                                <span className="text-sm">repositories</span>
                              </div>
                            </div>
                          </div>

                          {index < 3 && (
                            <motion.div
                              className="text-right"
                              animate={{ 
                                scale: [1, 1.1, 1],
                                opacity: [0.7, 1, 0.7]
                              }}
                              transition={{ 
                                duration: 2, 
                                repeat: Infinity, 
                                ease: "easeInOut" 
                              }}
                            >
                              <div className="text-2xl font-bold text-blue-600">
                                #{index + 1}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}