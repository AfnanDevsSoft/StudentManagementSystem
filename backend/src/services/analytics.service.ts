import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class AnalyticsService {
  /**
   * Calculate student enrollment metrics
   */
  static async getEnrollmentMetrics(branchId?: string) {
    try {
      const where: any = {};
      if (branchId) {
        where.course = { branch_id: branchId };
      }

      const totalEnrollments = await prisma.studentEnrollment.count({
        where,
      });

      const enrollmentsByGrade = await prisma.studentEnrollment.groupBy({
        by: ["course_id"],
        where,
        _count: {
          id: true,
        },
      });

      // For analytics metrics, we'll just return the calculated data
      return {
        success: true,
        message: "Enrollment metrics calculated",
        data: {
          totalEnrollments,
          enrollmentsByGrade,
        },
      };
    } catch (error: any) {
      console.error("Error calculating enrollment metrics:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Calculate attendance metrics
   */
  static async getAttendanceMetrics(
    branchId: string | undefined,
    startDate: Date,
    endDate: Date
  ) {
    try {
      const where: any = {
        date: {
          gte: startDate,
          lte: endDate,
        },
      };

      if (branchId) {
        where.course = { branch_id: branchId };
      }

      const attendanceRecords = await prisma.attendance.findMany({
        where,
      });

      const totalRecords = attendanceRecords.length;
      const presentCount = attendanceRecords.filter(
        (a) => a.status === "present"
      ).length;
      const attendanceRate =
        totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0;

      return {
        success: true,
        message: "Attendance metrics calculated",
        data: {
          totalRecords,
          presentCount,
          absentCount: totalRecords - presentCount,
          attendancePercentage: attendanceRate.toFixed(2) + "%",
        },
      };
    } catch (error: any) {
      console.error("Error calculating attendance metrics:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get fee collection metrics
   */
  static async getFeeMetrics(branchId?: string) {
    try {
      if (branchId) {
        const branch = await prisma.branch.findUnique({
          where: { id: branchId },
          include: { students: { select: { id: true } } },
        });

        if (!branch) return { success: false, message: "Branch not found" };

        return {
          success: true,
          message: "Fee metrics calculated",
          data: { totalStudents: branch.students.length }
        };
      } else {
        const totalStudents = await prisma.student.count();
        return {
          success: true,
          message: "Global fee metrics calculated",
          data: { totalStudents }
        };
      }
    } catch (error: any) {
      console.error("Error calculating fee metrics:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get teacher performance metrics
   */
  static async getTeacherMetrics(branchId?: string, teacherId?: string) {
    try {
      const where: any = {};
      if (branchId) where.branch_id = branchId;
      if (teacherId) {
        where.id = teacherId;
      }

      const teachers = await prisma.teacher.findMany({
        where,
        include: {
          courses: {
            include: {
              _count: {
                select: {
                  enrollments: true,
                  grades: true,
                },
              },
            },
          },
        },
      });

      return {
        success: true,
        message: "Teacher metrics calculated",
        data: {
          totalTeachers: teachers.length,
          teacherDetails: teachers.map((t) => ({
            id: t.id,
            name: `${t.first_name} ${t.last_name}`,
            courses: t.courses.length,
          })),
        },
      };
    } catch (error: any) {
      console.error("Error calculating teacher metrics:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get dashboard summary
   */
  /**
   * Get dashboard summary
   */
  static async getDashboardData(branchId?: string) {
    try {
      const whereClause = branchId ? { branch_id: branchId } : {};

      const [totalStudents, totalTeachers, totalCourses] = await Promise.all([
        prisma.student.count({ where: whereClause }),
        prisma.teacher.count({ where: whereClause }),
        prisma.course.count({ where: whereClause }),
      ]);

      return {
        success: true,
        message: "Dashboard data retrieved",
        data: {
          totalStudents,
          totalTeachers,
          totalCourses,
          monthlyRevenue: 25000, // Mock data
          attendanceRate: 92, // Mock data
          avgGrade: 85, // Mock data
          attendanceHistory: [
            { name: 'Mon', present: 110, absent: 10 },
            { name: 'Tue', present: 115, absent: 5 },
            { name: 'Wed', present: 108, absent: 12 },
            { name: 'Thu', present: 112, absent: 8 },
            { name: 'Fri', present: 105, absent: 15 },
          ],
          revenueHistory: [
            { name: 'Jan', income: 4000, expense: 2400 },
            { name: 'Feb', income: 3000, expense: 1398 },
            { name: 'Mar', income: 2000, expense: 9800 },
            { name: 'Apr', income: 2780, expense: 3908 },
            { name: 'May', income: 1890, expense: 4800 },
            { name: 'Jun', income: 2390, expense: 3800 },
          ],
          gradeDistribution: [
            { name: 'A', count: 30 },
            { name: 'B', count: 45 },
            { name: 'C', count: 25 },
            { name: 'D', count: 15 },
            { name: 'F', count: 5 },
          ]
        },
      };
    } catch (error: any) {
      console.error("Error getting dashboard data:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get trend analysis
   */
  static async getTrendAnalysis(
    branchId: string,
    metricType: string,
    days: number = 30
  ) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Return mock trend data for now
      const trends = {
        up: Math.floor(Math.random() * 5),
        down: Math.floor(Math.random() * 5),
        stable: Math.floor(Math.random() * 5),
      };

      return {
        success: true,
        message: "Trend analysis completed",
        data: {
          trends,
          period: `Last ${days} days`,
        },
      };
    } catch (error: any) {
      console.error("Error analyzing trends:", error);
      return { success: false, message: error.message };
    }
  }
}

export default AnalyticsService;
