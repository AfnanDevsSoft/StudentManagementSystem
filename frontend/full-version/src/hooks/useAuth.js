import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useState } from 'react'

export const useAuth = () => {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)

  // Load token to localStorage for API requests
  useEffect(() => {
    if (status === 'loading') return

    if (session?.user?.accessToken) {
      // Store token in localStorage for API calls
      localStorage.setItem('access_token', session.user.accessToken)
      localStorage.setItem('refresh_token', session.user.refreshToken || '')
      localStorage.setItem('user_role', session.user.role || '')
      localStorage.setItem('user_id', session.user.id || '')
      localStorage.setItem('username', session.user.username || '')
      
      // Set auth header in fetch/axios interceptors
      window.authToken = session.user.accessToken
    } else {
      // Clear localStorage on logout
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_role')
      localStorage.removeItem('user_id')
      localStorage.removeItem('username')
      window.authToken = null
    }

    setIsLoading(false)
  }, [session, status])

  const getAccessToken = useCallback(() => {
    return session?.user?.accessToken || localStorage.getItem('access_token')
  }, [session])

  const getRefreshToken = useCallback(() => {
    return session?.user?.refreshToken || localStorage.getItem('refresh_token')
  }, [session])

  const getUserRole = useCallback(() => {
    return session?.user?.role || localStorage.getItem('user_role')
  }, [session])

  const getUserId = useCallback(() => {
    return session?.user?.id || localStorage.getItem('user_id')
  }, [session])

  const getUsername = useCallback(() => {
    return session?.user?.username || localStorage.getItem('username')
  }, [session])

  const isAuthenticated = !!session?.user
  const isAdmin = session?.user?.role === 'SuperAdmin'
  const isTeacher = session?.user?.role === 'BranchAdmin' || session?.user?.role === 'Teacher'
  const isStudent = session?.user?.role === 'Student'

  return {
    session,
    status,
    isLoading,
    isAuthenticated,
    user: session?.user,
    getAccessToken,
    getRefreshToken,
    getUserRole,
    getUserId,
    getUsername,
    isAdmin,
    isTeacher,
    isStudent
  }
}

export default useAuth
