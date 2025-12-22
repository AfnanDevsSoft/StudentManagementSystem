import { prisma } from "../lib/db";
import { Decimal } from "@prisma/client/runtime/library";

export class PayrollService {
  /**
   * Get all salaries for teachers
   */
  static async getSalaries(
    branchId?: string,
    month?: number,
    year?: number,
    limit: number = 20,
    offset: number = 0,
    userContext?: any
  ) {
    try {
      const currentMonth = month || new Date().getMonth() + 1;
      const currentYear = year || new Date().getFullYear();

      const whereClause: any = {
        month: currentMonth,
        year: currentYear,
      };

      // Data Scoping
      if (userContext && userContext.role?.name !== 'SuperAdmin') {
        branchId = userContext.branch_id;
      }

      if (branchId) {
        whereClause.branch_id = branchId;
      }

      const records = await prisma.payrollRecord.findMany({
        where: whereClause,
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
        orderBy: { created_at: "desc" },
        take: limit,
        skip: offset,
      });

      const total = await prisma.payrollRecord.count({
        where: whereClause,
      });

      return {
        success: true,
        message: "Salaries retrieved successfully",
        data: records,
        pagination: {
          limit,
          offset,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error getting salaries:", error);
      return {
        success: false,
        message: "Failed to get salaries",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Calculate salary for a teacher
   */
  static async calculateSalary(
    teacherId: string,
    month: number,
    year: number,
    baseSalary: number,
    daysWorked?: number,
    leavesDays?: number
  ) {
    try {
      // Fetch teacher details
      const teacher = await prisma.teacher.findUnique({
        where: { id: teacherId },
      });

      if (!teacher) {
        return { success: false, message: "Teacher not found" };
      }

      // Default: all days of month worked
      const totalDaysInMonth = daysWorked || 30;
      const daysAbsent = (leavesDays || 0) > 0 ? 1 : 0;
      const actualDaysWorked = totalDaysInMonth - daysAbsent;

      // Calculate allowances (configurable based on salary_grade)
      const allowances = new Decimal(baseSalary * 0.1); // 10% allowance

      // Calculate gross salary
      const grossSalary = new Decimal(baseSalary).plus(allowances);

      // Calculate deductions (configurable)
      const deductions = new Decimal(baseSalary * 0.12); // 12% for tax/insurance

      // Calculate net salary
      const netSalary = grossSalary.minus(deductions);

      return {
        success: true,
        message: "Salary calculated successfully",
        data: {
          teacherId,
          month,
          year,
          baseSalary: new Decimal(baseSalary),
          allowances: allowances.toNumber(),
          grossSalary: grossSalary.toNumber(),
          deductions: deductions.toNumber(),
          netSalary: netSalary.toNumber(),
          daysWorked: actualDaysWorked,
          daysAbsent,
          leavesDays: leavesDays || 0,
        },
      };
    } catch (error) {
      console.error("Error calculating salary:", error);
      return {
        success: false,
        message: "Failed to calculate salary",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Process salary (create payroll record)
   */
  static async processSalary(
    teacherId: string,
    branchId: string,
    month: number,
    year: number,
    baseSalary: number,
    daysWorked?: number,
    leaveDays?: number,
    userContext?: any
  ) {
    try {
      // Data Scoping
      if (userContext && userContext.role?.name !== 'SuperAdmin') {
        branchId = userContext.branch_id;
      }
      // Check if already processed
      const existing = await prisma.payrollRecord.findUnique({
        where: {
          teacher_id_month_year: { teacher_id: teacherId, month, year },
        },
      });

      if (existing) {
        return {
          success: false,
          message: "Payroll already processed for this period",
        };
      }

      // Calculate salary
      const calc = await this.calculateSalary(
        teacherId,
        month,
        year,
        baseSalary,
        daysWorked,
        leaveDays
      );

      if (!calc.success) {
        return calc;
      }

      const data = calc.data!;

      // Create payroll record
      const payroll = await prisma.payrollRecord.create({
        data: {
          teacher_id: teacherId,
          branch_id: branchId,
          month,
          year,
          base_salary: new Decimal(data.baseSalary),
          allowances: new Decimal(data.allowances),
          gross_salary: new Decimal(data.grossSalary),
          deductions: new Decimal(data.deductions),
          net_salary: new Decimal(data.netSalary),
          days_worked: data.daysWorked,
          days_absent: data.daysAbsent,
          leave_days: data.leavesDays,
          status: "draft",
        },
      });

      return {
        success: true,
        message: "Salary processed successfully",
        data: payroll,
      };
    } catch (error) {
      console.error("Error processing salary:", error);
      return {
        success: false,
        message: "Failed to process salary",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get payroll records with filters
   */
  static async getPayrollRecords(
    branchId?: string,
    teacherId?: string,
    status?: string,
    limit: number = 20,
    offset: number = 0,
    userContext?: any
  ) {
    try {
      const whereClause: any = {};

      // Data Scoping
      // Data Scoping
      // If querying by specific teacher ID and user is that teacher, allow access regardless of branch
      const isSelfQuery = userContext && userContext.teacherId && userContext.teacherId === teacherId;

      if (userContext && userContext.role?.name !== 'SuperAdmin' && !isSelfQuery) {
        branchId = userContext.branch_id;
      }

      if (branchId && !isSelfQuery) {
        whereClause.branch_id = branchId;
      }

      if (teacherId) {
        whereClause.teacher_id = teacherId;
      }

      if (status) {
        whereClause.status = status;
      }

      const records = await prisma.payrollRecord.findMany({
        where: whereClause,
        include: {
          teacher: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              employee_code: true,
              email: true // Added email for context if needed
            },
          },
        },
        orderBy: { created_at: "desc" },
        take: limit,
        skip: offset,
      });

      const total = await prisma.payrollRecord.count({
        where: whereClause,
      });

      // Map to Frontend DTO
      const mappedRecords = records.map(r => ({
        id: r.id,
        teacher_id: r.teacher_id,
        salary_amount: Number(r.base_salary),
        bonus: Number(r.allowances),
        deductions: Number(r.deductions),
        net_salary: Number(r.net_salary),
        payment_date: r.paid_date || r.created_at, // Use paid_date if available
        payment_method: "Bank Transfer", // Default or fetch from remarks/meta
        status: r.status.charAt(0).toUpperCase() + r.status.slice(1), // Capitalize
        month: r.month,
        year: r.year,
        // remarks: Not available in schema currently
        teacher: r.teacher
      }));

      return {
        success: true,
        message: "Payroll records retrieved",
        data: mappedRecords,
        pagination: {
          limit,
          offset,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error getting payroll records:", error);
      return {
        success: false,
        message: "Failed to get payroll records",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Approve payroll record
   */
  static async approveSalary(payrollId: string, approvedBy: string) {
    try {
      const payroll = await prisma.payrollRecord.update({
        where: { id: payrollId },
        data: {
          status: "approved",
          approved_by: approvedBy,
        },
      });

      return {
        success: true,
        message: "Payroll approved successfully",
        data: payroll,
      };
    } catch (error) {
      console.error("Error approving payroll:", error);
      return {
        success: false,
        message: "Failed to approve payroll",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Mark payroll as paid
   */
  static async markAsPaid(payrollId: string) {
    try {
      const payroll = await prisma.payrollRecord.update({
        where: { id: payrollId },
        data: {
          status: "paid",
          paid_date: new Date(),
        },
      });

      return {
        success: true,
        message: "Payroll marked as paid",
        data: payroll,
      };
    } catch (error) {
      console.error("Error marking payroll as paid:", error);
      return {
        success: false,
        message: "Failed to mark payroll as paid",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Create/Record manual payment
   */
  static async createPayment(data: {
    teacher_id: string;
    salary_amount: number;
    bonus?: number;
    deductions?: number;
    payment_date: string;
    payment_method: string;
    status: string;
    remarks?: string;
    userContext?: any;
  }) {
    try {
      const { teacher_id, salary_amount, bonus = 0, deductions = 0, payment_date, payment_method, status, remarks, userContext } = data;
      const dateObj = new Date(payment_date);
      const month = dateObj.getMonth() + 1;
      const year = dateObj.getFullYear();

      // 1. Get Teacher to find branch
      const teacher = await prisma.teacher.findUnique({
        where: { id: teacher_id },
        select: { id: true, branch_id: true }
      });

      if (!teacher) throw new Error("Teacher not found");

      // 2. Check overlap
      const existing = await prisma.payrollRecord.findUnique({
        where: {
          teacher_id_month_year: { teacher_id, month, year }
        }
      });

      const gross = new Decimal(salary_amount).plus(bonus);
      const net = gross.minus(deductions);

      if (existing) {
        // Update existing record
        const updated = await prisma.payrollRecord.update({
          where: { id: existing.id },
          data: {
            base_salary: new Decimal(salary_amount),
            allowances: new Decimal(bonus),
            deductions: new Decimal(deductions),
            gross_salary: gross,
            net_salary: net,
            status: status.toLowerCase(),
            paid_date: status === 'Paid' ? dateObj : null,
          }
        });
        return { success: true, message: "Payroll updated", data: updated };
      }

      const created = await prisma.payrollRecord.create({
        data: {
          teacher_id,
          branch_id: teacher.branch_id,
          month,
          year,
          base_salary: new Decimal(salary_amount),
          allowances: new Decimal(bonus),
          deductions: new Decimal(deductions),
          gross_salary: gross,
          net_salary: net,
          status: status.toLowerCase(),
          paid_date: status === 'Paid' ? dateObj : null,
        }
      });

      return {
        success: true,
        message: "Payroll record created",
        data: created
      };

    } catch (error: any) {
      console.error("createPayment error:", error);
      return { success: false, message: error.message };
    }
  }
}
