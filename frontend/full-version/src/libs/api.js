const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'

// Get token from various sources
const getAuthToken = () => {
  // Try session storage first (set by useAuth hook)
  if (typeof window !== 'undefined' && window.authToken) {
    return window.authToken
  }
  
  // Fall back to localStorage
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token')
  }
  
  return null
}

// Create request with auth headers
const createAuthHeaders = () => {
  const token = getAuthToken()
  const headers = {
    'Content-Type': 'application/json'
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  return headers
}

// Main API fetch wrapper
export const apiClient = async (endpoint, options = {}) => {
  const {
    method = 'GET',
    body = null,
    headers = {},
    ...otherOptions
  } = options

  const url = `${API_BASE_URL}${endpoint}`
  const requestHeaders = {
    ...createAuthHeaders(),
    ...headers
  }

  try {
    console.log(`[API] ${method} ${endpoint}`)
    
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      ...otherOptions
    })

    const data = await response.json()

    if (!response.ok) {
      console.error(`[API Error] ${method} ${endpoint}:`, {
        status: response.status,
        message: data.message
      })

      // Handle 401 - token expired
      if (response.status === 401) {
        console.log('[API] Token expired, clearing auth')
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.authToken = null
        
        // Could trigger sign out here
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }

      throw new Error(data.message || `HTTP ${response.status}`)
    }

    console.log(`[API] Success: ${method} ${endpoint}`)
    return data
  } catch (error) {
    console.error(`[API] Request failed:`, error)
    throw error
  }
}

// Specific API methods
export const api = {
  get: (endpoint, options) => apiClient(endpoint, { method: 'GET', ...options }),
  
  post: (endpoint, body, options) => 
    apiClient(endpoint, { method: 'POST', body, ...options }),
  
  put: (endpoint, body, options) => 
    apiClient(endpoint, { method: 'PUT', body, ...options }),
  
  patch: (endpoint, body, options) => 
    apiClient(endpoint, { method: 'PATCH', body, ...options }),
  
  delete: (endpoint, options) => 
    apiClient(endpoint, { method: 'DELETE', ...options })
}

export default apiClient
