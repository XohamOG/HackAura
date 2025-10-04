import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import AuthPage from './components/Auth/AuthPage'
import GitHubCallback from './components/Auth/GitHubCallback'

function MainApp() {
  const [status, setStatus] = useState('loading')
  const [showAuth, setShowAuth] = useState(false)
  const location = useLocation()

  useEffect(() => {
    fetch('/health')
      .then((r) => r.json())
      .then((d) => setStatus(d.status))
      .catch(() => setStatus('unreachable'))
  }, [])

  // Show auth page if we're on the auth route
  if (location.pathname === '/auth') {
    return <AuthPage />
  }

  if (showAuth) {
    return <AuthPage />
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 20 }}>
      <h1>GitBountys - Frontend (Vite + React)</h1>
      <p>Backend health: {status}</p>
      <button 
        onClick={() => setShowAuth(true)}
        style={{
          background: '#667eea',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Go to GitBountys Auth
      </button>
      <div style={{ marginTop: '20px', color: '#666', fontSize: '14px' }}>
        <p>🔗 Direct links:</p>
        <a href="/auth" style={{ color: '#667eea', textDecoration: 'none' }}>
          /auth - Authentication Page
        </a>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth/callback" element={<GitHubCallback />} />
        <Route path="*" element={<MainApp />} />
      </Routes>
    </Router>
  )
}
