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
  async getFeeStructures(params?: any) {
    return this.get("/fees/structures", params);
  }

  async createFeeStructure(data: any) {
    return this.post("/fees/structures", data);
  }

  async updateFeeStructure(id: string, data: any) {
    return this.patch(`/fees/structures/${id}`, data);
  }

  async deleteFeeStructure(id: string) {
    return this.delete(`/fees/structures/${id}`);
  }

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
    return this.get("/admissions/applications", params);
  }

  async getApplicationById(id: string) {
    return this.get(`/admissions/applications/${id}`);
  }

  async createApplication(data: any) {
    return this.post("/admissions/applications", data);
  }

  async updateApplication(id: string, data: any) {
    return this.patch(`/admissions/applications/${id}`, data);
  }

  async updateApplicationStatus(id: string, status: string, remarks?: string) {
    return this.patch(`/admissions/applications/${id}/status`, {
      status,
      remarks,
    });
  }

  async deleteApplication(id: string) {
    return this.delete(`/admissions/applications/${id}`);
  }

  // ==================== MEDICAL/HEALTH RECORDS ====================
  async getStudentMedicalRecords(studentId: string) {
    return this.get(`/medical/students/${studentId}/records`);
  }

  async createMedicalRecord(studentId: string, data: any) {
    return this.post(`/medical/students/${studentId}/records`, data);
  }

  async updateMedicalRecord(recordId: string, data: any) {
    return this.patch(`/medical/records/${recordId}`, data);
  }

  async deleteMedicalRecord(recordId: string) {
    return this.delete(`/medical/records/${recordId}`);
  }

  async getVaccinationRecords(studentId: string) {
    return this.get(`/medical/students/${studentId}/vaccinations`);
  }

  async addVaccinationRecord(studentId: string, data: any) {
    return this.post(`/medical/students/${studentId}/vaccinations`, data);
  }

  async getHealthCheckups(studentId: string) {
    return this.get(`/medical/students/${studentId}/checkups`);
  }

  async scheduleHealthCheckup(data: any) {
    return this.post("/medical/checkups", data);
  }

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

  // ==================== LEAVE MANAGEMENT ====================
  async getLeaveRequests(params?: any) {
    return this.get("/leave/requests", params);
  }

  async createLeaveRequest(data: {
    employeeId: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    reason: string;
  }) {
    return this.post("/leave/requests", data);
  }

  async updateLeaveRequest(id: string, data: any) {
    return this.patch(`/leave/requests/${id}`, data);
  }

  async approveLeaveRequest(id: string, approverId: string) {
    return this.patch(`/leave/requests/${id}/approve`, { approverId });
  }

  async rejectLeaveRequest(id: string, reason: string) {
    return this.patch(`/leave/requests/${id}/reject`, { reason });
  }

  async getLeaveBalance(employeeId: string) {
    return this.get(`/leave/employees/${employeeId}/balance`);
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
    return this.patch(`/course-content/${contentId}`, data);
  }

  async deleteCourseContent(contentId: string) {
    return this.delete(`/course-content/${contentId}`);
  }

  async downloadCourseContent(contentId: string) {
    return this.get(`/course-content/${contentId}/download`, {
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

  async markAllNotificationsAsRead() {
    return this.patch("/notifications/read-all", {});
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

  // File Export/Import
  async exportData(exportType: string, params?: any) {
    return this.post(`/export/${exportType}`, params, {
      responseType: "blob",
    });
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
}

export const apiClient = new ApiClient();
export default apiClient;
