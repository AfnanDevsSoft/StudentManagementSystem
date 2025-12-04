import axios, { AxiosInstance, AxiosError } from "axios";
import { AuthResponse, ApiResponse } from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor
    this.client.interceptors.request.use((config) => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_token")
          : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Clear auth and redirect to login
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("auth_user");
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

  // Generic DELETE
  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url);
    return response.data;
  }

  // Branches
  async getBranches() {
    return this.get("/branches");
  }

  async getBranchById(id: string) {
    return this.get(`/branches/${id}`);
  }

  // Users
  async getUsers(branchId?: string) {
    return this.get("/users", { branch_id: branchId });
  }

  async getUserById(id: string) {
    return this.get(`/users/${id}`);
  }

  // Students
  async getStudents(branchId?: string, params?: any) {
    return this.get(`/branches/${branchId}/students`, params);
  }

  async getStudentById(id: string) {
    return this.get(`/students/${id}`);
  }

  async updateStudent(id: string, data: any) {
    return this.patch(`/students/${id}`, data);
  }

  // Teachers
  async getTeachers(branchId?: string, params?: any) {
    return this.get(`/branches/${branchId}/teachers`, params);
  }

  async getTeacherById(id: string) {
    return this.get(`/teachers/${id}`);
  }

  // Courses
  async getCourses(academicYearId?: string, params?: any) {
    return this.get(`/academic-years/${academicYearId}/courses`, params);
  }

  async getCourseById(id: string) {
    return this.get(`/courses/${id}`);
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

  // Course Content
  async getCourseContent(courseId: string, limit = 20, offset = 0) {
    return this.get(`/course-content/${courseId}`, { limit, offset });
  }

  // Grades
  async getStudentGrades(studentId: string, courseId?: string) {
    return this.get(`/students/${studentId}/grades`, { courseId });
  }

  // Attendance
  async getStudentAttendance(studentId: string, courseId?: string) {
    return this.get(`/students/${studentId}/attendance`, { courseId });
  }
}

export const apiClient = new ApiClient();
