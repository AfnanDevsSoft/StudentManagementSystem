import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class CourseService {
  static async getAllCourses(
    page: number = 1,
    limit: number = 20,
    search?: string,
    branchId?: string,
    userContext?: any
  ) {
    try {
      const skip = (page - 1) * limit;
      const where: any = { is_active: true };

      // Data Scoping
      if (userContext && userContext.role?.name !== 'SuperAdmin') {
        where.branch_id = userContext.branch_id;
      } else if (branchId) {
        where.branch_id = branchId;
      }

      if (search) {
        where.OR = [
          { course_name: { contains: search, mode: "insensitive" } },
          { course_code: { contains: search, mode: "insensitive" } },
        ];
      }

      const [courses, total] = await Promise.all([
        prisma.course.findMany({
          where,
          skip,
          take: limit,
          include: {
            teacher: true,
            subject: true,
            grade_level: true,
            academic_year: true,
          },
        }),
        prisma.course.count({ where }),
      ]);

      return {
        success: true,
        data: courses,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async getCourseById(courseId: string) {
    try {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
          teacher: true,
          subject: true,
          grade_level: true,
          academic_year: true,
          enrollments: { include: { student: true } },
        },
      });

      if (!course) return { success: false, message: "Course not found" };
      return { success: true, data: course };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async createCourse(courseData: any) {
    try {
      if (!courseData.course_code || !courseData.course_name) {
        return { success: false, message: "Course code and name are required" };
      }

      console.log("DEBUG: Creating course with data:", {
        ...courseData,
        branch_id: courseData.branch_id,
        academic_year_id: courseData.academic_year_id,
        subject_id: courseData.subject_id,
        grade_level_id: courseData.grade_level_id,
        teacher_id: courseData.teacher_id,
      });

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const uuidFields = ['branch_id', 'academic_year_id', 'subject_id', 'grade_level_id', 'teacher_id'];

      for (const field of uuidFields) {
        if (courseData[field] && !uuidRegex.test(courseData[field])) {
          console.error(`Invalid UUID for field ${field}: ${courseData[field]}`);
          return { success: false, message: `Invalid UUID for field ${field}: ${courseData[field]}` };
        }
      }

      const course = await prisma.course.create({
        data: {
          branch_id: courseData.branch_id,
          academic_year_id: courseData.academic_year_id,
          subject_id: courseData.subject_id,
          grade_level_id: courseData.grade_level_id,
          teacher_id: courseData.teacher_id,
          course_code: courseData.course_code,
          course_name: courseData.course_name,
          description: courseData.description,
          max_students: courseData.max_students || 40,
          room_number: courseData.room_number,
          building: courseData.building,
          schedule: courseData.schedule,
        },
        include: { teacher: true, subject: true },
      });

      return {
        success: true,
        data: course,
        message: "Course created successfully",
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async updateCourse(courseId: string, courseData: any) {
    try {
      const course = await prisma.course.update({
        where: { id: courseId },
        data: courseData,
        include: { teacher: true, subject: true },
      });

      return {
        success: true,
        data: course,
        message: "Course updated successfully",
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async deleteCourse(courseId: string) {
    try {
      const course = await prisma.course.update({
        where: { id: courseId },
        data: { is_active: false },
      });

      return {
        success: true,
        data: course,
        message: "Course deleted successfully",
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async getCourseEnrollments(courseId: string) {
    try {
      const enrollments = await prisma.studentEnrollment.findMany({
        where: { course_id: courseId },
        include: { student: true },
      });

      return { success: true, data: enrollments };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async getCourseStudents(courseId: string) {
    try {
      const enrollments = await prisma.studentEnrollment.findMany({
        where: { course_id: courseId, status: "enrolled" },
        include: { student: true },
      });

      const students = enrollments.map((e) => e.student);
      return { success: true, data: students };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }
}

export default CourseService;
