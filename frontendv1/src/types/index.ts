// User Roles
export type UserRole =
  | "SuperAdmin"
  | "Admin"
  | "Teacher"
  | "Student"
  | "Parent";

// Helper function to extract role name
export const getRoleName = (
  role: UserRole | { id: string; name: string } | string
): string => {
  if (typeof role === "string") return role;
  if (role && typeof role === "object" && "name" in role) return role.name;
  return "Unknown";
};

// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  role: UserRole | { id: string; name: string };
  branch_id?: string;
  branch_name?: string;
  permissions?: string[];
  profile_photo_url?: string;
  created_at?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  access_token?: string;
  refresh_token?: string;
  data: {
    user?: User;
    access_token?: string;
    refresh_token?: string;
  } & User;
}

// Branch Types
export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  phone: string;
  email: string;
  website?: string;
  principal_name: string;
  principal_email: string;
  timezone: string;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Student Types
export interface Student {
  id: string;
  student_code: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  blood_group?: string;
  nationality: string;
  cnic?: string;
  permanent_address: string;
  current_address?: string;
  city: string;
  postal_code: string;
  personal_phone: string;
  personal_email: string;
  admission_date: string;
  current_grade_level_id: string;
  admission_status: string;
  is_active: boolean;
  created_at: string;
}

// Teacher Types
export interface Teacher {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  nationality: string;
  hire_date: string;
  employment_type: string;
  department: string;
  designation: string;
  qualification_level: string;
  years_of_experience: number;
  employment_status: string;
  created_at: string;
}

// Course Types
export interface Course {
  id: string;
  course_code: string;
  course_name: string;
  description: string;
  grade_level: string;
  grade_level_id?: string;
  academic_year_id?: string;
  teacher_id: string;
  teacher_name: string;
  max_students: number;
  enrolled_students: number;
  room_number?: string;
  building?: string;
  schedule?: string;
  credits?: number;
  created_at: string;
}

// Grade Types
export interface Grade {
  id: string;
  student_id: string;
  course_id: string;
  assessment_type: string;
  assessment_name: string;
  score: number;
  max_score: number;
  weight: number;
  grade_date: string;
  remarks?: string;
}

// Attendance Types
export interface AttendanceRecord {
  id: string;
  date: string;
  status: "present" | "absent" | "late" | "half-day";
  remarks?: string;
}

// Message Types
export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  message_body: string;
  attachment_url?: string;
  created_at: string;
  read_at?: string;
  is_deleted: boolean;
}

// Announcement Types
export interface Announcement {
  id: string;
  course_id: string;
  title: string;
  content: string;
  priority: "low" | "normal" | "high" | "urgent";
  announcement_type: "general" | "assignment" | "exam" | "holiday";
  is_pinned: boolean;
  view_count: number;
  created_at: string;
  expiry_date?: string;
}

// Analytics Types
export interface AnalyticsDashboard {
  total_students: number;
  active_students: number;
  total_teachers: number;
  total_courses: number;
  attendance_percentage: number;
  fee_collection_rate: number;
  enrollment_by_grade: Record<string, number>;
}

// Pagination
export interface PaginationMeta {
  total: number;
  skip: number;
  limit: number;
  has_more: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  message: string;
  pagination: PaginationMeta;
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  pagination?: PaginationMeta;
}

// Filter/Search Types
export interface StudentFilter {
  branch_id?: string;
  grade_level_id?: string;
  search?: string;
  skip?: number;
  limit?: number;
}

export interface TeacherFilter {
  branch_id?: string;
  department?: string;
  search?: string;
  skip?: number;
  limit?: number;
}

export interface CourseFilter {
  academic_year_id?: string;
  teacher_id?: string;
  grade_level_id?: string;
  skip?: number;
  limit?: number;
}
