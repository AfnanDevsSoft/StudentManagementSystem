import request from 'supertest';
import app from '../../app';
import { prisma, setupTestDatabase, clearDatabase, teardownTestDatabase } from '../setup/testDb';
import { testUsers, testBranch, testAcademicYear } from '../setup/fixtures';
import { getAuthToken, authHeader, createTestRoles } from '../setup/helpers';

describe('Attendance Management API Tests', () => {
    let adminToken: string;
    let teacherToken: string;
    let branchId: string;
    let courseId: string;
    let studentId: string;
    let academicYearId: string;
    let roleIds: any;

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

        // Create teacher user
        const teacherUser = await prisma.user.create({
            data: {
                email: testUsers.teacher.email,
                username: testUsers.teacher.username,
                password_hash: testUsers.teacher.password_hash,
                first_name: testUsers.teacher.first_name,
                last_name: testUsers.teacher.last_name,
                phone: testUsers.teacher.phone,
                is_active: testUsers.teacher.is_active,
                branch_id: branchId,
                role_id: roleIds.teacherId,
            },
        });

        // Create academic year
        const academicYear = await prisma.academicYear.create({
            data: {
                ...testAcademicYear,
                branch_id: branchId,
            },
        });
        academicYearId = academicYear.id;

        // Create student
        const student = await prisma.student.create({
            data: {
                student_code: 'STU-2024-001',
                first_name: 'Jane',
                last_name: 'Doe',
                date_of_birth: new Date('2010-01-01'),
                admission_date: new Date(),
                branch_id: branchId,
            },
        });
        studentId = student.id;

        // Create teacher, subject, grade level, and course
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

        const teacher = await prisma.teacher.create({
            data: {
                employee_code: 'TEACH-001',
                first_name: 'John',
                last_name: 'Smith',
                email: 'john.smith@test.com',
                phone: '+1234567890',
                branch_id: branchId,
                user_id: teacherUser.id,
                hire_date: new Date(),
                employment_type: 'full_time',
            },
        });

        const course = await prisma.course.create({
            data: {
                course_name: 'Math 101',
                course_code: 'MATH-101-2024',
                branch_id: branchId,
                subject_id: subject.id,
                grade_level_id: gradeLevel.id,
                teacher_id: teacher.id,
                academic_year_id: academicYearId,
            },
        });
        courseId = course.id;

        // Enroll student in course
        await prisma.studentEnrollment.create({
            data: {
                student_id: studentId,
                course_id: courseId,
                academic_year_id: academicYearId,
                enrollment_date: new Date(),
                status: 'active',
            },
        });

        // Get auth tokens
        adminToken = await getAuthToken(app, 'admin');
        teacherToken = await getAuthToken(app, 'teacher');
    });

    afterAll(async () => {
        await teardownTestDatabase();
    });

    describe('POST /api/v1/attendance', () => {
        it('should mark attendance for a student', async () => {
            const attendanceData = {
                student_id: studentId,
                course_id: courseId,
                date: new Date().toISOString().split('T')[0],
                status: 'present',
            };

            const response = await request(app)
                .post('/api/v1/attendance')
                .set(authHeader(teacherToken))
                .send(attendanceData);

            expect(response.status).toBe(201);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.status).toBe('present');
        });

        it('should mark multiple students attendance', async () => {
            // Create another student
            const student2 = await prisma.student.create({
                data: {
                    student_code: 'STU-2024-002',
                    first_name: 'John',
                    last_name: 'Smith',
                    date_of_birth: new Date('2010-02-01'),
                    admission_date: new Date(),
                    branch_id: branchId,
                },
            });

            await prisma.studentEnrollment.create({
                data: {
                    student_id: student2.id,
                    course_id: courseId,
                    academic_year_id: academicYearId,
                    enrollment_date: new Date(),
                    status: 'active',
                },
            });

            const attendanceData = {
                course_id: courseId,
                date: new Date().toISOString().split('T')[0],
                attendance_records: [
                    { student_id: studentId, status: 'present' },
                    { student_id: student2.id, status: 'absent' },
                ],
            };

            const response = await request(app)
                .post('/api/v1/attendance/bulk')
                .set(authHeader(teacherToken))
                .send(attendanceData);

            expect(response.status).toBe(201);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBe(2);
        });
    });

    describe('GET /api/v1/attendance', () => {
        beforeEach(async () => {
            // Create some attendance records
            await prisma.attendance.createMany({
                data: [
                    {
                        student_id: studentId,
                        course_id: courseId,
                        date: new Date('2024-01-15'),
                        status: 'present',
                    },
                    {
                        student_id: studentId,
                        course_id: courseId,
                        date: new Date('2024-01-16'),
                        status: 'absent',
                    },
                ],
            });
        });

        it('should get attendance records for a student', async () => {
            const response = await request(app)
                .get(`/api/v1/attendance?studentId=${studentId}`)
                .set(authHeader(adminToken));

            expect(response.status).toBe(200);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBeGreaterThanOrEqual(2);
        });

        it('should get attendance records for a course', async () => {
            const response = await request(app)
                .get(`/api/v1/attendance?courseId=${courseId}`)
                .set(authHeader(teacherToken));

            expect(response.status).toBe(200);
            expect(response.body.data).toBeInstanceOf(Array);
        });

        it('should filter attendance by date range', async () => {
            const response = await request(app)
                .get(`/api/v1/attendance?studentId=${studentId}&startDate=2024-01-15&endDate=2024-01-16`)
                .set(authHeader(adminToken));

            expect(response.status).toBe(200);
            expect(response.body.data.length).toBe(2);
        });
    });

    describe('PUT /api/v1/attendance/:id', () => {
        it('should update attendance status', async () => {
            const attendance = await prisma.attendance.create({
                data: {
                    student_id: studentId,
                    course_id: courseId,
                    date: new Date(),
                    status: 'present',
                },
            });

            const response = await request(app)
                .put(`/api/v1/attendance/${attendance.id}`)
                .set(authHeader(teacherToken))
                .send({ status: 'late' });

            expect(response.status).toBe(200);
            expect(response.body.data.status).toBe('late');
        });
    });

    describe('GET /api/v1/attendance/statistics', () => {
        beforeEach(async () => {
            // Create attendance records
            await prisma.attendance.createMany({
                data: [
                    {
                        student_id: studentId,
                        course_id: courseId,
                        date: new Date('2024-01-15'),
                        status: 'present',
                    },
                    {
                        student_id: studentId,
                        course_id: courseId,
                        date: new Date('2024-01-16'),
                        status: 'present',
                    },
                    {
                        student_id: studentId,
                        course_id: courseId,
                        date: new Date('2024-01-17'),
                        status: 'absent',
                    },
                ],
            });
        });

        it('should get attendance statistics for a student', async () => {
            const response = await request(app)
                .get(`/api/v1/attendance/statistics?studentId=${studentId}`)
                .set(authHeader(adminToken));

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveProperty('totalDays');
            expect(response.body.data).toHaveProperty('presentDays');
            expect(response.body.data).toHaveProperty('absentDays');
            expect(response.body.data).toHaveProperty('attendanceRate');
        });
    });
});
