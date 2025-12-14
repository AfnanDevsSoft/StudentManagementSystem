import { PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

export class FeeService {
  /**
   * Get fee structures
   */
  static async getFeeStructure(
    branchId?: string,
    limit: number = 20,
    offset: number = 0,
    userContext?: any
  ) {
    try {
      const whereClause: any = {};

      // Data Scoping
      if (userContext && userContext.role?.name !== 'SuperAdmin') {
        branchId = userContext.branch_id;
      }

      if (branchId) {
        whereClause.branch_id = branchId;
      }

      const fees = await prisma.fee.findMany({
        where: whereClause,
        orderBy: { created_at: "desc" },
        take: limit,
        skip: offset,
      });

      const total = await prisma.fee.count({
        where: whereClause,
      });

      return {
        success: true,
        message: "Fee structures retrieved",
        data: fees,
        pagination: {
          limit,
          offset,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error getting fee structure:", error);
      return {
        success: false,
        message: "Failed to get fee structure",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Calculate fee for a student
   */
  static async calculateFee(
    studentId: string,
    gradeLevel?: string
  ) {
    try {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          enrollments: {
            include: {
              course: true,
            },
          },
        },
      });

      if (!student) {
        return { success: false, message: "Student not found" };
      }

      // Get applicable fees (assuming tuition + other base fees)
      const fees = await prisma.fee.findMany({
        where: {
          branch_id: student.branch_id,
          is_active: true,
        },
      });

      let totalFee = new Decimal(0);
      const breakdown: any[] = [];

      fees.forEach((fee) => {
        totalFee = totalFee.plus(fee.amount);
        breakdown.push({
          feeType: fee.fee_type,
          feeName: fee.fee_name,
          amount: fee.amount.toNumber(),
        });
      });

      // Apply scholarship discount if applicable
      const scholarships = await prisma.scholarship.findMany({
        where: {
          student_id: studentId,
          status: "active",
        },
      });

      let scholarshipDiscount = new Decimal(0);
      scholarships.forEach((scholarship) => {
        if (scholarship.percentage) {
          scholarshipDiscount = scholarshipDiscount.plus(
            totalFee.times(scholarship.percentage).div(100)
          );
        } else {
          scholarshipDiscount = scholarshipDiscount.plus(scholarship.amount);
        }
      });

      const finalFee = totalFee.minus(scholarshipDiscount);

      return {
        success: true,
        message: "Fee calculated",
        data: {
          studentId,
          grossFee: totalFee.toNumber(),
          scholarshipDiscount: scholarshipDiscount.toNumber(),
          netFee: Math.max(0, finalFee.toNumber()),
          breakdown,
          dueDate: fees[0]?.due_date || new Date(),
        },
      };
    } catch (error) {
      console.error("Error calculating fee:", error);
      return {
        success: false,
        message: "Failed to calculate fee",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Process fee payment
   */
  static async processFeePayment(
    studentId: string,
    feeId: string,
    amountPaid: number,
    paymentMethod: string,
    recordedBy: string,
    transactionId?: string
  ) {
    try {
      // Generate receipt number
      const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const payment = await prisma.feePayment.create({
        data: {
          student_id: studentId,
          fee_id: feeId,
          amount_paid: new Decimal(amountPaid),
          payment_date: new Date(),
          payment_method: paymentMethod,
          transaction_id: transactionId,
          receipt_number: receiptNumber,
          recorded_by: recordedBy,
          status: "completed",
        },
      });

      return {
        success: true,
        message: "Fee payment processed successfully",
        data: payment,
      };
    } catch (error) {
      console.error("Error processing fee payment:", error);
      return {
        success: false,
        message: "Failed to process fee payment",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get fee payment records for a student
   */
  static async getFeeRecords(
    studentId?: string,
    status?: string,
    limit: number = 20,
    offset: number = 0,
    branchId?: string,
    userContext?: any
  ) {
    try {
      const whereClause: any = {};

      // Data Scoping
      if (userContext && userContext.role?.name !== 'SuperAdmin') {
        whereClause.student = { branch_id: userContext.branch_id };
      } else if (branchId) {
        whereClause.student = { branch_id: branchId };
      }

      if (studentId) {
        whereClause.student_id = studentId;
      }

      if (status) {
        whereClause.status = status;
      }

      const records = await prisma.feePayment.findMany({
        where: whereClause,
        include: {
          student: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              student_code: true,
            },
          },
        },
        orderBy: { payment_date: "desc" },
        take: limit,
        skip: offset,
      });

      const total = await prisma.feePayment.count({
        where: whereClause,
      });

      return {
        success: true,
        message: "Fee records retrieved",
        data: records,
        pagination: {
          limit,
          offset,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error getting fee records:", error);
      return {
        success: false,
        message: "Failed to get fee records",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get outstanding fees for a student
   */
  static async getOutstandingFees(studentId: string) {
    try {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
      });

      if (!student) {
        return { success: false, message: "Student not found" };
      }

      // Get all applicable fees
      const allFees = await prisma.fee.findMany({
        where: {
          branch_id: student.branch_id,
          is_active: true,
        },
      });

      let totalDue = new Decimal(0);
      const feeDetails: any[] = [];

      for (const fee of allFees) {
        // Get paid amount for this fee
        const paidAmount = await prisma.feePayment.aggregate({
          where: {
            student_id: studentId,
            fee_id: fee.id,
            status: "completed",
          },
          _sum: {
            amount_paid: true,
          },
        });

        const paid = paidAmount._sum.amount_paid || new Decimal(0);
        const outstanding = fee.amount.minus(paid);

        if (outstanding.gt(0)) {
          totalDue = totalDue.plus(outstanding);
          feeDetails.push({
            feeId: fee.id,
            feeName: fee.fee_name,
            feeType: fee.fee_type,
            dueAmount: outstanding.toNumber(),
            paid: paid.toNumber(),
            dueDate: fee.due_date,
          });
        }
      }

      return {
        success: true,
        message: "Outstanding fees retrieved",
        data: {
          studentId,
          totalOutstanding: totalDue.toNumber(),
          feeDetails,
        },
      };
    } catch (error) {
      console.error("Error getting outstanding fees:", error);
      return {
        success: false,
        message: "Failed to get outstanding fees",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get fee statistics
   */
  static async getFeeStatistics(branchId?: string, userContext?: any) {
    try {
      const whereClause: any = {};

      // Data Scoping
      if (userContext && userContext.role?.name !== 'SuperAdmin') {
        branchId = userContext.branch_id;
      }

      if (branchId) {
        whereClause.branch_id = branchId;
      }

      // Total fees configured
      const totalFeeStructures = await prisma.fee.count({
        where: whereClause,
      });

      // Total payments
      const totalPayments = await prisma.feePayment.aggregate({
        _sum: {
          amount_paid: true,
        },
      });

      // Count by payment method
      const byPaymentMethod = await prisma.feePayment.groupBy({
        by: ["payment_method"],
        _sum: {
          amount_paid: true,
        },
        _count: true,
      });

      return {
        success: true,
        message: "Fee statistics retrieved",
        data: {
          totalFeeStructures,
          totalCollected: (totalPayments._sum.amount_paid || 0),
          byPaymentMethod: byPaymentMethod.map((m: any) => ({
            method: m.payment_method,
            count: m._count,
            total: m._sum.amount_paid,
          })),
        },
      };
    } catch (error) {
      console.error("Error getting fee statistics:", error);
      return {
        success: false,
        message: "Failed to get fee statistics",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
