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

    // Response interceptor with token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // If 401 and not already retried, attempt token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          if (typeof window !== "undefined") {
            const refreshToken = localStorage.getItem("refresh_token");

            if (refreshToken) {
              try {
                // Attempt to refresh the access token
                const response = await this.refreshToken(refreshToken);

                // Validate response has token
                if (!response.token) {
                  throw new Error("No token in refresh response");
                }

                // Update stored tokens
                localStorage.setItem("access_token", response.token);
                if (response.refresh_token) {
                  localStorage.setItem("refresh_token", response.refresh_token);
                }

                // Retry the original request with new token
                originalRequest.headers.Authorization = `Bearer ${response.token}`;
                return this.client(originalRequest);
              } catch (refreshError) {
                // Refresh failed, clear auth and redirect
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                localStorage.removeItem("user");
                window.location.href = "/auth/login";
                return Promise.reject(refreshError);
              }
            }
          }
        }

        // Other 401 errors or refresh already attempted
        if (error.response?.status === 401) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
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

  async getMe(): Promise<ApiResponse<any>> {
    const response = await this.client.get<ApiResponse<any>>("/auth/me");
    return response.data;
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    branch_id?: string;
    role_id?: string;
  }): Promise<ApiResponse<any>> {
    const response = await this.client.post<ApiResponse<any>>(
      "/auth/register",
      userData
    );
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>("/auth/refresh", {
      refresh_token: refreshToken,
    });
    return response.data;
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

  async getBranchStatistics(branchId: string) {
    return this.get(`/branches/${branchId}/statistics`);
  }

  async getBranchDashboard(branchId: string) {
    return this.get(`/branches/${branchId}/dashboard`);
  }

  async getBranchSummary(branchId: string) {
    return this.get(`/branches/${branchId}/summary`);
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

  async resetUserPassword(userId: string, newPassword: string) {
    return this.post(`/users/${userId}/reset-password`, { newPassword });
  }

  async activateUser(userId: string) {
    return this.post(`/users/${userId}/activate`, {});
  }

  async deactivateUser(userId: string) {
    return this.post(`/users/${userId}/deactivate`, {});
  }

  async assignUserRole(userId: string, roleId: string, branchId: string) {
    return this.post(`/users/${userId}/assign-role`, { roleId, branchId });
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

  async getStudentEnrollment(studentId: string) {
    return this.get(`/students/${studentId}/enrollment`);
  }

  async getStudentProfile(studentId: string) {
    return this.get(`/students/${studentId}/profile`);
  }

  async getStudentDashboard(studentId: string) {
    return this.get(`/students/${studentId}/dashboard`);
  }

  async getStudentPerformance(studentId: string) {
    return this.get(`/students/${studentId}/performance`);
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

  async getTeacherCourses(teacherId: string) {
    return this.get(`/teachers/${teacherId}/courses`);
  }

  async getTeacherAttendance(teacherId: string) {
    return this.get(`/teachers/${teacherId}/attendance`);
  }

  async getTeacherProfile(teacherId: string) {
    return this.get(`/teachers/${teacherId}/profile`);
  }

  async getTeacherDashboard(teacherId: string) {
    return this.get(`/teachers/${teacherId}/dashboard`);
  }

  async getTeacherSchedule(teacherId: string) {
    return this.get(`/teachers/${teacherId}/schedule`);
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

  async getCourseEnrollments(courseId: string) {
    return this.get(`/courses/${courseId}/enrollments`);
  }

  async getCourseStudents(courseId: string) {
    return this.get(`/courses/${courseId}/students`);
  }

  async enrollStudent(courseId: string, studentId: string) {
    return this.post(`/courses/${courseId}/enroll`, { student_id: studentId });
  }

  async unenrollStudent(courseId: string, studentId: string) {
    return this.delete(`/courses/${courseId}/enroll/${studentId}`);
  }

  async getCourseStatistics(courseId: string) {
    return this.get(`/courses/${courseId}/statistics`);
  }

  async getCoursePerformance(courseId: string) {
    return this.get(`/courses/${courseId}/performance`);
  }

  async getCourseCompletion(courseId: string) {
    return this.get(`/courses/${courseId}/completion`);
  }

  // Validation & Verification
  async validateEmail(email: string) {
    return this.post("/validation/email", { email });
  }

  async validatePhone(phone: string) {
    return this.post("/validation/phone", { phone });
  }

  async validateStudentId(studentId: string, branchId: string) {
    return this.post("/validation/student-id", { studentId, branchId });
  }

  async checkEnrollmentEligibility(studentId: string, courseId: string) {
    return this.post("/validation/enrollment-eligibility", { studentId, courseId });
  }

  // Import Helpers
  async getImportTemplate(type: string) {
    const response = await this.client.get(`/import/template/${type}`, {
      responseType: "blob",
    });
    return response.data;
  }

  async validateImportData(type: string, data: any) {
    return this.post(`/import/validate/${type}`, data);
  }

  async previewImport(type: string, formData: FormData) {
    const response = await this.client.post(`/import/preview/${type}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
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

  async getStudentAnalytics(branchId: string, params?: any) {
    return this.get("/analytics/students", { branchId, ...params });
  }

  async getTeacherAnalytics(branchId: string, params?: any) {
    return this.get("/analytics/teachers", { branchId, ...params });
  }

  async getTrendAnalytics(branchId: string, params?: any) {
    return this.get("/analytics/trends", { branchId, ...params });
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
    return this.post(`/messages/${messageId}/mark-read`, {});
  }

  async getMessage(messageId: string) {
    return this.get(`/messages/${messageId}`);
  }

  async markAllMessagesAsRead(userId: string) {
    return this.post("/messages/mark-all-read", { userId });
  }

  async deleteMessage(messageId: string) {
    return this.delete(`/messages/${messageId}`);
  }

  async searchMessages(query: string, userId: string) {
    return this.get("/messages/search", { query, userId });
  }

  async getConversation(userId: string, otherUserId: string) {
    return this.get(`/messages/conversation/${otherUserId}`, { userId });
  }

  // Announcements - LEGACY (use getAnnouncements and getCourseAnnouncements methods below instead)
  // These old methods are deprecated and kept only for backward compatibility
  // async getAnnouncements(courseId: string, limit = 20, offset = 0) {
  //   return this.get(`/announcements/${courseId}`, { limit, offset });
  // }
  //
  // async createAnnouncement(courseId: string, data: any) {
  //   return this.post("/announcements", { courseId, ...data });
  // }


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

  async getGradeById(id: string) {
    return this.get(`/grades/${id}`);
  }

  async bulkCreateGrades(grades: any[]) {
    return this.post("/grades/bulk", { grades });
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

  async deleteAttendance(id: string) {
    return this.delete(`/attendance/${id}`);
  }

  async bulkMarkAttendance(attendanceRecords: any[]) {
    return this.post("/attendance/bulk", { records: attendanceRecords });
  }

  async getAttendanceStatistics(params?: {
    branchId?: string;
    courseId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    return this.get("/attendance/statistics", params);
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

  async calculateFee(studentId: string, feeType?: string) {
    return this.post("/fees/calculate", { studentId, feeType });
  }

  async processFeePayment(data: {
    studentId: string;
    feeId?: string;
    amount: number;
    paymentMethod: string;
    transactionId?: string;
  }) {
    return this.post("/fees/payment", data);
  }

  async getOutstandingFees(studentId: string) {
    return this.get(`/fees/${studentId}/outstanding`);
  }

  async getFeeRecords(params?: {
    branchId?: string;
    studentId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    return this.get("/fees/records", params);
  }

  async getFeeStatistics(branchId?: string) {
    return this.get("/fees/statistics", { branchId });
  }

  async getFeeStructures(branchId?: string) {
    return this.get("/fees/structures", { branchId });
  }

  async getFeeStructureById(id: string) {
    return this.get(`/fees/structures/${id}`);
  }

  async createFeeStructure(data: {
    name: string;
    branchId: string;
    feeType: string;
    amount: number;
    description?: string;
  }) {
    return this.post("/fees/structures", data);
  }

  async updateFeeStructure(id: string, data: any) {
    return this.patch(`/fees/structures/${id}`, data);
  }

  async deleteFeeStructure(id: string) {
    return this.delete(`/fees/structures/${id}`);
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

  async updateAcademicYear(yearId: string, data: any) {
    return this.patch(`/academic-years/${yearId}`, data);
  }

  async deleteAcademicYear(yearId: string) {
    return this.delete(`/academic-years/${yearId}`);
  }

  async setActiveAcademicYear(yearId: string, branchId: string) {
    return this.patch(`/academic-years/${yearId}/set-active`, { branchId });
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

  async getTimetableEntries(academicYearId: string) {
    return this.get(`/timetable/entries/${academicYearId}`);
  }

  async getRoomTimetable(roomId: string) {
    return this.get(`/timetable/room/${roomId}`);
  }

  async updateTimetableEntry(id: string, data: any) {
    return this.patch(`/timetable/entries/${id}`, data);
  }

  // ==================== HEALTH/MEDICAL ====================
  async getHealthRecord(studentId: string) {
    return this.get(`/medical/health-records/${studentId}`);
  }
  async createHealthRecord(data: any) {
    return this.post("/medical/health-records", data);
  }
  async getMedicalCheckups(healthRecordId: string) {
    return this.get(`/medical/checkups/${healthRecordId}`);
  }
  async addMedicalCheckup(data: any) {
    return this.post("/medical/checkups", data);
  }
  async updateMedicalCheckup(id: string, data: any) {
    return this.patch(`/medical/checkups/${id}`, data);
  }
  async deleteMedicalCheckup(id: string) {
    return this.delete(`/medical/checkups/${id}`);
  }
  async getVaccinations(healthRecordId: string) {
    return this.get(`/medical/vaccinations/${healthRecordId}`);
  }
  async addVaccination(data: any) {
    return this.post("/medical/vaccinations", data);
  }
  async updateVaccination(id: string, data: any) {
    return this.patch(`/medical/vaccinations/${id}`, data);
  }
  async deleteVaccination(id: string) {
    return this.delete(`/medical/vaccinations/${id}`);
  }
  async getMedicalIncidents(studentId: string) {
    return this.get(`/medical/incidents/${studentId}`);
  }
  async reportMedicalIncident(data: any) {
    return this.post("/medical/incidents", data);
  }
  async updateMedicalIncident(id: string, data: any) {
    return this.patch(`/medical/incidents/${id}`, data);
  }
  async deleteMedicalIncident(id: string) {
    return this.delete(`/medical/incidents/${id}`);
  }
  async getMedicalIncidentDetails(id: string) {
    return this.get(`/medical/incidents/${id}/details`);
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

  async getActiveLoans(params?: any) {
    return this.get("/library/loans/active", params);
  }

  async getOverdueLoans(params?: any) {
    return this.get("/library/loans/overdue", params);
  }

  async getLoanHistory(borrowerId: string, borrowerType: string) {
    return this.get(`/library/loans/history/${borrowerId}`, { borrower_type: borrowerType });
  }

  async waiveFine(fineId: string, reason?: string) {
    return this.post(`/library/fines/waive`, { fineId, reason });
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

  async getEventById(id: string) {
    return this.get(`/events/${id}`);
  }

  async getEventCalendar(branchId: string) {
    return this.get(`/events/calendar/${branchId}`);
  }

  // ==================== RBAC (Role-Based Access Control) ====================
  async getRoles(branchId: string, limit = 20, offset = 0) {
    return this.get(`/rbac/roles/${branchId}`, { limit, offset });
  }

  async getRoleById(roleId: string) {
    return this.get(`/rbac/roles/detail/${roleId}`);
  }

  async createRole(
    branchId: string,
    roleName: string,
    permissions: string[],
    description?: string
  ) {
    return this.post("/rbac/roles", {
      branchId,
      roleName,
      permissions,
      description,
    });
  }

  async updateRolePermissions(roleId: string, permissionIds: string[]) {
    return this.put(`/rbac/roles/${roleId}`, { permissionIds });
  }

  async deleteRole(roleId: string) {
    return this.delete(`/rbac/roles/${roleId}`);
  }

  async getAllPermissions(limit = 100, offset = 0) {
    return this.get("/rbac/permissions", { limit, offset });
  }

  async createPermission(
    permissionName: string,
    resource: string,
    action: string,
    description?: string
  ) {
    return this.post("/rbac/permissions", {
      permissionName,
      resource,
      action,
      description,
    });
  }

  async assignRoleToUser(
    userId: string,
    roleId: string,
    branchId: string,
    assignedBy: string,
    expiryDate?: Date
  ) {
    return this.post("/rbac/assign", {
      userId,
      roleId,
      branchId,
      assignedBy,
      expiryDate,
    });
  }

  async removeUserRole(userRoleId: string) {
    return this.delete(`/rbac/user-roles/${userRoleId}`);
  }

  async getUserRoles(userId: string) {
    return this.get(`/rbac/user-roles/${userId}`);
  }

  async checkUserPermission(userId: string, permission: string) {
    return this.post("/rbac/check-permission", { userId, permission });
  }

  async getUserPermissions(userId: string) {
    return this.get(`/rbac/user-permissions/${userId}`);
  }

  async getPermissionHierarchy() {
    return this.get("/rbac/permission-hierarchy");
  }

  async getRolePermissions(roleId: string) {
    return this.get(`/rbac/roles/${roleId}/permissions`);
  }

  async assignPermissionToRole(roleId: string, permissionId: string) {
    return this.post(`/rbac/roles/${roleId}/permissions`, { permissionId });
  }

  async bulkAssignPermissions(roleId: string, permissionIds: string[]) {
    return this.post("/rbac/roles/assign-permissions", { roleId, permissionIds });
  }

  async removePermissionFromRole(roleId: string, permissionId: string) {
    return this.delete(`/rbac/roles/${roleId}/permissions/${permissionId}`);
  }

  // ==================== TIMETABLE MANAGEMENT ====================
  async getTimetables(params?: any) {
    return this.get("/timetables", params);
  }

  async getTimetableById(id: string) {
    return this.get(`/timetables/${id}`);
  }

  async createTimetable(data: any) {
    return this.post("/timetables", data);
  }

  async updateTimetable(id: string, data: any) {
    return this.patch(`/timetables/${id}`, data);
  }

  async deleteTimetable(id: string) {
    return this.delete(`/timetables/${id}`);
  }

  async getTimetableSlots(timetableId: string) {
    return this.get(`/timetables/${timetableId}/slots`);
  }

  async createTimetableSlot(timetableId: string, data: any) {
    return this.post(`/timetables/${timetableId}/slots`, data);
  }

  async updateTimetableSlot(timetableId: string, slotId: string, data: any) {
    return this.patch(`/timetables/${timetableId}/slots/${slotId}`, data);
  }

  async deleteTimetableSlot(timetableId: string, slotId: string) {
    return this.delete(`/timetables/${timetableId}/slots/${slotId}`);
  }

  // ==================== FEE MANAGEMENT ====================
  // DEPRECATED: Duplicate methods - use the ones defined earlier with better types
  // async getFeeStructures(params?: any) {
  //   return this.get("/fees/structures", params);
  // }

  // async createFeeStructure(data: any) {
  //   return this.post("/fees/structures", data);
  // }

  // async updateFeeStructure(id: string, data: any) {
  //   return this.patch(`/fees/structures/${id}`, data);
  // }

  // async deleteFeeStructure(id: string) {
  //   return this.delete(`/fees/structures/${id}`);
  // }

  async getStudentFees(studentId: string) {
    return this.get(`/fees/students/${studentId}`);
  }

  async recordPayment(data: {
    studentId: string;
    amount: number;
    paymentMethod: string;
    feeType?: string;
  }) {
    return this.post("/fees/payments", data);
  }

  async getFeeReports(params?: any) {
    return this.get("/fees/reports", params);
  }

  async getDuePayments(params?: any) {
    return this.get("/fees/due", params);
  }

  // ==================== ADMISSIONS ====================
  async getApplications(params?: any) {
    return this.get("/admission/applications", params);
  }

  async getApplicationById(id: string) {
    return this.get(`/admission/applications/${id}`);
  }

  async createApplication(data: any) {
    return this.post("/admission/applications", data);
  }

  async updateApplication(id: string, data: any) {
    return this.patch(`/admission/applications/${id}`, data);
  }

  async updateApplicationStatus(id: string, status: string, remarks?: string) {
    return this.patch(`/admission/applications/${id}/status`, {
      status,
      remarks,
    });
  }

  async approveApplication(id: string) {
    return this.post(`/admission/applications/${id}/approve`, {});
  }

  async rejectApplication(id: string, remarks?: string) {
    return this.post(`/admission/applications/${id}/reject`, { remarks });
  }

  async deleteApplication(id: string) {
    return this.delete(`/admission/applications/${id}`);
  }

  // ==================== MEDICAL/HEALTH RECORDS (DUPLICATE - DEPRECATED) ====================
  // These methods are duplicates and use incorrect paths.
  // Use the methods in the "HEALTH/MEDICAL" section above instead.
  // async getStudentMedicalRecords(studentId: string) {
  //   return this.get(`/medical/students/${studentId}/records`);
  // }
  //
  // async createMedicalRecord(studentId: string, data: any) {
  //   return this.post(`/medical/students/${studentId}/records`, data);
  // }
  //
  // async updateMedicalRecord(recordId: string, data: any) {
  //   return this.patch(`/medical/records/${recordId}`, data);
  // }
  //
  // async deleteMedicalRecord(recordId: string) {
  //   return this.delete(`/medical/records/${recordId}`);
  // }
  //
  // async getVaccinationRecords(studentId: string) {
  //   return this.get(`/medical/students/${studentId}/vaccinations`);
  // }
  //
  // async addVaccinationRecord(studentId: string, data: any) {
  //   return this.post(`/medical/students/${studentId}/vaccinations`, data);
  // }
  //
  // async getHealthCheckups(studentId: string) {
  //   return this.get(`/medical/students/${studentId}/checkups`);
  // }
  //
  // async scheduleHealthCheckup(data: any) {
  //   return this.post("/medical/checkups", data);
  // }

  // ==================== PAYROLL ====================
  async getPayrollRecords(params?: any) {
    return this.get("/payroll/records", params);
  }

  async generatePayroll(data: {
    employeeId: string;
    month: number;
    year: number;
    basicSalary: number;
    allowances?: number;
    deductions?: number;
  }) {
    return this.post("/payroll/generate", data);
  }

  async getEmployeeSalary(employeeId: string) {
    return this.get(`/payroll/employees/${employeeId}/salary`);
  }

  async updateSalaryStructure(employeeId: string, data: any) {
    return this.patch(`/payroll/employees/${employeeId}/salary`, data);
  }

  async getPayslip(recordId: string) {
    return this.get(`/payroll/records/${recordId}/payslip`);
  }

  async approvePayroll(recordId: string) {
    return this.post(`/payroll/records/${recordId}/approve`, {});
  }

  async getSalaries(params?: {
    teacherId?: string;
    branchId?: string;
    month?: number;
    year?: number;
    status?: string;
  }) {
    return this.get("/payroll/salaries", params);
  }

  async calculateSalary(data: {
    teacherId: string;
    month: number;
    year: number;
  }) {
    return this.post("/payroll/calculate", data);
  }

  async processSalary(recordId: string) {
    return this.post("/payroll/process", { recordId });
  }

  async markSalaryAsPaid(recordId: string, paidDate?: string) {
    return this.post(`/payroll/${recordId}/mark-paid`, { paidDate });
  }

  // ==================== LEAVE MANAGEMENT ====================
  async getLeaveRequests(params?: any) {
    return this.get("/leaves/requests", params);
  }

  async getPendingLeaveRequests() {
    return this.get("/leaves/pending");
  }

  async getLeaveStatistics() {
    return this.get("/leaves/statistics");
  }

  async createLeaveRequest(data: {
    employeeId: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    reason: string;
  }) {
    return this.post("/leaves/request", data);
  }

  async updateLeaveRequest(id: string, data: any) {
    return this.patch(`/leaves/requests/${id}`, data);
  }

  async approveLeaveRequest(id: string) {
    return this.post(`/leaves/${id}/approve`, {});
  }

  async rejectLeaveRequest(id: string, reason: string) {
    return this.post(`/leaves/${id}/reject`, { reason });
  }

  async getLeaveBalance(teacherId: string) {
    return this.get(`/leaves/${teacherId}/balance`);
  }

  async getLeaveHistory(teacherId: string) {
    return this.get(`/leaves/${teacherId}/history`);
  }

  // ==================== COURSE CONTENT ====================
  async getCourseContent(courseId: string, params?: any) {
    return this.get(`/courses/${courseId}/content`, params);
  }

  async uploadCourseContent(courseId: string, formData: FormData) {
    // Special handling for file upload
    const response = await this.client.post(
      `/courses/${courseId}/content`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  async updateCourseContent(contentId: string, data: any) {
    return this.patch(`/course-content/item/${contentId}`, data);
  }

  async deleteCourseContent(contentId: string) {
    return this.delete(`/course-content/item/${contentId}`);
  }

  async getContentItem(contentId: string) {
    return this.get(`/course-content/item/${contentId}`);
  }

  async incrementContentView(contentId: string) {
    return this.post(`/course-content/item/${contentId}/increment-view`, {});
  }

  async pinContent(contentId: string) {
    return this.post(`/course-content/item/${contentId}/pin`, {});
  }

  async unpinContent(contentId: string) {
    return this.post(`/course-content/item/${contentId}/unpin`, {});
  }

  async downloadCourseContent(contentId: string) {
    return this.get(`/course-content/item/${contentId}/download`, {
      responseType: "blob",
    });
  }

  // ==================== REPORTING ====================
  async generateReport(reportType: string, params: any) {
    return this.post(`/reports/${reportType}/generate`, params);
  }

  async getReportHistory(params?: any) {
    return this.get("/reports/history", params);
  }

  async downloadReport(reportId: string) {
    return this.get(`/reports/${reportId}/download`, { responseType: "blob" });
  }

  async scheduleReport(data: {
    reportType: string;
    frequency: string;
    recipients: string[];
    parameters: any;
  }) {
    return this.post("/reports/schedule", data);
  }

  async getReportById(reportId: string) {
    return this.get(`/reports/${reportId}`);
  }

  async deleteReport(reportId: string) {
    return this.delete(`/reports/${reportId}`);
  }

  async getReportSchedules(params?: any) {
    return this.get("/reports/schedules", params);
  }

  async generateCustomReport(config: {
    reportType: string;
    filters: any;
    format?: string;
  }) {
    return this.post("/reports/custom", config);
  }

  async updateReportSchedule(scheduleId: string, data: any) {
    return this.patch(`/reports/schedules/${scheduleId}`, data);
  }

  async deleteReportSchedule(scheduleId: string) {
    return this.delete(`/reports/schedules/${scheduleId}`);
  }

  async generateAttendanceReport(params: {
    branchId?: string;
    courseId?: string;
    studentId?: string;
    startDate: string;
    endDate: string;
    format?: string;
  }) {
    return this.post("/reports/attendance", params);
  }

  // ==================== ANNOUNCEMENTS ====================
  async getAnnouncements(params?: {
    branchId?: string;
    targetAudience?: string;
    limit?: number;
    offset?: number;
  }) {
    return this.get("/announcements", params);
  }

  async getAnnouncementById(id: string) {
    return this.get(`/announcements/${id}`);
  }

  async createAnnouncement(data: {
    title: string;
    content: string;
    targetAudience: string;
    branchId?: string;
    priority?: string;
    expiryDate?: string;
  }) {
    return this.post("/announcements", data);
  }

  async updateAnnouncement(id: string, data: any) {
    return this.patch(`/announcements/${id}`, data);
  }

  async deleteAnnouncement(id: string) {
    return this.delete(`/announcements/${id}`);
  }

  async publishAnnouncement(id: string) {
    return this.patch(`/announcements/${id}/publish`, {});
  }

  async unpublishAnnouncement(id: string) {
    return this.patch(`/announcements/${id}/unpublish`, {});
  }

  // General Announcements (specific endpoints)
  async getGeneralAnnouncements(params?: {
    branchId?: string;
    limit?: number;
    offset?: number;
  }) {
    return this.get("/announcements/general", params);
  }

  async getGeneralAnnouncement(id: string) {
    return this.get(`/announcements/general/${id}`);
  }

  async updateGeneralAnnouncement(id: string, data: any) {
    return this.patch(`/announcements/general/${id}`, data);
  }

  async deleteGeneralAnnouncement(id: string) {
    return this.delete(`/announcements/general/${id}`);
  }

  // Class Announcements
  async createClassAnnouncement(data: {
    courseId: string;
    createdBy: string;
    title: string;
    content: string;
    priority?: string;
    announcementType?: string;
    attachmentUrl?: string;
    isPinned?: boolean;
  }) {
    return this.post("/announcements/class", data);
  }

  async pinClassAnnouncement(id: string) {
    return this.post(`/announcements/class/${id}/pin`, {});
  }

  async getCourseClassAnnouncements(courseId: string) {
    return this.get(`/announcements/class/${courseId}`);
  }

  async getClassAnnouncementById(id: string) {
    return this.get(`/announcements/class/${id}`);
  }

  async getPinnedClassAnnouncements(courseId: string) {
    return this.get(`/announcements/class/pinned/${courseId}`);
  }

  async getTeacherClassAnnouncements(teacherId: string) {
    return this.get(`/announcements/class/for-teacher/${teacherId}`);
  }

  // ==================== NOTIFICATIONS ====================
  async getNotifications(params?: { unreadOnly?: boolean; limit?: number }) {
    return this.get("/notifications", params);
  }

  async getUnreadNotificationCount() {
    return this.get("/notifications/unread/count");
  }

  async markNotificationAsRead(id: string) {
    return this.patch(`/notifications/${id}/read`, {});
  }

  async markAllNotificationsAsRead(userId?: string) {
    return this.patch("/notifications/read-all", { userId });
  }

  async getNotificationSettings(userId: string) {
    return this.get(`/notifications/settings/${userId}`);
  }

  async updateNotificationSettings(userId: string, settings: any) {
    return this.patch(`/notifications/settings/${userId}`, settings);
  }

  async scheduleNotification(data: {
    userId: string;
    title: string;
    message: string;
    scheduledAt: string;
  }) {
    return this.post("/notifications/schedule", data);
  }

  // Communication
  async sendParentCommunication(data: {
    studentId: string;
    subject: string;
    message: string;
    method: string; // email, sms, both
  }) {
    return this.post("/communication/parent", data);
  }

  async getEmailTemplates(type?: string) {
    return this.get("/communication/templates/email", { type });
  }

  async getSMSTemplates(type?: string) {
    return this.get("/communication/templates/sms", { type });
  }

  async deleteNotification(id: string) {
    return this.delete(`/notifications/${id}`);
  }

  async getNotificationPreferences(userId: string) {
    return this.get(`/notifications/preferences/${userId}`);
  }

  async updateNotificationPreferences(userId: string, preferences: any) {
    return this.patch(`/notifications/preferences/${userId}`, preferences);
  }

  async sendNotification(data: {
    userId: string;
    title: string;
    message: string;
    notificationType?: string;
  }) {
    return this.post("/notifications/send", data);
  }

  async broadcastNotification(data: {
    userIds: string[];
    title: string;
    message: string;
    notificationType?: string;
  }) {
    return this.post("/notifications/broadcast", data);
  }

  // ==================== SYSTEM MANAGEMENT ====================

  // Backup & Restore
  async createBackup(data?: { description?: string; includeFiles?: boolean }) {
    return this.post("/backup/create", data);
  }

  async getBackups(params?: any) {
    return this.get("/backup/list", params);
  }

  async downloadBackup(backupId: string) {
    return this.get(`/backup/${backupId}/download`, { responseType: "blob" });
  }

  async restoreBackup(backupId: string) {
    return this.post(`/backup/${backupId}/restore`, {});
  }

  async deleteBackup(backupId: string) {
    return this.delete(`/backup/${backupId}`);
  }

  async getBackupById(backupId: string) {
    return this.get(`/backups/${backupId}`);
  }

  async listBackupSchedules() {
    return this.get("/backups/schedules");
  }

  async createBackupSchedule(data: {
    backupType: string;
    frequency: string;
    retentionDays?: number;
  }) {
    return this.post("/backups/schedules", data);
  }

  // Cache Management
  async clearCache(cacheType?: string) {
    return this.post("/cache/clear", { cacheType });
  }

  async getCacheStats() {
    return this.get("/cache/stats");
  }

  async warmupCache() {
    return this.post("/cache/warmup", {});
  }

  // System Logs
  async getSystemLogs(params?: {
    level?: string;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }) {
    return this.get("/logs", params);
  }

  async getAuditLogs(params?: {
    userId?: string;
    action?: string;
    limit?: number;
  }) {
    return this.get("/logs/audit", params);
  }

  async getErrorLogs(params?: { limit?: number; severity?: string }) {
    return this.get("/logs/errors", params);
  }

  async getUserActivityLogs(userId: string, params?: {
    startDate?: string;
    endDate?: string;
    action?: string;
    limit?: number;
  }) {
    return this.get(`/logs/activity/${userId}`, params);
  }

  async getSystemAuditLogs(params?: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) {
    return this.get("/logs/audit/filter", params);
  }

  async getActivityTimeline(params?: {
    entityType?: string;
    entityId?: string;
    limit?: number;
  }) {
    return this.get("/logs/timeline", params);
  }

  async trackUserSession(userId: string, action: string, metadata?: any) {
    return this.post("/logs/session", { userId, action, metadata });
  }

  async createLogEntry(data: {
    level: string;
    message: string;
    metadata?: any;
  }) {
    return this.post("/logs/log", data);
  }

  async clearOldLogs(days?: number) {
    return this.post("/logs/clear", { days });
  }

  // File Export/Import
  async exportData(exportType: string, params?: any) {
    const response = await this.client.post(`/export/${exportType}`, params, {
      responseType: "blob",
    });
    return response.data;
  }

  async importData(importType: string, formData: FormData) {
    const response = await this.client.post(
      `/import/${importType}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  async getExportHistory(params?: any) {
    return this.get("/export/history", params);
  }

  async requestExport(exportType: string, filters?: any) {
    return this.post("/exports/request", { exportType, filters });
  }

  async listExports(params?: any) {
    return this.get("/exports", params);
  }

  async getExportStatus(exportId: string) {
    return this.get(`/exports/${exportId}`);
  }

  async downloadExportFile(exportId: string) {
    const response = await this.client.get(`/exports/${exportId}/download`, {
      responseType: "blob",
    });
    return response.data;
  }

  // System Health
  async getSystemHealth() {
    return this.get("/health");
  }

  async getSystemStatus() {
    return this.get("/health/status");
  }

  async getDatabaseStatus() {
    return this.get("/health/database");
  }

  // System Settings
  async getSystemSettings() {
    return this.get("/settings/system");
  }

  async updateSystemSettings(settings: any) {
    return this.patch("/settings/system", settings);
  }

  async getBranchSettings(branchId: string) {
    return this.get(`/settings/branch/${branchId}`);
  }

  async updateBranchSettings(branchId: string, settings: any) {
    return this.patch(`/settings/branch/${branchId}`, settings);
  }

  // Global Search
  async globalSearch(query: string, filters?: {
    type?: string;
    branchId?: string;
    limit?: number;
  }) {
    return this.get("/search", { query, ...filters });
  }

  async searchStudents(query: string, branchId?: string) {
    return this.get("/search/students", { query, branchId });
  }

  async searchTeachers(query: string, branchId?: string) {
    return this.get("/search/teachers", { query, branchId });
  }

  async searchCourses(query: string) {
    return this.get("/search/courses", { query });
  }

  // Batch Operations
  async batchDeleteStudents(studentIds: string[]) {
    return this.post("/students/batch-delete", { studentIds });
  }

  async batchUpdateStudents(updates: Array<{ id: string; data: any }>) {
    return this.post("/students/batch-update", { updates });
  }

  async batchEnrollStudents(enrollments: Array<{ studentId: string; courseId: string }>) {
    return this.post("/courses/batch-enroll", { enrollments });
  }

  // Advanced Filtering
  async filterStudents(filters: {
    branchId?: string;
    grade?: string;
    status?: string;
    enrollmentYear?: number;
    ageRange?: { min: number; max: number };
  }) {
    return this.post("/students/filter", filters);
  }

  async filterTeachers(filters: {
    branchId?: string;
    department?: string;
    qualification?: string;
    experience?: number;
    status?: string;
  }) {
    return this.post("/teachers/filter", filters);
  }

  async filterCourses(filters: {
    academicYearId?: string;
    department?: string;
    level?: string;
    status?: string;
  }) {
    return this.post("/courses/filter", filters);
  }

  // System Monitoring
  async getSystemMetrics() {
    return this.get("/system/metrics");
  }

  async getSystemPerformance() {
    return this.get("/system/performance");
  }

  async getDatabaseMetrics() {
    return this.get("/system/database/metrics");
  }

  async getApiUsageStats(params?: {
    startDate?: string;
    endDate?: string;
    endpoint?: string;
  }) {
    return this.get("/system/api-usage", params);
  }

  // Dashboard Quick Stats
  async getQuickStats(branchId?: string) {
    return this.get("/dashboard/quick-stats", { branchId });
  }

  async getRecentActivities(limit = 10) {
    return this.get("/dashboard/recent-activities", { limit });
  }

  // DEPRECATED: Duplicate - use getUpcomingEvents in Events section
  // async getUpcomingEvents(branchId?: string, days = 7) {
  //   return this.get("/dashboard/upcoming-events", { branchId, days });
  // }

  // Data Cleanup & Maintenance
  async cleanupOldData(params: {
    type: string; // logs, backups, reports
    olderThanDays: number;
  }) {
    return this.post("/maintenance/cleanup", params);
  }

  async findOrphanedRecords(entityType: string) {
    return this.get(`/maintenance/orphaned/${entityType}`);
  }

  async checkDataIntegrity() {
    return this.get("/maintenance/integrity-check");
  }

  async optimizeDatabaseTables() {
    return this.post("/maintenance/optimize-db", {});
  }

  async findDuplicateRecords(entityType: string) {
    return this.get(`/maintenance/duplicates/${entityType}`);
  }

  // Utility Helpers
  async getTimezones() {
    return this.get("/utils/timezones");
  }

  async getCurrencies() {
    return this.get("/utils/currencies");
  }

  async getCountries() {
    return this.get("/utils/countries");
  }
}

export const apiClient = new ApiClient();
export default apiClient;
