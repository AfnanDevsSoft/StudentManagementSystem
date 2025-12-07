import request from 'supertest';
import { prisma } from './testDb';
import { testUsers } from './fixtures';

/**
 * Helper to get authentication token for testing
 */
export async function getAuthToken(app: any, userType: keyof typeof testUsers = 'admin'): Promise<string> {
    const user = testUsers[userType];

    const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
            username: user.username,
            password: user.password,
        });

    if (response.status !== 200) {
        throw new Error(`Failed to login ${userType}: ${JSON.stringify(response.body)}`);
    }

    console.log('🔍 Login response body:', JSON.stringify(response.body, null, 2));

    // Login route returns 'token' at top level
    const token = response.body.token;
    console.log('🔍 Extracted token from helper:', token);
    return token;
}

/**
 * Helper to create authenticated request headers
 */
export function authHeader(token: string) {
    return {
        Authorization: `Bearer ${token}`,
    };
}

/**
 * Wait for async operations
 */
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Create test roles and return their IDs
 */
export async function createTestRoles(prisma: any) {
    const roles = await Promise.all([
        prisma.role.create({ data: { name: 'SuperAdmin' } }),
        prisma.role.create({ data: { name: 'Admin' } }),
        prisma.role.create({ data: { name: 'Teacher' } }),
        prisma.role.create({ data: { name: 'Student' } }),
        prisma.role.create({ data: { name: 'Parent' } }),
    ]);

    return {
        superAdminId: roles[0].id,
        adminId: roles[1].id,
        teacherId: roles[2].id,
        studentId: roles[3].id,
        parentId: roles[4].id,
    };
}

/**
 * Generate unique ID for test data
 */
export function uniqueId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Expect success response
 */
export function expectSuccess(response: any, statusCode = 200) {
    expect(response.status).toBe(statusCode);
    expect(response.body).toBeTruthy();
}

/**
 * Expect error response
 */
export function expectError(response: any, statusCode = 400) {
    expect(response.status).toBe(statusCode);
    expect(response.body).toHaveProperty('error');
}

/**
 * Clean specific table
 */
export async function cleanTable(prisma: any, tableName: string) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tableName}" CASCADE`);
}

/**
 * Count records in table
 */
export async function countRecords(prisma: any, model: string): Promise<number> {
    return await prisma[model].count();
}
