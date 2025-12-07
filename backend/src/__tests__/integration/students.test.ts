import request from 'supertest';
import app from '../../app';
import { prisma, setupTestDatabase, clearDatabase, teardownTestDatabase } from '../setup/testDb';
import { testUsers, testBranch, testAcademicYear, testGradeLevels, testStudentData } from '../setup/fixtures';
import { getAuthToken, authHeader, uniqueId, createTestRoles } from '../setup/helpers';

describe('Student Management API Tests', () => {
    let adminToken: string;
    let branchId: string;
    let academicYearId: string;
    let gradeLevelId: string;
    let roleIds: any;

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

        // Create admin user
        await prisma.user.create({
            data: {
                email: testUsers.admin.email,
                username: testUsers.admin.username,
                password_hash: testUsers.admin.password_hash,
                first_name: testUsers.admin.first_name,
                last_name: testUsers.admin.last_name,
                phone: testUsers.admin.phone,
                is_active: testUsers.admin.is_active,
                branch_id: branchId,
                role_id: roleIds.adminId,
            },
        });

        // Create academic year
        const academicYear = await prisma.academicYear.create({
            data: { ...testAcademicYear, branch_id: branchId },
        });
        academicYearId = academicYear.id;

        // Create grade level
        const gradeLevel = await prisma.gradeLevel.create({
            data: { ...testGradeLevels[0], branch_id: branchId },
        });
        gradeLevelId = gradeLevel.id;

        // Get auth token
        adminToken = await getAuthToken(app, 'admin');
    });

    afterAll(async () => {
        await teardownTestDatabase();
    });

    describe('GET /api/v1/students', () => {
        it('should return all students', async () => {
            // Create test students
            await prisma.student.createMany({
                data: [
                    { ...testStudentData, branch_id: branchId, current_grade_level_id: gradeLevelId },
                    {
                        ...testStudentData,
                        student_code: uniqueId('STU'),
                        branch_id: branchId,
                        current_grade_level_id: gradeLevelId
                    },
                ],
            });

            const response = await request(app)
                .get('/api/v1/students')
                .set(authHeader(adminToken));

            expect(response.status).toBe(200);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBeGreaterThanOrEqual(2);
        });

        it('should filter by branch_id', async () => {
            // Create another branch and student
            const otherBranch = await prisma.branch.create({
                data: { ...testBranch, code: 'TEST-002', name: 'Other Campus' },
            });

            await prisma.student.create({
                data: { ...testStudentData, branch_id: branchId, current_grade_level_id: gradeLevelId },
            });

            await prisma.student.create({
                data: {
                    ...testStudentData,
                    student_code: uniqueId('STU'),
                    branch_id: otherBranch.id,
                    current_grade_level_id: gradeLevelId
                },
            });

            const response = await request(app)
                .get(`/api/v1/students?branch_id=${branchId}`)
                .set(authHeader(adminToken));

            expect(response.status).toBe(200);
            expect(response.body.data.length).toBe(1);
            expect(response.body.data[0].branch_id).toBe(branchId);
        });

        it('should reject unauthorized request', async () => {
            const response = await request(app).get('/api/v1/students');
            expect(response.status).toBe(401);
        });
    });

    describe('POST /api/v1/students', () => {
        it('should create student with valid data', async () => {
            const newStudent = {
                ...testStudentData,
                student_code: uniqueId('STU'),
                branch_id: branchId,
                current_grade_level_id: gradeLevelId,
            };

            const response = await request(app)
                .post('/api/v1/students')
                .set(authHeader(adminToken))
                .send(newStudent);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.student_code).toBe(newStudent.student_code);

            // Verify in database
            const dbStudent = await prisma.student.findUnique({
                where: { id: response.body.id },
            });
            expect(dbStudent).toBeTruthy();
            expect(dbStudent!.first_name).toBe(newStudent.first_name);
        });

        it('should link user account when user_id provided', async () => {
            const user = await prisma.user.create({
                data: {
                    email: 'linked.student@test.com',
                    username: 'linked.student@test.com',
                    password_hash: testUsers.student.password_hash,
                    first_name: testUsers.student.first_name,
                    last_name: testUsers.student.last_name,
                    phone: testUsers.student.phone,
                    is_active: testUsers.student.is_active,
                    branch_id: branchId,
                    role_id: roleIds.studentId,
                },
            });

            const newStudent = {
                ...testStudentData,
                student_code: uniqueId('STU'),
                branch_id: branchId,
                current_grade_level_id: gradeLevelId,
                user_id: user.id,
            };

            const response = await request(app)
                .post('/api/v1/students')
                .set(authHeader(adminToken))
                .send(newStudent);

            expect(response.status).toBe(201);
            expect(response.body.user_id).toBe(user.id);

            // Verify in database
            const dbStudent = await prisma.student.findUnique({
                where: { id: response.body.id },
                include: { user: true },
            });
            expect(dbStudent!.user).toBeTruthy();
            expect(dbStudent!.user!.email).toBe('linked.student@test.com');
        });

        it('should reject missing required fields', async () => {
            const response = await request(app)
                .post('/api/v1/students')
                .set(authHeader(adminToken))
                .send({
                    first_name: 'Test',
                    // Missing other required fields
                });

            expect(response.status).toBe(400);
        });

        it('should reject duplicate student_code', async () => {
            await prisma.student.create({
                data: { ...testStudentData, branch_id: branchId, current_grade_level_id: gradeLevelId },
            });

            const response = await request(app)
                .post('/api/v1/students')
                .set(authHeader(adminToken))
                .send({
                    ...testStudentData,
                    branch_id: branchId,
                    current_grade_level_id: gradeLevelId,
                });

            expect(response.status).toBe(409);
        });
    });

    describe('GET /api/v1/students/:id', () => {
        it('should return student by id', async () => {
            const student = await prisma.student.create({
                data: { ...testStudentData, branch_id: branchId, current_grade_level_id: gradeLevelId },
            });

            const response = await request(app)
                .get(`/api/v1/students/${student.id}`)
                .set(authHeader(adminToken));

            expect(response.status).toBe(200);
            expect(response.body.id).toBe(student.id);
            expect(response.body.student_code).toBe(testStudentData.student_code);
        });

        it('should return 404 for non-existent student', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            const response = await request(app)
                .get(`/api/v1/students/${fakeId}`)
                .set(authHeader(adminToken));

            expect(response.status).toBe(404);
        });
    });

    describe('PUT /api/v1/students/:id', () => {
        it('should update student', async () => {
            const student = await prisma.student.create({
                data: { ...testStudentData, branch_id: branchId, current_grade_level_id: gradeLevelId },
            });

            const updates = {
                first_name: 'Updated',
                last_name: 'Name',
            };

            const response = await request(app)
                .put(`/api/v1/students/${student.id}`)
                .set(authHeader(adminToken))
                .send(updates);

            expect(response.status).toBe(200);
            expect(response.body.first_name).toBe('Updated');

            // Verify in database
            const dbStudent = await prisma.student.findUnique({
                where: { id: student.id },
            });
            expect(dbStudent!.first_name).toBe('Updated');
        });

        it('should return 404 for non-existent student', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            const response = await request(app)
                .put(`/api/v1/students/${fakeId}`)
                .set(authHeader(adminToken))
                .send({ first_name: 'Test' });

            expect(response.status).toBe(404);
        });
    });

    describe('DELETE /api/v1/students/:id', () => {
        it('should soft delete student', async () => {
            const student = await prisma.student.create({
                data: { ...testStudentData, branch_id: branchId, current_grade_level_id: gradeLevelId, is_active: true },
            });

            const response = await request(app)
                .delete(`/api/v1/students/${student.id}`)
                .set(authHeader(adminToken));

            expect(response.status).toBe(200);

            // Verify soft delete - record still exists but is_active = false
            const dbStudent = await prisma.student.findUnique({
                where: { id: student.id },
            });
            expect(dbStudent).toBeTruthy();
            expect(dbStudent!.is_active).toBe(false);
        });
    });
});
