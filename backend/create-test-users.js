/**
 * Simple Test User Creator
 * Creates users with easy-to-type credentials and linked Student/Teacher entities
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUsers() {
    console.log('🚀 Creating simple test users with linked entities...\n');

    try {
        // Get the first branch
        let branch = await prisma.branch.findFirst();
        if (!branch) {
            console.log('Creating branch...');
            branch = await prisma.branch.create({
                data: {
                    name: 'Main Campus',
                    code: 'MAIN',
                    is_active: true
                }
            });
        }
        console.log('✅ Branch:', branch.name);

        // Get or create academic year
        let academicYear = await prisma.academicYear.findFirst({ where: { is_current: true } });
        if (!academicYear) {
            academicYear = await prisma.academicYear.findFirst();
        }
        if (!academicYear) {
            academicYear = await prisma.academicYear.create({
                data: {
                    name: '2024-2025',
                    start_date: new Date('2024-09-01'),
                    end_date: new Date('2025-06-30'),
                    is_current: true,
                    branch_id: branch.id
                }
            });
            console.log('✅ Created academic year:', academicYear.name);
        }

        // Get or create roles
        let adminRole = await prisma.role.findFirst({ where: { name: 'admin' } });
        let teacherRole = await prisma.role.findFirst({ where: { name: 'teacher' } });
        let studentRole = await prisma.role.findFirst({ where: { name: 'student' } });

        if (!adminRole) {
            adminRole = await prisma.role.create({
                data: { name: 'admin', description: 'Admin', branch_id: branch.id }
            });
        }
        if (!teacherRole) {
            teacherRole = await prisma.role.create({
                data: { name: 'teacher', description: 'Teacher', branch_id: branch.id }
            });
        }
        if (!studentRole) {
            studentRole = await prisma.role.create({
                data: { name: 'student', description: 'Student', branch_id: branch.id }
            });
        }

        // Simple password: test123
        const passwordHash = await bcrypt.hash('test123', 10);

        // ===== CREATE ADMIN USER =====
        console.log('\n--- Creating Admin User ---');
        await prisma.user.deleteMany({ where: { username: 'admin' } });
        const adminUser = await prisma.user.create({
            data: {
                username: 'admin',
                email: 'admin@test.com',
                password_hash: passwordHash,
                role_id: adminRole.id,
                branch_id: branch.id,
                first_name: 'Admin',
                last_name: 'User',
                is_active: true
            }
        });
        console.log('✅ Created admin user');

        // ===== CREATE TEACHER USER WITH LINKED TEACHER ENTITY =====
        console.log('\n--- Creating Teacher User ---');
        // Delete existing teacher and user first
        const existingTeacherUser = await prisma.user.findUnique({ where: { username: 'teacher' } });
        if (existingTeacherUser) {
            await prisma.teacher.deleteMany({ where: { user_id: existingTeacherUser.id } });
            await prisma.user.delete({ where: { id: existingTeacherUser.id } });
        }

        const teacherUser = await prisma.user.create({
            data: {
                username: 'teacher',
                email: 'teacher@test.com',
                password_hash: passwordHash,
                role_id: teacherRole.id,
                branch_id: branch.id,
                first_name: 'Teacher',
                last_name: 'One',
                is_active: true
            }
        });

        // Create linked Teacher entity
        const teacherEntity = await prisma.teacher.create({
            data: {
                employee_code: 'TCH001',
                first_name: 'Teacher',
                last_name: 'One',
                email: 'teacher@test.com',
                phone: '1234567890',
                date_of_birth: new Date('1985-05-15'),
                gender: 'Male',
                hire_date: new Date('2020-01-01'),
                employment_status: 'active',
                employment_type: 'full-time',
                is_active: true,
                branch_id: branch.id,
                user_id: teacherUser.id
            }
        });
        console.log('✅ Created teacher user + teacher entity (ID:', teacherEntity.id, ')');

        // ===== CREATE STUDENT USER WITH LINKED STUDENT ENTITY =====
        console.log('\n--- Creating Student User ---');
        // Delete existing student and user first
        const existingStudentUser = await prisma.user.findUnique({ where: { username: 'student' } });
        if (existingStudentUser) {
            await prisma.student.deleteMany({ where: { user_id: existingStudentUser.id } });
            await prisma.user.delete({ where: { id: existingStudentUser.id } });
        }

        const studentUser = await prisma.user.create({
            data: {
                username: 'student',
                email: 'student@test.com',
                password_hash: passwordHash,
                role_id: studentRole.id,
                branch_id: branch.id,
                first_name: 'Student',
                last_name: 'One',
                is_active: true
            }
        });

        // Create linked Student entity
        const studentEntity = await prisma.student.create({
            data: {
                student_code: 'STU001',
                first_name: 'Student',
                last_name: 'One',
                personal_email: 'student@test.com',
                date_of_birth: new Date('2005-08-20'),
                gender: 'Male',
                admission_date: new Date('2023-09-01'),
                admission_status: 'admitted',
                is_active: true,
                branch_id: branch.id,
                user_id: studentUser.id
            }
        });
        console.log('✅ Created student user + student entity (ID:', studentEntity.id, ')');

        // ===== CREATE SAMPLE DATA FOR STUDENT =====
        console.log('\n--- Creating Sample Data for Student ---');

        // Create a subject
        let subject = await prisma.subject.findFirst({ where: { code: 'MATH' } });
        if (!subject) {
            subject = await prisma.subject.create({
                data: {
                    name: 'Mathematics',
                    code: 'MATH',
                    description: 'Mathematics subject',
                    is_active: true,
                    branch_id: branch.id
                }
            });
            console.log('✅ Created subject: Mathematics');
        }

        // Create a grade level
        let gradeLevel = await prisma.gradeLevel.findFirst({ where: { name: 'Grade 10' } });
        if (!gradeLevel) {
            gradeLevel = await prisma.gradeLevel.create({
                data: {
                    name: 'Grade 10',
                    code: 'G10',
                    order_sequence: 10,
                    is_active: true,
                    branch_id: branch.id
                }
            });
            console.log('✅ Created grade level: Grade 10');
        }

        // Create a course
        let course = await prisma.course.findFirst({ where: { course_code: 'MATH101' } });
        if (!course) {
            course = await prisma.course.create({
                data: {
                    course_name: 'Mathematics 101',
                    course_code: 'MATH101',
                    description: 'Introduction to Mathematics',
                    max_students: 30,
                    is_active: true,
                    branch_id: branch.id,
                    teacher_id: teacherEntity.id,
                    academic_year_id: academicYear.id,
                    subject_id: subject.id,
                    grade_level_id: gradeLevel.id
                }
            });
            console.log('✅ Created course: MATH101');
        }

        // Enroll student in course
        const existingEnrollment = await prisma.studentEnrollment.findFirst({
            where: { student_id: studentEntity.id, course_id: course.id }
        });
        if (!existingEnrollment) {
            await prisma.studentEnrollment.create({
                data: {
                    student_id: studentEntity.id,
                    course_id: course.id,
                    status: 'enrolled',
                    enrollment_date: new Date()
                }
            });
            console.log('✅ Enrolled student in MATH101');
        }

        // Create sample attendance records
        const today = new Date();
        for (let i = 0; i < 5; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0); // Normalize time

            const existingAttendance = await prisma.attendance.findFirst({
                where: {
                    student_id: studentEntity.id,
                    course_id: course.id,
                    date: date
                }
            });

            if (!existingAttendance) {
                await prisma.attendance.create({
                    data: {
                        student_id: studentEntity.id,
                        course_id: course.id,
                        date: date,
                        status: i === 2 ? 'absent' : 'present',
                        recorded_by: teacherEntity.id
                    }
                });
            }
        }
        console.log('✅ Created sample attendance records');

        // Create sample grades
        const existingGrade = await prisma.grade.findFirst({
            where: { student_id: studentEntity.id, course_id: course.id }
        });
        if (!existingGrade) {
            await prisma.grade.create({
                data: {
                    student_id: studentEntity.id,
                    course_id: course.id,
                    academic_year_id: academicYear.id,
                    assessment_type: 'Exam',
                    assessment_name: 'Midterm Exam',
                    score: 85,
                    max_score: 100,
                    grade_date: new Date(),
                    graded_by: teacherEntity.id
                }
            });
            await prisma.grade.create({
                data: {
                    student_id: studentEntity.id,
                    course_id: course.id,
                    academic_year_id: academicYear.id,
                    assessment_type: 'Quiz',
                    assessment_name: 'Quiz 1',
                    score: 92,
                    max_score: 100,
                    grade_date: new Date(),
                    graded_by: teacherEntity.id
                }
            });
            console.log('✅ Created sample grades');
        }

        console.log('\n' + '='.repeat(50));
        console.log('🎉 TEST USERS CREATED WITH LINKED ENTITIES!');
        console.log('='.repeat(50));
        console.log('\n📋 LOGIN CREDENTIALS (use these exactly):');
        console.log('-'.repeat(50));
        console.log('\n👤 ADMIN:');
        console.log('   Username: admin');
        console.log('   Password: test123');
        console.log('\n👨‍🏫 TEACHER:');
        console.log('   Username: teacher');
        console.log('   Password: test123');
        console.log('   Teacher Entity ID:', teacherEntity.id);
        console.log('\n👨‍🎓 STUDENT:');
        console.log('   Username: student');
        console.log('   Password: test123');
        console.log('   Student Entity ID:', studentEntity.id);
        console.log('\n📚 SAMPLE DATA:');
        console.log('   - Course: MATH101 (Mathematics 101)');
        console.log('   - Enrollment: Student enrolled in MATH101');
        console.log('   - Attendance: 5 records (4 present, 1 absent)');
        console.log('   - Grades: 2 assessments (Midterm: 85, Quiz: 92)');
        console.log('\n' + '='.repeat(50));

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestUsers();
