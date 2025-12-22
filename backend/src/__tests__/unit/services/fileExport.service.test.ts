import { FileExportService } from '../../../services/fileExport.service';
import { prisma } from '../../../lib/db';

jest.mock('../../../lib/db', () => {
    const mockPrisma = {
        fileExport: { create: jest.fn(), findUnique: jest.fn(), findMany: jest.fn(), update: jest.fn(), count: jest.fn(), deleteMany: jest.fn() },
        exportSchedule: { create: jest.fn(), findMany: jest.fn(), update: jest.fn(), count: jest.fn() },
        student: { findMany: jest.fn() },
        teacher: { findMany: jest.fn() },
        attendance: { findMany: jest.fn() },
        fee: { findMany: jest.fn() },
        course: { findMany: jest.fn() },
    };
    return { prisma: mockPrisma };
});
jest.mock('fs');

describe('FileExportService Unit Tests', () => {
    const mockExport = { id: 'exp-123', user_id: 'u-123', export_type: 'students', format: 'csv', status: 'completed' };

    beforeEach(() => { jest.clearAllMocks(); });

    describe('getExportStatus', () => {
        it('should return export status', async () => {
            (prisma.fileExport.findUnique as jest.Mock).mockResolvedValue(mockExport);
            const result = await FileExportService.getExportStatus('exp-123');
            expect(result.success).toBe(true);
            expect(result.data!.status).toBe('completed');
        });

        it('should return error for non-existent export', async () => {
            (prisma.fileExport.findUnique as jest.Mock).mockResolvedValue(null);
            const result = await FileExportService.getExportStatus('nonexistent');
            expect(result.success).toBe(false);
        });
    });

    describe('getUserExports', () => {
        it('should return user exports with pagination', async () => {
            (prisma.fileExport.findMany as jest.Mock).mockResolvedValue([mockExport]);
            (prisma.fileExport.count as jest.Mock).mockResolvedValue(1);
            const result = await FileExportService.getUserExports('u-123');
            expect(result.success).toBe(true);
            expect(result.total).toBe(1);
        });
    });

    describe('getAllExports', () => {
        it('should return all exports', async () => {
            (prisma.fileExport.findMany as jest.Mock).mockResolvedValue([mockExport]);
            (prisma.fileExport.count as jest.Mock).mockResolvedValue(1);
            const result = await FileExportService.getAllExports();
            expect(result.success).toBe(true);
        });
    });

    describe('downloadExport', () => {
        it('should increment download count', async () => {
            (prisma.fileExport.findUnique as jest.Mock).mockResolvedValue({ ...mockExport, file_url: '/exports/file.csv' });
            (prisma.fileExport.update as jest.Mock).mockResolvedValue({ ...mockExport, download_count: 1 });
            const result = await FileExportService.downloadExport('exp-123');
            expect(result.success).toBe(true);
        });
    });

    describe('getExportSchedules', () => {
        it('should return active schedules', async () => {
            (prisma.exportSchedule.findMany as jest.Mock).mockResolvedValue([]);
            const result = await FileExportService.getExportSchedules('u-123');
            expect(result.success).toBe(true);
        });
    });

    describe('cancelSchedule', () => {
        it('should cancel schedule', async () => {
            (prisma.exportSchedule.update as jest.Mock).mockResolvedValue({ is_active: false });
            const result = await FileExportService.cancelSchedule('schedule-123');
            expect(result.success).toBe(true);
        });
    });

    describe('cancelExport', () => {
        it('should cancel export', async () => {
            (prisma.fileExport.update as jest.Mock).mockResolvedValue({ ...mockExport, status: 'cancelled' });
            const result = await FileExportService.cancelExport('exp-123');
            expect(result.success).toBe(true);
        });
    });

    describe('getExportStats', () => {
        it('should return export statistics', async () => {
            (prisma.fileExport.count as jest.Mock).mockResolvedValue(10);
            (prisma.exportSchedule.count as jest.Mock).mockResolvedValue(2);
            (prisma.fileExport.findMany as jest.Mock).mockResolvedValue([mockExport]);
            const result = await FileExportService.getExportStats();
            expect(result.success).toBe(true);
            expect(result.data!.total_exports).toBe(10);
        });
    });
});
