import { prisma } from "../lib/db";

export class ReportingService {
  /**
   * Generate student progress report
   */
  static async generateStudentReport(
    branchId: string,
    courseId?: string,
    format: "pdf" | "excel" = "pdf"
  ) {
    try {
      const where: any = {};
      if (courseId) {
        where.course_id = courseId;
      }

      const enrollments = await prisma.studentEnrollment.findMany({
        where,
        include: {
          student: {
            select: { first_name: true, last_name: true },
          },
          course: { select: { course_name: true } },
        },
      });

      const report = await prisma.report.create({
        data: {
          branch_id: branchId,
          report_type: "student_progress",
          title: `Student Progress Report - ${new Date().toLocaleDateString()}`,
          generated_by: "system", // TODO: Get from auth context
          report_format: format,
          status: "completed",
        },
      });

      return {
        success: true,
        message: "Student progress report generated",
        data: { report, enrollments: enrollments.length },
      };
    } catch (error: any) {
      console.error("Error generating student report:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Generate teacher performance report
   */
  static async generateTeacherReport(
    branchId: string,
    teacherId?: string,
    format: "pdf" | "excel" = "pdf"
  ) {
    try {
      const where: any = { branch_id: branchId };
      if (teacherId) {
        where.id = teacherId;
      }

      const teachers = await prisma.teacher.findMany({
        where,
        include: {
          courses: {
            select: {
              course_name: true,
              _count: { select: { enrollments: true } },
            },
          },
        },
      });

      const report = await prisma.report.create({
        data: {
          branch_id: branchId,
          report_type: "teacher_performance",
          title: `Teacher Performance Report - ${new Date().toLocaleDateString()}`,
          generated_by: "system",
          report_format: format,
          status: "completed",
        },
      });

      return {
        success: true,
        message: "Teacher performance report generated",
        data: { report, teachers: teachers.length },
      };
    } catch (error: any) {
      console.error("Error generating teacher report:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Generate fee collection report
   */
  static async generateFeeReport(
    branchId: string,
    format: "pdf" | "excel" = "pdf"
  ) {
    try {
      const report = await prisma.report.create({
        data: {
          branch_id: branchId,
          report_type: "fee_collection",
          title: `Fee Collection Report - ${new Date().toLocaleDateString()}`,
          generated_by: "system",
          report_format: format,
          status: "completed",
        },
      });

      return {
        success: true,
        message: "Fee collection report generated",
        data: report,
      };
    } catch (error: any) {
      console.error("Error generating fee report:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Generate attendance summary report
   */
  static async generateAttendanceReport(
    branchId: string,
    startDate: Date,
    endDate: Date,
    format: "pdf" | "excel" = "pdf"
  ) {
    try {
      const attendance = await prisma.attendance.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          student: { select: { first_name: true, last_name: true } },
          course: { select: { course_name: true } },
        },
      });

      const report = await prisma.report.create({
        data: {
          branch_id: branchId,
          report_type: "attendance_summary",
          title: `Attendance Report - ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
          generated_by: "system",
          report_format: format,
          date_range_start: startDate,
          date_range_end: endDate,
          status: "completed",
        },
      });

      // Calculate statistics
      const totalRecords = attendance.length;
      const presentCount = attendance.filter(
        (a) => a.status === "present"
      ).length;
      const absentCount = attendance.filter(
        (a) => a.status === "absent"
      ).length;
      const attendanceRate = (presentCount / totalRecords) * 100;

      return {
        success: true,
        message: "Attendance report generated",
        data: {
          report,
          stats: {
            totalRecords,
            presentCount,
            absentCount,
            attendanceRate: attendanceRate.toFixed(2) + "%",
          },
        },
      };
    } catch (error: any) {
      console.error("Error generating attendance report:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get all reports
   */
  static async getReports(
    branchId: string,
    limit: number = 20,
    offset: number = 0
  ) {
    try {
      const [reports, total] = await Promise.all([
        prisma.report.findMany({
          where: { branch_id: branchId },
          orderBy: { generated_at: "desc" },
          take: limit,
          skip: offset,
        }),
        prisma.report.count({ where: { branch_id: branchId } }),
      ]);

      return {
        success: true,
        message: "Reports retrieved",
        data: reports,
        pagination: {
          limit,
          offset,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      console.error("Error getting reports:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Delete report
   */
  static async deleteReport(reportId: string) {
    try {
      const report = await prisma.report.delete({
        where: { id: reportId },
      });

      return {
        success: true,
        message: "Report deleted",
        data: report,
      };
    } catch (error: any) {
      console.error("Error deleting report:", error);
      return { success: false, message: error.message };
    }
  }
}

export default ReportingService;
