// Phase 2 Course Content API Service
// Handles course content upload, retrieval, updates, and management

import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'

class CourseContentService {
  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/course-content`,
      timeout: 30000, // Longer timeout for file uploads
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
   * Upload new course content
   * @param {Object} payload - Content data
   * @param {string} payload.courseId - Course identifier
   * @param {string} payload.contentType - video|pdf|document|link|assignment
   * @param {string} payload.title - Content title
   * @param {string} payload.description - Content description
   * @param {string} payload.fileName - File name
   * @param {number} payload.fileSize - File size in bytes
   * @param {string} payload.filePath - File URL/path
   * @param {string} payload.uploadedBy - Teacher/uploader ID
   * @param {number} payload.duration - Duration in seconds (for videos)
   * @returns {Promise} Upload response
   */
  async uploadContent(payload) {
    try {
      const response = await this.client.post('/upload', payload)
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  /**
   * Get all content for a course
   * @param {string} courseId - Course identifier
   * @param {number} limit - Results per page (default: 20)
   * @param {number} offset - Pagination offset (default: 0)
   * @returns {Promise} Course content with pagination
   */
  async getCourseContent(courseId, limit = 20, offset = 0) {
    try {
      const response = await this.client.get(`/${courseId}`, {
        params: { limit, offset }
      })
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  /**
   * Get only published content for a course
   * @param {string} courseId - Course identifier
   * @param {number} limit - Results per page (default: 20)
   * @param {number} offset - Pagination offset (default: 0)
   * @returns {Promise} Published content
   */
  async getPublishedContent(courseId, limit = 20, offset = 0) {
    try {
      const response = await this.client.get(`/${courseId}/published`, {
        params: { limit, offset }
      })
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  /**
   * Get content filtered by type
   * @param {string} courseId - Course identifier
   * @param {string} contentType - video|pdf|document|link|assignment
   * @param {number} limit - Results per page (default: 20)
   * @param {number} offset - Pagination offset (default: 0)
   * @returns {Promise} Filtered content
   */
  async getContentByType(courseId, contentType, limit = 20, offset = 0) {
    try {
      const response = await this.client.get(`/${courseId}/by-type/${contentType}`, {
        params: { limit, offset }
      })
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  /**
   * Get popular/most viewed content
   * @param {string} courseId - Course identifier
   * @param {number} limit - Number of results (default: 10)
   * @returns {Promise} Popular content sorted by views
   */
  async getPopularContent(courseId, limit = 10) {
    try {
      const response = await this.client.get(`/${courseId}/popular`, {
        params: { limit }
      })
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  /**
   * Update content metadata
   * @param {string} contentId - Content identifier
   * @param {Object} payload - Updated content data
   * @returns {Promise} Update response
   */
  async updateContent(contentId, payload) {
    try {
      const response = await this.client.patch(`/${contentId}`, payload)
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  /**
   * Delete content (soft delete)
   * @param {string} contentId - Content identifier
   * @returns {Promise} Deletion confirmation
   */
  async deleteContent(contentId) {
    try {
      const response = await this.client.delete(`/${contentId}`)
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  /**
   * Track content view
   * @param {string} contentId - Content identifier
   * @returns {Promise} View tracking confirmation
   */
  async trackView(contentId) {
    try {
      const response = await this.client.post(`/${contentId}/view`)
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  /**
   * Pin or unpin content
   * @param {string} contentId - Content identifier
   * @param {boolean} isPinned - Pin status
   * @returns {Promise} Pin status update
   */
  async setPinned(contentId, isPinned) {
    try {
      const response = await this.client.post(`/${contentId}/pin`, {
        isPinned
      })
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  /**
   * Search course content
   * @param {string} courseId - Course identifier
   * @param {string} searchTerm - Search keyword
   * @param {number} limit - Results limit (default: 20)
   * @returns {Promise} Search results
   */
  async searchContent(courseId, searchTerm, limit = 20) {
    try {
      const response = await this.client.get(`/${courseId}/search`, {
        params: { searchTerm, limit }
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

export default new CourseContentService()
