import React, { useState } from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Trophy, Medal, Award, DollarSign, CheckCircle, GitBranch, Heart, Loader2 } from "lucide-react"
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
    avatar: "TC",
    description: "Leading enterprise software solutions",
    walletAddress: "0x742d35Cc6635C0532925a3b8D0b17A30C6638bF1"
  },
  {
    user_id: "2",
    name: "OpenStack Foundation",
    total_pool: 12500,
    repo_count: 12,
    avatar: "OF",
    description: "Open source cloud computing platform",
    walletAddress: "0x123abc456def789ghi012jkl345mno678pqr901st"
  },
  {
    user_id: "3",
    name: "DevHub Inc",
    total_pool: 10800,
    repo_count: 6,
    avatar: "DI",
    description: "Developer tools and collaboration platform",
    walletAddress: "0x987zyx654wvu321tsr098qpo765nml432kji109hg"
  },
  {
    user_id: "4",
    name: "CloudFirst Labs",
    total_pool: 8900,
    repo_count: 5,
    avatar: "CL",
    description: "Cloud-native development solutions",
    walletAddress: "0xabc123def456ghi789jkl012mno345pqr678stu901"
  },
  {
    user_id: "5",
    name: "AI Research Group",
    total_pool: 7200,
    repo_count: 4,
    avatar: "AR",
    description: "Artificial intelligence and machine learning",
    walletAddress: "0x456def789abc012ghi345jkl678mno901pqr234stu"
  },
  {
    user_id: "6",
    name: "Blockchain Builders",
    total_pool: 9500,
    repo_count: 7,
    avatar: "BB",
    description: "Decentralized applications and smart contracts",
    walletAddress: "0x789ghi012def345abc678jkl901mno234pqr567stu"
  },
  {
    user_id: "7",
    name: "CyberSec Solutions",
    total_pool: 11200,
    repo_count: 9,
    avatar: "CS",
    description: "Cybersecurity and privacy tools",
    walletAddress: "0x234pqr567stu890abc123def456ghi789jkl012mno"
  },
  {
    user_id: "8",
    name: "GameDev Studio",
    total_pool: 6800,
    repo_count: 11,
    avatar: "GS",
    description: "Interactive gaming and entertainment",
    walletAddress: "0x567stu890pqr123abc456def789ghi012jkl345mno"
  },
  {
    user_id: "9",
    name: "FinTech Innovations",
    total_pool: 13400,
    repo_count: 6,
    avatar: "FI",
    description: "Financial technology and payment solutions",
    walletAddress: "0x890abc123def456ghi789jkl012mno345pqr678stu"
  },
  {
    user_id: "10",
    name: "Green Tech Initiative",
    total_pool: 5600,
    repo_count: 8,
    avatar: "GT",
    description: "Sustainable technology and environmental solutions",
    walletAddress: "0x123def456abc789ghi012jkl345mno678pqr901stu"
  },
  {
    user_id: "11",
    name: "DataViz Collective",
    total_pool: 7900,
    repo_count: 5,
    avatar: "DV",
    description: "Data visualization and analytics tools",
    walletAddress: "0x456abc789def012ghi345jkl678mno901pqr234stu"
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
  const [donationModal, setDonationModal] = useState({ isOpen: false, organization: null })
  const [donationAmount, setDonationAmount] = useState('')
  const [isDonating, setIsDonating] = useState(false)
  const [organizations, setOrganizations] = useState(topOrganizations)

  // Donation function
  const handleDonate = async (organization) => {
    setDonationModal({ isOpen: true, organization })
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

      // Use the organization's wallet address
      const recipientAddress = donationModal.organization.walletAddress

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
      
      // Update the organization's total pool locally
      setOrganizations(prevOrgs => 
        prevOrgs.map(org => 
          org.user_id === donationModal.organization.user_id 
            ? { ...org, total_pool: org.total_pool + parseFloat(donationAmount) * 3000 } // Convert ETH to USD equivalent
            : org
        )
      )

      alert(`🎉 Donation successful! Transaction hash: ${txHash}`)
      setDonationModal({ isOpen: false, organization: null })
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
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold font-heading mb-2">Leaderboard</h1>
          <p className="text-muted-foreground text-lg">Top performers in the Git Hunters community</p>
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
                {organizations.map((org, index) => (
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
                            <p className="text-sm text-muted-foreground mt-1">{org.description}</p>
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

                          <div className="flex flex-col items-end gap-3">
                            <Button
                              onClick={() => handleDonate(org)}
                              className="gap-2"
                              size="sm"
                            >
                              <Heart className="w-4 h-4" />
                              Donate
                            </Button>

                            {index < 3 && (
                              <motion.div
                                className="text-center"
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
                                <div className="text-lg font-bold text-blue-600">
                                  #{index + 1}
                                </div>
                              </motion.div>
                            )}
                          </div>
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
              <h3 className="text-lg font-semibold">Donate to {donationModal.organization?.name}</h3>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Support this organization by donating cryptocurrency. Your donation will help fund their open source projects and bounties.
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
                  <strong>Organization:</strong> {donationModal.organization?.name}<br />
                  <strong>Description:</strong> {donationModal.organization?.description}<br />
                  <strong>Current Pool:</strong> ${donationModal.organization?.total_pool?.toLocaleString()}<br />
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
                    setDonationModal({ isOpen: false, organization: null })
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
                <p>💝 Your support helps fund open source development</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}