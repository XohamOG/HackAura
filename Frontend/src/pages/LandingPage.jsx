import React, { useState, useEffect } from 'react'
import { Card } from "../components/ui/card"
import { Building2, Code2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import DotGrid from "../components/DotGrid"

export default function LandingPage() {
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
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
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
              Git Hunter
            </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Original background elements with reduced opacity */}
      <div className="absolute inset-0 -z-10">
        <motion.div 
          className="absolute top-20 left-10 w-96 h-96 bg-primary/3 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2] 
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.2, 0.1] 
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 1 
          }}
        />
      </div>

      {/* Interactive Dot Grid Background - Above content */}
      <div className="absolute inset-0 z-0">
        <DotGrid
          dotSize={4}
          gap={35}
          baseColor="#64748b"
          activeColor="#F5F5DC"
          proximity={150}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
          className=""
        />
      </div>

      {/* Main Content */}
      <motion.div 
        className="max-w-6xl w-full flex flex-col items-center gap-16 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Title Section - Always visible after loading */}
        <AnimatePresence>
          {showContent && (
            <motion.div 
              className="text-center space-y-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOutBack" }}
            >
              <motion.h1 
                className="font-aston text-8xl md:text-9xl lg:text-[10rem] text-foreground tracking-wider"
                initial={{ opacity: 0, scale: 0.8, rotateZ: -5 }}
                animate={{ opacity: 1, scale: 1, rotateZ: 0 }}
                transition={{ duration: 1.2, delay: 0.2, ease: "easeOutBack" }}
              >
                Git Hunter
              </motion.h1>
              <motion.p 
                className="text-2xl md:text-3xl font-heading text-foreground/80 tracking-wide"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Build open source, earn rewards
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cards Section - Always visible */}
        <motion.div 
          className="grid md:grid-cols-2 gap-8 w-full max-w-4xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
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
              className="group relative cursor-pointer transition-all duration-700 hover:shadow-2xl shadow-lg overflow-hidden bg-card border-2 border-border/50 hover:border-[#F5F5DC] h-full flex flex-col"
              onMouseEnter={() => setHoveredCard("org")}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => navigate("/org/dashboard")}
              style={{
                backgroundColor: hoveredCard === "org" ? "#F5F5DC" : undefined,
                transition: "all 0.7s ease"
              }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{
                  background: "linear-gradient(135deg, rgba(245, 245, 220, 0.8) 0%, rgba(245, 245, 220, 0.4) 100%)",
                }}
              />
              <div className="relative p-12 flex flex-col items-center gap-6 text-center flex-1 justify-center">
                <motion.div 
                  className="p-8 rounded-2xl bg-primary/5 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  style={{
                    backgroundColor: hoveredCard === "org" ? "rgba(245, 245, 220, 0.6)" : undefined
                  }}
                >
                  <Building2 className="w-20 h-20 text-foreground transition-colors duration-700" 
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
                  className="mt-4 px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium text-lg transition-all duration-300 hover:scale-105"
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
              className="group relative cursor-pointer transition-all duration-700 hover:shadow-2xl shadow-lg overflow-hidden bg-card border-2 border-border/50 hover:border-[#F5F5DC] h-full flex flex-col"
              onMouseEnter={() => setHoveredCard("dev")}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => navigate("/dev/dashboard")}
              style={{
                backgroundColor: hoveredCard === "dev" ? "#F5F5DC" : undefined,
                transition: "all 0.7s ease"
              }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{
                  background: "linear-gradient(135deg, rgba(245, 245, 220, 0.8) 0%, rgba(245, 245, 220, 0.4) 100%)",
                }}
              />
              <div className="relative p-12 flex flex-col items-center gap-6 text-center flex-1 justify-center">
                <motion.div 
                  className="p-8 rounded-2xl bg-primary/5 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  style={{
                    backgroundColor: hoveredCard === "dev" ? "rgba(245, 245, 220, 0.6)" : undefined
                  }}
                >
                  <Code2 className="w-20 h-20 text-foreground transition-colors duration-700" 
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
                  className="mt-4 px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium text-lg transition-all duration-300 hover:scale-105"
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
  )
}