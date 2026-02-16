/**
 * Transaction Wrapper for Prisma
 * Ensures data consistency across critical multi-operation processes
 */

import { prisma } from "../lib/db";
import { logger } from "../lib/logger";

export interface TransactionOptions {
  /** Transaction timeout in milliseconds (default: 10000ms) */
  timeout?: number;
  /** Max wait time for connection (default: 5000ms) */
  maxWait?: number;
  /** Retry attempts on transaction conflict (default: 3) */
  retryAttempts?: number;
  /** Retry delay in milliseconds (default: 100ms) */
  retryDelay?: number;
}

export const DEFAULT_TRANSACTION_OPTIONS: TransactionOptions = {
  timeout: 10000,  // 10 seconds
  maxWait: 5000,   // 5 seconds
  retryAttempts: 3,
  retryDelay: 100, // 100ms
};

/**
 * Transaction conflict error codes
 */
const TRANSACTION_CONFLICT_CODES = [
  'P2034', // Transaction conflict
  'P2033', // Foreign key constraint failed
  'P2002', // Unique constraint failed
];

/**
 * Execute a function within a Prisma transaction
 * @param operation - Async function to execute in transaction
 * @param name - Name of the transaction for logging
 * @param options - Transaction options
 * @returns Transaction result
 */
export async function withTransaction<T>(
  operation: (tx: typeof prisma) => Promise<T>,
  name: string,
  options: TransactionOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_TRANSACTION_OPTIONS, ...options };
  const startTime = Date.now();
  
  logger.debug('Starting transaction', {
    component: 'transaction',
    event: 'transaction_start',
    transactionName: name,
    options: opts
  });

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const txStartTime = Date.now();
        const result = await operation(tx);
        
        logger.debug('Transaction operation completed', {
          component: 'transaction',
          event: 'transaction_operation_complete',
          transactionName: name,
          duration: Date.now() - txStartTime
        });
        
        return result;
      },
      {
        timeout: opts.timeout,
        maxWait: opts.maxWait,
      }
    );
    
    const duration = Date.now() - startTime;
    logger.info('Transaction committed successfully', {
      component: 'transaction',
      event: 'transaction_commit',
      transactionName: name,
      duration
    });
    
    return result;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    // Check if it's a transaction conflict
    if (TRANSACTION_CONFLICT_CODES.includes(error.code)) {
      logger.warn('Transaction conflict detected', {
        component: 'transaction',
        event: 'transaction_conflict',
        transactionName: name,
        duration,
        errorCode: error.code,
        errorMessage: error.message
      });
      
      throw new TransactionConflictError(
        `Transaction conflict in ${name}: ${error.message}`,
        error.code,
        duration
      );
    }
    
    logger.error('Transaction failed', {
      component: 'transaction',
      event: 'transaction_failure',
      transactionName: name,
      duration,
      errorCode: error.code,
      errorMessage: error.message,
      stack: error.stack
    });
    
    throw new TransactionError(
      `Transaction ${name} failed: ${error.message}`,
      error.code,
      duration
    );
  }
}

/**
 * Retry transaction on conflict
 * @param operation - Transaction operation
 * @param name - Transaction name
 * @param options - Transaction options with retry settings
 * @returns Transaction result
 */
export async function withRetryTransaction<T>(
  operation: (tx: typeof prisma) => Promise<T>,
  name: string,
  options: TransactionOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_TRANSACTION_OPTIONS, ...options };
  let lastError: Error;
  
  for (let attempt = 1; attempt <= opts.retryAttempts!; attempt++) {
    try {
      if (attempt > 1) {
        logger.debug('Retrying transaction', {
          component: 'transaction',
          event: 'transaction_retry',
          transactionName: name,
          attempt,
          maxAttempts: opts.retryAttempts
        });
        
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, opts.retryDelay! * Math.pow(2, attempt - 1))
        );
      }
      
      return await withTransaction(operation, name, options);
    } catch (error: any) {
      lastError = error;
      
      // Only retry on transaction conflicts
      if (error instanceof TransactionConflictError) {
        if (attempt < opts.retryAttempts!) {
          continue; // Retry
        }
      }
      
      // Don't retry for other errors
      throw error;
    }
  }
  
  logger.error('Transaction max retries exceeded', {
    component: 'transaction',
    event: 'transaction_max_retries',
    transactionName: name,
    maxAttempts: opts.retryAttempts,
    error: lastError!.message
  });
  
  throw new MaxRetryError(
    `Transaction ${name} failed after ${opts.retryAttempts} attempts`,
    lastError!
  );
}

/**
 * Common transaction scenarios
 */
