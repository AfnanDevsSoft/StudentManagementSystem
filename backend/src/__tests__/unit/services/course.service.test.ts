import { CourseService } from '../../../services/course.service';
import { prisma } from '../../../lib/db';

// Mock Prisma client
jest.mock('../../../lib/db', () => ({
    prisma: {
        course: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            count: jest.fn(),
        },
        studentEnrollment: {
            findMany: jest.fn(),
        },
    },
}));

describe('CourseService Unit Tests', () => {
    const mockCourse = {
        id: 'course-123',
        course_code: 'MATH-101',
        course_name: 'Mathematics 101',
        branch_id: 'branch-123',
        subject_id: 'subject-123',
        grade_level_id: 'grade-123',
        teacher_id: 'teacher-123',
        academic_year_id: 'year-123',
        is_active: true,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllCourses', () => {
        it('should return paginated courses', async () => {
            // Arrange
            (prisma.course.findMany as jest.Mock).mockResolvedValue([mockCourse]);
            (prisma.course.count as jest.Mock).mockResolvedValue(1);

            // Act
            const result = await CourseService.getAllCourses(1, 10);

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toEqual([mockCourse]);
            expect(result.pagination).toEqual({
                page: 1,
                limit: 10,
                total: 1,
                pages: 1,
            });
        });

        it('should filter by branch_id', async () => {
            // Arrange
            (prisma.course.findMany as jest.Mock).mockResolvedValue([mockCourse]);
            (prisma.course.count as jest.Mock).mockResolvedValue(1);

            // Act
            await CourseService.getAllCourses(1, 10, undefined, 'branch-123');

            // Assert
            expect(prisma.course.findMany).toHaveBeenCalledWith({
                where: { is_active: true, branch_id: 'branch-123' },
                skip: 0,
                take: 10,
                include: expect.any(Object),
            });
        });

        it('should enforce branch_id for non-SuperAdmin users', async () => {
            // Arrange
            const userContext = {
                role: { name: 'Teacher' },
                branch_id: 'user-branch-123',
            };
            (prisma.course.findMany as jest.Mock).mockResolvedValue([mockCourse]);
            (prisma.course.count as jest.Mock).mockResolvedValue(1);

            // Act
            await CourseService.getAllCourses(1, 10, undefined, 'different-branch', userContext);

            // Assert
            expect(prisma.course.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        branch_id: 'user-branch-123',
                    }),
                })
            );
        });
    });

    describe('getCourseById', () => {
        it('should return course by ID', async () => {
            // Arrange
            const courseWithDetails = {
                ...mockCourse,
                subject: {},
                grade_level: {},
                teacher: {},
                enrollments: [],
            };
            (prisma.course.findUnique as jest.Mock).mockResolvedValue(courseWithDetails);

            // Act
            const result = await CourseService.getCourseById('course-123');

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toEqual(courseWithDetails);
        });

        it('should return error when course not found', async () => {
            // Arrange
            (prisma.course.findUnique as jest.Mock).mockResolvedValue(null);

            // Act
            const result = await CourseService.getCourseById('nonexistent-id');

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toBe('Course not found');
        });
    });

    describe('createCourse', () => {
        it('should create course successfully', async () => {
            // Arrange
            const courseData = {
                course_code: 'SCI-101',
                course_name: 'Science 101',
                branch_id: '123e4567-e89b-12d3-a456-426614174000',
                subject_id: '123e4567-e89b-12d3-a456-426614174001',
                grade_level_id: '123e4567-e89b-12d3-a456-426614174002',
                teacher_id: '123e4567-e89b-12d3-a456-426614174003',
                academic_year_id: '123e4567-e89b-12d3-a456-426614174004',
            };
            (prisma.course.create as jest.Mock).mockResolvedValue(mockCourse);

            // Act
            const result = await CourseService.createCourse(courseData);

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockCourse);
        });

        it('should validate required fields', async () => {
            // Act
            const result = await CourseService.createCourse({
                course_name: 'Test Course',
                // Missing required fields
            });

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toContain('required');
        });
    });

    describe('updateCourse', () => {
        it('should update course successfully', async () => {
            // Arrange
            (prisma.course.update as jest.Mock).mockResolvedValue({
                ...mockCourse,
                course_name: 'Advanced Mathematics',
            });

            // Act
            const result = await CourseService.updateCourse('course-123', {
                course_name: 'Advanced Mathematics',
            });

            // Assert
            expect(result.success).toBe(true);
            expect(result.data!.course_name).toBe('Advanced Mathematics');
        });
    });

    describe('deleteCourse', () => {
        it('should soft delete course', async () => {
            // Arrange
            (prisma.course.update as jest.Mock).mockResolvedValue({
                ...mockCourse,
                is_active: false,
            });

            // Act
            const result = await CourseService.deleteCourse('course-123');

            // Assert
            expect(result.success).toBe(true);
            expect(prisma.course.update).toHaveBeenCalledWith({
                where: { id: 'course-123' },
                data: { is_active: false },
            });
        });
    });

    describe('getCourseEnrollments', () => {
        it('should return course enrollments', async () => {
            // Arrange
            const enrollments = [
                {
                    id: 'enrollment-1',
                    student: { first_name: 'John', last_name: 'Doe' },
                },
            ];
            (prisma.studentEnrollment.findMany as jest.Mock).mockResolvedValue(enrollments);

            // Act
            const result = await CourseService.getCourseEnrollments('course-123');

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toEqual(enrollments);
        });
    });
});
