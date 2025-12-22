import { BackupService } from '../../../services/backup.service';
import { prisma } from '../../../lib/db';

jest.mock('../../../lib/db', () => ({
    prisma: {
        backup: { create: jest.fn(), update: jest.fn(), findUnique: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(), count: jest.fn() },
        backupSchedule: { create: jest.fn(), update: jest.fn(), findMany: jest.fn() },
    },
}));
jest.mock('fs');

describe('BackupService Unit Tests', () => {
    const mockBackup = { id: 'backup-123', backup_type: 'full', status: 'completed', backup_size: 1024 };

    beforeEach(() => { jest.clearAllMocks(); });

    describe('getBackupStatus', () => {
        it('should return backup status', async () => {
            (prisma.backup.findUnique as jest.Mock).mockResolvedValue(mockBackup);
            const result = await BackupService.getBackupStatus('backup-123');
            expect(result.success).toBe(true);
            expect(result.data!.status).toBe('completed');
        });

        it('should return error for non-existent backup', async () => {
            (prisma.backup.findUnique as jest.Mock).mockResolvedValue(null);
            const result = await BackupService.getBackupStatus('nonexistent');
            expect(result.success).toBe(false);
        });
    });

    describe('getBackupHistory', () => {
        it('should return backup history with pagination', async () => {
            (prisma.backup.findMany as jest.Mock).mockResolvedValue([mockBackup]);
            (prisma.backup.count as jest.Mock).mockResolvedValue(1);
            const result = await BackupService.getBackupHistory(20, 0);
            expect(result.success).toBe(true);
            expect(result.total).toBe(1);
        });
    });

    describe('listAvailableBackups', () => {
        it('should return available backups', async () => {
            (prisma.backup.findMany as jest.Mock).mockResolvedValue([mockBackup]);
            const result = await BackupService.listAvailableBackups();
            expect(result.success).toBe(true);
        });
    });

    describe('getBackupSchedules', () => {
        it('should return active schedules', async () => {
            (prisma.backupSchedule.findMany as jest.Mock).mockResolvedValue([]);
            const result = await BackupService.getBackupSchedules();
            expect(result.success).toBe(true);
        });
    });

    describe('cancelScheduledBackup', () => {
        it('should cancel schedule', async () => {
            (prisma.backupSchedule.update as jest.Mock).mockResolvedValue({ is_active: false });
            const result = await BackupService.cancelScheduledBackup('schedule-123');
            expect(result.success).toBe(true);
        });
    });

    describe('getBackupStorageStats', () => {
        it('should return storage stats', async () => {
            (prisma.backup.findMany as jest.Mock).mockResolvedValue([mockBackup, { ...mockBackup, backup_type: 'incremental' }]);
            const result = await BackupService.getBackupStorageStats();
            expect(result.success).toBe(true);
            expect(result.data!.total_backups).toBe(2);
        });
    });
});
