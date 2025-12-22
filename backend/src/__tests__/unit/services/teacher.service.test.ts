import { TeacherService } from '../../../services/teacher.service';
import { prisma } from '../../../lib/db';

// Mock Prisma client
jest.mock('../../../lib/db', () => ({
    prisma: {
        teacher: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            count: jest.fn(),
        },
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
        role: {
            findFirst: jest.fn(),
        },
        course: {
            findMany: jest.fn(),
        },
        teacherAttendance: {
            findMany: jest.fn(),
        },
    },
}));

jest.mock('bcryptjs', () => ({
    hash: jest.fn().mockResolvedValue('hashed_password'),
}));

describe('TeacherService Unit Tests', () => {
    const mockTeacher = {
        id: 'teacher-123',
        employee_code: 'TEACH-001',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@test.com',
        phone: '+1234567890',
        branch_id: 'branch-123',
        is_active: true,
        hire_date: new Date(),
        employment_type: 'full_time',
        branch: { name: 'Main Campus' },
        courses: [],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllTeachers', () => {
        it('should return paginated teachers', async () => {
            // Arrange
            (prisma.teacher.findMany as jest.Mock).mockResolvedValue([mockTeacher]);
            (prisma.teacher.count as jest.Mock).mockResolvedValue(1);

            // Act
            const result = await TeacherService.getAllTeachers(1, 10);

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toEqual([mockTeacher]);
            expect(result.pagination).toEqual({
                page: 1,
                limit: 10,
                total: 1,
                pages: 1,
            });
        });

        it('should filter by branch_id', async () => {
            // Arrange
            (prisma.teacher.findMany as jest.Mock).mockResolvedValue([mockTeacher]);
            (prisma.teacher.count as jest.Mock).mockResolvedValue(1);

            // Act
            await TeacherService.getAllTeachers(1, 10, undefined, 'branch-123');

            // Assert
            expect(prisma.teacher.findMany).toHaveBeenCalledWith({
                where: { is_active: true, branch_id: 'branch-123' },
                skip: 0,
                take: 10,
                include: {
                    branch: { select: { name: true } },
                    courses: { select: { course_name: true } },
                },
            });
        });

        it('should filter by search query', async () => {
            // Arrange
            (prisma.teacher.findMany as jest.Mock).mockResolvedValue([mockTeacher]);
            (prisma.teacher.count as jest.Mock).mockResolvedValue(1);

            // Act
            await TeacherService.getAllTeachers(1, 10, 'John');

            // Assert
            expect(prisma.teacher.findMany).toHaveBeenCalledWith({
                where: {
                    is_active: true,
                    OR: [
                        { first_name: { contains: 'John', mode: 'insensitive' } },
                        { last_name: { contains: 'John', mode: 'insensitive' } },
                        { email: { contains: 'John', mode: 'insensitive' } },
                        { employee_code: { contains: 'John', mode: 'insensitive' } },
                    ],
                },
                skip: 0,
                take: 10,
                include: {
                    branch: { select: { name: true } },
                    courses: { select: { course_name: true } },
                },
            });
        });

        it('should enforce branch_id for non-SuperAdmin users', async () => {
            // Arrange
            const userContext = {
                role: { name: 'Admin' },
                branch_id: 'user-branch-123',
            };
            (prisma.teacher.findMany as jest.Mock).mockResolvedValue([mockTeacher]);
            (prisma.teacher.count as jest.Mock).mockResolvedValue(1);

            // Act
            await TeacherService.getAllTeachers(1, 10, undefined, 'different-branch', userContext);

            // Assert
            expect(prisma.teacher.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        branch_id: 'user-branch-123',
                    }),
                })
            );
        });
    });

    describe('getTeacherById', () => {
        it('should return teacher by ID', async () => {
            // Arrange
            const teacherWithDetails = {
                ...mockTeacher,
                leave_requests: [],
                payroll_records: [],
            };
            (prisma.teacher.findUnique as jest.Mock).mockResolvedValue(teacherWithDetails);

            // Act
            const result = await TeacherService.getTeacherById('teacher-123');

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toEqual(teacherWithDetails);
        });

        it('should return error when teacher not found', async () => {
            // Arrange
            (prisma.teacher.findUnique as jest.Mock).mockResolvedValue(null);

            // Act
            const result = await TeacherService.getTeacherById('nonexistent-id');

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toBe('Teacher not found');
        });
    });

    describe('createTeacher', () => {
        it('should create teacher successfully', async () => {
            // Arrange
            const teacherData = {
                employee_code: 'TEACH-002',
                first_name: 'Jane',
                last_name: 'Smith',
                email: 'jane.smith@test.com',
                phone: '+1234567891',
                branch_id: 'branch-123',
            };
            (prisma.teacher.create as jest.Mock).mockResolvedValue(mockTeacher);

            // Act
            const result = await TeacherService.createTeacher(teacherData);

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockTeacher);
        });

        it('should validate required fields', async () => {
            // Act
            const result = await TeacherService.createTeacher({
                first_name: 'Jane',
                // Missing employee_code and branch_id
            });

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toBe('Employee code and branch ID are required');
        });

        it('should create user account when username and password provided', async () => {
            // Arrange
            const teacherData = {
                employee_code: 'TEACH-003',
                first_name: 'Bob',
                last_name: 'Johnson',
                email: 'bob@test.com',
                phone: '+1234567892',
                branch_id: 'branch-123',
                username: 'bob.johnson',
                password: 'Password@123',
            };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
            (prisma.role.findFirst as jest.Mock).mockResolvedValue({ id: 'role-teacher', name: 'Teacher' });
            (prisma.user.create as jest.Mock).mockResolvedValue({ id: 'user-123' });
            (prisma.teacher.create as jest.Mock).mockResolvedValue({
                ...mockTeacher,
                user_id: 'user-123',
            });

            // Act
            const result = await TeacherService.createTeacher(teacherData);

            // Assert
            expect(prisma.user.create).toHaveBeenCalled();
            expect(prisma.teacher.create).toHaveBeenCalled();
            expect(result.success).toBe(true);
        });

        it('should reject duplicate username', async () => {
            // Arrange
            const teacherData = {
                employee_code: 'TEACH-004',
                first_name: 'Test',
                last_name: 'User',
                email: 'test@test.com',
                phone: '+1234567893',
                branch_id: 'branch-123',
                username: 'existing.user',
                password: 'Password@123',
            };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'existing-user' });

            // Act
            const result = await TeacherService.createTeacher(teacherData);

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toBe('Username already exists');
        });
    });

    describe('updateTeacher', () => {
        it('should update teacher successfully', async () => {
            // Arrange
            (prisma.teacher.update as jest.Mock).mockResolvedValue({
                ...mockTeacher,
                first_name: 'Updated',
            });

            // Act
            const result = await TeacherService.updateTeacher('teacher-123', {
                first_name: 'Updated',
            });

            // Assert
            expect(result.success).toBe(true);
            expect(result.data!.first_name).toBe('Updated');
        });
    });

    describe('deleteTeacher', () => {
        it('should soft delete teacher', async () => {
            // Arrange
            (prisma.teacher.update as jest.Mock).mockResolvedValue({
                ...mockTeacher,
                is_active: false,
            });

            // Act
            const result = await TeacherService.deleteTeacher('teacher-123');

            // Assert
            expect(result.success).toBe(true);
            expect(prisma.teacher.update).toHaveBeenCalledWith({
                where: { id: 'teacher-123' },
                data: { is_active: false },
            });
        });
    });

    describe('getTeacherCourses', () => {
        it('should return teacher courses', async () => {
            // Arrange
            const courses = [
                {
                    id: 'course-1',
                    course_name: 'Mathematics',
                    subject: {},
                    grade_level: {},
                    enrollments: [],
                },
            ];
            (prisma.course.findMany as jest.Mock).mockResolvedValue(courses);

            // Act
            const result = await TeacherService.getTeacherCourses('teacher-123');

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toEqual(courses);
        });
    });

    describe('getTeacherAttendance', () => {
        it('should return teacher attendance', async () => {
            // Arrange
            const attendance = [
                {
                    id: 'attendance-1',
                    teacher_id: 'teacher-123',
                    date: new Date(),
                    status: 'present',
                },
            ];
            (prisma.teacherAttendance.findMany as jest.Mock).mockResolvedValue(attendance);

            // Act
            const result = await TeacherService.getTeacherAttendance('teacher-123');

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toEqual(attendance);
        });

        it('should filter by date range', async () => {
            // Arrange
            const startDate = new Date('2024-01-01');
            const endDate = new Date('2024-01-31');
            (prisma.teacherAttendance.findMany as jest.Mock).mockResolvedValue([]);

            // Act
            await TeacherService.getTeacherAttendance('teacher-123', startDate, endDate);

            // Assert
            expect(prisma.teacherAttendance.findMany).toHaveBeenCalledWith({
                where: {
                    teacher_id: 'teacher-123',
                    date: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                orderBy: { date: 'desc' },
            });
        });
    });
});
