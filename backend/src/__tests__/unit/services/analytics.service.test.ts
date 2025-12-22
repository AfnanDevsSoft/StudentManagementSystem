import { AnalyticsService } from '../../../services/analytics.service';
import { prisma } from '../../../lib/db';

// Mock Prisma client
jest.mock('../../../lib/db', () => ({
    prisma: {
        studentEnrollment: {
            count: jest.fn(),
            groupBy: jest.fn(),
        },
        attendance: {
            findMany: jest.fn(),
        },
        branch: {
            findUnique: jest.fn(),
        },
        student: {
            count: jest.fn(),
        },
        teacher: {
            count: jest.fn(),
            findMany: jest.fn(),
        },
        course: {
            count: jest.fn(),
        },
    },
}));

describe('AnalyticsService Unit Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getEnrollmentMetrics', () => {
        it('should calculate enrollment metrics', async () => {
            // Arrange
            (prisma.studentEnrollment.count as jest.Mock).mockResolvedValue(150);
            (prisma.studentEnrollment.groupBy as jest.Mock).mockResolvedValue([
                { course_id: 'course-1', _count: { id: 50 } },
                { course_id: 'course-2', _count: { id: 100 } },
            ]);

            // Act
            const result = await AnalyticsService.getEnrollmentMetrics();

            // Assert
            expect(result.success).toBe(true);
            expect(result.data!.totalEnrollments).toBe(150);
            expect(result.data!.enrollmentsByGrade).toHaveLength(2);
        });

        it('should filter by branch_id', async () => {
            // Arrange
            (prisma.studentEnrollment.count as jest.Mock).mockResolvedValue(50);
            (prisma.studentEnrollment.groupBy as jest.Mock).mockResolvedValue([]);

            // Act
            await AnalyticsService.getEnrollmentMetrics('branch-123');

            // Assert
            expect(prisma.studentEnrollment.count).toHaveBeenCalledWith({
                where: { course: { branch_id: 'branch-123' } },
            });
        });
    });

    describe('getAttendanceMetrics', () => {
        it('should calculate attendance metrics', async () => {
            // Arrange
            const mockRecords = [
                { status: 'present' },
                { status: 'present' },
                { status: 'absent' },
            ];
            (prisma.attendance.findMany as jest.Mock).mockResolvedValue(mockRecords);

            // Act
            const result = await AnalyticsService.getAttendanceMetrics(
                undefined,
                new Date('2024-01-01'),
                new Date('2024-01-31')
            );

            // Assert
            expect(result.success).toBe(true);
            expect(result.data!.totalRecords).toBe(3);
            expect(result.data!.presentCount).toBe(2);
            expect(result.data!.absentCount).toBe(1);
        });

        it('should handle empty records', async () => {
            // Arrange
            (prisma.attendance.findMany as jest.Mock).mockResolvedValue([]);

            // Act
            const result = await AnalyticsService.getAttendanceMetrics(
                'branch-123',
                new Date('2024-01-01'),
                new Date('2024-01-31')
            );

            // Assert
            expect(result.success).toBe(true);
            expect(result.data!.totalRecords).toBe(0);
            expect(result.data!.attendancePercentage).toBe('0.00%');
        });
    });

    describe('getFeeMetrics', () => {
        it('should return fee metrics for branch', async () => {
            // Arrange
            (prisma.branch.findUnique as jest.Mock).mockResolvedValue({
                id: 'branch-123',
                students: [{ id: 's1' }, { id: 's2' }],
            });

            // Act
            const result = await AnalyticsService.getFeeMetrics('branch-123');

            // Assert
            expect(result.success).toBe(true);
            expect(result.data!.totalStudents).toBe(2);
        });

        it('should return global fee metrics when no branch specified', async () => {
            // Arrange
            (prisma.student.count as jest.Mock).mockResolvedValue(500);

            // Act
            const result = await AnalyticsService.getFeeMetrics();

            // Assert
            expect(result.success).toBe(true);
            expect(result.data!.totalStudents).toBe(500);
        });

        it('should return error when branch not found', async () => {
            // Arrange
            (prisma.branch.findUnique as jest.Mock).mockResolvedValue(null);

            // Act
            const result = await AnalyticsService.getFeeMetrics('nonexistent');

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toBe('Branch not found');
        });
    });

    describe('getTeacherMetrics', () => {
        it('should return teacher metrics', async () => {
            // Arrange
            const mockTeachers = [
                {
                    id: 't1',
                    first_name: 'John',
                    last_name: 'Doe',
                    courses: [{ _count: { enrollments: 30, grades: 100 } }],
                },
            ];
            (prisma.teacher.findMany as jest.Mock).mockResolvedValue(mockTeachers);

            // Act
            const result = await AnalyticsService.getTeacherMetrics();

            // Assert
            expect(result.success).toBe(true);
            expect(result.data!.totalTeachers).toBe(1);
            expect(result.data!.teacherDetails[0].name).toBe('John Doe');
        });

        it('should filter by branch_id', async () => {
            // Arrange
            (prisma.teacher.findMany as jest.Mock).mockResolvedValue([]);

            // Act
            await AnalyticsService.getTeacherMetrics('branch-123');

            // Assert
            expect(prisma.teacher.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { branch_id: 'branch-123' },
                })
            );
        });
    });

    describe('getDashboardData', () => {
        it('should return dashboard summary', async () => {
            // Arrange
            (prisma.student.count as jest.Mock).mockResolvedValue(200);
            (prisma.teacher.count as jest.Mock).mockResolvedValue(20);
            (prisma.course.count as jest.Mock).mockResolvedValue(15);

            // Act
            const result = await AnalyticsService.getDashboardData();

            // Assert
            expect(result.success).toBe(true);
            expect(result.data!.totalStudents).toBe(200);
            expect(result.data!.totalTeachers).toBe(20);
            expect(result.data!.totalCourses).toBe(15);
            expect(result.data!.attendanceHistory).toBeDefined();
            expect(result.data!.gradeDistribution).toBeDefined();
        });

        it('should filter by branch_id', async () => {
            // Arrange
            (prisma.student.count as jest.Mock).mockResolvedValue(50);
            (prisma.teacher.count as jest.Mock).mockResolvedValue(5);
            (prisma.course.count as jest.Mock).mockResolvedValue(10);

            // Act
            await AnalyticsService.getDashboardData('branch-123');

            // Assert
            expect(prisma.student.count).toHaveBeenCalledWith({
                where: { branch_id: 'branch-123' },
            });
        });
    });

    describe('getTrendAnalysis', () => {
        it('should return trend analysis', async () => {
            // Act
            const result = await AnalyticsService.getTrendAnalysis('branch-123', 'attendance', 30);

            // Assert
            expect(result.success).toBe(true);
            expect(result.data!.trends).toBeDefined();
            expect(result.data!.period).toBe('Last 30 days');
        });
    });
});
