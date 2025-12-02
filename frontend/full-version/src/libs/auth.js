// Third-party Imports
import CredentialProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const authOptions = {
  adapter: PrismaAdapter(prisma),

  // ** Configure one or more authentication providers
  providers: [
    CredentialProvider({
      // ** The name to display on the sign in form (e.g. 'Sign in with...')
      name: 'Credentials',
      type: 'credentials',

      credentials: {},
      async authorize(credentials) {
        const { email, password } = credentials

        try {
          // ** Login API Call to the backend
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'
          const res = await fetch(`${apiUrl}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              username: email,  // Backend expects username
              password 
            })
          })

          const data = await res.json()

          console.log('Auth Response:', { status: res.status, success: data.success, role: data.data?.user?.role?.name })

          if (res.status === 401) {
            throw new Error(JSON.stringify({ message: [data.message || 'Invalid credentials'] }))
          }

          if (res.status === 200 && data.success) {
            // Extract user data from backend response
            const userData = data.data?.user || {}
            
            // Get role name - handle both object and string formats
            const roleName = typeof userData.role === 'string' 
              ? userData.role 
              : userData.role?.name || 'user'
            
            // Return user object with tokens
            const userObj = {
              id: userData.id,
              email: userData.email || userData.username + '@koolhub.edu',
              name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.username,
              username: userData.username,
              role: roleName,
              accessToken: data.data?.access_token,
              refreshToken: data.data?.refresh_token,
              userId: userData.id,
              branchId: userData.branch_id
            }

            console.log('Authorized User:', userObj)
            return userObj
          }

          throw new Error(JSON.stringify({ message: [data.message || 'Login failed'] }))
        } catch (e) {
          console.error('Authorization Error:', e)
          const errorMessage = e.message
          try {
            const parsedError = JSON.parse(errorMessage)
            throw new Error(JSON.stringify(parsedError))
          } catch {
            throw new Error(JSON.stringify({ message: [errorMessage || 'An error occurred during login'] }))
          }
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  ],

  // ** Session configuration
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60 // Update every 24 hours
  },

  // ** JWT configuration
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },

  // ** Pages configuration
  pages: {
    signIn: '/login',
    error: '/login'
  },

  // ** Event callbacks for logging
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('SignIn Event:', { user: user?.username, isNewUser })
    },
    async signOut({ token }) {
      console.log('SignOut Event:', { user: token?.username })
    }
  },

  // ** Callbacks configuration
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.username = user.username
        token.role = user.role
        token.accessToken = user.accessToken
        token.refreshToken = user.refreshToken
        token.name = user.name || user.username
        token.userId = user.userId
        token.branchId = user.branchId
        token.issuedAt = Date.now()

        console.log('JWT Token Created:', { 
          username: token.username, 
          role: token.role,
          accessToken: !!token.accessToken 
        })
      }

      // Token refresh logic
      if (token.accessToken && token.issuedAt) {
        const tokenAge = Date.now() - token.issuedAt
        const refreshThreshold = 25 * 24 * 60 * 60 * 1000 // Refresh after 25 days

        if (tokenAge > refreshThreshold && token.refreshToken) {
          console.log('Refreshing token...')
          try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'
            const refreshRes = await fetch(`${apiUrl}/auth/refresh`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token.refreshToken}`
              }
            })

            const refreshData = await refreshRes.json()
            if (refreshData.success && refreshData.data?.access_token) {
              token.accessToken = refreshData.data.access_token
              token.issuedAt = Date.now()
              console.log('Token refreshed successfully')
            }
          } catch (error) {
            console.error('Token refresh failed:', error)
          }
        }
      }

      return token
    },
    async session({ session, token }) {
      // Pass token data to session
      if (session.user) {
        session.user.id = token.id
        session.user.username = token.username
        session.user.role = token.role
        session.user.accessToken = token.accessToken
        session.user.refreshToken = token.refreshToken
        session.user.userId = token.userId
        session.user.branchId = token.branchId
      }

      return session
    }
  }
}
