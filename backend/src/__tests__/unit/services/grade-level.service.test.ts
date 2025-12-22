import { GradeLevelService } from '../../../services/grade-level.service';
import { prisma } from '../../../lib/db';

jest.mock('../../../lib/db', () => ({
    prisma: {
        gradeLevel: {
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

describe('GradeLevelService Unit Tests', () => {
    const mockGradeLevel = { id: 'gl-123', name: 'Grade 10', branch_id: 'branch-123', sort_order: 10, is_active: true };

    beforeEach(() => { jest.clearAllMocks(); });

    describe('getAll', () => {
        it('should return all grade levels for branch', async () => {
            (prisma.gradeLevel.findMany as jest.Mock).mockResolvedValue([mockGradeLevel]);
            const result = await GradeLevelService.getAll('branch-123');
            expect(result.success).toBe(true);
            expect(result.data).toEqual([mockGradeLevel]);
        });
    });

    describe('create', () => {
        it('should create grade level successfully', async () => {
            (prisma.gradeLevel.create as jest.Mock).mockResolvedValue(mockGradeLevel);
            const result = await GradeLevelService.create({ name: 'Grade 10', branch_id: 'branch-123' });
            expect(result.success).toBe(true);
            expect(result.message).toContain('created successfully');
        });
    });

    describe('update', () => {
        it('should update grade level successfully', async () => {
            (prisma.gradeLevel.update as jest.Mock).mockResolvedValue({ ...mockGradeLevel, name: 'Grade 11' });
            const result = await GradeLevelService.update('gl-123', { name: 'Grade 11' });
            expect(result.success).toBe(true);
        });
    });

    describe('delete', () => {
        it('should delete grade level successfully', async () => {
            (prisma.gradeLevel.delete as jest.Mock).mockResolvedValue(mockGradeLevel);
            const result = await GradeLevelService.delete('gl-123');
            expect(result.success).toBe(true);
        });
    });
});
