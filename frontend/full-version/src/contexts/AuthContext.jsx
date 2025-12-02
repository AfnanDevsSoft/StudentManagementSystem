// Authentication Context and Guard for Phase 2
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import authService from '@/services/authService'

// Create Auth Context
const AuthContext = createContext(null)

/**
 * Auth Provider Component
 * Manages authentication state and provides auth methods to all children
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Initialize auth on mount
  useEffect(() => {
    const initializeAuth = () => {
      const currentUser = authService.getCurrentUser()
      const token = authService.getToken()

      if (token && !authService.isTokenExpired()) {
        setUser(currentUser)
        setIsAuthenticated(true)
      } else if (token && authService.isTokenExpired()) {
        // Token expired, logout
        handleLogout()
      } else {
        setIsAuthenticated(false)
      }

      setLoading(false)
    }

    initializeAuth()
  }, [])

  /**
   * Handle login
   */
  const handleLogin = async (email, password) => {
    try {
      setLoading(true)
      const result = await authService.login({ email, password })

      if (result.success) {
        setUser(result.user)
        setIsAuthenticated(true)
        return { success: true, user: result.user }
      }

      return result
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: error.message }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle logout
   */
  const handleLogout = () => {
    authService.logout()
    setUser(null)
    setIsAuthenticated(false)
    router.push('/login')
  }

  /**
   * Check if token needs refresh
   */
  const checkTokenValidity = () => {
    if (authService.isTokenExpired()) {
      handleLogout()
      return false
    }
    return true
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    handleLogin,
    handleLogout,
    checkTokenValidity,
    getToken: () => authService.getToken()
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Custom hook to use Auth Context
 */
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

/**
 * Higher-order component for protected routes
 */
export function withAuthGuard(Component) {
  return function ProtectedComponent(props) {
    const { isAuthenticated, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!loading && !isAuthenticated) {
        router.push('/login')
      }
    }, [isAuthenticated, loading, router])

    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <p>Loading...</p>
        </div>
      )
    }

    if (!isAuthenticated) {
      return null
    }

    return <Component {...props} />
  }
}
