import { AnnouncementService } from '../../../services/announcement.service';
import { prisma } from '../../../lib/db';

jest.mock('../../../lib/db', () => ({
    prisma: {
        classAnnouncement: { create: jest.fn(), findMany: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
        course: { findUnique: jest.fn() },
    },
}));

describe('AnnouncementService Unit Tests', () => {
    const mockAnnouncement = { id: 'ann-123', course_id: 'c-123', title: 'Test', content: 'Content', priority: 'normal' };

    beforeEach(() => { jest.clearAllMocks(); });

    describe('createAnnouncement', () => {
        it('should create announcement', async () => {
            (prisma.classAnnouncement.create as jest.Mock).mockResolvedValue(mockAnnouncement);
            const result = await AnnouncementService.createAnnouncement('c-123', 'user-1', { title: 'Test', content: 'Content' });
            expect(result.success).toBe(true);
        });
    });

    describe('getAnnouncements', () => {
        it('should return announcements with pagination', async () => {
            (prisma.classAnnouncement.findMany as jest.Mock).mockResolvedValue([mockAnnouncement]);
            (prisma.classAnnouncement.count as jest.Mock).mockResolvedValue(1);
            const result = await AnnouncementService.getAnnouncements('c-123');
            expect(result.success).toBe(true);
            expect(result.pagination).toBeDefined();
        });
    });

    describe('updateAnnouncement', () => {
        it('should update announcement', async () => {
            (prisma.classAnnouncement.update as jest.Mock).mockResolvedValue({ ...mockAnnouncement, title: 'Updated' });
            const result = await AnnouncementService.updateAnnouncement('ann-123', { title: 'Updated' });
            expect(result.success).toBe(true);
        });
    });

    describe('deleteAnnouncement', () => {
        it('should delete announcement', async () => {
            (prisma.classAnnouncement.delete as jest.Mock).mockResolvedValue(mockAnnouncement);
            const result = await AnnouncementService.deleteAnnouncement('ann-123');
            expect(result.success).toBe(true);
        });
    });

    describe('pinAnnouncement', () => {
        it('should pin announcement', async () => {
            (prisma.classAnnouncement.update as jest.Mock).mockResolvedValue({ ...mockAnnouncement, is_pinned: true });
            const result = await AnnouncementService.pinAnnouncement('ann-123', true);
            expect(result.success).toBe(true);
            expect(result.message).toContain('pinned');
        });
    });

    describe('trackView', () => {
        it('should increment view count', async () => {
            (prisma.classAnnouncement.update as jest.Mock).mockResolvedValue({ ...mockAnnouncement, view_count: 1 });
            const result = await AnnouncementService.trackView('ann-123');
            expect(result.success).toBe(true);
        });
    });

    describe('getPinnedAnnouncements', () => {
        it('should return pinned announcements', async () => {
            (prisma.classAnnouncement.findMany as jest.Mock).mockResolvedValue([{ ...mockAnnouncement, is_pinned: true }]);
            const result = await AnnouncementService.getPinnedAnnouncements('c-123');
            expect(result.success).toBe(true);
        });
    });

    describe('getAnnouncementStats', () => {
        it('should return statistics', async () => {
            (prisma.classAnnouncement.count as jest.Mock).mockResolvedValue(10);
            const result = await AnnouncementService.getAnnouncementStats('c-123');
            expect(result.success).toBe(true);
            expect(result.data!.totalAnnouncements).toBe(10);
        });
    });

    describe('searchAnnouncements', () => {
        it('should search announcements', async () => {
            (prisma.classAnnouncement.findMany as jest.Mock).mockResolvedValue([mockAnnouncement]);
            const result = await AnnouncementService.searchAnnouncements('c-123', 'test');
            expect(result.success).toBe(true);
        });
    });
});
