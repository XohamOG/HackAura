import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Loader2 } from 'lucide-react'

const GitHubCallback = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { checkAuthStatus, metamaskConnected } = useAuth()

  useEffect(() => {
    const handleGitHubCallback = async () => {
      const code = searchParams.get('code')
      const error = searchParams.get('error')

      console.log('🔍 GitHubCallback - URL params:', { code: !!code, error })

      if (error) {
        console.error('GitHub OAuth error:', error)
        alert('GitHub authentication failed. Please try again.')
        navigate('/auth')
        return
      }

      if (code) {
        try {
          console.log('🔄 Exchanging GitHub authorization code for token...')
          
          // Exchange authorization code for access token
          const response = await fetch('/api/auth/github/exchange', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          })

          console.log('📡 Exchange response status:', response.status)

          if (response.ok) {
            const data = await response.json()
            console.log('✅ Token exchange successful')
            
            // Store the token in localStorage
            localStorage.setItem('github_token', data.access_token)
            console.log('💾 GitHub token stored in localStorage')
            
            // Update auth status
            checkAuthStatus()
            
            // Wait a moment for auth status to update, then redirect
            setTimeout(() => {
              console.log('🔄 Checking MetaMask connection status:', metamaskConnected)
              
              // Always redirect to auth page - it will auto-redirect to role selection if both are connected
              console.log('📝 Redirecting to auth page...')
              navigate('/auth', { replace: true })
            }, 500)
          } else {
            const errorData = await response.text()
            console.error('❌ Token exchange failed:', errorData)
            throw new Error('Token exchange failed')
          }
        } catch (error) {
          console.error('❌ Error exchanging GitHub code:', error)
          alert('Failed to complete GitHub authentication. Please try again.')
          navigate('/auth')
        }
      } else {
        console.log('❌ No authorization code found, redirecting to auth')
        navigate('/auth')
      }
    }

    handleGitHubCallback()
  }, [searchParams, navigate, checkAuthStatus, metamaskConnected])

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Processing GitHub Authentication...
        </h2>
        <p className="text-muted-foreground">
          Please wait while we complete your GitHub connection.
        </p>
      </div>
    </div>
  )
}

export default GitHubCallback