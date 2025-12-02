// Phase 2 Authentication Service
// Handles login, token management, and user session

import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'

class AuthService {
  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/auth`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  /**
   * Login with credentials
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise} Login response with token and user data
   */
  async login(credentials) {
    try {
      const response = await this.client.post('/login', credentials)

      if (response.data.success && response.data.token) {
        // Store token and user data
        localStorage.setItem('authToken', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        localStorage.setItem('tokenTimestamp', Date.now().toString())

        return {
          success: true,
          token: response.data.token,
          user: response.data.user,
          message: 'Login successful'
        }
      }

      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  /**
   * Logout user and clear session
   * @returns {Object} Logout confirmation
   */
  logout() {
    try {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      localStorage.removeItem('tokenTimestamp')

      return {
        success: true,
        message: 'Logout successful'
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  }

  /**
   * Get current user from storage
   * @returns {Object|null} Current user data or null
   */
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user')
      return userStr ? JSON.parse(userStr) : null
    } catch (error) {
      console.error('Error parsing user:', error)
      return null
    }
  }

  /**
   * Get stored token
   * @returns {string|null} JWT token or null
   */
  getToken() {
    return localStorage.getItem('authToken')
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    return !!this.getToken()
  }

  /**
   * Check if token is expired
   * Token expiry: 60 minutes from login
   * @returns {boolean} Token expiration status
   */
  isTokenExpired() {
    const timestamp = localStorage.getItem('tokenTimestamp')
    if (!timestamp) return true

    const loginTime = parseInt(timestamp, 10)
    const tokenExpiry = 60 * 60 * 1000 // 60 minutes in milliseconds
    const currentTime = Date.now()

    return currentTime - loginTime > tokenExpiry
  }

  /**
   * Refresh authentication (in case needed)
   * Currently placeholder - implement based on backend requirements
   * @returns {Promise} Refresh response
   */
  async refreshToken() {
    try {
      const token = this.getToken()
      if (!token) {
        throw new Error('No token available')
      }

      const response = await this.client.post(
        '/refresh',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token)
      }

      return response.data
    } catch (error) {
      // If refresh fails, logout
      this.logout()
      throw this._handleError(error)
    }
  }

  /**
   * Handle API errors consistently
   */
  _handleError(error) {
    if (error.response) {
      return {
        success: false,
        message: error.response.data?.message || 'Authentication failed',
        status: error.response.status,
        data: null
      }
    } else if (error.request) {
      return {
        success: false,
        message: 'No response from server',
        status: 0,
        data: null
      }
    } else {
      return {
        success: false,
        message: error.message,
        status: 0,
        data: null
      }
    }
  }
}

export default new AuthService()
