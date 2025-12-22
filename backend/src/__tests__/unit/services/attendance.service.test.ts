import { AttendanceService } from '../../../services/attendance.service';
import { prisma } from '../../../lib/db';

// Mock Prisma client
jest.mock('../../../lib/db', () => ({
    prisma: {
        attendance: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            createMany: jest.fn(),
            update: jest.fn(),
            count: jest.fn(),
            groupBy: jest.fn(),
        },
        student: {
            findUnique: jest.fn(),
        },
        course: {
            findUnique: jest.fn(),
        },
        $transaction: jest.fn((callback) => callback(prisma)),
    },
}));

describe('AttendanceService Unit Tests', () => {
    const mockAttendance = {
        id: 'attendance-123',
        student_id: 'student-123',
        course_id: 'course-123',
        date: new Date('2024-01-15'),
        status: 'present',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllAttendance', () => {
        it('should return attendance records', async () => {
            // Arrange
            (prisma.attendance.findMany as jest.Mock).mockResolvedValue([mockAttendance]);
            (prisma.attendance.count as jest.Mock).mockResolvedValue(1);

            // Act
            const result = await AttendanceService.getAllAttendance(undefined, 10, 1);

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toEqual([mockAttendance]);
        });

        it('should filter by branch_id', async () => {
            // Arrange
            (prisma.attendance.findMany as jest.Mock).mockResolvedValue([mockAttendance]);
            (prisma.attendance.count as jest.Mock).mockResolvedValue(1);

            // Act
            const result = await AttendanceService.getAllAttendance('branch-123', 10, 1);

            // Assert
            expect(prisma.attendance.findMany).toHaveBeenCalled();
            expect(result.success).toBe(true);
        });
    });

    describe('markAttendance', () => {
        it('should mark attendance successfully', async () => {
            // Arrange
            const attendanceData = {
                student_id: 'student-123',
                branch_id: 'branch-123',
                course_id: 'course-123',
                date: '2024-01-15',
                status: 'present',
                recorded_by: 'teacher-123',
            };
            (prisma.attendance.findUnique as jest.Mock).mockResolvedValue(null);
            (prisma.attendance.create as jest.Mock).mockResolvedValue(mockAttendance);

            // Act
            const result = await AttendanceService.markAttendance(attendanceData);

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockAttendance);
        });
    });

    describe('bulkMark', () => {
        it('should mark bulk attendance successfully', async () => {
            // Arrange
            const bulkData = {
                courseId: 'course-123',
                date: '2024-01-15',
                records: [
                    { studentId: 'student-1', status: 'present' },
                    { studentId: 'student-2', status: 'absent' },
                ],
                recordedBy: 'teacher-123',
                branchId: 'branch-123',
            };
            (prisma.$transaction as jest.Mock).mockResolvedValue([mockAttendance, mockAttendance]);

            // Act
            const result = await AttendanceService.bulkMark(bulkData);

            // Assert
            expect(result.success).toBe(true);
        });
    });

    describe('getByCourse', () => {
        it('should return attendance by course', async () => {
            // Arrange
            (prisma.attendance.findMany as jest.Mock).mockResolvedValue([mockAttendance]);

            // Act
            const result = await AttendanceService.getByCourse('course-123');

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toEqual([mockAttendance]);
        });

        it('should filter by date', async () => {
            // Arrange
            (prisma.attendance.findMany as jest.Mock).mockResolvedValue([mockAttendance]);

            // Act
            await AttendanceService.getByCourse('course-123', '2024-01-15');

            // Assert
            expect(prisma.attendance.findMany).toHaveBeenCalled();
        });
    });
});
