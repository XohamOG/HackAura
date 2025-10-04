import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import LandingPage from './pages/LandingPage'
import DeveloperDashboard from './pages/DeveloperDashboard'
import OrganizationDashboard from './pages/OrganizationDashboard'
import LeaderboardPage from './pages/LeaderboardPage'

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dev/dashboard" element={<DeveloperDashboard />} />
          <Route path="/org/dashboard" element={<OrganizationDashboard />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
        </Routes>
      </div>
    </Router>
  )
}
