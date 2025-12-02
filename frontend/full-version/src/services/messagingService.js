// Phase 2 Messaging API Service
// Handles all messaging endpoints: send, inbox, sent, conversation, search, mark read

import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'

class MessagingService {
  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/messages`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Add auth interceptor
    this.client.interceptors.request.use(config => {
      const token = localStorage.getItem('authToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })
  }

  /**
   * Send a message to a recipient
   * @param {Object} payload - Message data
   * @param {string} payload.senderId - Sender user ID
   * @param {string} payload.recipientId - Recipient user ID
   * @param {string} payload.subject - Message subject
   * @param {string} payload.messageBody - Message content
   * @param {string} payload.attachmentUrl - Optional attachment URL
   * @returns {Promise} Message creation response
   */
  async sendMessage(payload) {
    try {
      const response = await this.client.post('/send', payload)
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  /**
   * Get inbox messages for a user
   * @param {string} userId - User identifier
   * @param {number} limit - Results per page (default: 20)
   * @param {number} offset - Pagination offset (default: 0)
   * @returns {Promise} Inbox messages with pagination
   */
  async getInbox(userId, limit = 20, offset = 0) {
    try {
      const response = await this.client.get('/inbox', {
        params: { userId, limit, offset }
      })
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  /**
   * Get sent messages for a user
   * @param {string} userId - User identifier
   * @param {number} limit - Results per page (default: 20)
   * @param {number} offset - Pagination offset (default: 0)
   * @returns {Promise} Sent messages with pagination
   */
  async getSentMessages(userId, limit = 20, offset = 0) {
    try {
      const response = await this.client.get('/sent', {
        params: { userId, limit, offset }
      })
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  /**
   * Get conversation between two users
   * @param {string} userId - First user ID
   * @param {string} otherUserId - Second user ID
   * @param {number} limit - Number of messages to retrieve (default: 50)
   * @returns {Promise} Conversation messages
   */
  async getConversation(userId, otherUserId, limit = 50) {
    try {
      const response = await this.client.get('/conversation', {
        params: { userId, otherUserId, limit }
      })
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  /**
   * Mark a message as read
   * @param {string} messageId - Message identifier
   * @returns {Promise} Update confirmation
   */
  async markAsRead(messageId) {
    try {
      const response = await this.client.post(`/${messageId}/read`)
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  /**
   * Mark multiple messages as read
   * @param {string[]} messageIds - Array of message IDs
   * @returns {Promise} Batch update confirmation
   */
  async markMultipleAsRead(messageIds) {
    try {
      const response = await this.client.post('/mark-multiple-read', {
        messageIds
      })
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  /**
   * Delete a message (soft delete)
   * @param {string} messageId - Message identifier
   * @returns {Promise} Deletion confirmation
   */
  async deleteMessage(messageId) {
    try {
      const response = await this.client.delete(`/${messageId}`)
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  /**
   * Search messages by content
   * @param {string} userId - User identifier
   * @param {string} searchTerm - Search keyword
   * @param {number} limit - Results limit (default: 20)
   * @returns {Promise} Search results
   */
  async searchMessages(userId, searchTerm, limit = 20) {
    try {
      const response = await this.client.get('/search', {
        params: { userId, searchTerm, limit }
      })
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  /**
   * Get unread message count for a user
   * @param {string} userId - User identifier
   * @returns {Promise} Unread count data
   */
  async getUnreadCount(userId) {
    try {
      const response = await this.client.get('/unread-count', {
        params: { userId }
      })
      return response.data
    } catch (error) {
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
        message: error.response.data?.message || 'API Error',
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

export default new MessagingService()
