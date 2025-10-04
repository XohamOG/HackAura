import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Code2, GitBranch, Coins, Users } from 'lucide-react'
import AnimatedGrid from '../components/AnimatedGrid'

const InfoPage = () => {
  const navigate = useNavigate()
  const [showTitle, setShowTitle] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    // Show title first
    const timer1 = setTimeout(() => setShowTitle(true), 500)
    // Show content after title
    const timer2 = setTimeout(() => setShowContent(true), 2000)
    // Show button last
    const timer3 = setTimeout(() => setShowButton(true), 3500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [])

  const features = [
    {
      icon: <Code2 className="w-8 h-8" />,
      title: "Open Source Development",
      description: "Contribute to meaningful projects and build your portfolio while earning rewards for your contributions."
    },
    {
      icon: <GitBranch className="w-8 h-8" />,
      title: "GitHub Integration", 
      description: "Seamlessly connect your GitHub account to track your contributions and showcase your development skills."
    },
    {
      icon: <Coins className="w-8 h-8" />,
      title: "Earn Bounties",
      description: "Get paid for your code contributions, bug fixes, and feature implementations through our bounty system."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Developer Community",
      description: "Join a vibrant community of developers, collaborate on projects, and learn from experienced contributors."
    }
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Animated Grid Background */}
      <AnimatedGrid />

      <div className="relative z-20 max-w-6xl mx-auto text-center">
        {/* Main Title Animation */}
        <AnimatePresence>
          {showTitle && (
            <motion.div
              className="mb-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
            >
              <motion.h1 
                className="text-6xl md:text-8xl lg:text-9xl font-bold text-foreground mb-6"
                style={{ fontFamily: 'Aston Script, cursive' }}
                initial={{ scale: 0.5, rotateZ: -10 }}
                animate={{ scale: 1, rotateZ: 0 }}
                transition={{ 
                  duration: 1.8, 
                  ease: "easeOutBack",
                  type: "spring",
                  stiffness: 100
                }}
              >
                Git Hunters
              </motion.h1>
              
              <motion.p
                className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                Where open source meets opportunity. Connect, contribute, and get rewarded for your code.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Features Grid */}
        <AnimatePresence>
          {showContent && (
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 text-center hover:bg-card/70 transition-all duration-200"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  whileHover={{ 
                    scale: 1.03, 
                    y: -8,
                    boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
                    transition: { duration: 0.2, ease: "easeOut" }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex justify-center mb-4 text-primary dark:text-green-400">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Get Started Button */}
        <AnimatePresence>
          {showButton && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            >
              <motion.button
                onClick={() => navigate('/auth')}
                className="group bg-primary hover:bg-primary/90 dark:bg-green-600 dark:hover:bg-green-700 text-primary-foreground px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 flex items-center gap-3 mx-auto shadow-lg hover:shadow-xl"
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
                  transition: { duration: 0.15, ease: "easeOut" }
                }}
                whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default InfoPage