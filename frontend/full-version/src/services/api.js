// API service for all backend calls
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    // Add auth token if available (optional)
    // const token = localStorage.getItem('authToken')
    // if (token) {
    //   headers.Authorization = `Bearer ${token}`
    // }

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
      console.error('API Request Error:', error)
      throw error
    }
  }

  // ==================== STUDENTS ====================
  async getStudents(page = 1, limit = 10, search = '') {
    const params = new URLSearchParams({ page, limit, search })
    return this.request(`/students?${params}`)
  }

  async getStudent(id) {
    return this.request(`/students/${id}`)
  }

  async createStudent(data) {
    return this.request('/students', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateStudent(id, data) {
    return this.request(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteStudent(id) {
    return this.request(`/students/${id}`, {
      method: 'DELETE',
    })
  }

  async getStudentEnrollments(id) {
    return this.request(`/students/${id}/enrollment`)
  }

  async getStudentGrades(id) {
    return this.request(`/students/${id}/grades`)
  }

  async getStudentAttendance(id) {
    return this.request(`/students/${id}/attendance`)
  }

  // ==================== TEACHERS ====================
  async getTeachers(page = 1, limit = 10, search = '') {
    const params = new URLSearchParams({ page, limit, search })
    return this.request(`/teachers?${params}`)
  }

  async getTeacher(id) {
    return this.request(`/teachers/${id}`)
  }

  async createTeacher(data) {
    return this.request('/teachers', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateTeacher(id, data) {
    return this.request(`/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteTeacher(id) {
    return this.request(`/teachers/${id}`, {
      method: 'DELETE',
    })
  }

  async getTeacherCourses(id) {
    return this.request(`/teachers/${id}/courses`)
  }

  async getTeacherAttendance(id) {
    return this.request(`/teachers/${id}/attendance`)
  }

  // ==================== COURSES ====================
  async getCourses(page = 1, limit = 10, search = '') {
    const params = new URLSearchParams({ page, limit, search })
    return this.request(`/courses?${params}`)
  }

  async getCourse(id) {
    return this.request(`/courses/${id}`)
  }

  async createCourse(data) {
    return this.request('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateCourse(id, data) {
    return this.request(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteCourse(id) {
    return this.request(`/courses/${id}`, {
      method: 'DELETE',
    })
  }

  async getCourseEnrollments(id) {
    return this.request(`/courses/${id}/enrollments`)
  }

  async getCourseStudents(id) {
    return this.request(`/courses/${id}/students`)
  }

  async enrollStudent(courseId, studentId) {
    return this.request(`/courses/${courseId}/students`, {
      method: 'POST',
      body: JSON.stringify({ student_id: studentId }),
    })
  }

  // ==================== BRANCHES ====================
  async getBranches(page = 1, limit = 10, search = '') {
    const params = new URLSearchParams({ page, limit, search })
    return this.request(`/branches?${params}`)
  }

  async getBranch(id) {
    return this.request(`/branches/${id}`)
  }

  async createBranch(data) {
    return this.request('/branches', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateBranch(id, data) {
    return this.request(`/branches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteBranch(id) {
    return this.request(`/branches/${id}`, {
      method: 'DELETE',
    })
  }

  // ==================== USERS ====================
  async getUsers(page = 1, limit = 10, search = '') {
    const params = new URLSearchParams({ page, limit, search })
    return this.request(`/users?${params}`)
  }

  async getUser(id) {
    return this.request(`/users/${id}`)
  }

  async createUser(data) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateUser(id, data) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    })
  }
}

export default new ApiService()
