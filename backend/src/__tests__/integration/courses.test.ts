import request from 'supertest';
import app from '../../app';
import { prisma, setupTestDatabase, clearDatabase, teardownTestDatabase } from '../setup/testDb';
import { testUsers, testBranch, testAcademicYear } from '../setup/fixtures';
import { getAuthToken, authHeader, createTestRoles, createTestRBACRoles, assignRBACRole, uniqueId } from '../setup/helpers';

describe('Courses Management API Tests', () => {
    let adminToken: string;
    let branchId: string;
    let subjectId: string;
    let gradeLevelId: string;
    let teacherId: string;
    let academicYearId: string;
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
        adminUsername = `admin-${uniqueId('course')}@test.com`;
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

        try {
            adminToken = await getAuthToken(app, 'admin', {
                username: adminUsername,
                password: testUsers.admin.password
            });
        } catch (e) {
            console.error('DEBUG: Token fetch failed', e);
            throw e;
        }

        // Create subject
        const subject = await prisma.subject.create({
            data: {
                name: 'Mathematics',
                code: 'MATH-101',
                branch_id: branchId,
            },
        });
        subjectId = subject.id;

        // Create grade level
        const gradeLevel = await prisma.gradeLevel.create({
            data: {
                name: 'Grade 1',
                code: 'G1',
                branch_id: branchId,
            },
        });
        gradeLevelId = gradeLevel.id;

        // Create teacher
        const teacher = await prisma.teacher.create({
            data: {
                employee_code: 'TEACH-001',
                first_name: 'John',
                last_name: 'Doe',
                email: 'john.doe@test.com',
                phone: '+1234567890',
                branch_id: branchId,
                hire_date: new Date(),
                employment_type: 'full_time',
            },
        });
        teacherId = teacher.id;

        // Create academic year
        const academicYear = await prisma.academicYear.create({
            data: {
                ...testAcademicYear,
                branch_id: branchId,
            },
        });
        academicYearId = academicYear.id;

        academicYearId = academicYear.id;
    });

    afterAll(async () => {
        await teardownTestDatabase();
    });

    describe('GET /api/v1/courses', () => {
        it('should return all courses', async () => {
            // Create test courses
            await prisma.course.createMany({
                data: [
                    {
                        course_name: 'Math 101',
                        course_code: 'MATH-101-2024',
                        branch_id: branchId,
                        subject_id: subjectId,
                        grade_level_id: gradeLevelId,
                        teacher_id: teacherId,
                        academic_year_id: academicYearId,
                    },
                    {
                        course_name: 'Math 102',
                        course_code: 'MATH-102-2024',
                        branch_id: branchId,
                        subject_id: subjectId,
                        grade_level_id: gradeLevelId,
                        teacher_id: teacherId,
                        academic_year_id: academicYearId,
                    },
                ],
            });

            const response = await request(app)
                .get('/api/v1/courses')
                .set(authHeader(adminToken));

            expect(response.status).toBe(200);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBeGreaterThanOrEqual(2);
        });

        it('should filter by branch_id', async () => {
            await prisma.course.create({
                data: {
                    course_name: 'Math 101',
                    course_code: 'MATH-101-2024',
                    branch_id: branchId,
                    subject_id: subjectId,
                    grade_level_id: gradeLevelId,
                    teacher_id: teacherId,
                    academic_year_id: academicYearId,
                },
            });

            const response = await request(app)
                .get(`/api/v1/courses?branchId=${branchId}`)
                .set(authHeader(adminToken));

            expect(response.status).toBe(200);
            expect(response.body.data.length).toBe(1);
        });
    });

    describe('POST /api/v1/courses', () => {
        it('should create course with valid data', async () => {
            const newCourse = {
                course_name: 'Advanced Mathematics',
                course_code: 'MATH-ADV-2024',
                branch_id: branchId,
                subject_id: subjectId,
                grade_level_id: gradeLevelId,
                teacher_id: teacherId,
                max_students: 30,
            };

            const response = await request(app)
                .post('/api/v1/courses')
                .set(authHeader(adminToken))
                .send(newCourse);

            expect(response.status).toBe(201);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.course_name).toBe(newCourse.course_name);
        });

        it('should reject duplicate course code', async () => {
            await prisma.course.create({
                data: {
                    course_name: 'Math 101',
                    course_code: 'MATH-101-2024',
                    branch_id: branchId,
                    subject_id: subjectId,
                    grade_level_id: gradeLevelId,
                    teacher_id: teacherId,
                    academic_year_id: academicYearId,
                },
            });

            const response = await request(app)
                .post('/api/v1/courses')
                .set(authHeader(adminToken))
                .send({
                    course_name: 'Math 101 Duplicate',
                    course_code: 'MATH-101-2024',
                    branch_id: branchId,
                    subject_id: subjectId,
                    grade_level_id: gradeLevelId,
                    teacher_id: teacherId,
                });

            expect(response.status).toBe(409);
        });
    });

    describe('GET /api/v1/courses/:id', () => {
        it('should return course by id', async () => {
            const course = await prisma.course.create({
                data: {
                    course_name: 'Math 101',
                    course_code: 'MATH-101-2024',
                    branch_id: branchId,
                    subject_id: subjectId,
                    grade_level_id: gradeLevelId,
                    teacher_id: teacherId,
                    academic_year_id: academicYearId,
                },
            });

            const response = await request(app)
                .get(`/api/v1/courses/${course.id}`)
                .set(authHeader(adminToken));

            expect(response.status).toBe(200);
            expect(response.body.data.id).toBe(course.id);
            expect(response.body.data.course_code).toBe('MATH-101-2024');
        });

        it('should return 404 for non-existent course', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            const response = await request(app)
                .get(`/api/v1/courses/${fakeId}`)
                .set(authHeader(adminToken));

            expect(response.status).toBe(404);
        });
    });

    describe('PUT /api/v1/courses/:id', () => {
        it('should update course', async () => {
            const course = await prisma.course.create({
                data: {
                    course_name: 'Math 101',
                    course_code: 'MATH-101-2024',
                    branch_id: branchId,
                    subject_id: subjectId,
                    grade_level_id: gradeLevelId,
                    teacher_id: teacherId,
                    academic_year_id: academicYearId,
                },
            });

            const updates = {
                course_name: 'Advanced Mathematics 101',
                max_students: 25,
            };

            const response = await request(app)
                .put(`/api/v1/courses/${course.id}`)
                .set(authHeader(adminToken))
                .send(updates);

            expect(response.status).toBe(200);
            expect(response.body.data.course_name).toBe('Advanced Mathematics 101');
        });
    });

    describe('DELETE /api/v1/courses/:id', () => {
        it('should soft delete course', async () => {
            const course = await prisma.course.create({
                data: {
                    course_name: 'Math 101',
                    course_code: 'MATH-101-2024',
                    branch_id: branchId,
                    subject_id: subjectId,
                    grade_level_id: gradeLevelId,
                    teacher_id: teacherId,
                    academic_year_id: academicYearId,
                    is_active: true,
                },
            });

            const response = await request(app)
                .delete(`/api/v1/courses/${course.id}`)
                .set(authHeader(adminToken));

            expect(response.status).toBe(200);

            // Verify soft delete
            const dbCourse = await prisma.course.findUnique({
                where: { id: course.id },
            });
            expect(dbCourse).toBeTruthy();
            expect(dbCourse!.is_active).toBe(false);
        });
    });
});
