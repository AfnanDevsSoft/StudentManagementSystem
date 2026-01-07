import bcryptjs from "bcryptjs";
import { prisma } from "../lib/db";

export class TeacherService {
  static async getAllTeachers(
    page: number = 1,
    limit: number = 20,
    search?: string,
    branchId?: string,
    userContext?: any
  ) {
    try {
      const skip = (page - 1) * limit;
      const where: any = { is_active: true };

      // Data Scoping: If user is not SuperAdmin, strictly filter by their branch
      if (userContext && userContext.role?.name !== 'SuperAdmin') {
        where.branch_id = userContext.branch_id;
      } else if (branchId) {
        where.branch_id = branchId;
      }

      if (search) {
        where.OR = [
          { first_name: { contains: search, mode: "insensitive" } },
          { last_name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { employee_code: { contains: search, mode: "insensitive" } },
        ];
      }

      const [teachers, total] = await Promise.all([
        prisma.teacher.findMany({
          where,
          skip,
          take: limit,
          include: {
            branch: { select: { name: true } },
            courses: { select: { course_name: true } },
            user: { select: { employee_id: true } },
          },
        }),
        prisma.teacher.count({ where }),
      ]);

      return {
        success: true,
        data: teachers,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async getTeacherById(teacherId: string) {
    try {
      const teacher = await prisma.teacher.findUnique({
        where: { id: teacherId },
        include: {
          branch: true,
          courses: true,
          leave_requests: true,
          payroll_records: true,
        },
      });

      if (!teacher) return { success: false, message: "Teacher not found" };
      return { success: true, data: teacher };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async createTeacher(teacherData: any) {
    try {
      if (!teacherData.branch_id) {
        return {
          success: false,
          message: "Branch ID is required",
        };
      }

      let userId = teacherData.user_id;

      // If username and password provided, create user account
      if (teacherData.username && teacherData.password) {
        // Check if username exists
        console.log("DEBUG: Checking existing user...");
        const existingUser = await prisma.user.findUnique({ where: { username: teacherData.username } });
        if (existingUser) {
          return { success: false, message: "Username already exists" };
        }

        // Check if email exists
        const existingEmail = await prisma.user.findUnique({ where: { email: teacherData.email } });
        if (existingEmail) {
          return { success: false, message: "Email already exists" };
        }

        // Get Teacher Role
        console.log("DEBUG: Finding Teacher role...");
        const teacherRole = await prisma.role.findFirst({
          where: { name: { equals: 'Teacher', mode: 'insensitive' } } // Case insensitive check
        });

        if (!teacherRole) {
          console.error("DEBUG: Teacher role not found");
          return { success: false, message: "Teacher role configuration error" };
        }
        console.log("DEBUG: Teacher role found:", teacherRole.id);

        console.log("DEBUG: Hashing password...");
        const hashedPassword = await bcryptjs.hash(teacherData.password, 10);
        console.log("DEBUG: Password hashed");

        console.log("DEBUG: Creating user...");
        const newUser = await prisma.user.create({
          data: {
            username: teacherData.username,
            password_hash: hashedPassword,
            email: teacherData.email || `${teacherData.username}@koolhub.edu`,
            first_name: teacherData.first_name,
            last_name: teacherData.last_name,
            phone: teacherData.phone,
            role_id: teacherRole.id,
            branch_id: teacherData.branch_id,
            is_active: true
          }
        });
        userId = newUser.id;
        console.log("DEBUG: User created", userId);

        // SYNC RBAC ROLE: Assign Teacher RBAC role to user
        try {
          const teacherRbacRole = await prisma.rBACRole.findUnique({
            where: { role_name: 'Teacher' }
          });

          if (teacherRbacRole) {
            await prisma.userRole.create({
              data: {
                user_id: newUser.id,
                rbac_role_id: teacherRbacRole.id,
                branch_id: teacherData.branch_id,
                assigned_by: teacherData.assignedBy || newUser.id,
              }
            });
            console.log("DEBUG: RBAC role assigned to teacher");
          }
        } catch (rbacError) {
          console.error("Warning: Failed to assign RBAC role to teacher:", rbacError);
        }
      }

      const { EmployeeIdService } = require('./employee-id.service');
      // Auto-generate employee_code if not provided
      let finalEmployeeCode = teacherData.employee_code;

      if (!finalEmployeeCode) {
        try {
          // If we have a user, ensure they have an ID and use it
          if (userId) {
            finalEmployeeCode = await EmployeeIdService.assignEmployeeId(userId, teacherData.branch_id);
          } else {
            // If no user, just generate a raw ID using a dummy ID for the function signature
            finalEmployeeCode = await EmployeeIdService.generateEmployeeId("temp-generation", teacherData.branch_id);
          }
        } catch (e) {
          console.error("Failed to generate employee ID for teacher:", e);
          finalEmployeeCode = `EMP-${Date.now()}`;
        }
      }

      const teacher = await prisma.teacher.create({
        data: {
          branch_id: teacherData.branch_id,
          user_id: userId || null, // Link to user account for login
          employee_code: finalEmployeeCode,
          first_name: teacherData.first_name,
          last_name: teacherData.last_name,
          email: teacherData.email,
          phone: teacherData.phone,
          date_of_birth: teacherData.date_of_birth ? new Date(teacherData.date_of_birth) : null,
          gender: teacherData.gender,
          nationality: teacherData.nationality,
          hire_date: teacherData.hire_date ? new Date(teacherData.hire_date) : new Date(),
          employment_type: teacherData.employment_type || "full_time",
          designation: teacherData.designation,
          qualification: teacherData.qualification || teacherData.qualification_level,
          years_experience: teacherData.years_experience || teacherData.years_of_experience,
          department: teacherData.department,
          total_leaves: teacherData.total_leaves !== undefined ? parseInt(teacherData.total_leaves) : 24,
          used_leaves: teacherData.used_leaves !== undefined ? parseInt(teacherData.used_leaves) : 0,
        },
        include: {
          branch: true,
          user: true, // Include user in response
        },
      });

      return {
        success: true,
        data: teacher,
        message: "Teacher created successfully",
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async updateTeacher(teacherId: string, teacherData: any) {
    try {
      const teacher = await prisma.teacher.update({
        where: { id: teacherId },
        data: teacherData,
        include: { branch: true, courses: true },
      });

      return {
        success: true,
        data: teacher,
        message: "Teacher updated successfully",
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async deleteTeacher(teacherId: string) {
    try {
      const teacher = await prisma.teacher.update({
        where: { id: teacherId },
        data: { is_active: false },
      });

      return {
        success: true,
        data: teacher,
        message: "Teacher deleted successfully",
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async getTeacherCourses(teacherId: string) {
    try {
      const courses = await prisma.course.findMany({
        where: { teacher_id: teacherId },
        include: {
          subject: true,
          grade_level: true,
          enrollments: true
        },
      });

      return { success: true, data: courses };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async getTeacherAttendance(
    teacherId: string,
    startDate?: Date,
    endDate?: Date
  ) {
    try {
      const where: any = { teacher_id: teacherId };

      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = startDate;
        if (endDate) where.date.lte = endDate;
      }

      const attendance = await prisma.teacherAttendance.findMany({
        where,
        orderBy: { date: "desc" },
      });

      return { success: true, data: attendance };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }
}

export default TeacherService;
