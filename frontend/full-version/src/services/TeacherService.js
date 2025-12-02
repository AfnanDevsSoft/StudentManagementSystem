/**
 * Teacher Portal Service
 * Handles all API calls for teacher portal features
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'

class TeacherService {
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
      console.error('TeacherService Error:', error)
      throw error
    }
  }

  /**
   * ==================== CLASS SCHEDULE ====================
   */

  /**
   * Fetch teacher's class schedule
   * @param {string} teacherId - Teacher ID
   * @param {object} filters - Filter options (date, classId)
   * @returns {Promise<Array>} Class schedule
   */
  async fetchSchedule(teacherId, filters = {}) {
    const params = new URLSearchParams(filters)
    return this.request(`/teachers/${teacherId}/schedule?${params}`)
  }

  /**
   * Fetch class details
   * @param {string} classId - Class ID
   * @returns {Promise<Object>} Class details
   */
  async fetchClassDetails(classId) {
    return this.request(`/classes/${classId}`)
  }

  /**
   * Update class details
   * @param {string} classId - Class ID
   * @param {object} data - Updated class data
   * @returns {Promise<Object>} Updated class
   */
  async updateClassDetails(classId, data) {
    return this.request(`/classes/${classId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  /**
   * ==================== STUDENT MANAGEMENT ====================
   */

  /**
   * Fetch students in teacher's classes
   * @param {string} teacherId - Teacher ID
   * @param {object} filters - Filter options (classId, search)
   * @returns {Promise<Array>} Student list
   */
  async fetchStudents(teacherId, filters = {}) {
    const params = new URLSearchParams(filters)
    return this.request(`/teachers/${teacherId}/students?${params}`)
  }

  /**
   * Fetch student details
   * @param {string} studentId - Student ID
   * @returns {Promise<Object>} Student details
   */
  async fetchStudentDetails(studentId) {
    return this.request(`/students/${studentId}`)
  }

  /**
   * Fetch student performance
   * @param {string} studentId - Student ID
   * @param {string} classId - Class ID
   * @returns {Promise<Object>} Performance metrics
   */
  async fetchStudentPerformance(studentId, classId) {
    return this.request(`/students/${studentId}/performance/${classId}`)
  }

  /**
   * ==================== ATTENDANCE MARKING ====================
   */

  /**
   * Fetch attendance records for a class
   * @param {string} classId - Class ID
   * @param {object} filters - Filter options (date, month)
   * @returns {Promise<Array>} Attendance records
   */
  async fetchAttendanceRecords(classId, filters = {}) {
    const params = new URLSearchParams(filters)
    return this.request(`/classes/${classId}/attendance?${params}`)
  }

  /**
   * Mark attendance for a class
   * @param {string} classId - Class ID
   * @param {object} attendanceData - Attendance records
   * @returns {Promise<Object>} Confirmation
   */
  async markAttendance(classId, attendanceData) {
    return this.request(`/classes/${classId}/attendance`, {
      method: 'POST',
      body: JSON.stringify(attendanceData),
    })
  }

  /**
   * Update attendance record
   * @param {string} attendanceId - Attendance ID
   * @param {object} data - Updated attendance data
   * @returns {Promise<Object>} Updated record
   */
  async updateAttendance(attendanceId, data) {
    return this.request(`/attendance/${attendanceId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  /**
   * Fetch student attendance history
   * @param {string} studentId - Student ID
   * @param {string} classId - Class ID
   * @returns {Promise<Array>} Attendance history
   */
  async fetchStudentAttendanceHistory(studentId, classId) {
    return this.request(`/students/${studentId}/attendance/${classId}`)
  }

  /**
   * ==================== GRADE ENTRY ====================
   */

  /**
   * Fetch grades for a class
   * @param {string} classId - Class ID
   * @param {object} filters - Filter options (term, subject)
   * @returns {Promise<Array>} Grade records
   */
  async fetchGrades(classId, filters = {}) {
    const params = new URLSearchParams(filters)
    return this.request(`/classes/${classId}/grades?${params}`)
  }

  /**
   * Submit grades for a class
   * @param {string} classId - Class ID
   * @param {object} gradesData - Grades and metadata
   * @returns {Promise<Object>} Confirmation
   */
  async submitGrades(classId, gradesData) {
    return this.request(`/classes/${classId}/grades`, {
      method: 'POST',
      body: JSON.stringify(gradesData),
    })
  }

  /**
   * Update a single grade
   * @param {string} gradeId - Grade ID
   * @param {object} data - Updated grade data
   * @returns {Promise<Object>} Updated grade
   */
  async updateGrade(gradeId, data) {
    return this.request(`/grades/${gradeId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  /**
   * Fetch student grades for a class
   * @param {string} studentId - Student ID
   * @param {string} classId - Class ID
   * @returns {Promise<Object>} Student grades and details
   */
  async fetchStudentGrades(studentId, classId) {
    return this.request(`/students/${studentId}/grades/${classId}`)
  }

  /**
   * Bulk update grades
   * @param {string} classId - Class ID
   * @param {Array} gradesArray - Array of grade updates
   * @returns {Promise<Object>} Bulk update confirmation
   */
  async bulkUpdateGrades(classId, gradesArray) {
    return this.request(`/classes/${classId}/grades/bulk`, {
      method: 'PUT',
      body: JSON.stringify({ grades: gradesArray }),
    })
  }

  /**
   * ==================== ASSIGNMENTS ====================
   */

  /**
   * Fetch assignments for a class
   * @param {string} classId - Class ID
   * @returns {Promise<Array>} Assignment list
   */
  async fetchAssignments(classId) {
    return this.request(`/classes/${classId}/assignments`)
  }

  /**
   * Create assignment
   * @param {string} classId - Class ID
   * @param {object} assignmentData - Assignment details
   * @returns {Promise<Object>} Created assignment
   */
  async createAssignment(classId, assignmentData) {
    return this.request(`/classes/${classId}/assignments`, {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    })
  }

  /**
   * Update assignment
   * @param {string} assignmentId - Assignment ID
   * @param {object} data - Updated assignment data
   * @returns {Promise<Object>} Updated assignment
   */
  async updateAssignment(assignmentId, data) {
    return this.request(`/assignments/${assignmentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  /**
   * Delete assignment
   * @param {string} assignmentId - Assignment ID
   * @returns {Promise<Object>} Confirmation
   */
  async deleteAssignment(assignmentId) {
    return this.request(`/assignments/${assignmentId}`, {
      method: 'DELETE',
    })
  }

  /**
   * Fetch assignment submissions
   * @param {string} assignmentId - Assignment ID
   * @returns {Promise<Array>} Submissions list
   */
  async fetchSubmissions(assignmentId) {
    return this.request(`/assignments/${assignmentId}/submissions`)
  }

  /**
   * Grade assignment submission
   * @param {string} submissionId - Submission ID
   * @param {object} gradeData - Grade and feedback
   * @returns {Promise<Object>} Graded submission
   */
  async gradeSubmission(submissionId, gradeData) {
    return this.request(`/submissions/${submissionId}/grade`, {
      method: 'POST',
      body: JSON.stringify(gradeData),
    })
  }

  /**
   * ==================== LEAVE REQUESTS ====================
   */

  /**
   * Fetch teacher's leave requests
   * @param {string} teacherId - Teacher ID
   * @returns {Promise<Array>} Leave request list
   */
  async fetchLeaveRequests(teacherId) {
    return this.request(`/teachers/${teacherId}/leave-requests`)
  }

  /**
   * Submit leave request
   * @param {string} teacherId - Teacher ID
   * @param {object} leaveData - Leave details
   * @returns {Promise<Object>} Leave request confirmation
   */
  async submitLeaveRequest(teacherId, leaveData) {
    return this.request(`/teachers/${teacherId}/leave-requests`, {
      method: 'POST',
      body: JSON.stringify(leaveData),
    })
  }

  /**
   * Update leave request
   * @param {string} leaveId - Leave request ID
   * @param {object} data - Updated leave data
   * @returns {Promise<Object>} Updated leave request
   */
  async updateLeaveRequest(leaveId, data) {
    return this.request(`/leave-requests/${leaveId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  /**
   * Cancel leave request
   * @param {string} leaveId - Leave request ID
   * @returns {Promise<Object>} Confirmation
   */
  async cancelLeaveRequest(leaveId) {
    return this.request(`/leave-requests/${leaveId}`, {
      method: 'DELETE',
    })
  }

  /**
   * ==================== PROFILE ====================
   */

  /**
   * Fetch teacher profile
   * @param {string} teacherId - Teacher ID
   * @returns {Promise<Object>} Teacher profile
   */
  async fetchProfile(teacherId) {
    return this.request(`/teachers/${teacherId}/profile`)
  }

  /**
   * Update teacher profile
   * @param {string} teacherId - Teacher ID
   * @param {object} profileData - Updated profile data
   * @returns {Promise<Object>} Updated profile
   */
  async updateProfile(teacherId, profileData) {
    return this.request(`/teachers/${teacherId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  }

  /**
   * ==================== NOTIFICATIONS ====================
   */

  /**
   * Fetch teacher notifications
   * @param {string} teacherId - Teacher ID
   * @returns {Promise<Array>} Notifications
   */
  async fetchNotifications(teacherId) {
    return this.request(`/teachers/${teacherId}/notifications`)
  }

  /**
   * Mark notification as read
   * @param {string} teacherId - Teacher ID
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} Confirmation
   */
  async markNotificationAsRead(teacherId, notificationId) {
    return this.request(`/teachers/${teacherId}/notifications/${notificationId}/read`, {
      method: 'PUT',
    })
  }
}

export default new TeacherService()
