import { CourseContentService } from '../../../services/courseContent.service';
import { prisma } from '../../../lib/db';

jest.mock('../../../lib/db', () => ({
    prisma: {
        courseContent: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
    },
}));
jest.mock('fs');

describe('CourseContentService Unit Tests', () => {
    const mockContent = { id: 'cc-123', course_id: 'c-123', title: 'Lesson 1', content_type: 'video', is_published: true };

    beforeEach(() => { jest.clearAllMocks(); });

    describe('getContent', () => {
        it('should return content with pagination', async () => {
            (prisma.courseContent.findMany as jest.Mock).mockResolvedValue([mockContent]);
            (prisma.courseContent.count as jest.Mock).mockResolvedValue(1);
            const result = await CourseContentService.getContent('c-123');
            expect(result.success).toBe(true);
            expect(result.pagination).toBeDefined();
        });
    });

    describe('getPublishedContent', () => {
        it('should return only published content', async () => {
            (prisma.courseContent.findMany as jest.Mock).mockResolvedValue([mockContent]);
            const result = await CourseContentService.getPublishedContent('c-123');
            expect(result.success).toBe(true);
        });
    });

    describe('updateContent', () => {
        it('should update content', async () => {
            (prisma.courseContent.update as jest.Mock).mockResolvedValue({ ...mockContent, title: 'Updated' });
            const result = await CourseContentService.updateContent('cc-123', { title: 'Updated' });
            expect(result.success).toBe(true);
        });
    });

    describe('trackView', () => {
        it('should increment view count', async () => {
            (prisma.courseContent.update as jest.Mock).mockResolvedValue({ ...mockContent, view_count: 1 });
            const result = await CourseContentService.trackView('cc-123');
            expect(result.success).toBe(true);
        });
    });

    describe('pinContent', () => {
        it('should pin content', async () => {
            (prisma.courseContent.update as jest.Mock).mockResolvedValue({ ...mockContent, is_pinned: true });
            const result = await CourseContentService.pinContent('cc-123', true);
            expect(result.success).toBe(true);
            expect(result.message).toContain('pinned');
        });
    });

    describe('getContentByType', () => {
        it('should return content by type', async () => {
            (prisma.courseContent.findMany as jest.Mock).mockResolvedValue([mockContent]);
            const result = await CourseContentService.getContentByType('c-123', 'video');
            expect(result.success).toBe(true);
        });
    });

    describe('getPopularContent', () => {
        it('should return popular content by views', async () => {
            (prisma.courseContent.findMany as jest.Mock).mockResolvedValue([mockContent]);
            const result = await CourseContentService.getPopularContent('c-123');
            expect(result.success).toBe(true);
        });
    });
});
