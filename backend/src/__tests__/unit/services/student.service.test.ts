import StudentService from '../../../services/student.service';
import { prisma } from '../../../lib/db';

// Mock Prisma client
jest.mock('../../../lib/db', () => ({
    prisma: {
        student: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            count: jest.fn(),
        },
        studentEnrollment: {
            findMany: jest.fn(),
        },
        grade: {
            findMany: jest.fn(),
        },
        attendance: {
            findMany: jest.fn(),
        },
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
        role: {
            findFirst: jest.fn(),
        },
    },
}));

describe('StudentService Unit Tests', () => {
    const mockStudent = {
        id: 'student-123',
        student_code: 'STU-2024-001',
        first_name: 'John',
        last_name: 'Doe',
        branch_id: 'branch-123',
        date_of_birth: new Date('2010-01-01'),
        admission_date: new Date('2024-09-01'),
        gender: 'Male',
        is_active: true,
        branch: { id: 'branch-123', name: 'Main Campus' },
        user: null,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllStudents', () => {
        it('should return paginated students successfully', async () => {
            // Arrange
            (prisma.student.findMany as jest.Mock).mockResolvedValue([mockStudent]);
            (prisma.student.count as jest.Mock).mockResolvedValue(1);

            // Act
            const result = await StudentService.getAllStudents(1, 10);

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toEqual([mockStudent]);
            expect(result.pagination).toEqual({
                page: 1,
                limit: 10,
                total: 1,
                pages: 1,
            });
        });

        it('should filter by branch_id', async () => {
            // Arrange
            (prisma.student.findMany as jest.Mock).mockResolvedValue([mockStudent]);
            (prisma.student.count as jest.Mock).mockResolvedValue(1);

            // Act
            await StudentService.getAllStudents(1, 10, '', 'branch-123');

            // Assert
            expect(prisma.student.findMany).toHaveBeenCalledWith({
                where: { branch_id: 'branch-123' },
                include: { branch: true, user: true },
                skip: 0,
                take: 10,
                orderBy: { created_at: 'desc' },
            });
        });

        it('should filter by search query', async () => {
            // Arrange
            (prisma.student.findMany as jest.Mock).mockResolvedValue([mockStudent]);
            (prisma.student.count as jest.Mock).mockResolvedValue(1);

            // Act
            await StudentService.getAllStudents(1, 10, 'John');

            // Assert
            expect(prisma.student.findMany).toHaveBeenCalledWith({
                where: {
                    OR: [
                        { first_name: { contains: 'John', mode: 'insensitive' } },
                        { last_name: { contains: 'John', mode: 'insensitive' } },
                        { personal_email: { contains: 'John', mode: 'insensitive' } },
                        { personal_phone: { contains: 'John', mode: 'insensitive' } },
                        { student_code: { contains: 'John', mode: 'insensitive' } },
                        { cnic: { contains: 'John', mode: 'insensitive' } },
                    ],
                },
                include: { branch: true, user: true },
                skip: 0,
                take: 10,
                orderBy: { created_at: 'desc' },
            });
        });

        it('should enforce branch_id for non-SuperAdmin users', async () => {
            // Arrange
            const userContext = {
                role: { name: 'Admin' },
                branch_id: 'user-branch-123',
            };
            (prisma.student.findMany as jest.Mock).mockResolvedValue([mockStudent]);
            (prisma.student.count as jest.Mock).mockResolvedValue(1);

            // Act
            await StudentService.getAllStudents(1, 10, '', 'different-branch', userContext);

            // Assert
            expect(prisma.student.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { branch_id: 'user-branch-123' },
                })
            );
        });
    });

    describe('getStudentById', () => {
        it('should return student by ID', async () => {
            // Arrange
            const studentWithEnrollments = {
                ...mockStudent,
                enrollments: [{ id: 'enroll-1', course: { course_name: 'Math' } }],
            };
            (prisma.student.findUnique as jest.Mock).mockResolvedValue(studentWithEnrollments);

            // Act
            const result = await StudentService.getStudentById('student-123');

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toEqual(studentWithEnrollments);
            expect(prisma.student.findUnique).toHaveBeenCalledWith({
                where: { id: 'student-123' },
                include: {
                    branch: true,
                    user: true,
                    enrollments: { include: { course: true } },
                },
            });
        });

        it('should return error when student not found', async () => {
            // Arrange
            (prisma.student.findUnique as jest.Mock).mockResolvedValue(null);

            // Act
            const result = await StudentService.getStudentById('nonexistent-id');

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toBe('Student not found');
        });
    });

    describe('createStudent', () => {
        it('should create student successfully', async () => {
            // Arrange
            const studentData = {
                first_name: 'Jane',
                last_name: 'Smith',
                student_code: 'STU-2024-002',
                branch_id: 'branch-123',
                date_of_birth: '2011-05-15',
                admission_date: '2024-09-01',
            };
            (prisma.student.findUnique as jest.Mock).mockResolvedValue(null);
            (prisma.student.create as jest.Mock).mockResolvedValue(mockStudent);

            // Act
            const result = await StudentService.createStudent(studentData);

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockStudent);
            expect(prisma.student.create).toHaveBeenCalled();
        });

        it('should reject duplicate student code', async () => {
            // Arrange
            const studentData = {
                first_name: 'Jane',
                last_name: 'Smith',
                student_code: 'STU-2024-001',
                branch_id: 'branch-123',
                date_of_birth: '2011-05-15',
                admission_date: '2024-09-01',
            };
            (prisma.student.findUnique as jest.Mock).mockResolvedValue(mockStudent);

            // Act
            const result = await StudentService.createStudent(studentData);

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toBe('Student code already exists');
        });

        it('should validate required fields', async () => {
            // Act
            const result = await StudentService.createStudent({
                first_name: 'Jane',
                // Missing required fields
            });

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toBe('Missing required fields');
        });

        it('should create user account when username and password provided', async () => {
            // Arrange
            const studentData = {
                first_name: 'Jane',
                last_name: 'Smith',
                student_code: 'STU-2024-003',
                branch_id: 'branch-123',
                date_of_birth: '2011-05-15',
                admission_date: '2024-09-01',
                username: 'jane.smith',
                password: 'Password@123',
                personal_email: 'jane@example.com',
            };
            (prisma.student.findUnique as jest.Mock).mockResolvedValue(null);
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
            (prisma.role.findFirst as jest.Mock).mockResolvedValue({ id: 'role-student', name: 'Student' });
            (prisma.user.create as jest.Mock).mockResolvedValue({ id: 'user-123' });
            (prisma.student.create as jest.Mock).mockResolvedValue({ ...mockStudent, user_id: 'user-123' });

            // Act
            const result = await StudentService.createStudent(studentData);

            // Assert
            expect(prisma.user.create).toHaveBeenCalled();
            expect(prisma.student.create).toHaveBeenCalled();
            expect(result.success).toBe(true);
        });
    });

    describe('updateStudent', () => {
        it('should update student successfully', async () => {
            // Arrange
            (prisma.student.findUnique as jest.Mock).mockResolvedValue(mockStudent);
            (prisma.student.update as jest.Mock).mockResolvedValue({
                ...mockStudent,
                first_name: 'John Updated',
            });

            // Act
            const result = await StudentService.updateStudent('student-123', {
                first_name: 'John Updated',
            });

            // Assert
            expect(result.success).toBe(true);
            expect(result.data.first_name).toBe('John Updated');
        });

        it('should return error when student not found', async () => {
            // Arrange
            (prisma.student.findUnique as jest.Mock).mockResolvedValue(null);

            // Act
            const result = await StudentService.updateStudent('nonexistent-id', {
                first_name: 'Updated',
            });

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toBe('Student not found');
        });

        it('should reject duplicate student code on update', async () => {
            // Arrange
            (prisma.student.findUnique as jest.Mock)
                .mockResolvedValueOnce(mockStudent)
                .mockResolvedValueOnce({ id: 'other-student', student_code: 'STU-2024-999' });

            // Act
            const result = await StudentService.updateStudent('student-123', {
                student_code: 'STU-2024-999',
            });

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toBe('Student code already exists');
        });
    });

    describe('deleteStudent', () => {
        it('should soft delete student', async () => {
            // Arrange
            (prisma.student.findUnique as jest.Mock).mockResolvedValue(mockStudent);
            (prisma.student.update as jest.Mock).mockResolvedValue({
                ...mockStudent,
                is_active: false,
            });

            // Act
            const result = await StudentService.deleteStudent('student-123');

            // Assert
            expect(result.success).toBe(true);
            expect(prisma.student.update).toHaveBeenCalledWith({
                where: { id: 'student-123' },
                data: { is_active: false },
            });
        });

        it('should return error when student not found', async () => {
            // Arrange
            (prisma.student.findUnique as jest.Mock).mockResolvedValue(null);

            // Act
            const result = await StudentService.deleteStudent('nonexistent-id');

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toBe('Student not found');
        });
    });

    describe('getStudentEnrollments', () => {
        it('should return student enrollments', async () => {
            // Arrange
            const enrollments = [
                {
                    id: 'enroll-1',
                    student_id: 'student-123',
                    course: { course_name: 'Mathematics', subject: {}, grade_level: {}, teacher: {} },
                },
            ];
            (prisma.studentEnrollment.findMany as jest.Mock).mockResolvedValue(enrollments);

            // Act
            const result = await StudentService.getStudentEnrollments('student-123');

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toEqual(enrollments);
        });
    });

    describe('getStudentGrades', () => {
        it('should return student grades', async () => {
            // Arrange
            const grades = [
                {
                    id: 'grade-1',
                    student_id: 'student-123',
                    course: {},
                    academic_year: {},
                    graded_by_teacher: {},
                },
            ];
            (prisma.grade.findMany as jest.Mock).mockResolvedValue(grades);

            // Act
            const result = await StudentService.getStudentGrades('student-123');

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toEqual(grades);
        });
    });

    describe('getStudentAttendance', () => {
        it('should return student attendance', async () => {
            // Arrange
            const attendance = [
                {
                    id: 'attendance-1',
                    student_id: 'student-123',
                    course: {},
                    date: new Date(),
                },
            ];
            (prisma.attendance.findMany as jest.Mock).mockResolvedValue(attendance);

            // Act
            const result = await StudentService.getStudentAttendance('student-123');

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toEqual(attendance);
        });
    });
});
