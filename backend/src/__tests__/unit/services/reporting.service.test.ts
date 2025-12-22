import { ReportingService } from '../../../services/reporting.service';
import { prisma } from '../../../lib/db';

jest.mock('../../../lib/db', () => ({
    prisma: {
        studentEnrollment: { findMany: jest.fn() },
        teacher: { findMany: jest.fn() },
        attendance: { findMany: jest.fn() },
        report: { create: jest.fn(), findMany: jest.fn(), count: jest.fn(), delete: jest.fn() },
    },
}));

describe('ReportingService Unit Tests', () => {
    const mockReport = { id: 'rep-123', report_type: 'student_progress', status: 'completed', branch_id: 'b-123' };

    beforeEach(() => { jest.clearAllMocks(); });

    describe('generateStudentReport', () => {
        it('should generate student progress report', async () => {
            (prisma.studentEnrollment.findMany as jest.Mock).mockResolvedValue([{ id: 'e-1' }]);
            (prisma.report.create as jest.Mock).mockResolvedValue(mockReport);
            const result = await ReportingService.generateStudentReport('b-123');
            expect(result.success).toBe(true);
            expect(result.message).toContain('generated');
        });
    });

    describe('generateTeacherReport', () => {
        it('should generate teacher performance report', async () => {
            (prisma.teacher.findMany as jest.Mock).mockResolvedValue([{ id: 't-1', courses: [] }]);
            (prisma.report.create as jest.Mock).mockResolvedValue({ ...mockReport, report_type: 'teacher_performance' });
            const result = await ReportingService.generateTeacherReport('b-123');
            expect(result.success).toBe(true);
        });
    });

    describe('generateFeeReport', () => {
        it('should generate fee collection report', async () => {
            (prisma.report.create as jest.Mock).mockResolvedValue({ ...mockReport, report_type: 'fee_collection' });
            const result = await ReportingService.generateFeeReport('b-123');
            expect(result.success).toBe(true);
        });
    });

    describe('generateAttendanceReport', () => {
        it('should generate attendance report with statistics', async () => {
            (prisma.attendance.findMany as jest.Mock).mockResolvedValue([
                { status: 'present' }, { status: 'present' }, { status: 'absent' }
            ]);
            (prisma.report.create as jest.Mock).mockResolvedValue({ ...mockReport, report_type: 'attendance_summary' });

            const result = await ReportingService.generateAttendanceReport('b-123', new Date(), new Date());
            expect(result.success).toBe(true);
            expect(result.data!.stats.presentCount).toBe(2);
            expect(result.data!.stats.absentCount).toBe(1);
        });
    });

    describe('getReports', () => {
        it('should return paginated reports', async () => {
            (prisma.report.findMany as jest.Mock).mockResolvedValue([mockReport]);
            (prisma.report.count as jest.Mock).mockResolvedValue(1);
            const result = await ReportingService.getReports('b-123');
            expect(result.success).toBe(true);
            expect(result.pagination).toBeDefined();
        });
    });

    describe('deleteReport', () => {
        it('should delete report', async () => {
            (prisma.report.delete as jest.Mock).mockResolvedValue(mockReport);
            const result = await ReportingService.deleteReport('rep-123');
            expect(result.success).toBe(true);
        });
    });
});
