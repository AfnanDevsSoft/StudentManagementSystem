import request from 'supertest';
import app from '../../app';
import { prisma, setupTestDatabase, clearDatabase, teardownTestDatabase } from '../setup/testDb';
import { testUsers, testBranch, testTeacherData, testAcademicYear } from '../setup/fixtures';
import { getAuthToken, authHeader, uniqueId, createTestRoles, createTestRBACRoles, assignRBACRole } from '../setup/helpers';

describe('Teacher Management API Tests', () => {
    let adminToken: string;
    let branchId: string;
    let roleIds: any;
    let adminUsername: string;

    beforeAll(async () => {
        await setupTestDatabase();
    });

    beforeEach(async () => {
        await clearDatabase();

        // Setup roles
        roleIds = await createTestRoles(prisma);

        // Create branch FIRST
        const branch = await prisma.branch.create({ data: testBranch });
        branchId = branch.id;

        // Setup RBAC Roles
        const rbacRoles = await createTestRBACRoles(prisma, branchId);

        // Create admin user with unique username
        adminUsername = `admin-${uniqueId('teacher')}@test.com`;
        const adminUser = await prisma.user.create({
            data: {
                email: adminUsername,
                username: adminUsername,
                password_hash: testUsers.admin.password_hash,
                first_name: testUsers.admin.first_name,
                last_name: testUsers.admin.last_name,
                phone: testUsers.admin.phone,
                is_active: testUsers.admin.is_active,
                branch_id: branchId,
                role_id: roleIds.adminId,
            },
        });

        // Assign RBAC Role
        await assignRBACRole(prisma, adminUser.id, rbacRoles.adminRoleId, branchId, adminUser.id);

        // Get auth token
        adminToken = await getAuthToken(app, 'admin', {
            username: adminUsername,
            password: testUsers.admin.password
        });
    });

    afterAll(async () => {
        await teardownTestDatabase();
    });

    describe('GET /api/v1/teachers', () => {
        it('should return all teachers', async () => {
            // Create test teachers
            await prisma.teacher.createMany({
                data: [
                    { ...testTeacherData, branch_id: branchId },
                    {
                        ...testTeacherData,
                        employee_code: uniqueId('TEACH'),
                        branch_id: branchId,
                    },
                ],
            });

            const response = await request(app)
                .get('/api/v1/teachers')
                .set(authHeader(adminToken));

            expect(response.status).toBe(200);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBeGreaterThanOrEqual(2);
        });

        it('should filter by branch_id', async () => {
            // Create another branch and teacher
            const otherBranch = await prisma.branch.create({
                data: { ...testBranch, code: 'TEST-002', name: 'Other Campus' },
            });

            await prisma.teacher.create({
                data: { ...testTeacherData, branch_id: branchId },
            });

            await prisma.teacher.create({
                data: {
                    ...testTeacherData,
                    employee_code: uniqueId('TEACH'),
                    branch_id: otherBranch.id,
                },
            });

            const response = await request(app)
                .get(`/api/v1/teachers?branchId=${branchId}`)
                .set(authHeader(adminToken));

            expect(response.status).toBe(200);
            expect(response.body.data.length).toBe(1);
            expect(response.body.data[0].branch_id).toBe(branchId);
        });

        it('should reject unauthorized request', async () => {
            const response = await request(app).get('/api/v1/teachers');
            expect(response.status).toBe(401);
        });
    });

    describe('POST /api/v1/teachers', () => {
        it('should create teacher with valid data', async () => {
            const newTeacher = {
                ...testTeacherData,
                employee_code: uniqueId('TEACH'),
                branch_id: branchId,
            };

            const response = await request(app)
                .post('/api/v1/teachers')
                .set(authHeader(adminToken))
                .send(newTeacher);

            expect(response.status).toBe(201);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.employee_code).toBe(newTeacher.employee_code);

            // Verify in database
            const dbTeacher = await prisma.teacher.findUnique({
                where: { id: response.body.data.id },
            });
            expect(dbTeacher).toBeTruthy();
            expect(dbTeacher!.first_name).toBe(newTeacher.first_name);
        });

        it('should reject missing required fields', async () => {
            const response = await request(app)
                .post('/api/v1/teachers')
                .set(authHeader(adminToken))
                .send({
                    first_name: 'Test',
                    // Missing other required fields
                });

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/v1/teachers/:id', () => {
        it('should return teacher by id', async () => {
            const teacher = await prisma.teacher.create({
                data: { ...testTeacherData, branch_id: branchId },
            });

            const response = await request(app)
                .get(`/api/v1/teachers/${teacher.id}`)
                .set(authHeader(adminToken));

            expect(response.status).toBe(200);
            expect(response.body.data.id).toBe(teacher.id);
            expect(response.body.data.employee_code).toBe(testTeacherData.employee_code);
        });

        it('should return 404 for non-existent teacher', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            const response = await request(app)
                .get(`/api/v1/teachers/${fakeId}`)
                .set(authHeader(adminToken));

            expect(response.status).toBe(404);
        });
    });

    describe('PUT /api/v1/teachers/:id', () => {
        it('should update teacher', async () => {
            const teacher = await prisma.teacher.create({
                data: { ...testTeacherData, branch_id: branchId },
            });

            const updates = {
                first_name: 'Updated',
                last_name: 'Name',
            };

            const response = await request(app)
                .put(`/api/v1/teachers/${teacher.id}`)
                .set(authHeader(adminToken))
                .send(updates);

            expect(response.status).toBe(200);
            expect(response.body.data.first_name).toBe('Updated');

            // Verify in database
            const dbTeacher = await prisma.teacher.findUnique({
                where: { id: teacher.id },
            });
            expect(dbTeacher!.first_name).toBe('Updated');
        });

        it('should return 404 for non-existent teacher', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            const response = await request(app)
                .put(`/api/v1/teachers/${fakeId}`)
                .set(authHeader(adminToken))
                .send({ first_name: 'Test' });

            expect(response.status).toBe(404);
        });
    });

    describe('DELETE /api/v1/teachers/:id', () => {
        it('should soft delete teacher', async () => {
            const teacher = await prisma.teacher.create({
                data: { ...testTeacherData, branch_id: branchId, is_active: true },
            });

            const response = await request(app)
                .delete(`/api/v1/teachers/${teacher.id}`)
                .set(authHeader(adminToken));

            expect(response.status).toBe(200);

            // Verify soft delete - record still exists but is_active = false
            const dbTeacher = await prisma.teacher.findUnique({
                where: { id: teacher.id },
            });
            expect(dbTeacher).toBeTruthy();
            expect(dbTeacher!.is_active).toBe(false);
        });
    });

    describe('GET /api/v1/teachers/:id/courses', () => {
        it('should return teacher courses', async () => {
            const teacher = await prisma.teacher.create({
                data: { ...testTeacherData, branch_id: branchId },
            });

            // Create academic year first
            const academicYear = await prisma.academicYear.create({
                data: {
                    ...testAcademicYear,
                    branch_id: branchId,
                },
            });

            // Create subject and grade level first
            const subject = await prisma.subject.create({
                data: {
                    name: 'Mathematics',
                    code: 'MATH-101',
                    branch_id: branchId,
                },
            });

            const gradeLevel = await prisma.gradeLevel.create({
                data: {
                    name: 'Grade 1',
                    code: 'G1',
                    branch_id: branchId,
                },
            });

            // Create course for teacher
            await prisma.course.create({
                data: {
                    course_name: 'Math 101',
                    course_code: 'MATH-101-2024',
                    branch_id: branchId,
                    teacher_id: teacher.id,
                    subject_id: subject.id,
                    grade_level_id: gradeLevel.id,
                    academic_year_id: academicYear.id,
                },
            });

            const response = await request(app)
                .get(`/api/v1/teachers/${teacher.id}/courses`)
                .set(authHeader(adminToken));

            expect(response.status).toBe(200);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBe(1);
            expect(response.body.data[0].teacher_id).toBe(teacher.id);
        });
    });
});
