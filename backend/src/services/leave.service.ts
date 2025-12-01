import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class LeaveService {
  /**
   * Request leave
   */
  static async requestLeave(
    teacherId: string,
    leaveType: "annual" | "sick" | "casual",
    startDate: Date,
    endDate: Date,
    reason: string
  ) {
    try {
      // Calculate number of days
      const daysCount = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;

      // Validate dates
      if (endDate < startDate) {
        return {
          success: false,
          message: "End date cannot be before start date",
        };
      }

      // Create leave request
      const leaveRequest = await prisma.leaveRequest.create({
        data: {
          teacher_id: teacherId,
          leave_type: leaveType,
          start_date: startDate,
          end_date: endDate,
          days_count: daysCount,
          reason,
          status: "pending",
        },
      });

      return {
        success: true,
        message: "Leave request submitted successfully",
        data: leaveRequest,
      };
    } catch (error) {
      console.error("Error requesting leave:", error);
      return {
        success: false,
        message: "Failed to request leave",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Approve leave request
   */
  static async approveLeave(leaveRequestId: string, approvedBy: string) {
    try {
      const leaveRequest = await prisma.leaveRequest.update({
        where: { id: leaveRequestId },
        data: {
          status: "approved",
          approved_by: approvedBy,
          approval_date: new Date(),
        },
      });

      return {
        success: true,
        message: "Leave request approved successfully",
        data: leaveRequest,
      };
    } catch (error) {
      console.error("Error approving leave:", error);
      return {
        success: false,
        message: "Failed to approve leave",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Reject leave request
   */
  static async rejectLeave(
    leaveRequestId: string,
    approvedBy: string,
    reason?: string
  ) {
    try {
      const leaveRequest = await prisma.leaveRequest.update({
        where: { id: leaveRequestId },
        data: {
          status: "rejected",
          approved_by: approvedBy,
          approval_date: new Date(),
        },
      });

      return {
        success: true,
        message: `Leave request rejected${reason ? `: ${reason}` : ""}`,
        data: leaveRequest,
      };
    } catch (error) {
      console.error("Error rejecting leave:", error);
      return {
        success: false,
        message: "Failed to reject leave",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get leave balance for a teacher
   */
  static async getLeaveBalance(
    teacherId: string,
    year?: number
  ): Promise<any> {
    try {
      const currentYear = year || new Date().getFullYear();
      const yearStart = new Date(`${currentYear}-01-01`);
      const yearEnd = new Date(`${currentYear}-12-31`);

      // Get approved leaves for this year
      const approvedLeaves = await prisma.leaveRequest.findMany({
        where: {
          teacher_id: teacherId,
          status: "approved",
          start_date: {
            gte: yearStart,
            lte: yearEnd,
          },
        },
      });

      // Calculate used leaves by type
      const leavesByType = {
        annual: 0,
        sick: 0,
        casual: 0,
      };

      approvedLeaves.forEach((leave) => {
        leavesByType[leave.leave_type as keyof typeof leavesByType] +=
          leave.days_count;
      });

      // Define maximum leaves per year (configurable)
      const maxLeavesByType = {
        annual: 20,
        sick: 10,
        casual: 5,
      };

      // Calculate remaining leaves
      const remainingLeaves = {
        annual: Math.max(0, maxLeavesByType.annual - leavesByType.annual),
        sick: Math.max(0, maxLeavesByType.sick - leavesByType.sick),
        casual: Math.max(0, maxLeavesByType.casual - leavesByType.casual),
      };

      return {
        success: true,
        message: "Leave balance retrieved",
        data: {
          year: currentYear,
          used: leavesByType,
          remaining: remainingLeaves,
          max: maxLeavesByType,
        },
      };
    } catch (error) {
      console.error("Error getting leave balance:", error);
      return {
        success: false,
        message: "Failed to get leave balance",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get leave history for a teacher
   */
  static async getLeaveHistory(
    teacherId: string,
    limit: number = 20,
    offset: number = 0,
    status?: string
  ) {
    try {
      const whereClause: any = { teacher_id: teacherId };

      if (status) {
        whereClause.status = status;
      }

      const leaves = await prisma.leaveRequest.findMany({
        where: whereClause,
        orderBy: { created_at: "desc" },
        take: limit,
        skip: offset,
      });

      const total = await prisma.leaveRequest.count({
        where: whereClause,
      });

      return {
        success: true,
        message: "Leave history retrieved",
        data: leaves,
        pagination: {
          limit,
          offset,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error getting leave history:", error);
      return {
        success: false,
        message: "Failed to get leave history",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get pending leave requests for admin/principal
   */
  static async getPendingLeaves(limit: number = 20, offset: number = 0) {
    try {
      const leaves = await prisma.leaveRequest.findMany({
        where: { status: "pending" },
        include: {
          teacher: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              employee_code: true,
            },
          },
        },
        orderBy: { created_at: "asc" },
        take: limit,
        skip: offset,
      });

      const total = await prisma.leaveRequest.count({
        where: { status: "pending" },
      });

      return {
        success: true,
        message: "Pending leaves retrieved",
        data: leaves,
        pagination: {
          limit,
          offset,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error getting pending leaves:", error);
      return {
        success: false,
        message: "Failed to get pending leaves",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get leave statistics
   */
  static async getLeaveStatistics(year?: number) {
    try {
      const currentYear = year || new Date().getFullYear();
      const yearStart = new Date(`${currentYear}-01-01`);
      const yearEnd = new Date(`${currentYear}-12-31`);

      const totalRequests = await prisma.leaveRequest.count({
        where: {
          start_date: {
            gte: yearStart,
            lte: yearEnd,
          },
        },
      });

      const approvedRequests = await prisma.leaveRequest.count({
        where: {
          status: "approved",
          start_date: {
            gte: yearStart,
            lte: yearEnd,
          },
        },
      });

      const rejectedRequests = await prisma.leaveRequest.count({
        where: {
          status: "rejected",
          start_date: {
            gte: yearStart,
            lte: yearEnd,
          },
        },
      });

      const pendingRequests = await prisma.leaveRequest.count({
        where: {
          status: "pending",
          start_date: {
            gte: yearStart,
            lte: yearEnd,
          },
        },
      });

      const byType = await prisma.leaveRequest.groupBy({
        by: ["leave_type"],
        _sum: { days_count: true },
        _count: true,
        where: {
          status: "approved",
          start_date: {
            gte: yearStart,
            lte: yearEnd,
          },
        },
      });

      return {
        success: true,
        message: "Leave statistics retrieved",
        data: {
          year: currentYear,
          total: totalRequests,
          approved: approvedRequests,
          rejected: rejectedRequests,
          pending: pendingRequests,
          byType: byType.map((t: any) => ({
            type: t.leave_type,
            count: t._count,
            totalDays: t._sum.days_count,
          })),
        },
      };
    } catch (error) {
      console.error("Error getting leave statistics:", error);
      return {
        success: false,
        message: "Failed to get leave statistics",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
