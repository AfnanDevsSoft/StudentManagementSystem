import { PrismaClient } from "@prisma/client";
import { prisma } from "../lib/db";

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: any;
}

class StudentService {
  // Get all students with pagination and search
  static async getAllStudents(
    page: number = 1,
    limit: number = 10,
    search: string = "",
    branchId: string = "",
    userContext?: any
  ): Promise<ApiResponse> {
    try {
      const skip = (page - 1) * limit;
      const where: any = {};

      // Data Scoping
      if (userContext && userContext.role?.name !== 'SuperAdmin') {
        // Enforce branch_id from user context, ignoring frontend request if different
        branchId = userContext.branch_id;
      }

      if (search) {
        where.OR = [
          { first_name: { contains: search, mode: "insensitive" } },
          { last_name: { contains: search, mode: "insensitive" } },
          { personal_email: { contains: search, mode: "insensitive" } },
          { personal_phone: { contains: search, mode: "insensitive" } },
          { student_code: { contains: search, mode: "insensitive" } },
          { cnic: { contains: search, mode: "insensitive" } },
        ];
      }

      if (branchId) {
        where.branch_id = branchId;
      }

      const [students, total] = await Promise.all([
        prisma.student.findMany({
          where,
          include: {
            branch: true,
            user: true,
          },
          skip,
          take: limit,
          orderBy: { created_at: "desc" },
        }),
        prisma.student.count({ where }),
      ]);

      return {
        success: true,
        message: "Students fetched successfully",
        data: students,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      console.error("getAllStudents error:", error);
      return {
        success: false,
        message: error.message || "Failed to fetch students",
      };
    }
  }

  // Get single student by ID
  static async getStudentById(id: string): Promise<ApiResponse> {
    try {
      const student = await prisma.student.findUnique({
        where: { id },
        include: {
          branch: true,
          user: true,
          enrollments: {
            include: {
              course: true,
            },
          },
        },
      });

      if (!student) {
        return {
          success: false,
          message: "Student not found",
        };
      }

      return {
        success: true,
        message: "Student fetched successfully",
        data: student,
      };
    } catch (error: any) {
      console.error("getStudentById error:", error);
      return {
        success: false,
        message: error.message || "Failed to fetch student",
      };
    }
  }

  // Get student enrollments
  static async getStudentEnrollments(id: string): Promise<ApiResponse> {
    try {
      const enrollments = await prisma.studentEnrollment.findMany({
        where: { student_id: id },
        include: {
          course: {
            include: {
              subject: true,
              grade_level: true,
              teacher: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Student enrollments fetched successfully",
        data: enrollments,
      };
    } catch (error: any) {
      console.error("getStudentEnrollments error:", error);
      return {
        success: false,
        message: error.message || "Failed to fetch student enrollments",
      };
    }
  }

  // Get student grades
  static async getStudentGrades(id: string): Promise<ApiResponse> {
    try {
      const grades = await prisma.grade.findMany({
        where: { student_id: id },
        include: {
          course: true,
          academic_year: true,
          graded_by_teacher: true,
        },
        orderBy: { created_at: "desc" },
      });

      return {
        success: true,
        message: "Student grades fetched successfully",
        data: grades,
      };
    } catch (error: any) {
      console.error("getStudentGrades error:", error);
      return {
        success: false,
        message: error.message || "Failed to fetch student grades",
      };
    }
  }

  // Get student attendance
  static async getStudentAttendance(id: string): Promise<ApiResponse> {
    try {
      const attendance = await prisma.attendance.findMany({
        where: { student_id: id },
        include: {
          course: true,
        },
        orderBy: { date: "desc" },
      });

      return {
        success: true,
        message: "Student attendance fetched successfully",
        data: attendance,
      };
    } catch (error: any) {
      console.error("getStudentAttendance error:", error);
      return {
        success: false,
        message: error.message || "Failed to fetch student attendance",
      };
    }
  }

  // Create student
  static async createStudent(data: any): Promise<ApiResponse> {
    try {
      const {
        first_name,
        last_name,
        branch_id,
        student_code,
        date_of_birth,
        gender,
        blood_group,
        nationality,
        cnic,
        passport_number,
        permanent_address,
        current_address,
        city,
        postal_code,
        personal_phone,
        personal_email,
        admission_date,
        admission_status,
        current_grade_level_id,
        username,
        password,
      } = data;

      // Validation
      if (!first_name || !last_name || !branch_id || !student_code || !date_of_birth || !admission_date) {
        return {
          success: false,
          message: "Missing required fields",
        };
      }

      // Check if student code already exists
      const existing = await prisma.student.findUnique({
        where: { student_code },
      });

      if (existing) {
        return {
          success: false,
          message: "Student code already exists",
        };
      }

      let userId = data.user_id;

      // If username and password provided, create user account
      if (username && password) {
        // Check if username exists
        const existingUser = await prisma.user.findUnique({ where: { username } });
        if (existingUser) {
          return { success: false, message: "Username already exists" };
        }

        // Get Student Role
        const studentRole = await prisma.role.findFirst({
          where: { name: 'Student' } // Global student role
        });

        if (!studentRole) {
          return { success: false, message: "Student role configuration error" };
        }

        const bcryptjs = require("bcryptjs");
        const hashedPassword = await bcryptjs.hash(password, 10);

        const newUser = await prisma.user.create({
          data: {
            username,
            password_hash: hashedPassword,
            email: personal_email || `${username}@koolhub.edu`,
            first_name,
            last_name,
            phone: personal_phone,
            role_id: studentRole.id,
            branch_id: branch_id,
            is_active: true
          }
        });
        userId = newUser.id;
      }

      // Create student
      const student = await prisma.student.create({
        data: {
          first_name,
          last_name,
          student_code,
          branch_id,
          user_id: userId || null, // Link to user account
          current_grade_level_id: current_grade_level_id || null,
          date_of_birth: new Date(date_of_birth),
          admission_date: new Date(admission_date),
          gender: gender || null,
          blood_group: blood_group || null,
          nationality: nationality || null,
          cnic: cnic || null,
          passport_number: passport_number || null,
          permanent_address: permanent_address || null,
          current_address: current_address || null,
          city: city || null,
          postal_code: postal_code || null,
          personal_phone: personal_phone || null,
          personal_email: personal_email || null,
          admission_status: admission_status || "pending",
        },
        include: {
          branch: true,
          user: true, // Include user in response
        },
      });

      return {
        success: true,
        message: "Student created successfully",
        data: student,
      };
    } catch (error: any) {
      console.error("createStudent error:", error);
      return {
        success: false,
        message: error.message || "Failed to create student",
      };
    }
  }

  // Update student
  static async updateStudent(id: string, data: any): Promise<ApiResponse> {
    try {
      const {
        first_name,
        last_name,
        branch_id,
        student_code,
        date_of_birth,
        gender,
        blood_group,
        nationality,
        cnic,
        passport_number,
        permanent_address,
        current_address,
        city,
        postal_code,
        personal_phone,
        personal_email,
        admission_date,
        admission_status,
      } = data;

      // Check if student exists
      const student = await prisma.student.findUnique({
        where: { id },
      });

      if (!student) {
        return {
          success: false,
          message: "Student not found",
        };
      }

      // Check if student code is being changed to an existing one
      if (student_code && student_code !== student.student_code) {
        const existing = await prisma.student.findUnique({
          where: { student_code },
        });
        if (existing) {
          return {
            success: false,
            message: "Student code already exists",
          };
        }
      }

      // Update student
      const updated = await prisma.student.update({
        where: { id },
        data: {
          ...(first_name && { first_name }),
          ...(last_name && { last_name }),
          ...(student_code && { student_code }),
          ...(branch_id && { branch_id }),
          ...(date_of_birth && { date_of_birth: new Date(date_of_birth) }),
          ...(gender !== undefined && { gender }),
          ...(blood_group !== undefined && { blood_group }),
          ...(nationality !== undefined && { nationality }),
          ...(cnic !== undefined && { cnic }),
          ...(passport_number !== undefined && { passport_number }),
          ...(permanent_address !== undefined && { permanent_address }),
          ...(current_address !== undefined && { current_address }),
          ...(city !== undefined && { city }),
          ...(postal_code !== undefined && { postal_code }),
          ...(personal_phone !== undefined && { personal_phone }),
          ...(personal_email !== undefined && { personal_email }),
          ...(admission_date && { admission_date: new Date(admission_date) }),
          ...(admission_status !== undefined && { admission_status }),
        },
        include: {
          branch: true,
        },
      });

      return {
        success: true,
        message: "Student updated successfully",
        data: updated,
      };
    } catch (error: any) {
      console.error("updateStudent error:", error);
      return {
        success: false,
        message: error.message || "Failed to update student",
      };
    }
  }

  // Delete student (soft delete)
  static async deleteStudent(id: string): Promise<ApiResponse> {
    try {
      // Check if student exists
      const student = await prisma.student.findUnique({
        where: { id },
      });

      if (!student) {
        return {
          success: false,
          message: "Student not found",
        };
      }

      // Soft delete student by setting is_active to false
      const updatedStudent = await prisma.student.update({
        where: { id },
        data: { is_active: false },
      });

      return {
        success: true,
        message: "Student deleted successfully",
        data: updatedStudent,
      };
    } catch (error: any) {
      console.error("deleteStudent error:", error);
      return {
        success: false,
        message: error.message || "Failed to delete student",
      };
    }
  }
}

export default StudentService;