export const TransactionScenarios = {
  /**
   * Create student with user account and enrollment
   * - Creates user
   * - Creates student profile
   * - Creates initial enrollment
   */
  async createStudentWithEnrollment(
    studentData: any,
    userData: any,
    enrollmentData?: any
  ) {
    return withRetryTransaction(
      async (tx) => {
        // Create user
        const user = await tx.user.create({
          data: {
            ...userData,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });

        // Create student
        const student = await tx.student.create({
          data: {
            ...studentData,
            user_id: user.id,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });

        // Create enrollment if provided
        let enrollment = null;
        if (enrollmentData) {
          enrollment = await tx.enrollment.create({
            data: {
              ...enrollmentData,
              student_id: student.id,
              created_at: new Date(),
            },
          });
        }

        return {
          user,
          student,
          enrollment,
        };
      },
      'createStudentWithEnrollment'
    );
  },

  /**
   * Process payment and update student balance
   * - Creates payment record
   * - Updates student fee balance
   * - Creates transaction log
   */
  async processPayment(
    paymentData: any,
    studentId: string,
    amount: number
  ) {
    return withTransaction(
      async (tx) => {
        // Create payment record
        const payment = await tx.payment.create({
          data: {
            ...paymentData,
            created_at: new Date(),
          },
        });

        // Update student balance
        const student = await tx.student.update({
          where: { id: studentId },
          data: {
            outstanding_balance: {
              decrement: amount,
            },
            updated_at: new Date(),
          },
        });

        // Create transaction log
        const transaction = await tx.transaction.create({
          data: {
            student_id: studentId,
            type: 'PAYMENT',
            amount,
            description: `Payment processed: ${payment.id}`,
            created_at: new Date(),
          },
        });

        return {
          payment,
          student,
          transaction,
        };
      },
      'processPayment'
    );
  },

  /**
   * Update grade with history tracking
   * - Updates grade
   * - Creates grade history entry
   * - Sends notification (async, outside transaction)
   */
  async updateGradeWithHistory(
    gradeId: string,
    gradeData: any,
    historyData: any
  ) {
    return withTransaction(
      async (tx) => {
        // Get existing grade
        const existingGrade = await tx.grade.findUnique({
          where: { id: gradeId },
        });

        if (!existingGrade) {
          throw new Error('Grade not found');
        }

        // Create history entry
        const history = await tx.gradeHistory.create({
          data: {
            grade_id: gradeId,
            old_grade: existingGrade.grade,
            old_remarks: existingGrade.remarks,
            changed_by: historyData.changed_by,
            change_reason: historyData.change_reason,
            created_at: new Date(),
          },
        });

        // Update grade
        const grade = await tx.grade.update({
          where: { id: gradeId },
          data: {
            ...gradeData,
            updated_at: new Date(),
          },
        });

        return {
          grade,
          history,
        };
      },
      'updateGradeWithHistory'
    );
  },

  /**
   * Bulk attendance marking
   * - Creates attendance records for multiple students
   * - Validates all records before commit
   */
  async bulkMarkAttendance(
    attendanceRecords: Array<{
      student_id: string;
      course_id: string;
      date: Date;
      status: string;
    }>
  ) {
    return withTransaction(
      async (tx) => {
        // Validate all records first
        for (const record of attendanceRecords) {
          const studentExists = await tx.student.findUnique({
            where: { id: record.student_id },
          });

          if (!studentExists) {
            throw new Error(`Student not found: ${record.student_id}`);
          }
        }

        // Create all attendance records
        const results = await Promise.all(
          attendanceRecords.map(record =>
            tx.attendance.create({
              data: {
                ...record,
                created_at: new Date(),
              },
            })
          )
        );

        logger.info('Bulk attendance marked', {
          component: 'transaction',
          event: 'bulk_attendance',
          count: results.length
        });

        return results;
      },
      'bulkMarkAttendance'
    );
  },
};

/**
 * Transaction Error Classes
 */

export class TransactionError extends Error {
  constructor(
    message: string,
    public code?: string,
    public duration?: number
  ) {
    super(message);
    this.name = 'TransactionError';
  }
}

export class TransactionConflictError extends TransactionError {
  constructor(
    message: string,
    code?: string,
    duration?: number
  ) {
    super(message, code, duration);
    this.name = 'TransactionConflictError';
  }
}

export class MaxRetryError extends Error {
  constructor(
    message: string,
    public originalError: Error
  ) {
    super(message);
    this.name = 'MaxRetryError';
  }
}

export default {
  withTransaction,
  withRetryTransaction,
  TransactionScenarios,
  TransactionError,
  TransactionConflictError,
  MaxRetryError,
};
