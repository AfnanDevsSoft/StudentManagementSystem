// Phase 2 Announcements API Service
// Handles announcements creation, retrieval, filtering, and management

import axiosClient from '@/libs/axiosClient'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'

class AnnouncementsService {
  constructor() {
    // Use NextAuth-aware axios client
    this.client = axiosClient
    this.baseURL = `${API_BASE_URL}/announcements`
  }

  /**
   * Create new announcement
   * @param {Object} payload - Announcement data
   * @param {string} payload.courseId - Course identifier
   * @param {string} payload.title - Announcement title
   * @param {string} payload.content - Announcement content
   * @param {string} payload.priority - low|normal|high|urgent
   * @param {string} payload.announcementType - general|assignment|exam|holiday
   * @param {string} payload.expiryDate - ISO date format (optional)
   * @returns {Promise} Creation response
   */
  async createAnnouncement(payload) {
    try {
      const response = await this.client.post('/', payload)
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  /**
   * Get all announcements for a course
   * @param {string} courseId - Course identifier
   * @param {number} limit - Results per page (default: 20)
   * @param {number} offset - Pagination offset (default: 0)
   * @returns {Promise} Announcements list with pagination
   */
  async getAnnouncements(courseId, limit = 20, offset = 0) {
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
   * Get announcements filtered by priority
   * @param {string} courseId - Course identifier
   * @param {string} priority - low|normal|high|urgent
   * @param {number} limit - Results per page (default: 20)
   * @returns {Promise} Filtered announcements
   */
  async getAnnouncementsByPriority(courseId, priority, limit = 20) {
    try {
      const response = await this.client.get(`/${courseId}/priority/${priority}`, {
        params: { limit }
      })
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  /**
   * Get announcements filtered by type
   * @param {string} courseId - Course identifier
   * @param {string} announcementType - general|assignment|exam|holiday
   * @param {number} limit - Results per page (default: 20)
   * @returns {Promise} Filtered announcements
   */
  async getAnnouncementsByType(courseId, announcementType, limit = 20) {
    try {
      const response = await this.client.get(`/${courseId}/type/${announcementType}`, {
        params: { limit }
      })
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  /**
   * Get pinned announcements
   * @param {string} courseId - Course identifier
   * @returns {Promise} Pinned announcements
   */
  async getPinnedAnnouncements(courseId) {
    try {
      const response = await this.client.get(`/${courseId}/pinned`)
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  /**
   * Get upcoming announcements
   * @param {string} courseId - Course identifier
   * @param {number} limit - Results limit (default: 10)
   * @returns {Promise} Upcoming announcements
   */
  async getUpcomingAnnouncements(courseId, limit = 10) {
    try {
      const response = await this.client.get(`/${courseId}/upcoming`, {
        params: { limit }
      })
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  /**
   * Get announcement statistics
   * @param {string} courseId - Course identifier
   * @returns {Promise} Statistics data
   */
  async getAnnouncementStatistics(courseId) {
    try {
      const response = await this.client.get(`/${courseId}/statistics`)
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  /**
   * Search announcements by content
   * @param {string} courseId - Course identifier
   * @param {string} searchTerm - Search keyword
   * @param {number} limit - Results limit (default: 20)
   * @returns {Promise} Search results
   */
  async searchAnnouncements(courseId, searchTerm, limit = 20) {
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
   * Update announcement
   * @param {string} announcementId - Announcement identifier
   * @param {Object} payload - Updated announcement data
   * @returns {Promise} Update response
   */
  async updateAnnouncement(announcementId, payload) {
    try {
      const response = await this.client.patch(`/${announcementId}`, payload)
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  /**
   * Delete announcement (soft delete)
   * @param {string} announcementId - Announcement identifier
   * @returns {Promise} Deletion confirmation
   */
  async deleteAnnouncement(announcementId) {
    try {
      const response = await this.client.delete(`/${announcementId}`)
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  /**
   * Pin or unpin announcement
   * @param {string} announcementId - Announcement identifier
   * @param {boolean} isPinned - Pin status
   * @returns {Promise} Pin status update
   */
  async setPinned(announcementId, isPinned) {
    try {
      const response = await this.client.post(`/${announcementId}/pin`, {
        isPinned
      })
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  /**
   * Track announcement view
   * @param {string} announcementId - Announcement identifier
   * @returns {Promise} View tracking confirmation
   */
  async trackView(announcementId) {
    try {
      const response = await this.client.post(`/${announcementId}/view`)
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

export default new AnnouncementsService()
