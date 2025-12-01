import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class TeacherService {
  static async getAllTeachers(
    page: number = 1,
    limit: number = 20,
    search?: string
  ) {
    try {
      const skip = (page - 1) * limit;
      const where: any = { is_active: true };

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
      if (!teacherData.employee_code || !teacherData.branch_id) {
        return {
          success: false,
          message: "Employee code and branch ID are required",
        };
      }

      const teacher = await prisma.teacher.create({
        data: {
          branch_id: teacherData.branch_id,
          employee_code: teacherData.employee_code,
          first_name: teacherData.first_name,
          last_name: teacherData.last_name,
          email: teacherData.email,
          phone: teacherData.phone,
          date_of_birth: teacherData.date_of_birth,
          gender: teacherData.gender,
          hire_date: teacherData.hire_date || new Date(),
          employment_type: teacherData.employment_type || "full_time",
          designation: teacherData.designation,
          qualification: teacherData.qualification,
          years_experience: teacherData.years_experience,
          department: teacherData.department,
        },
        include: { branch: true },
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
        include: { subject: true, grade_level: true },
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
