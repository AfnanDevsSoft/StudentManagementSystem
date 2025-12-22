import { prisma } from "../lib/db";
import * as fs from "fs";
import * as path from "path";

export class LoggingService {
  // ============= Application Logging =============

  static async logInfo(message: string, metadata?: any) {
    try {
      await prisma.log.create({
        data: {
          level: "info",
          message,
          metadata: metadata || {},
        },
      });
    } catch (error) {
      console.error("Failed to log info:", error);
    }
  }

  static async logWarning(message: string, metadata?: any) {
    try {
      await prisma.log.create({
        data: {
          level: "warn",
          message,
          metadata: metadata || {},
        },
      });
    } catch (error) {
      console.error("Failed to log warning:", error);
    }
  }

  static async logError(message: string, error?: any, metadata?: any) {
    try {
      await prisma.log.create({
        data: {
          level: "error",
          message,
          metadata: {
            error_message: error?.message,
            error_stack: error?.stack,
            ...metadata,
          },
        },
      });
    } catch (err) {
      console.error("Failed to log error:", err);
    }
  }

  static async logDebug(message: string, metadata?: any) {
    try {
      await prisma.log.create({
        data: {
          level: "debug",
          message,
          metadata: metadata || {},
        },
      });
    } catch (error) {
      console.error("Failed to log debug:", error);
    }
  }

  // ============= API Request Logging =============

  static async logApiRequest(
    method: string,
    endpoint: string,
    userId: string | null,
    statusCode: number,
    duration: number,
    metadata?: any
  ) {
    try {
      await prisma.log.create({
        data: {
          level: statusCode >= 400 ? "warn" : "info",
          message: `${method} ${endpoint} - ${statusCode}`,
          metadata: {
            method,
            endpoint,
            user_id: userId,
            status_code: statusCode,
            duration_ms: duration,
            ...metadata,
          },
        },
      });
    } catch (error) {
      console.error("Failed to log API request:", error);
    }
  }

  static async getApiRequestLogs(
    filters?: { method?: string; endpoint?: string; statusCode?: number },
    limit = 50,
    offset = 0
  ) {
    try {
      const logs = await prisma.log.findMany({
        where: {
          level: { in: ["info", "warn"] },
          metadata: {
            path: ["method"],
            ...(filters && {
              ...(filters.method && { equals: filters.method }),
              ...(filters.endpoint && {
                path: ["endpoint"],
                equals: filters.endpoint,
              }),
            }),
          },
        },
        orderBy: { timestamp: "desc" },
        take: limit,
        skip: offset,
      });
      return { success: true, data: logs };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async getPerformanceMetrics(timeRange: { start: Date; end: Date }) {
    try {
      const logs = await prisma.log.findMany({
        where: {
          timestamp: {
            gte: timeRange.start,
            lte: timeRange.end,
          },
          level: "info",
        },
      });

      const avgDuration =
        logs.reduce(
          (sum, log) => sum + ((log.metadata as any)?.duration_ms || 0),
          0
        ) / logs.length;
      const endpointMetrics = logs.reduce((acc: any, log) => {
        const ep = (log.metadata as any)?.endpoint;
        if (ep) {
          acc[ep] = (acc[ep] || 0) + 1;
        }
        return acc;
      }, {});

      return {
        success: true,
        data: {
          total_requests: logs.length,
          avg_duration_ms: Math.round(avgDuration),
          endpoint_metrics: endpointMetrics,
        },
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async getErrorRate(timeRange: { start: Date; end: Date }) {
    try {
      const total = await prisma.log.count({
        where: {
          timestamp: { gte: timeRange.start, lte: timeRange.end },
        },
      });
      const errors = await prisma.log.count({
        where: {
          level: "error",
          timestamp: { gte: timeRange.start, lte: timeRange.end },
        },
      });
      return {
        success: true,
        data: {
          total_logs: total,
          error_count: errors,
          error_rate:
            total > 0 ? ((errors / total) * 100).toFixed(2) + "%" : "0%",
        },
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  // ============= Business Event Logging =============

  static async logStudentCreated(
    studentId: string,
    branchId: string,
    createdBy: string
  ) {
    return this.logInfo("Student created", {
      student_id: studentId,
      branch_id: branchId,
      created_by: createdBy,
    });
  }

  static async logTeacherAssigned(
    teacherId: string,
    courseId: string,
    assignedBy: string
  ) {
    return this.logInfo("Teacher assigned to course", {
      teacher_id: teacherId,
      course_id: courseId,
      assigned_by: assignedBy,
    });
  }

  static async logPaymentProcessed(
    paymentId: string,
    amount: number,
    userId: string
  ) {
    return this.logInfo("Payment processed", {
      payment_id: paymentId,
      amount,
      user_id: userId,
    });
  }

  static async logLeaveApproved(leaveRequestId: string, approvedBy: string) {
    return this.logInfo("Leave request approved", {
      leave_request_id: leaveRequestId,
      approved_by: approvedBy,
    });
  }

  static async logAttendanceMarked(
    courseId: string,
    date: Date,
    markedBy: string,
    count: number
  ) {
    return this.logInfo("Attendance marked", {
      course_id: courseId,
      date,
      marked_by: markedBy,
      student_count: count,
    });
  }

  // ============= System Health Monitoring =============

  static async checkDatabaseHealth(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error("Database health check failed:", error);
      return false;
    }
  }

  static async checkMemoryUsage() {
    const usage = process.memoryUsage();
    return {
      rss_mb: Math.round(usage.rss / 1024 / 1024),
      heap_used_mb: Math.round(usage.heapUsed / 1024 / 1024),
      heap_total_mb: Math.round(usage.heapTotal / 1024 / 1024),
    };
  }

  static async getSystemStatus() {
    try {
      const dbHealth = await this.checkDatabaseHealth();
      const memory = await this.checkMemoryUsage();

      const health = await prisma.systemHealthCheck.create({
        data: {
          check_type: "api",
          status: dbHealth ? "healthy" : "warning",
          details: {
            database: dbHealth ? "connected" : "warning",
            memory: memory,
            timestamp: new Date(),
          } as any,
        },
      });

      return {
        success: true,
        data: {
          database: dbHealth ? "healthy" : "unhealthy",
          memory,
          overall_status: health.status,
        },
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  // ============= Log Export =============

  static async exportLogs(
    startDate: Date,
    endDate: Date,
    format: "json" | "csv"
  ) {
    try {
      const logs = await prisma.log.findMany({
        where: {
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { timestamp: "desc" },
      });

      if (format === "json") {
        return { success: true, data: logs };
      } else if (format === "csv") {
        const csv = this.convertToCsv(logs);
        return { success: true, data: csv, format: "csv" };
      }

      return { success: false, message: "Invalid format" };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async archiveLogs(olderThanDays: number) {
    try {
      const cutoffDate = new Date(
        Date.now() - olderThanDays * 24 * 60 * 60 * 1000
      );
      const result = await prisma.log.deleteMany({
        where: {
          timestamp: { lt: cutoffDate },
        },
      });
      return { success: true, data: { deleted_count: result.count } };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async clearLogs(olderThanDays: number) {
    return this.archiveLogs(olderThanDays);
  }

  // ============= Helper Methods =============

  private static convertToCsv(logs: any[]): string {
    if (logs.length === 0) return "";

    const headers = ["timestamp", "level", "message"];
    const rows = logs.map((log) => [log.timestamp, log.level, log.message]);

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  }
}
