import request from 'supertest';
import { prisma } from './testDb';
import { testUsers } from './fixtures';

/**
 * Helper to get authentication token for testing
 */
export async function getAuthToken(
    app: any,
    userType: keyof typeof testUsers = 'admin',
    customCredentials?: { username: string; password: string }
): Promise<string> {
    const user = customCredentials || testUsers[userType];

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
    // Create necessary permissions
    const permissions = [
        'students:read',
        'students:create',
        'students:update',
        'students:delete'
    ];

    await Promise.all(permissions.map(p =>
        prisma.permission.create({
            data: {
                name: p,
                slug: p, // Assuming slug exists or using name as unique identifier
                description: `Permission for ${p}`
            }
        }).catch(() => { }) // Ignore if exists
    ));

    const roles = await Promise.all([
        prisma.role.create({ data: { name: 'SuperAdmin' } }),
        prisma.role.create({
            data: {
                name: 'Admin',
                permissions: {
                    connect: permissions.map(p => ({ name: p }))
                }
            }
        }),
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
 * Create RBAC roles and permissions
 */
export async function createTestRBACRoles(prisma: any, branchId: string) {
    // Ensure permissions exist
    const permissions = [
        'students:read',
        'students:create',
        'students:update',
        'students:delete',
        'auth:login'
    ];

    // Upsert permissions
    await Promise.all(permissions.map(p =>
        prisma.permission.upsert({
            where: { permission_name: p },
            create: {
                permission_name: p,
                resource: p.split(':')[0],
                action: p.split(':')[1],
                description: `Permission for ${p}`
            },
            update: {}
        })
    ));

    // Create RBAC Roles
    const roles = await Promise.all([
        prisma.rBACRole.create({
            data: {
                role_name: 'Admin',
                branch_id: branchId,
                permissions: {
                    connect: permissions.map(p => ({ permission_name: p }))
                }
            }
        }),
        prisma.rBACRole.create({
            data: { role_name: 'Teacher', branch_id: branchId }
        }),
        prisma.rBACRole.create({
            data: { role_name: 'Student', branch_id: branchId }
        })
    ]);

    return {
        adminRoleId: roles[0].id,
        teacherRoleId: roles[1].id,
        studentRoleId: roles[2].id
    };
}

/**
 * Assign RBAC Role to User
 */
export async function assignRBACRole(
    prisma: any,
    userId: string,
    roleId: string,
    branchId: string,
    assignedBy: string
) {
    return await prisma.userRole.create({
        data: {
            user_id: userId,
            rbac_role_id: roleId,
            branch_id: branchId,
            assigned_by: assignedBy
        }
    });
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
