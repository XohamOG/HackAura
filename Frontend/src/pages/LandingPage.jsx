import React, { useState } from 'react'
import { Card } from "../components/ui/card"
import { Building2, Code2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"

export default function LandingPage() {
  const navigate = useNavigate()
  const [hoveredCard, setHoveredCard] = useState(null)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <motion.div 
          className="absolute top-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3] 
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2] 
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 1 
          }}
        />
      </div>

      <motion.div 
        className="max-w-6xl w-full flex flex-col items-center gap-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center space-y-6">
          <motion.h1 
            className="font-calligraphic text-8xl md:text-9xl lg:text-[10rem] text-foreground tracking-wide animate-text-shimmer"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Git Hunter
          </motion.h1>
          <motion.p 
            className="text-2xl md:text-3xl font-heading text-foreground/80 tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Build open source, earn rewards
          </motion.p>
        </div>

        <motion.div 
          className="grid md:grid-cols-2 gap-8 w-full max-w-4xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card
              className="group relative cursor-pointer transition-all duration-700 hover:shadow-2xl shadow-lg overflow-hidden bg-card border-2 border-border/50 hover:border-primary/30"
              onMouseEnter={() => setHoveredCard("org")}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => navigate("/org/dashboard")}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{
                  background: "linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.02) 100%)",
                }}
              />
              <div className="relative p-12 flex flex-col items-center gap-6 text-center">
                <motion.div 
                  className="p-8 rounded-2xl bg-primary/5 group-hover:bg-primary/10 transition-all duration-700"
                  whileHover={{ scale: 1.1, rotate: 6 }}
                >
                  <Building2 className="w-20 h-20 text-foreground" />
                </motion.div>
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold text-foreground font-heading">Organization</h2>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Register your repositories, add bounties to issues, and attract top developers to contribute to your
                    projects.
                  </p>
                </div>
                <motion.div 
                  className="mt-4 px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium text-lg"
                  whileHover={{ scale: 1.05, paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                  transition={{ duration: 0.3 }}
                >
                  Get Started
                </motion.div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card
              className="group relative cursor-pointer transition-all duration-700 hover:shadow-2xl shadow-lg overflow-hidden bg-card border-2 border-border/50 hover:border-primary/30"
              onMouseEnter={() => setHoveredCard("dev")}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => navigate("/dev/dashboard")}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{
                  background: "linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.02) 100%)",
                }}
              />
              <div className="relative p-12 flex flex-col items-center gap-6 text-center">
                <motion.div 
                  className="p-8 rounded-2xl bg-primary/5 group-hover:bg-primary/10 transition-all duration-700"
                  whileHover={{ scale: 1.1, rotate: 6 }}
                >
                  <Code2 className="w-20 h-20 text-foreground" />
                </motion.div>
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold text-foreground font-heading">Developer</h2>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Browse repositories, find issues matching your skills, earn bounties, and climb the leaderboard.
                  </p>
                </div>
                <motion.div 
                  className="mt-4 px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium text-lg"
                  whileHover={{ scale: 1.05, paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                  transition={{ duration: 0.3 }}
                >
                  Get Started
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}