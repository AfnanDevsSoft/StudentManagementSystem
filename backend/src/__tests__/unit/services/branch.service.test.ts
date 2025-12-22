import { BranchService } from '../../../services/branch.service';
import { prisma } from '../../../lib/db';

// Mock Prisma client
jest.mock('../../../lib/db', () => ({
    prisma: {
        branch: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        user: {
            count: jest.fn(),
        },
        student: {
            count: jest.fn(),
        },
        teacher: {
            count: jest.fn(),
        },
    },
}));

describe('BranchService Unit Tests', () => {
    const mockBranch = {
        id: 'branch-123',
        name: 'Main Campus',
        code: 'MAIN',
        address: '123 Main St',
        phone: '+1234567890',
        email: 'main@school.com',
        is_active: true,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllBranches', () => {
        it('should return paginated branches', async () => {
            // Arrange
            (prisma.branch.findMany as jest.Mock).mockResolvedValue([mockBranch]);
            (prisma.branch.count as jest.Mock).mockResolvedValue(1);

            // Act
            const result = await BranchService.getAllBranches(1, 10);

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toEqual([mockBranch]);
            expect(result.pagination).toEqual({
                page: 1,
                limit: 10,
                total: 1,
                pages: 1,
            });
        });

        it('should filter by search query', async () => {
            // Arrange
            (prisma.branch.findMany as jest.Mock).mockResolvedValue([mockBranch]);
            (prisma.branch.count as jest.Mock).mockResolvedValue(1);

            // Act
            await BranchService.getAllBranches(1, 10, 'Main');

            // Assert
            expect(prisma.branch.findMany).toHaveBeenCalledWith({
                where: {
                    OR: expect.arrayContaining([
                        expect.objectContaining({ name: expect.any(Object) }),
                        expect.objectContaining({ code: expect.any(Object) }),
                        expect.objectContaining({ city: expect.any(Object) }),
                    ]),
                },
                skip: 0,
                take: 10,
                orderBy: { created_at: 'desc' },
            });
        });
    });

    describe('getBranchById', () => {
        it('should return branch by ID', async () => {
            // Arrange
            (prisma.branch.findUnique as jest.Mock).mockResolvedValue(mockBranch);

            // Act
            const result = await BranchService.getBranchById('branch-123');

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockBranch);
        });

        it('should return error when branch not found', async () => {
            // Arrange
            (prisma.branch.findUnique as jest.Mock).mockResolvedValue(null);

            // Act
            const result = await BranchService.getBranchById('nonexistent-id');

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toBe('Branch not found');
        });
    });

    describe('createBranch', () => {
        it('should create branch successfully', async () => {
            // Arrange
            const branchData = {
                name: 'New Branch',
                code: 'NEW',
                address: '456 New St',
                phone: '+1234567891',
                email: 'new@school.com',
            };
            (prisma.branch.create as jest.Mock).mockResolvedValue(mockBranch);

            // Act
            const result = await BranchService.createBranch(branchData);

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockBranch);
        });

        it('should validate required fields', async () => {
            // Act
            const result = await BranchService.createBranch({
                name: 'Test',
                // Missing required fields
            });

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toContain('required');
        });
    });

    describe('updateBranch', () => {
        it('should update branch successfully', async () => {
            // Arrange
            (prisma.branch.update as jest.Mock).mockResolvedValue({
                ...mockBranch,
                name: 'Updated Branch',
            });

            // Act
            const result = await BranchService.updateBranch('branch-123', {
                name: 'Updated Branch',
            });

            // Assert
            expect(result.success).toBe(true);
            expect(result.data!.name).toBe('Updated Branch');
        });
    });

    describe('deleteBranch', () => {
        it('should delete branch', async () => {
            // Arrange
            (prisma.branch.delete as jest.Mock).mockResolvedValue(mockBranch);

            // Act
            const result = await BranchService.deleteBranch('branch-123');

            // Assert
            expect(result.success).toBe(true);
            expect(prisma.branch.delete).toHaveBeenCalledWith({
                where: { id: 'branch-123' },
            });
        });
    });
});
