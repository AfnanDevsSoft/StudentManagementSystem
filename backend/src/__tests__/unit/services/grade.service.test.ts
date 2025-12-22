import { GradeService } from '../../../services/grade.service';
import { prisma } from '../../../lib/db';

// Mock Prisma client
jest.mock('../../../lib/db', () => ({
    prisma: {
        grade: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            count: jest.fn(),
        },
        course: {
            findUnique: jest.fn(),
        },
        teacher: {
            findUnique: jest.fn(),
        },
        $transaction: jest.fn(),
    },
}));

describe('GradeService Unit Tests', () => {
    const mockGrade = {
        id: 'grade-123',
        student_id: 'student-123',
        course_id: 'course-123',
        academic_year_id: 'year-123',
        assessment_type: 'Midterm',
        assessment_name: 'Midterm Exam',
        score: 85,
        max_score: 100,
        remarks: 'Good work',
        grade_date: new Date('2024-01-15'),
        graded_by: 'teacher-123',
        student: { first_name: 'John', last_name: 'Doe', student_code: 'STU001' },
        course: { course_name: 'Mathematics', course_code: 'MATH101' },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getByCourse', () => {
        it('should return grades for a course', async () => {
            // Arrange
            (prisma.grade.findMany as jest.Mock).mockResolvedValue([mockGrade]);

            // Act
            const result = await GradeService.getByCourse('course-123');

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toEqual([mockGrade]);
            expect(prisma.grade.findMany).toHaveBeenCalledWith({
                where: { course_id: 'course-123' },
                include: expect.any(Object),
                orderBy: { created_at: 'desc' },
            });
        });

        it('should handle errors gracefully', async () => {
            // Arrange
            (prisma.grade.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

            // Act
            const result = await GradeService.getByCourse('course-123');

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toBe('DB Error');
        });
    });

    describe('getAllGrades', () => {
        it('should return paginated grades', async () => {
            // Arrange
            (prisma.grade.findMany as jest.Mock).mockResolvedValue([mockGrade]);
            (prisma.grade.count as jest.Mock).mockResolvedValue(1);

            // Act
            const result = await GradeService.getAllGrades(undefined, 20, 1);

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(1);
            expect(result.pagination).toEqual({
                page: 1,
                limit: 20,
                total: 1,
                pages: 1,
            });
        });

        it('should filter by branch_id', async () => {
            // Arrange
            (prisma.grade.findMany as jest.Mock).mockResolvedValue([mockGrade]);
            (prisma.grade.count as jest.Mock).mockResolvedValue(1);

            // Act
            await GradeService.getAllGrades('branch-123', 20, 1);

            // Assert
            expect(prisma.grade.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { course: { branch_id: 'branch-123' } },
                })
            );
        });

        it('should enforce branch_id for non-SuperAdmin users', async () => {
            // Arrange
            const userContext = {
                role: { name: 'Teacher' },
                branch_id: 'user-branch-123',
            };
            (prisma.grade.findMany as jest.Mock).mockResolvedValue([mockGrade]);
            (prisma.grade.count as jest.Mock).mockResolvedValue(1);

            // Act
            await GradeService.getAllGrades('different-branch', 20, 1, userContext);

            // Assert
            expect(prisma.grade.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { course: { branch_id: 'user-branch-123' } },
                })
            );
        });
    });

    describe('bulkCreate', () => {
        it('should create grades for multiple students', async () => {
            // Arrange
            const mockCourse = { id: 'course-123', academic_year_id: 'year-123', course_name: 'Math' };
            const mockTeacher = { id: 'teacher-123' };

            (prisma.course.findUnique as jest.Mock).mockResolvedValue(mockCourse);
            (prisma.teacher.findUnique as jest.Mock).mockResolvedValue(mockTeacher);
            (prisma.$transaction as jest.Mock).mockResolvedValue([mockGrade, mockGrade]);

            const gradeData = {
                courseId: 'course-123',
                assessmentType: 'Midterm',
                totalMarks: 100,
                userId: 'user-123',
                grades: [
                    { studentId: 'student-1', marksObtained: 85, remarks: 'Good' },
                    { studentId: 'student-2', marksObtained: 90, remarks: 'Excellent' },
                ],
            };

            // Act
            const result = await GradeService.bulkCreate(gradeData);

            // Assert
            expect(result.success).toBe(true);
            expect(result.message).toContain('2 students');
        });

        it('should return error when course not found', async () => {
            // Arrange
            (prisma.course.findUnique as jest.Mock).mockResolvedValue(null);

            // Act
            const result = await GradeService.bulkCreate({
                courseId: 'nonexistent',
                assessmentType: 'Test',
                totalMarks: 100,
                userId: 'user-123',
                grades: [],
            });

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toContain('Course not found');
        });

        it('should return error when teacher not found', async () => {
            // Arrange
            (prisma.course.findUnique as jest.Mock).mockResolvedValue({ id: 'course-123' });
            (prisma.teacher.findUnique as jest.Mock).mockResolvedValue(null);

            // Act
            const result = await GradeService.bulkCreate({
                courseId: 'course-123',
                assessmentType: 'Test',
                totalMarks: 100,
                userId: 'user-123',
                grades: [],
            });

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toContain('teacher');
        });
    });
});
