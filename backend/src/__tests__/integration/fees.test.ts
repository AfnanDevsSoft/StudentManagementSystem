import request from 'supertest';
import app from '../../app';
import { prisma, setupTestDatabase, clearDatabase, teardownTestDatabase } from '../setup/testDb';
import { testUsers, testBranch } from '../setup/fixtures';
import { getAuthToken, authHeader, createTestRoles, createTestRBACRoles, assignRBACRole, uniqueId } from '../setup/helpers';

describe('Fee Management API Tests', () => {
    let adminToken: string;
    let branchId: string;
    let studentId: string;
    let roleIds: any;
    let adminUsername: string;

    beforeAll(async () => {
        await setupTestDatabase();
    });

    beforeEach(async () => {
        await clearDatabase();

        // Setup roles
        roleIds = await createTestRoles(prisma);

        // Create branch
        const branch = await prisma.branch.create({ data: testBranch });
        branchId = branch.id;

        // Setup RBAC Roles
        const rbacRoles = await createTestRBACRoles(prisma, branchId);

        // Create admin user with unique username
        adminUsername = `admin-fee-${uniqueId('fee')}@test.com`;
        const adminUser = await prisma.user.create({
            data: {
                email: adminUsername,
                username: adminUsername,
                password_hash: testUsers.admin.password_hash,
                first_name: testUsers.admin.first_name,
                last_name: testUsers.admin.last_name,
                is_active: testUsers.admin.is_active,
                branch_id: branchId,
                role_id: roleIds.adminId,
            },
        });

        // Assign RBAC Role
        await assignRBACRole(prisma, adminUser.id, rbacRoles.adminRoleId, branchId, adminUser.id);

        // Create student
        const student = await prisma.student.create({
            data: {
                student_code: 'STU-FEE-001',
                first_name: 'Fee',
                last_name: 'Student',
                date_of_birth: new Date('2010-01-01'),
                admission_date: new Date(),
                branch_id: branchId,
            },
        });
        studentId = student.id;

        // Get auth token
        adminToken = await getAuthToken(app, 'admin', {
            username: adminUsername,
            password: testUsers.admin.password
        });
    });

    afterAll(async () => {
        await teardownTestDatabase();
    });

    describe('POST /api/v1/fees/structures', () => {
        it('should create a fee structure', async () => {
            const feeData = {
                fee_name: 'Tuition Fee 2024',
                fee_type: 'tuition',
                amount: 5000,
                due_date: new Date().toISOString(),
                branch_id: branchId
            };

            const response = await request(app)
                .post('/api/v1/fees/structures')
                .set(authHeader(adminToken))
                .send(feeData);

            expect(response.status).toBe(201);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.amount).toBe("5000"); // Decimal returns as string usually
        });
    });

    describe('GET /api/v1/fees/structures', () => {
        it('should list fee structures', async () => {
            // Create fee
            await prisma.fee.create({
                data: {
                    fee_name: 'Lab Fee',
                    fee_type: 'lab',
                    amount: 1000,
                    due_date: new Date(),
                    branch_id: branchId
                }
            });

            const response = await request(app)
                .get('/api/v1/fees/structures')
                .set(authHeader(adminToken));

            expect(response.status).toBe(200);
            expect(response.body.data.length).toBeGreaterThan(0);
        });
    });
});
