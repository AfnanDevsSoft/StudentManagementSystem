// Axios client with NextAuth session token support
// Automatically adds JWT token from NextAuth session to all requests

import axios from 'axios'
import { getSession } from 'next-auth/react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'

// Create axios instance
const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add request interceptor to attach token from NextAuth session
axiosClient.interceptors.request.use(async (config) => {
  try {
    const session = await getSession()
    if (session?.user?.accessToken) {
      config.headers.Authorization = `Bearer ${session.user.accessToken}`
    }
  } catch (error) {
    console.warn('Error getting session for token:', error)
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

// Add response interceptor to handle 401 errors
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn('Received 401 - Token may be expired')
    }
    return Promise.reject(error)
  }
)

export default axiosClient
