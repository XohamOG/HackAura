import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { Navbar } from './components/Navbar'
import ThemeToggle from './components/ThemeToggle'
import ProtectedRoute from './components/ProtectedRoute'
import RoleSelectionPage from './pages/RoleSelectionPage'
import AuthPage from './pages/AuthPage'
import LandingPage from './pages/LandingPage'
import DeveloperDashboard from './pages/DeveloperDashboard'
import OrganizationDashboard from './pages/OrganizationDashboard'
import LeaderboardPage from './pages/LeaderboardPage'

export default function App() {
  console.log('🏠 App component rendering')
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <Navbar />
            <ThemeToggle />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/info" element={<RoleSelectionPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <LandingPage />
                </ProtectedRoute>
              } />
              <Route path="/dev/dashboard" element={
                <ProtectedRoute>
                  <DeveloperDashboard />
                </ProtectedRoute>
              } />
              <Route path="/org/dashboard" element={
                <ProtectedRoute>
                  <OrganizationDashboard />
                </ProtectedRoute>
              } />
              <Route path="/leaderboard" element={
                <ProtectedRoute>
                  <LeaderboardPage />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}
