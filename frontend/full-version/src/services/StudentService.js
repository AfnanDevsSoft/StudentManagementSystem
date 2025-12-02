/**
 * Student Portal Service
 * Handles all API calls for student portal features
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'

class StudentService {
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
      console.error('StudentService Error:', error)
      throw error
    }
  }

  /**
   * ==================== CLASSES ====================
   */

  /**
   * Fetch all enrolled classes for a student
   * @param {string} studentId - Student ID
   * @returns {Promise<Array>} List of enrolled classes
   */
  async fetchClasses(studentId) {
    return this.request(`/students/${studentId}/classes`)
  }

  /**
   * Fetch a specific class details
   * @param {string} classId - Class ID
   * @returns {Promise<Object>} Class details
   */
  async fetchClassDetails(classId) {
    return this.request(`/classes/${classId}`)
  }

  /**
   * Fetch class schedule
   * @param {string} classId - Class ID
   * @returns {Promise<Array>} Class schedule
   */
  async fetchClassSchedule(classId) {
    return this.request(`/classes/${classId}/schedule`)
  }

  /**
   * ==================== ASSIGNMENTS ====================
   */

  /**
   * Fetch all assignments for a student
   * @param {string} studentId - Student ID
   * @param {object} filters - Filter options (classId, status, dueDate)
   * @returns {Promise<Array>} List of assignments
   */
  async fetchAssignments(studentId, filters = {}) {
    const params = new URLSearchParams(filters)
    return this.request(`/students/${studentId}/assignments?${params}`)
  }

  /**
   * Fetch assignment details
   * @param {string} assignmentId - Assignment ID
   * @returns {Promise<Object>} Assignment details
   */
  async fetchAssignmentDetails(assignmentId) {
    return this.request(`/assignments/${assignmentId}`)
  }

  /**
   * Submit assignment
   * @param {string} assignmentId - Assignment ID
   * @param {FormData} submissionData - Form data with file and metadata
   * @returns {Promise<Object>} Submission confirmation
   */
  async submitAssignment(assignmentId, submissionData) {
    return this.request(`/assignments/${assignmentId}/submit`, {
      method: 'POST',
      body: submissionData,
      headers: {
        // Don't set Content-Type for FormData, browser will set it with boundary
      },
    })
  }

  /**
   * Fetch submission status for an assignment
   * @param {string} studentId - Student ID
   * @param {string} assignmentId - Assignment ID
   * @returns {Promise<Object>} Submission status and grades
   */
  async fetchSubmissionStatus(studentId, assignmentId) {
    return this.request(`/students/${studentId}/assignments/${assignmentId}/submission`)
  }

  /**
   * ==================== GRADES ====================
   */

  /**
   * Fetch all grades for a student
   * @param {string} studentId - Student ID
   * @param {object} filters - Filter options (classId, term)
   * @returns {Promise<Array>} List of grades by subject
   */
  async fetchGrades(studentId, filters = {}) {
    const params = new URLSearchParams(filters)
    return this.request(`/students/${studentId}/grades?${params}`)
  }

  /**
   * Fetch detailed grade components for a subject
   * @param {string} studentId - Student ID
   * @param {string} subjectId - Subject ID
   * @returns {Promise<Object>} Detailed grade breakdown
   */
  async fetchGradeDetails(studentId, subjectId) {
    return this.request(`/students/${studentId}/grades/${subjectId}`)
  }

  /**
   * Fetch GPA history
   * @param {string} studentId - Student ID
   * @returns {Promise<Array>} GPA trend data
   */
  async fetchGPAHistory(studentId) {
    return this.request(`/students/${studentId}/gpa-history`)
  }

  /**
   * ==================== ATTENDANCE ====================
   */

  /**
   * Fetch attendance records for a student
   * @param {string} studentId - Student ID
   * @param {object} filters - Filter options (classId, month, year)
   * @returns {Promise<Array>} Attendance records
   */
  async fetchAttendance(studentId, filters = {}) {
    const params = new URLSearchParams(filters)
    return this.request(`/students/${studentId}/attendance?${params}`)
  }

  /**
   * Fetch attendance statistics
   * @param {string} studentId - Student ID
   * @returns {Promise<Object>} Attendance percentage and stats
   */
  async fetchAttendanceStats(studentId) {
    return this.request(`/students/${studentId}/attendance/stats`)
  }

  /**
   * Fetch leave requests
   * @param {string} studentId - Student ID
   * @returns {Promise<Array>} List of leave requests
   */
  async fetchLeaveRequests(studentId) {
    return this.request(`/students/${studentId}/leave-requests`)
  }

  /**
   * Submit leave request
   * @param {string} studentId - Student ID
   * @param {object} leaveData - Leave request details
   * @returns {Promise<Object>} Leave request confirmation
   */
  async submitLeaveRequest(studentId, leaveData) {
    return this.request(`/students/${studentId}/leave-requests`, {
      method: 'POST',
      body: JSON.stringify(leaveData),
    })
  }

  /**
   * ==================== FEES ====================
   */

  /**
   * Fetch fee structure for a student
   * @param {string} studentId - Student ID
   * @returns {Promise<Object>} Fee structure and installments
   */
  async fetchFeeStructure(studentId) {
    return this.request(`/students/${studentId}/fees/structure`)
  }

  /**
   * Fetch fee payment history
   * @param {string} studentId - Student ID
   * @param {object} filters - Filter options (month, year, status)
   * @returns {Promise<Array>} Payment history
   */
  async fetchPaymentHistory(studentId, filters = {}) {
    const params = new URLSearchParams(filters)
    return this.request(`/students/${studentId}/fees/payments?${params}`)
  }

  /**
   * Fetch outstanding fees
   * @param {string} studentId - Student ID
   * @returns {Promise<Object>} Outstanding balance and due dates
   */
  async fetchOutstandingFees(studentId) {
    return this.request(`/students/${studentId}/fees/outstanding`)
  }

  /**
   * Submit fee payment
   * @param {string} studentId - Student ID
   * @param {object} paymentData - Payment details
   * @returns {Promise<Object>} Payment confirmation or gateway URL
   */
  async submitFeePayment(studentId, paymentData) {
    return this.request(`/students/${studentId}/fees/pay`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    })
  }

  /**
   * Get payment receipt
   * @param {string} studentId - Student ID
   * @param {string} paymentId - Payment ID
   * @returns {Promise<Object>} Receipt details
   */
  async getPaymentReceipt(studentId, paymentId) {
    return this.request(`/students/${studentId}/fees/receipts/${paymentId}`)
  }

  /**
   * ==================== PROFILE ====================
   */

  /**
   * Fetch student profile
   * @param {string} studentId - Student ID
   * @returns {Promise<Object>} Student profile information
   */
  async fetchProfile(studentId) {
    return this.request(`/students/${studentId}/profile`)
  }

  /**
   * Update student profile
   * @param {string} studentId - Student ID
   * @param {object} profileData - Updated profile data
   * @returns {Promise<Object>} Updated profile
   */
  async updateProfile(studentId, profileData) {
    return this.request(`/students/${studentId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  }

  /**
   * Upload profile picture
   * @param {string} studentId - Student ID
   * @param {File} file - Image file
   * @returns {Promise<Object>} Upload confirmation
   */
  async uploadProfilePicture(studentId, file) {
    const formData = new FormData()
    formData.append('profilePicture', file)

    return this.request(`/students/${studentId}/profile-picture`, {
      method: 'POST',
      body: formData,
      headers: {},
    })
  }

  /**
   * ==================== NOTIFICATIONS ====================
   */

  /**
   * Fetch student notifications
   * @param {string} studentId - Student ID
   * @param {object} filters - Filter options (type, read)
   * @returns {Promise<Array>} Notifications
   */
  async fetchNotifications(studentId, filters = {}) {
    const params = new URLSearchParams(filters)
    return this.request(`/students/${studentId}/notifications?${params}`)
  }

  /**
   * Mark notification as read
   * @param {string} studentId - Student ID
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} Confirmation
   */
  async markNotificationAsRead(studentId, notificationId) {
    return this.request(`/students/${studentId}/notifications/${notificationId}/read`, {
      method: 'PUT',
    })
  }

  /**
   * ==================== DOCUMENTS ====================
   */

  /**
   * Fetch student documents
   * @param {string} studentId - Student ID
   * @returns {Promise<Array>} Available documents
   */
  async fetchDocuments(studentId) {
    return this.request(`/students/${studentId}/documents`)
  }

  /**
   * Download document
   * @param {string} studentId - Student ID
   * @param {string} documentId - Document ID
   * @returns {Promise<Blob>} Document file
   */
  async downloadDocument(studentId, documentId) {
    const url = `${this.baseURL}/students/${studentId}/documents/${documentId}/download`
    const response = await fetch(url)
    if (!response.ok) throw new Error('Download failed')
    return response.blob()
  }
}

export default new StudentService()
