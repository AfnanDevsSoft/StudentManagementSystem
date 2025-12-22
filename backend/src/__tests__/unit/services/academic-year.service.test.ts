import { AcademicYearService } from '../../../services/academic-year.service';
import { prisma } from '../../../lib/db';

// Mock Prisma client
jest.mock('../../../lib/db', () => ({
    prisma: {
        academicYear: {
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

describe('AcademicYearService Unit Tests', () => {
    const mockAcademicYear = {
        id: 'year-123',
        name: '2024-2025',
        branch_id: 'branch-123',
        start_date: new Date('2024-04-01'),
        end_date: new Date('2025-03-31'),
        is_current: true,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAll', () => {
        it('should return all academic years for a branch', async () => {
            // Arrange
            (prisma.academicYear.findMany as jest.Mock).mockResolvedValue([mockAcademicYear]);

            // Act
            const result = await AcademicYearService.getAll('branch-123');

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toEqual([mockAcademicYear]);
            expect(prisma.academicYear.findMany).toHaveBeenCalledWith({
                where: { branch_id: 'branch-123' },
                orderBy: { start_date: 'desc' },
            });
        });

        it('should handle errors gracefully', async () => {
            // Arrange
            (prisma.academicYear.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

            // Act
            const result = await AcademicYearService.getAll('branch-123');

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toBe('DB Error');
        });
    });

    describe('create', () => {
        it('should create academic year successfully', async () => {
            // Arrange
            const yearData = {
                name: '2025-2026',
                branch_id: 'branch-123',
                start_date: '2025-04-01',
                end_date: '2026-03-31',
            };
            (prisma.academicYear.create as jest.Mock).mockResolvedValue(mockAcademicYear);

            // Act
            const result = await AcademicYearService.create(yearData);

            // Assert
            expect(result.success).toBe(true);
            expect(result.message).toContain('created successfully');
        });

        it('should handle creation errors', async () => {
            // Arrange
            (prisma.academicYear.create as jest.Mock).mockRejectedValue(new Error('Duplicate entry'));

            // Act
            const result = await AcademicYearService.create({
                name: 'Test',
                branch_id: 'branch-123',
                start_date: '2024-01-01',
                end_date: '2024-12-31',
            });

            // Assert
            expect(result.success).toBe(false);
        });
    });

    describe('update', () => {
        it('should update academic year successfully', async () => {
            // Arrange
            (prisma.academicYear.update as jest.Mock).mockResolvedValue({
                ...mockAcademicYear,
                name: 'Updated Year',
            });

            // Act
            const result = await AcademicYearService.update('year-123', { name: 'Updated Year' });

            // Assert
            expect(result.success).toBe(true);
            expect(result.message).toContain('updated successfully');
        });

        it('should handle update errors', async () => {
            // Arrange
            (prisma.academicYear.update as jest.Mock).mockRejectedValue(new Error('Not found'));

            // Act
            const result = await AcademicYearService.update('nonexistent', { name: 'Test' });

            // Assert
            expect(result.success).toBe(false);
        });
    });

    describe('delete', () => {
        it('should delete academic year successfully', async () => {
            // Arrange
            (prisma.academicYear.delete as jest.Mock).mockResolvedValue(mockAcademicYear);

            // Act
            const result = await AcademicYearService.delete('year-123');

            // Assert
            expect(result.success).toBe(true);
            expect(result.message).toContain('deleted successfully');
        });

        it('should handle delete errors', async () => {
            // Arrange
            (prisma.academicYear.delete as jest.Mock).mockRejectedValue(new Error('Foreign key constraint'));

            // Act
            const result = await AcademicYearService.delete('year-123');

            // Assert
            expect(result.success).toBe(false);
        });
    });
});
