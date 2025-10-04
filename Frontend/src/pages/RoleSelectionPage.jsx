import React, { useState, useEffect } from 'react'
import { Card } from "../components/ui/card"
import { Building2, Code2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import AnimatedGrid from "../components/AnimatedGrid"

// Animated Taglines Component
const AnimatedTagline = () => {
  const taglines = [
    "Code. Contribute. Claim your bounty.",
    "Rewarding open source, one commit at a time.",
    "Build together, earn together.",
    "Open source meets opportunity.",
    "Fix bugs. Get paid. Simple.",
    "Turning pull requests into paychecks.",
    "Empowering devs through open collaboration.",
    "Bounties for builders, by builders.",
    "Your code deserves more than stars.",
    "Open code. Open rewards."
  ]

  const [currentTagline, setCurrentTagline] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTagline((prev) => (prev + 1) % taglines.length)
    }, 3000) // Change every 3 seconds

    return () => clearInterval(interval)
  }, [taglines.length])

  return (
    <div className="h-16 flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.p
          key={currentTagline}
          className="text-xl md:text-2xl text-muted-foreground text-center max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ 
            duration: 0.5,
            ease: "easeInOut"
          }}
        >
          {taglines[currentTagline]}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}

export default function RoleSelectionPage() {
  const navigate = useNavigate()
  const [hoveredCard, setHoveredCard] = useState(null)
  const [showContent, setShowContent] = useState(false)
  const [loadingComplete, setLoadingComplete] = useState(false)

  useEffect(() => {
    // Show content after loading animation
    const timer1 = setTimeout(() => {
      setShowContent(true)
    }, 2500)

    // Complete loading
    const timer2 = setTimeout(() => {
      setLoadingComplete(true)
    }, 3500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Animated Grid Background - Must be first for proper layering */}
      <AnimatedGrid />
      
      {/* Loading Screen */}
      <AnimatePresence>
        {!loadingComplete && (
          <motion.div
            className="fixed inset-0 z-50 bg-background flex items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <motion.h1
              className="font-aston text-8xl md:text-9xl lg:text-[12rem] text-foreground tracking-wider"
              initial={{ 
                opacity: 0, 
                scale: 0.5,
                rotateZ: -10,
                y: 50
              }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                rotateZ: 0,
                y: 0
              }}
              transition={{ 
                duration: 1.5, 
                ease: "easeOutBack",
                type: "spring",
                stiffness: 100
              }}
            >
              Git Hunters
            </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content - Centered */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen w-full max-w-5xl mx-auto">
        {/* Loading Screen */}
        <AnimatePresence>
          {!loadingComplete && (
            <motion.div
              className="fixed inset-0 bg-background z-50 flex items-center justify-center"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.h1 
                className="text-8xl md:text-9xl font-bold text-foreground"
                style={{ fontFamily: 'Aston Script, cursive' }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              >
                Git Hunters
              </motion.h1>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Container */}
        <motion.div
          className="flex flex-col items-center justify-center space-y-12 w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: loadingComplete ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Title and Animated Taglines */}
          <motion.div
            className="flex flex-col items-center gap-6 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.h1 
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground"
              style={{ fontFamily: 'Aston Script, cursive' }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              Git Hunters
            </motion.h1>
            
            <AnimatedTagline />
          </motion.div>

          {/* Cards Section */}
          <motion.div 
            className="grid md:grid-cols-2 gap-8 w-full max-w-4xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
          {/* Organization Card */}
          <motion.div
            className="h-full"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ 
              duration: 0.6, 
              delay: 1.0,
              ease: "easeOut",
              type: "tween"
            }}
          >
            <Card
              onMouseEnter={() => setHoveredCard("org")}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => navigate("/org/dashboard")}
              style={{
                backgroundColor: hoveredCard === "org" ? "#F5F5DC" : undefined,
                transition: "all 0.3s ease"
              }}
              className={`group relative cursor-pointer transition-all duration-300 hover:shadow-2xl shadow-lg overflow-hidden bg-card border-2 border-border/50 h-full flex flex-col ${
                hoveredCard === "org" ? "dark:!bg-green-950/30 dark:!border-green-500/30" : "hover:border-[#F5F5DC] dark:hover:border-green-500/30"
              }`}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none dark:hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(245, 245, 220, 0.8) 0%, rgba(245, 245, 220, 0.4) 100%)",
                }}
              />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none hidden dark:block"
                style={{
                  background: "linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)",
                }}
              />
              <div className="relative p-10 flex flex-col items-center gap-6 text-center flex-1 justify-center">
                <motion.div 
                  className={`p-8 rounded-2xl bg-primary/5 transition-all duration-300 ${hoveredCard === "org" ? "dark:!bg-green-500/20" : ""}`}
                  whileHover={{ scale: 1.05 }}
                  style={{
                    backgroundColor: hoveredCard === "org" ? "rgba(245, 245, 220, 0.6)" : undefined
                  }}
                >
                  <Building2 
                    className={`w-20 h-20 text-foreground transition-colors duration-300 ${hoveredCard === "org" ? "dark:!text-green-400" : ""}`}
                    style={{
                      color: hoveredCard === "org" ? "#8B4513" : undefined
                    }}
                  />
                </motion.div>
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold text-foreground font-heading">Organization</h2>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Register your repositories, add bounties to issues, and attract top developers to contribute to your
                    projects.
                  </p>
                </div>
                <div 
                  className={`mt-4 px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium text-lg transition-all duration-300 hover:scale-105 ${hoveredCard === "org" ? "dark:!bg-green-500 dark:!text-black" : ""}`}
                  style={{
                    backgroundColor: hoveredCard === "org" ? "#D2B48C" : undefined,
                    color: hoveredCard === "org" ? "#8B4513" : undefined
                  }}
                >
                  Get Started
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Developer Card */}
          <motion.div
            className="h-full"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ 
              duration: 0.6, 
              delay: 1.2,
              ease: "easeOut",
              type: "tween"
            }}
          >
            <Card
              onMouseEnter={() => setHoveredCard("dev")}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => navigate("/dev/dashboard")}
              style={{
                backgroundColor: hoveredCard === "dev" ? "#F5F5DC" : undefined,
                transition: "all 0.3s ease"
              }}
              className={`group relative cursor-pointer transition-all duration-300 hover:shadow-2xl shadow-lg overflow-hidden bg-card border-2 border-border/50 h-full flex flex-col ${
                hoveredCard === "dev" ? "dark:!bg-green-950/30 dark:!border-green-500/30" : "hover:border-[#F5F5DC] dark:hover:border-green-500/30"
              }`}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none dark:hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(245, 245, 220, 0.8) 0%, rgba(245, 245, 220, 0.4) 100%)",
                }}
              />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none hidden dark:block"
                style={{
                  background: "linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)",
                }}
              />
              <div className="relative p-10 flex flex-col items-center gap-6 text-center flex-1 justify-center">
                <motion.div 
                  className={`p-8 rounded-2xl bg-primary/5 transition-all duration-300 ${hoveredCard === "dev" ? "dark:!bg-green-500/20" : ""}`}
                  whileHover={{ scale: 1.05 }}
                  style={{
                    backgroundColor: hoveredCard === "dev" ? "rgba(245, 245, 220, 0.6)" : undefined
                  }}
                >
                  <Code2 
                    className={`w-20 h-20 text-foreground transition-colors duration-300 ${hoveredCard === "dev" ? "dark:!text-green-400" : ""}`}
                    style={{
                      color: hoveredCard === "dev" ? "#8B4513" : undefined
                    }}
                  />
                </motion.div>
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold text-foreground font-heading">Developer</h2>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Browse repositories, find issues matching your skills, earn bounties, and climb the leaderboard.
                  </p>
                </div>
                <div 
                  className={`mt-4 px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium text-lg transition-all duration-300 hover:scale-105 ${hoveredCard === "dev" ? "dark:!bg-green-500 dark:!text-black" : ""}`}
                  style={{
                    backgroundColor: hoveredCard === "dev" ? "#D2B48C" : undefined,
                    color: hoveredCard === "dev" ? "#8B4513" : undefined
                  }}
                >
                  Get Started
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
        </motion.div>
      </div>
    </div>
  )
}