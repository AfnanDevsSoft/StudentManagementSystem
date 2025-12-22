import { prisma } from "../lib/db";
import * as fs from "fs";
import * as path from "path";

export class FileExportService {
  private static exportsDir = path.join(process.cwd(), "exports");

  static ensureExportsDirectory() {
    if (!fs.existsSync(this.exportsDir)) {
      fs.mkdirSync(this.exportsDir, { recursive: true });
    }
  }

  // ============= Export Creation =============

  static async createExport(
    userId: string,
    exportType: string,
    format: "pdf" | "excel" | "csv",
    filters?: any
  ) {
    try {
      this.ensureExportsDirectory();

      const fileExport = await prisma.fileExport.create({
        data: {
          user_id: userId,
          export_type: exportType,
          format,
          filters: filters || {},
          status: "processing",
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      // Simulate export generation
      await this.generateExportFile(fileExport.id, exportType, format, filters);

      return {
        success: true,
        message: "Export created successfully",
        data: fileExport,
      };
    } catch (error: any) {
      return { success: false, message: error.message, code: "EXPORT_ERROR" };
    }
  }

  static async generateExportFile(
    exportId: string,
    exportType: string,
    format: string,
    filters?: any
  ) {
    try {
      const fileExport = await prisma.fileExport.findUnique({
        where: { id: exportId },
      });
      if (!fileExport) throw new Error("Export not found");

      let data: any[] = [];
      let fileName = "";

      switch (exportType) {
        case "students":
          data = await this.getStudentData(filters);
          fileName = `students_${new Date().toISOString()}.${format}`;
          break;
        case "teachers":
          data = await this.getTeacherData(filters);
          fileName = `teachers_${new Date().toISOString()}.${format}`;
          break;
        case "attendance":
          data = await this.getAttendanceData(filters);
          fileName = `attendance_${new Date().toISOString()}.${format}`;
          break;
        case "fees":
          data = await this.getFeeData(filters);
          fileName = `fees_${new Date().toISOString()}.${format}`;
          break;
        case "courses":
          data = await this.getCourseData(filters);
          fileName = `courses_${new Date().toISOString()}.${format}`;
          break;
        default:
          throw new Error("Unknown export type");
      }

      const filePath = path.join(this.exportsDir, fileName);

      if (format === "csv") {
        this.writeToCsv(filePath, data);
      } else if (format === "excel") {
        this.writeToExcel(filePath, data);
      } else if (format === "pdf") {
        this.writeToPdf(filePath, data, exportType);
      }

      const fileSize = fs.existsSync(filePath) ? fs.statSync(filePath).size : 0;
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      await prisma.fileExport.update({
        where: { id: exportId },
        data: {
          file_url: `/exports/${fileName}`,
          file_size: fileSize,
          status: "completed",
          expires_at: expiresAt,
        },
      });
    } catch (error) {
      console.error("Export generation error:", error);
      await prisma.fileExport.update({
        where: { id: exportId },
        data: {
          status: "failed",
          error_message: (error as any).message,
        },
      });
    }
  }

  // ============= Data Retrieval =============

  private static async getStudentData(filters?: any) {
    const where: any = {};
    if (filters?.branch_id) where.branch_id = filters.branch_id;
    if (filters?.grade) where.grade = filters.grade;

    return await prisma.student.findMany({
      where,
    });
  }

  private static async getTeacherData(filters?: any) {
    const where: any = {};
    if (filters?.branch_id) where.branch_id = filters.branch_id;
    if (filters?.specialization) where.specialization = filters.specialization;

    return await prisma.teacher.findMany({
      where,
    });
  }

  private static async getAttendanceData(filters?: any) {
    const where: any = {};
    if (filters?.course_id) where.course_id = filters.course_id;
    if (filters?.date_from)
      where.attendance_date = { gte: new Date(filters.date_from) };

    return await prisma.attendance.findMany({
      where,
    });
  }

  private static async getFeeData(filters?: any) {
    const where: any = {};
    if (filters?.student_id) where.student_id = filters.student_id;
    if (filters?.status) where.payment_status = filters.status;

    return await prisma.fee.findMany({
      where,
    });
  }

  private static async getCourseData(filters?: any) {
    const where: any = {};
    if (filters?.branch_id) where.branch_id = filters.branch_id;
    if (filters?.grade) where.grade = filters.grade;

    return await prisma.course.findMany({
      where,
    });
  }

  // ============= File Format Writing =============

  private static writeToCsv(filePath: string, data: any[]) {
    try {
      if (data.length === 0) {
        fs.writeFileSync(filePath, "No data available");
        return;
      }

      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(","),
        ...data.map((row) =>
          headers.map((h) => JSON.stringify(row[h] || "")).join(",")
        ),
      ].join("\n");

      fs.writeFileSync(filePath, csvContent);
    } catch (error) {
      console.error("CSV write error:", error);
    }
  }

  private static writeToExcel(filePath: string, data: any[]) {
    try {
      // In production, use exceljs library
      // For now, create a simple JSON representation
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Excel write error:", error);
    }
  }

  private static writeToPdf(filePath: string, data: any[], exportType: string) {
    try {
      // In production, use pdfkit library
      // For now, create a simple text file
      const content = `
${exportType.toUpperCase()} EXPORT
Generated: ${new Date().toISOString()}
Record Count: ${data.length}

${JSON.stringify(data, null, 2)}
      `;
      fs.writeFileSync(filePath, content);
    } catch (error) {
      console.error("PDF write error:", error);
    }
  }

  // ============= Export Status & History =============

  static async getExportStatus(exportId: string) {
    try {
      const fileExport = await prisma.fileExport.findUnique({
        where: { id: exportId },
      });
      if (!fileExport) return { success: false, message: "Export not found" };
      return { success: true, data: fileExport };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async getUserExports(userId: string, limit = 20, offset = 0) {
    try {
      const exports = await prisma.fileExport.findMany({
        where: { user_id: userId },
        orderBy: { created_at: "desc" },
        take: limit,
        skip: offset,
      });

      const total = await prisma.fileExport.count({
        where: { user_id: userId },
      });

      return {
        success: true,
        data: exports,
        total,
        limit,
        offset,
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async getAllExports(limit = 50, offset = 0) {
    try {
      const exports = await prisma.fileExport.findMany({
        orderBy: { created_at: "desc" },
        take: limit,
        skip: offset,
      });

      const total = await prisma.fileExport.count();

      return {
        success: true,
        data: exports,
        total,
        limit,
        offset,
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async downloadExport(exportId: string) {
    try {
      const fileExport = await prisma.fileExport.findUnique({
        where: { id: exportId },
      });
      if (!fileExport) return { success: false, message: "Export not found" };

      if (!fileExport.file_url)
        return { success: false, message: "File not ready" };

      // Update download count
      await prisma.fileExport.update({
        where: { id: exportId },
        data: { download_count: { increment: 1 } },
      });

      return { success: true, data: fileExport };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  // ============= Export Scheduling =============

  static async scheduleRecurringExport(
    userId: string,
    exportType: string,
    format: string,
    frequency: string,
    recipients: string[],
    filters?: any
  ) {
    try {
      const schedule = await prisma.exportSchedule.create({
        data: {
          user_id: userId,
          export_type: exportType,
          format,
          frequency,
          recipients,
          filters: filters || {},
          next_run_at: this.calculateNextRun(frequency),
          is_active: true,
        },
      });

      return {
        success: true,
        message: "Export schedule created",
        data: schedule,
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async getExportSchedules(userId?: string) {
    try {
      const schedules = await prisma.exportSchedule.findMany({
        where: userId
          ? { user_id: userId, is_active: true }
          : { is_active: true },
      });

      return { success: true, data: schedules };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async updateSchedule(scheduleId: string, updates: any) {
    try {
      const schedule = await prisma.exportSchedule.update({
        where: { id: scheduleId },
        data: updates,
      });

      return { success: true, message: "Schedule updated", data: schedule };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async cancelSchedule(scheduleId: string) {
    try {
      const schedule = await prisma.exportSchedule.update({
        where: { id: scheduleId },
        data: { is_active: false },
      });

      return { success: true, message: "Schedule cancelled", data: schedule };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  // ============= Export Management =============

  static async cancelExport(exportId: string) {
    try {
      const fileExport = await prisma.fileExport.update({
        where: { id: exportId },
        data: { status: "cancelled" },
      });

      return { success: true, message: "Export cancelled", data: fileExport };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async deleteExpiredExports() {
    try {
      const now = new Date();
      const deleted = await prisma.fileExport.deleteMany({
        where: {
          expires_at: { lte: now },
        },
      });

      // Also delete files from disk
      const expiringExports = await prisma.fileExport.findMany({
        where: { expires_at: { lte: now } },
      });

      expiringExports.forEach((exp: any) => {
        if (exp.file_url) {
          const filePath = path.join(
            this.exportsDir,
            path.basename(exp.file_url)
          );
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      });

      return {
        success: true,
        message: `${deleted.count} expired exports deleted`,
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async getExportStats() {
    try {
      const stats = {
        total_exports: await prisma.fileExport.count(),
        exports_by_status: {
          processing: await prisma.fileExport.count({
            where: { status: "processing" },
          }),
          completed: await prisma.fileExport.count({
            where: { status: "completed" },
          }),
          failed: await prisma.fileExport.count({
            where: { status: "failed" },
          }),
          cancelled: await prisma.fileExport.count({
            where: { status: "cancelled" },
          }),
        },
        exports_by_format: {
          pdf: await prisma.fileExport.count({ where: { format: "pdf" } }),
          excel: await prisma.fileExport.count({ where: { format: "excel" } }),
          csv: await prisma.fileExport.count({ where: { format: "csv" } }),
        },
        total_file_size: 0,
        active_schedules: await prisma.exportSchedule.count({
          where: { is_active: true },
        }),
      };

      const exports = await prisma.fileExport.findMany();
      stats.total_file_size = exports.reduce(
        (sum: number, exp: any) => sum + (exp.file_size || 0),
        0
      );

      return { success: true, data: stats };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  // ============= Helper Methods =============

  private static calculateNextRun(frequency: string): Date {
    const next = new Date();

    switch (frequency) {
      case "daily":
        next.setDate(next.getDate() + 1);
        break;
      case "weekly":
        next.setDate(next.getDate() + 7);
        break;
      case "monthly":
        next.setMonth(next.getMonth() + 1);
        break;
    }

    return next;
  }
}
