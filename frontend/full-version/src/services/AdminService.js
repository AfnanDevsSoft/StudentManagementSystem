/**
 * Admin Portal Service
 * Handles all API calls for admin portal features
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'

class AdminService {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('AdminService Error:', error)
      throw error
    }
  }

  /**
   * ==================== USER MANAGEMENT ====================
   */

  /**
   * Fetch all users with pagination
   * @param {object} filters - Filter options (page, limit, role, search)
   * @returns {Promise<Array>} User list
   */
  async fetchUsers(filters = {}) {
    const params = new URLSearchParams(filters)
    return this.request(`/users?${params}`)
  }

  /**
   * Fetch user details
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User details
   */
  async fetchUserDetails(userId) {
    return this.request(`/users/${userId}`)
  }

  /**
   * Create new user
   * @param {object} userData - User information
   * @returns {Promise<Object>} Created user
   */
  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  /**
   * Update user
   * @param {string} userId - User ID
   * @param {object} data - Updated user data
   * @returns {Promise<Object>} Updated user
   */
  async updateUser(userId, data) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  /**
   * Delete user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Confirmation
   */
  async deleteUser(userId) {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
    })
  }

  /**
   * Assign role to user
   * @param {string} userId - User ID
   * @param {string} role - Role to assign (student/teacher/admin)
   * @returns {Promise<Object>} Updated user
   */
  async assignRole(userId, role) {
    return this.request(`/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    })
  }

  /**
   * Bulk user import
   * @param {FormData} fileData - CSV file with user data
   * @returns {Promise<Object>} Import result
   */
  async bulkImportUsers(fileData) {
    return this.request('/users/bulk-import', {
      method: 'POST',
      body: fileData,
      headers: {},
    })
  }

  /**
   * Fetch user activity log
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Activity records
   */
  async fetchUserActivityLog(userId) {
    return this.request(`/users/${userId}/activity-log`)
  }

  /**
   * ==================== ACADEMIC MANAGEMENT ====================
   */

  /**
   * Fetch academic years
   * @returns {Promise<Array>} Academic year list
   */
  async fetchAcademicYears() {
    return this.request('/academic-years')
  }

  /**
   * Create academic year
   * @param {object} data - Academic year details
   * @returns {Promise<Object>} Created academic year
   */
  async createAcademicYear(data) {
    return this.request('/academic-years', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Update academic year
   * @param {string} yearId - Academic year ID
   * @param {object} data - Updated data
   * @returns {Promise<Object>} Updated academic year
   */
  async updateAcademicYear(yearId, data) {
    return this.request(`/academic-years/${yearId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  /**
   * Fetch classes
   * @param {string} yearId - Academic year ID
   * @returns {Promise<Array>} Class list
   */
  async fetchClasses(yearId) {
    return this.request(`/academic-years/${yearId}/classes`)
  }

  /**
   * Create class
   * @param {string} yearId - Academic year ID
   * @param {object} data - Class details
   * @returns {Promise<Object>} Created class
   */
  async createClass(yearId, data) {
    return this.request(`/academic-years/${yearId}/classes`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Update class
   * @param {string} classId - Class ID
   * @param {object} data - Updated class data
   * @returns {Promise<Object>} Updated class
   */
  async updateClass(classId, data) {
    return this.request(`/classes/${classId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  /**
   * Delete class
   * @param {string} classId - Class ID
   * @returns {Promise<Object>} Confirmation
   */
  async deleteClass(classId) {
    return this.request(`/classes/${classId}`, {
      method: 'DELETE',
    })
  }

  /**
   * ==================== FINANCE MANAGEMENT ====================
   */

  /**
   * Fetch fee structure
   * @returns {Promise<Array>} Fee structures
   */
  async fetchFeeStructures() {
    return this.request('/fee-structures')
  }

  /**
   * Create fee structure
   * @param {object} data - Fee structure details
   * @returns {Promise<Object>} Created structure
   */
  async createFeeStructure(data) {
    return this.request('/fee-structures', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Update fee structure
   * @param {string} structureId - Fee structure ID
   * @param {object} data - Updated data
   * @returns {Promise<Object>} Updated structure
   */
  async updateFeeStructure(structureId, data) {
    return this.request(`/fee-structures/${structureId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  /**
   * Fetch payment records
   * @param {object} filters - Filter options (status, dateRange)
   * @returns {Promise<Array>} Payment records
   */
  async fetchPayments(filters = {}) {
    const params = new URLSearchParams(filters)
    return this.request(`/payments?${params}`)
  }

  /**
   * Fetch financial reports
   * @param {object} filters - Filter options (type, period)
   * @returns {Promise<Object>} Financial report
   */
  async fetchFinancialReport(filters = {}) {
    const params = new URLSearchParams(filters)
    return this.request(`/reports/financial?${params}`)
  }

  /**
   * Fetch outstanding fees
   * @returns {Promise<Array>} Outstanding records
   */
  async fetchOutstandingFees() {
    return this.request('/payments/outstanding')
  }

  /**
   * Generate dunning notice
   * @param {string} studentId - Student ID
   * @returns {Promise<Object>} Dunning notice
   */
  async generateDunningNotice(studentId) {
    return this.request(`/payments/dunning/${studentId}`)
  }

  /**
   * ==================== ADMISSION MANAGEMENT ====================
   */

  /**
   * Fetch admission applications
   * @param {object} filters - Filter options (status, year)
   * @returns {Promise<Array>} Applications
   */
  async fetchAdmissions(filters = {}) {
    const params = new URLSearchParams(filters)
    return this.request(`/admissions?${params}`)
  }

  /**
   * Fetch application details
   * @param {string} applicationId - Application ID
   * @returns {Promise<Object>} Application details
   */
  async fetchApplicationDetails(applicationId) {
    return this.request(`/admissions/${applicationId}`)
  }

  /**
   * Create admission application
   * @param {object} data - Application data
   * @returns {Promise<Object>} Created application
   */
  async createAdmission(data) {
    return this.request('/admissions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Update admission status
   * @param {string} applicationId - Application ID
   * @param {string} status - New status (approved/rejected/pending)
   * @returns {Promise<Object>} Updated application
   */
  async updateAdmissionStatus(applicationId, status) {
    return this.request(`/admissions/${applicationId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }

  /**
   * Generate admission letter
   * @param {string} applicationId - Application ID
   * @returns {Promise<Blob>} PDF document
   */
  async generateAdmissionLetter(applicationId) {
    const url = `${this.baseURL}/admissions/${applicationId}/letter`
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to generate letter')
    return response.blob()
  }

  /**
   * ==================== REPORT GENERATION ====================
   */

  /**
   * Fetch available reports
   * @returns {Promise<Array>} Report templates
   */
  async fetchReportTemplates() {
    return this.request('/reports/templates')
  }

  /**
   * Generate report
   * @param {object} params - Report parameters
   * @returns {Promise<Object>} Generated report
   */
  async generateReport(params) {
    return this.request('/reports/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  /**
   * Export report as PDF
   * @param {string} reportId - Report ID
   * @returns {Promise<Blob>} PDF document
   */
  async exportReportPDF(reportId) {
    const url = `${this.baseURL}/reports/${reportId}/export/pdf`
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to export')
    return response.blob()
  }

  /**
   * Export report as CSV
   * @param {string} reportId - Report ID
   * @returns {Promise<Blob>} CSV document
   */
  async exportReportCSV(reportId) {
    const url = `${this.baseURL}/reports/${reportId}/export/csv`
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to export')
    return response.blob()
  }

  /**
   * Fetch saved reports
   * @returns {Promise<Array>} Saved reports
   */
  async fetchSavedReports() {
    return this.request('/reports/saved')
  }

  /**
   * ==================== SYSTEM SETTINGS ====================
   */

  /**
   * Fetch system settings
   * @returns {Promise<Object>} System configuration
   */
  async fetchSettings() {
    return this.request('/settings')
  }

  /**
   * Update system settings
   * @param {object} data - Updated settings
   * @returns {Promise<Object>} Updated settings
   */
  async updateSettings(data) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  /**
   * Fetch school information
   * @returns {Promise<Object>} School details
   */
  async fetchSchoolInfo() {
    return this.request('/school-info')
  }

  /**
   * Update school information
   * @param {object} data - Updated info
   * @returns {Promise<Object>} Updated info
   */
  async updateSchoolInfo(data) {
    return this.request('/school-info', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  /**
   * Fetch notification templates
   * @returns {Promise<Array>} Notification templates
   */
  async fetchNotificationTemplates() {
    return this.request('/notification-templates')
  }

  /**
   * Update notification template
   * @param {string} templateId - Template ID
   * @param {object} data - Updated template
   * @returns {Promise<Object>} Updated template
   */
  async updateNotificationTemplate(templateId, data) {
    return this.request(`/notification-templates/${templateId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  /**
   * ==================== BACKUP & MAINTENANCE ====================
   */

  /**
   * Create system backup
   * @returns {Promise<Object>} Backup confirmation
   */
  async createBackup() {
    return this.request('/system/backup', {
      method: 'POST',
    })
  }

  /**
   * Fetch backup history
   * @returns {Promise<Array>} Backup records
   */
  async fetchBackupHistory() {
    return this.request('/system/backups')
  }

  /**
   * Download backup
   * @param {string} backupId - Backup ID
   * @returns {Promise<Blob>} Backup file
   */
  async downloadBackup(backupId) {
    const url = `${this.baseURL}/system/backups/${backupId}/download`
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to download')
    return response.blob()
  }

  /**
   * Fetch system logs
   * @param {object} filters - Filter options
   * @returns {Promise<Array>} System logs
   */
  async fetchSystemLogs(filters = {}) {
    const params = new URLSearchParams(filters)
    return this.request(`/system/logs?${params}`)
  }

  /**
   * ==================== ANALYTICS ====================
   */

  /**
   * Fetch dashboard analytics
   * @returns {Promise<Object>} Key metrics
   */
  async fetchDashboardAnalytics() {
    return this.request('/analytics/dashboard')
  }

  /**
   * Fetch enrollment analytics
   * @returns {Promise<Array>} Enrollment data
   */
  async fetchEnrollmentAnalytics() {
    return this.request('/analytics/enrollment')
  }

  /**
   * Fetch academic performance analytics
   * @returns {Promise<Object>} Performance metrics
   */
  async fetchPerformanceAnalytics() {
    return this.request('/analytics/performance')
  }

  /**
   * Fetch attendance analytics
   * @returns {Promise<Object>} Attendance metrics
   */
  async fetchAttendanceAnalytics() {
    return this.request('/analytics/attendance')
  }
}

export default new AdminService()
