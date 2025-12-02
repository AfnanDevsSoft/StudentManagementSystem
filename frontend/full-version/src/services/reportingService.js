// Phase 2 Reporting API Service
// Handles report generation and retrieval

import axiosClient from '@/libs/axiosClient'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'

class ReportingService {
  constructor() {
    // Use NextAuth-aware axios client
    this.client = axiosClient
    this.baseURL = `${API_BASE_URL}/reports`
  }

  /**
   * Generate student progress report
   * @param {Object} payload - Report parameters
   * @param {string} payload.branchId - Branch identifier
   * @param {string} payload.courseId - Course identifier
   * @param {string} payload.format - pdf|excel (default: pdf)
   * @returns {Promise} Report generation response
   */
  async generateStudentProgressReport(payload) {
    try {
      const response = await this.client.post('/student-progress', payload)
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  /**
   * Generate teacher performance report
   * @param {Object} payload - Report parameters
   * @param {string} payload.branchId - Branch identifier
   * @param {string} payload.teacherId - Teacher identifier
   * @param {string} payload.format - pdf|excel (default: pdf)
   * @returns {Promise} Report generation response
   */
  async generateTeacherPerformanceReport(payload) {
    try {
      const response = await this.client.post('/teacher-performance', payload)
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  /**
   * Generate fee collection report
   * @param {Object} payload - Report parameters
   * @param {string} payload.branchId - Branch identifier
   * @param {string} payload.format - pdf|excel (default: pdf)
   * @returns {Promise} Report generation response
   */
  async generateFeeCollectionReport(payload) {
    try {
      const response = await this.client.post('/fee-collection', payload)
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  /**
   * Generate attendance report
   * @param {Object} payload - Report parameters
   * @param {string} payload.branchId - Branch identifier
   * @param {string} payload.startDate - ISO date format
   * @param {string} payload.endDate - ISO date format
   * @param {string} payload.format - pdf|excel (default: pdf)
   * @returns {Promise} Report generation response
   */
  async generateAttendanceReport(payload) {
    try {
      const response = await this.client.post('/attendance', payload)
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  /**
   * Get all reports for a branch
   * @param {string} branchId - Branch identifier
   * @param {number} limit - Results per page (default: 20)
   * @param {number} offset - Pagination offset (default: 0)
   * @returns {Promise} Reports list with pagination
   */
  async getAllReports(branchId, limit = 20, offset = 0) {
    try {
      const response = await this.client.get('/', {
        params: { branchId, limit, offset }
      })
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  /**
   * Get a specific report by ID
   * @param {string} reportId - Report identifier
   * @returns {Promise} Report details
   */
  async getReport(reportId) {
    try {
      const response = await this.client.get(`/${reportId}`)
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  /**
   * Delete a report
   * @param {string} reportId - Report identifier
   * @returns {Promise} Deletion confirmation
   */
  async deleteReport(reportId) {
    try {
      const response = await this.client.delete(`/${reportId}`)
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  /**
   * Download report file
   * @param {string} downloadUrl - Download URL from report data
   * @returns {Promise} File download
   */
  async downloadReport(downloadUrl) {
    try {
      window.open(downloadUrl, '_blank')
      return { success: true, message: 'Download started' }
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
        message: error.response.data?.message || 'Report generation failed',
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

export default new ReportingService()
