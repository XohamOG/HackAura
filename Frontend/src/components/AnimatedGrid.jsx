import React from 'react'
import { motion } from 'framer-motion'

const AnimatedGrid = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Subtle Gradient Mesh Background - Matching Theme Colors */}
      <div className="absolute inset-0 opacity-40">
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 25% 25%, rgba(120, 113, 108, 0.08) 0%, transparent 30%),
              radial-gradient(circle at 75% 75%, rgba(168, 162, 158, 0.06) 0%, transparent 30%),
              radial-gradient(circle at 75% 25%, rgba(214, 211, 209, 0.05) 0%, transparent 30%),
              radial-gradient(circle at 25% 75%, rgba(87, 83, 82, 0.07) 0%, transparent 30%)
            `
          }}
        />
      </div>

      {/* Dark theme gradient overlay */}
      <div className="absolute inset-0 opacity-0 dark:opacity-50">
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 20% 20%, rgba(34, 197, 94, 0.12) 0%, transparent 35%),
              radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.10) 0%, transparent 35%),
              radial-gradient(circle at 80% 20%, rgba(5, 150, 105, 0.08) 0%, transparent 35%),
              radial-gradient(circle at 20% 80%, rgba(34, 197, 94, 0.11) 0%, transparent 35%)
            `
          }}
        />
      </div>

      {/* Subtle Floating Geometric Shapes - Positioned in Empty Areas */}
      {[...Array(8)].map((_, i) => {
        const shapes = ['circle', 'square', 'diamond'];
        const shape = shapes[i % shapes.length];
        const positions = [
          // Top corners
          { left: '10%', top: '8%' }, { left: '90%', top: '10%' },
          // Side areas 
          { left: '5%', top: '45%' }, { left: '95%', top: '50%' },
          // Bottom areas
          { left: '15%', top: '85%' }, { left: '85%', top: '88%' },
          // Additional subtle positions
          { left: '20%', top: '20%' }, { left: '80%', top: '25%' }
        ];
        const pos = positions[i] || { left: `${10 + (i * 10)}%`, top: `${15 + (i * 10)}%` };
        
        return (
          <motion.div
            key={`shape-${i}`}
            className={`absolute ${
              shape === 'circle' ? 'w-3 h-3 rounded-full' :
              shape === 'square' ? 'w-3 h-3 rounded-sm' :
              'w-2 h-2 rotate-45'
            } bg-stone-400/30 dark:bg-green-400/40`}
            style={{
              left: pos.left,
              top: pos.top,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2],
              scale: [0.8, 1.1, 0.8],
            }}
            transition={{
              duration: 5 + i,
              ease: "easeInOut",
              repeat: Infinity,
              delay: i * 0.8,
            }}
          />
        );
      })}

      {/* Subtle Animated Lines Network with Wiggle */}
      <svg className="absolute inset-0 w-full h-full" style={{ filter: 'blur(0.5px)' }}>
        {/* Wiggling vertical lines on sides */}
        {[...Array(4)].map((_, i) => (
          <motion.line
            key={`vline-${i}`}
            x1={i < 2 ? `${8 + i * 4}%` : `${84 + (i-2) * 4}%`}
            y1="15%"
            x2={i < 2 ? `${10 + i * 4}%` : `${86 + (i-2) * 4}%`}
            y2="85%"
            stroke="currentColor"
            strokeWidth="1"
            className="text-stone-400/25 dark:text-green-400/35"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: [0, 1, 0],
              opacity: [0, 0.4, 0],
              x1: [0, Math.sin(i) * 2, 0],
              x2: [0, Math.cos(i) * 1.5, 0],
            }}
            transition={{
              duration: 4 + i,
              ease: "easeInOut",
              repeat: Infinity,
              delay: i * 1.2,
            }}
          />
        ))}
        
        {/* Wiggling horizontal lines */}
        {[...Array(2)].map((_, i) => (
          <motion.line
            key={`hline-${i}`}
            x1="15%"
            y1={i === 0 ? "15%" : "85%"}
            x2="85%"
            y2={i === 0 ? "17%" : "87%"}
            stroke="currentColor"
            strokeWidth="1"
            className="text-stone-400/20 dark:text-green-500/30"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: [0, 1, 0],
              opacity: [0, 0.3, 0],
              y1: [0, Math.sin(i * 2) * 1, 0],
              y2: [0, Math.cos(i * 2) * 1, 0],
            }}
            transition={{
              duration: 6,
              ease: "easeInOut",
              repeat: Infinity,
              delay: i * 3,
            }}
          />
        ))}

        {/* Additional wiggling diagonal lines */}
        {[...Array(3)].map((_, i) => (
          <motion.line
            key={`dline-${i}`}
            x1={`${20 + i * 20}%`}
            y1="20%"
            x2={`${30 + i * 20}%`}
            y2="80%"
            stroke="currentColor"
            strokeWidth="0.8"
            className="text-stone-400/15 dark:text-green-400/25"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: [0, 1, 0],
              opacity: [0, 0.25, 0],
              x1: [0, Math.sin(i * 1.5) * 3, 0],
              x2: [0, Math.cos(i * 1.5) * 2, 0],
              y1: [0, Math.cos(i) * 1.5, 0],
              y2: [0, Math.sin(i) * 2, 0],
            }}
            transition={{
              duration: 5 + i * 0.8,
              ease: "easeInOut",
              repeat: Infinity,
              delay: i * 2,
            }}
          />
        ))}
      </svg>

      {/* Ripple Effect */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`ripple-${i}`}
          className="absolute rounded-full border border-primary/10 dark:border-green-400/20"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            width: ['0px', '400px', '800px'],
            height: ['0px', '400px', '800px'],
            opacity: [0.6, 0.2, 0],
            borderWidth: ['2px', '1px', '0px'],
          }}
          transition={{
            duration: 4,
            ease: "easeOut",
            repeat: Infinity,
            delay: i * 1.3,
          }}
        />
      ))}

      {/* Subtle Particle System */}
      {[...Array(12)].map((_, i) => {
        const positions = [
          // Top corners
          { x: 12, y: 8 }, { x: 88, y: 12 },
          // Side areas  
          { x: 8, y: 35 }, { x: 92, y: 40 }, { x: 6, y: 65 }, { x: 94, y: 70 },
          // Bottom areas
          { x: 20, y: 88 }, { x: 80, y: 90 },
          // Additional scattered
          { x: 25, y: 22 }, { x: 75, y: 25 }, { x: 18, y: 75 }, { x: 82, y: 78 }
        ];
        const pos = positions[i] || { x: Math.random() * 100, y: Math.random() * 100 };
        
        return (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 rounded-full bg-stone-400/40 dark:bg-green-400/50"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
            }}
            animate={{
              y: [0, -15, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              ease: "easeInOut",
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        );
      })}

      {/* Single Animated Grid Pattern - More Visible Black Grid for Light Theme */}
      <motion.div 
        className="absolute inset-0 opacity-20 dark:opacity-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
        animate={{
          x: [0, 25, 0],
          y: [0, 18, 0],
        }}
        transition={{
          duration: 22,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />
      
      {/* Dark theme grid - unchanged */}
      <motion.div 
        className="absolute inset-0 opacity-0 dark:opacity-15"
        style={{
          backgroundImage: `
            linear-gradient(rgba(34, 197, 94, 0.25) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 197, 94, 0.25) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
        animate={{
          x: [0, 25, 0],
          y: [0, 18, 0],
        }}
        transition={{
          duration: 22,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />
      
      {/* Subtle Corner Gradients */}
      <motion.div 
        className="absolute top-0 left-0 w-80 h-80 bg-gradient-to-br from-stone-400/8 to-transparent dark:from-green-400/12 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div 
        className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-stone-500/6 to-transparent dark:from-green-500/10 rounded-full blur-3xl" 
        animate={{
          scale: [1.05, 1, 1.05],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
    </div>
  )
}

export default AnimatedGrid