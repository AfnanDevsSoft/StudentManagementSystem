import { SubjectService } from '../../../services/subject.service';
import { prisma } from '../../../lib/db';

jest.mock('../../../lib/db', () => ({
    prisma: {
        subject: {
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

describe('SubjectService Unit Tests', () => {
    const mockSubject = { id: 'sub-123', name: 'Mathematics', code: 'MATH', branch_id: 'branch-123', is_active: true };

    beforeEach(() => { jest.clearAllMocks(); });

    describe('getAll', () => {
        it('should return all subjects for branch', async () => {
            (prisma.subject.findMany as jest.Mock).mockResolvedValue([mockSubject]);
            const result = await SubjectService.getAll('branch-123');
            expect(result.success).toBe(true);
            expect(result.data).toEqual([mockSubject]);
        });
    });

    describe('create', () => {
        it('should create subject successfully', async () => {
            (prisma.subject.create as jest.Mock).mockResolvedValue(mockSubject);
            const result = await SubjectService.create({ name: 'Math', branch_id: 'branch-123' });
            expect(result.success).toBe(true);
            expect(result.message).toContain('created successfully');
        });
    });

    describe('update', () => {
        it('should update subject successfully', async () => {
            (prisma.subject.update as jest.Mock).mockResolvedValue({ ...mockSubject, name: 'Updated' });
            const result = await SubjectService.update('sub-123', { name: 'Updated' });
            expect(result.success).toBe(true);
        });
    });

    describe('delete', () => {
        it('should delete subject successfully', async () => {
            (prisma.subject.delete as jest.Mock).mockResolvedValue(mockSubject);
            const result = await SubjectService.delete('sub-123');
            expect(result.success).toBe(true);
        });
    });
});
