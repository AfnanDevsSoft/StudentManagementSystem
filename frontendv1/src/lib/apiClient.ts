import axios, { AxiosInstance, AxiosError } from "axios";
import { AuthResponse } from "@/types"; // Removed ApiResponse as it's now defined locally

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
  pagination?: {
    total: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL, // Using the updated constant
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000, // Added timeout
    });

    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("access_token") // Changed from auth_token to access_token
            : null;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error) // Added error handler
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Clear auth and redirect to login
          if (typeof window !== "undefined") {
            localStorage.removeItem("access_token");
            localStorage.removeItem("user");
            window.location.href = "/auth/login";
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth Endpoints
  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>("/auth/login", {
      username,
      password,
    });
    return response.data;
  }

  async logout(): Promise<void> {
    await this.client.post("/auth/logout");
  }

  // Generic GET
  async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, { params });
    return response.data;
  }

  // Generic POST
  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data);
    return response.data;
  }

  // Generic PATCH
  async patch<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data);
    return response.data;
  }

  // Generic DELETE
  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url);
    return response.data;
  }

  // Branches
  async getBranches(page = 1, limit = 10, search = "") {
    return this.get("/branches", { page, limit, search });
  }

  async getBranchById(id: string) {
    return this.get(`/branches/${id}`);
  }

  async createBranch(data: any) {
    return this.post("/branches", data);
  }

  async updateBranch(id: string, data: any) {
    return this.patch(`/branches/${id}`, data);
  }

  async deleteBranch(id: string) {
    return this.delete(`/branches/${id}`);
  }

  // Users
  async getUsers(page = 1, limit = 10, search = "", branchId?: string) {
    return this.get("/users", { page, limit, search, branch_id: branchId });
  }

  async getUserById(id: string) {
    return this.get(`/users/${id}`);
  }

  async createUser(data: any) {
    return this.post("/users", data);
  }

  async updateUser(id: string, data: any) {
    return this.put(`/users/${id}`, data);
  }

  async deleteUser(id: string) {
    return this.delete(`/users/${id}`);
  }

  // Students
  async getStudents(branchId?: string, params?: any) {
    if (!branchId) {
      // Fallback to generic students endpoint if no branchId
      return this.get(`/students`, params);
    }
    return this.get(`/branches/${branchId}/students`, params);
  }

  async getStudentById(id: string) {
    return this.get(`/students/${id}`);
  }

  async createStudent(data: any) {
    return this.post("/students", data);
  }

  async updateStudent(id: string, data: any) {
    return this.patch(`/students/${id}`, data);
  }

  async deleteStudent(id: string) {
    return this.delete(`/students/${id}`);
  }

  // Teachers
  async getTeachers(branchId?: string, params?: any) {
    if (!branchId) {
      // Fallback to generic teachers endpoint if no branchId
      return this.get(`/teachers`, params);
    }
    return this.get(`/branches/${branchId}/teachers`, params);
  }

  async getTeacherById(id: string) {
    return this.get(`/teachers/${id}`);
  }

  async createTeacher(data: any) {
    return this.post("/teachers", data);
  }

  async updateTeacher(id: string, data: any) {
    return this.patch(`/teachers/${id}`, data);
  }

  async deleteTeacher(id: string) {
    return this.delete(`/teachers/${id}`);
  }

  // Courses
  async getCourses(academicYearId?: string, params?: any) {
    return this.get(`/academic-years/${academicYearId}/courses`, params);
  }

  async getCourseById(id: string) {
    return this.get(`/courses/${id}`);
  }

  async createCourse(data: any) {
    return this.post("/courses", data);
  }

  async updateCourse(id: string, data: any) {
    return this.patch(`/courses/${id}`, data);
  }

  async deleteCourse(id: string) {
    return this.delete(`/courses/${id}`);
  }

  // Analytics
  async getAnalyticsDashboard(branchId: string) {
    return this.get(`/analytics/dashboard`, { branchId });
  }

  async getEnrollmentMetrics(branchId: string) {
    return this.get(`/analytics/enrollment`, { branchId });
  }

  async getAttendanceMetrics(
    branchId: string,
    startDate?: string,
    endDate?: string
  ) {
    return this.get(`/analytics/attendance`, { branchId, startDate, endDate });
  }

  async getFeeMetrics(branchId: string) {
    return this.get(`/analytics/fees`, { branchId });
  }

  // Messaging
  async sendMessage(
    senderId: string,
    recipientId: string,
    subject: string,
    messageBody: string
  ) {
    return this.post("/messages/send", {
      senderId,
      recipientId,
      subject,
      messageBody,
    });
  }

  async getInbox(userId: string, limit = 20, offset = 0) {
    return this.get(`/messages/inbox`, { userId, limit, offset });
  }

  async getSentMessages(userId: string, limit = 20, offset = 0) {
    return this.get(`/messages/sent`, { userId, limit, offset });
  }

  async markMessageAsRead(messageId: string) {
    return this.post(`/messages/${messageId}/read`, {});
  }

  // Announcements
  async getAnnouncements(courseId: string, limit = 20, offset = 0) {
    return this.get(`/announcements/${courseId}`, { limit, offset });
  }

  async createAnnouncement(courseId: string, data: any) {
    return this.post("/announcements", { courseId, ...data });
  }


  // Grades
  async getStudentGrades(studentId: string, courseId?: string) {
    return this.get(`/students/${studentId}/grades`, { courseId });
  }

  async getCourseGrades(courseId: string) {
    return this.get(`/courses/${courseId}/grades`);
  }

  async createGrade(data: any) {
    return this.post("/grades", data);
  }

  async updateGrade(id: string, data: any) {
    return this.patch(`/grades/${id}`, data);
  }

  async deleteGrade(id: string) {
    return this.delete(`/grades/${id}`);
  }

  // Attendance
  async getStudentAttendance(studentId: string, courseId?: string) {
    return this.get(`/students/${studentId}/attendance`, { courseId });
  }

  async getCourseAttendance(courseId: string, date?: string) {
    return this.get(`/courses/${courseId}/attendance`, { date });
  }

  async markAttendance(data: any) {
    return this.post("/attendance", data);
  }

  async updateAttendance(id: string, data: any) {
    return this.patch(`/attendance/${id}`, data);
  }

  // Roles
  async getRoles(params?: any) {
    return this.get("/roles", params);
  }

  async createRole(data: any) {
    return this.post("/roles", data);
  }

  async updateRole(id: string, data: any) {
    return this.patch(`/roles/${id}`, data);
  }

  async deleteRole(id: string) {
    return this.delete(`/roles/${id}`);
  }

  // Settings
  async getSettings(branchId?: string) {
    return this.get("/settings", branchId ? { branchId } : {});
  }

  async updateSettings(data: any) {
    return this.patch("/settings", data);
  }

  // Fee Management
  async getFees(branchId?: string, params?: any) {
    return this.get("/fees", { branchId, ...params });
  }

  async getFeeById(id: string) {
    return this.get(`/fees/${id}`);
  }

  async createFee(data: any) {
    return this.post("/fees", data);
  }

  async updateFee(id: string, data: any) {
    return this.patch(`/fees/${id}`, data);
  }

  async deleteFee(id: string) {
    return this.delete(`/fees/${id}`);
  }

  async getFeePayments(studentId?: string, params?: any) {
    return this.get("/fee-payments", { studentId, ...params });
  }

  async recordFeePayment(data: any) {
    return this.post("/fee-payments", data);
  }

  async updateFeePayment(id: string, data: any) {
    return this.patch(`/fee-payments/${id}`, data);
  }

  // Academic Years
  async getAcademicYears(branchId?: string) {
    return this.get("/academic-years", { branchId });
  }

  async getCurrentAcademicYear(branchId: string) {
    return this.get("/academic-years/current", { branchId });
  }

  async createAcademicYear(data: any) {
    return this.post("/academic-years", data);
  }

  // Course Content Management
  async getCourseContent(courseId: string) {
    return this.get(`/courses/${courseId}/content`);
  }

  async uploadCourseContent(courseId: string, data: FormData) {
    const response = await this.client.post(`/courses/${courseId}/content`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateCourseContent(courseId: string, contentId: string, data: any) {
    return this.patch(`/courses/${courseId}/content/${contentId}`, data);
  }

  async deleteCourseContent(courseId: string, contentId: string) {
    return this.delete(`/courses/${courseId}/content/${contentId}`);
  }

  // Course Announcements
  async getCourseAnnouncements(courseId: string) {
    return this.get(`/courses/${courseId}/announcements`);
  }

  async createCourseAnnouncement(courseId: string, data: any) {
    return this.post(`/courses/${courseId}/announcements`, data);
  }

  async updateCourseAnnouncement(courseId: string, announcementId: string, data: any) {
    return this.patch(`/courses/${courseId}/announcements/${announcementId}`, data);
  }

  async deleteCourseAnnouncement(courseId: string, announcementId: string) {
    return this.delete(`/courses/${courseId}/announcements/${announcementId}`);
  }

  // Notifications
  async getNotifications(params?: { unreadOnly?: boolean; limit?: number }) {
    return this.get("/notifications", params);
  }

  async getUnreadNotificationCount() {
    return this.get("/notifications/unread-count");
  }

  async markNotificationAsRead(notificationId: string) {
    return this.patch(`/notifications/${notificationId}/read`, {});
  }

  async markAllNotificationsAsRead() {
    return this.patch("/notifications/read-all", {});
  }

  async deleteNotification(notificationId: string) {
    return this.delete(`/notifications/${notificationId}`);
  }

  async getNotificationPreferences() {
    return this.get("/notification-preferences");
  }

  async updateNotificationPreferences(data: any) {
    return this.patch("/notification-preferences", data);
  }
  // ==================== TIMETABLE ====================
  async getTimeSlots(branchId: string) {
    return this.get(`/timetable/time-slots?branch_id=${branchId}`);
  }
  async createTimeSlot(data: any) {
    return this.post("/timetable/time-slots", data);
  }
  async updateTimeSlot(id: string, data: any) {
    return this.patch(`/timetable/time-slots/${id}`, data);
  }
  async deleteTimeSlot(id: string) {
    return this.delete(`/timetable/time-slots/${id}`);
  }
  async getRooms(branchId: string) {
    return this.get(`/timetable/rooms?branch_id=${branchId}`);
  }
  async createRoom(data: any) {
    return this.post("/timetable/rooms", data);
  }
  async updateRoom(id: string, data: any) {
    return this.patch(`/timetable/rooms/${id}`, data);
  }
  async deleteRoom(id: string) {
    return this.delete(`/timetable/rooms/${id}`);
  }
  async getCourseTimetable(courseId: string) {
    return this.get(`/timetable/course/${courseId}`);
  }
  async getTeacherTimetable(teacherId: string) {
    return this.get(`/timetable/teacher/${teacherId}`);
  }
  async getStudentTimetable(studentId: string) {
    return this.get(`/timetable/student/${studentId}`);
  }
  async createTimetableEntry(data: any) {
    return this.post("/timetable/entries", data);
  }
  async deleteTimetableEntry(id: string) {
    return this.delete(`/timetable/entries/${id}`);
  }

  // ==================== HEALTH/MEDICAL ====================
  async getHealthRecord(studentId: string) {
    return this.get(`/medical/student/${studentId}`);
  }
  async upsertHealthRecord(studentId: string, data: any) {
    return this.post(`/medical/student/${studentId}`, data);
  }
  async getMedicalCheckups(studentId: string) {
    return this.get(`/medical/checkups/${studentId}`);
  }
  async addMedicalCheckup(studentId: string, data: any) {
    return this.post(`/medical/checkups/${studentId}`, data);
  }
  async getVaccinations(studentId: string) {
    return this.get(`/medical/vaccinations/${studentId}`);
  }
  async addVaccination(studentId: string, data: any) {
    return this.post(`/medical/vaccinations/${studentId}`, data);
  }
  async getMedicalIncidents(studentId: string) {
    return this.get(`/medical/incidents/${studentId}`);
  }
  async reportMedicalIncident(data: any) {
    return this.post("/medical/incidents", data);
  }
  async getHealthSummary(studentId: string) {
    return this.get(`/medical/summary/${studentId}`);
  }

  // ==================== LIBRARY ====================
  async getBooks(branchId: string, filters?: any) {
    const params = new URLSearchParams({ branch_id: branchId, ...filters });
    return this.get(`/library/books?${params}`);
  }
  async createBook(data: any) {
    return this.post("/library/books", data);
  }
  async updateBook(id: string, data: any) {
    return this.patch(`/library/books/${id}`, data);
  }
  async deleteBook(id: string) {
    return this.delete(`/library/books/${id}`);
  }
  async issueBook(data: any) {
    return this.post("/library/loans/issue", data);
  }
  async returnBook(id: string, returnedTo: string) {
    return this.post(`/library/loans/${id}/return`, { returned_to: returnedTo });
  }
  async renewBook(id: string) {
    return this.post(`/library/loans/${id}/renew`, {});
  }
  async getBorrowerLoans(borrowerId: string, borrowerType: string) {
    return this.get(`/library/loans/borrower/${borrowerId}?borrower_type=${borrowerType}`);
  }
  async getBorrowerFines(borrowerId: string, borrowerType: string) {
    return this.get(`/library/fines/borrower/${borrowerId}?borrower_type=${borrowerType}`);
  }
  async payFine(id: string, amount: number, method: string) {
    return this.post(`/library/fines/${id}/pay`, { amount, method });
  }

  // ==================== EVENTS ====================
  async getEvents(branchId: string, filters?: any) {
    const params = new URLSearchParams({ branch_id: branchId, ...filters });
    return this.get(`/events?${params}`);
  }
  async getUpcomingEvents(branchId: string) {
    return this.get(`/events/upcoming?branch_id=${branchId}`);
  }
  async getMonthlyCalendar(branchId: string, year: number, month: number) {
    return this.get(`/events/calendar/${year}/${month}?branch_id=${branchId}`);
  }
  async createEvent(data: any) {
    return this.post("/events", data);
  }
  async updateEvent(id: string, data: any) {
    return this.patch(`/events/${id}`, data);
  }
  async deleteEvent(id: string) {
    return this.delete(`/events/${id}`);
  }
}

export const apiClient = new ApiClient();
export default apiClient;
