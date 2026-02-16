/**
 * Circuit Breaker Wrapper for Prisma Operations
 * Wraps database operations with circuit breaker protection
 */

import { prisma } from "../lib/db";
import { databaseBreaker, FALLBACK_RESPONSES } from "../lib/circuit-breaker";
import { logger } from "../lib/logger";

/**
 * Wrap a Prisma operation with circuit breaker
 * @param operation - Prisma operation to wrap
 * @param name - Name for the circuit breaker
 * @param fallback - Optional custom fallback response
 */
export function wrapPrismaOperation<T>(
  operation: () => Promise<T>,
  name: string,
  fallback?: any
): Promise<T> {
  const breaker = databaseBreaker(operation, name);
  
  // Set custom fallback if provided
  if (fallback) {
    breaker.fallback(() => fallback);
  } else {
    breaker.fallback(() => {
      logger.warn(`Using fallback for database operation: ${name}`);
      return FALLBACK_RESPONSES.database;
    });
  }
  
  return breaker.fire();
}

/**
 * Student service operations with circuit breaker
 */
export const StudentServiceWithCircuitBreaker = {
  
  async getAllStudents(page: number = 1, limit: number = 10, search: string = "", branchId: string = "") {
    return wrapPrismaOperation(
      async () => {
        const skip = (page - 1) * limit;
        const where: any = {};
        
        if (search) {
          where.OR = [
            { first_name: { contains: search, mode: "insensitive" } },
            { last_name: { contains: search, mode: "insensitive" } },
            { personal_email: { contains: search, mode: "insensitive" } },
            { student_code: { contains: search, mode: "insensitive" } },
          ];
        }
        
        if (branchId) {
          where.branch_id = branchId;
        }
        
        const [students, total] = await Promise.all([
          prisma.student.findMany({
            where,
            include: {
              branch: true,
              user: true,
            },
            skip,
            take: limit,
            orderBy: { created_at: "desc" },
          }),
          prisma.student.count({ where }),
        ]);
        
        return {
          success: true,
          message: "Students fetched successfully",
          data: students,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        };
      },
      'getAllStudents'
    );
  },
  
  async getStudentById(id: string, userContext?: any) {
    return wrapPrismaOperation(
      async () => {
        const student = await prisma.student.findUnique({
          where: { id },
          include: {
            branch: true,
            user: {
              include: {
                role: true,
              },
            },
            enrollments: {
              include: {
                course: true,
                academic_year: true,
              },
            },
            grades: {
              include: {
                course: true,
                teacher: true,
              },
            },
            attendance: {
              include: {
                course: true,
              },
            },
          },
        });
        
        if (!student) {
          return {
            success: false,
            message: "Student not found",
          };
        }
        
        return {
          success: true,
          message: "Student fetched successfully",
          data: student,
        };
      },
      'getStudentById'
    );
  },
  
  async createStudent(data: any) {
    return wrapPrismaOperation(
      async () => {
        const student = await prisma.student.create({
          data: {
            ...data,
            created_at: new Date(),
            updated_at: new Date(),
          },
          include: {
            branch: true,
            user: true,
          },
        });
        
        logger.info('Student created', {
          component: 'student-service',
          studentId: student.id,
          circuitBreaker: 'closed'
        });
        
        return {
          success: true,
          message: "Student created successfully",
          data: student,
        };
      },
      'createStudent',
      {
        success: false,
        message: "Student creation temporarily unavailable. Please try again.",
        code: 'SERVICE_UNAVAILABLE',
        circuitBreaker: 'open',
        retryAfter: 30
      }
    );
  }
};

/**
 * Database health check for circuit breaker
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.debug('Database health check passed');
    return true;
  } catch (error) {
    logger.error('Database health check failed', { error });
    return false;
  }
}

/**
 * Redis health check for circuit breaker
 */
export async function checkRedisHealth(): Promise<boolean> {
  try {
    const redis = require('../lib/redis');
    await redis.redis.ping();
    logger.debug('Redis health check passed');
    return true;
  } catch (error) {
    logger.error('Redis health check failed', { error });
    return false;
  }
}

/**
 * External API health check
 */
export async function checkExternalApiHealth(url: string): Promise<boolean> {
  try {
    const axios = require('axios');
    await axios.get(url, { timeout: 5000 });
    logger.debug('External API health check passed', { url });
    return true;
  } catch (error) {
    logger.error('External API health check failed', { url, error });
    return false;
  }
}

export default {
  wrapPrismaOperation,
  StudentServiceWithCircuitBreaker,
  checkDatabaseHealth,
  checkRedisHealth,
  checkExternalApiHealth
};
