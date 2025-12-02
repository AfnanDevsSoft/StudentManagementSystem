// Phase 2 Analytics API Service
// Handles all analytics endpoints: enrollment, attendance, fees, teachers, dashboard, trends

import axiosClient from '@/libs/axiosClient'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'

class AnalyticsService {
  constructor() {
    // Use NextAuth-aware axios client with automatic token injection
    this.client = axiosClient
    this.baseURL = `${API_BASE_URL}/analytics`
  }

  /**
   * Get enrollment metrics for a branch
   * @param {string} branchId - Branch identifier
   * @returns {Promise} Enrollment metrics data
   */
  async getEnrollmentMetrics(branchId) {
    try {
      const response = await this.client.get('/enrollment', {
        params: { branchId }
      })
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  /**
   * Get attendance metrics for a date range
   * @param {string} branchId - Branch identifier
   * @param {string} startDate - ISO date format (optional)
   * @param {string} endDate - ISO date format (optional)
   * @returns {Promise} Attendance metrics data
   */
  async getAttendanceMetrics(branchId, startDate = null, endDate = null) {
    try {
      const params = { branchId }
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const response = await this.client.get('/attendance', { params })
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  /**
   * Get fee metrics for a branch
   * @param {string} branchId - Branch identifier
   * @returns {Promise} Fee metrics data
   */
  async getFeeMetrics(branchId) {
    try {
      const response = await this.client.get('/fees', {
        params: { branchId }
      })
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  /**
   * Get teacher metrics for a branch
   * @param {string} branchId - Branch identifier
   * @param {string} teacherId - Specific teacher ID (optional)
   * @returns {Promise} Teacher metrics data
   */
  async getTeacherMetrics(branchId, teacherId = null) {
    try {
      const params = { branchId }
      if (teacherId) params.teacherId = teacherId

      const response = await this.client.get('/teachers', { params })
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  /**
   * Get comprehensive dashboard summary
   * @param {string} branchId - Branch identifier
   * @returns {Promise} Dashboard summary data
   */
  async getDashboardSummary(branchId) {
    try {
      const response = await this.client.get('/dashboard', {
        params: { branchId }
      })
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  /**
   * Get trend analysis for a metric
   * @param {string} metricType - enrollment|attendance|fees|teachers
   * @param {string} branchId - Branch identifier
   * @param {number} days - Number of days to analyze (default: 30, max: 365)
   * @returns {Promise} Trend analysis data
   */
  async getTrendAnalysis(metricType, branchId, days = 30) {
    try {
      const response = await this.client.get(`/trends/${metricType}`, {
        params: { branchId, days }
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
      // Server responded with error status
      return {
        success: false,
        message: error.response.data?.message || 'API Error',
        status: error.response.status,
        data: null
      }
    } else if (error.request) {
      // Request was made but no response
      return {
        success: false,
        message: 'No response from server',
        status: 0,
        data: null
      }
    } else {
      // Error in request setup
      return {
        success: false,
        message: error.message,
        status: 0,
        data: null
      }
    }
  }
}

export default new AnalyticsService()
