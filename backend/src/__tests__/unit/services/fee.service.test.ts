import { FeeService } from '../../../services/fee.service';
import { prisma } from '../../../lib/db';
import { Decimal } from '@prisma/client/runtime/library';

// Mock Prisma client
jest.mock('../../../lib/db', () => ({
    prisma: {
        fee: {
            findMany: jest.fn(),
            create: jest.fn(),
            count: jest.fn(),
        },
        student: {
            findUnique: jest.fn(),
        },
        feePayment: {
            create: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
            aggregate: jest.fn(),
            groupBy: jest.fn(),
        },
        scholarship: {
            findMany: jest.fn(),
        },
    },
}));

describe('FeeService Unit Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getFeeStructure', () => {
        it('should return fee structures with pagination', async () => {
            // Arrange
            const mockFees = [
                {
                    id: 'fee-1',
                    branch_id: 'branch-123',
                    fee_name: 'Tuition Fee',
                    fee_type: 'Tuition',
                    amount: new Decimal(5000),
                    due_date: new Date(),
                },
            ];
            (prisma.fee.findMany as jest.Mock).mockResolvedValue(mockFees);
            (prisma.fee.count as jest.Mock).mockResolvedValue(1);

            // Act
            const result = await FeeService.getFeeStructure('branch-123', 20, 0);

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockFees);
            expect(result.pagination).toEqual({
                limit: 20,
                offset: 0,
                total: 1,
                pages: 1,
            });
        });

        it('should enforce branch_id for non-SuperAdmin users', async () => {
            // Arrange
            const userContext = {
                role: { name: 'Admin' },
                branch_id: 'user-branch-123',
            };
            (prisma.fee.findMany as jest.Mock).mockResolvedValue([]);
            (prisma.fee.count as jest.Mock).mockResolvedValue(0);

            // Act
            await FeeService.getFeeStructure('different-branch', 20, 0, userContext);

            // Assert
            expect(prisma.fee.findMany).toHaveBeenCalledWith({
                where: { branch_id: 'user-branch-123' },
                orderBy: { created_at: 'desc' },
                take: 20,
                skip: 0,
            });
        });
    });

    describe('createFee', () => {
        it('should create fee structure successfully', async () => {
            // Arrange
            const feeData = {
                branch_id: 'branch-123',
                name: 'Library Fee',
                type: 'Library',
                amount: 1000,
                due_date: '2024-12-31',
            };
            const mockFee = {
                id: 'fee-123',
                branch_id: 'branch-123',
                fee_name: 'Library Fee',
                fee_type: 'Library',
                amount: new Decimal(1000),
                due_date: new Date('2024-12-31'),
            };
            (prisma.fee.create as jest.Mock).mockResolvedValue(mockFee);

            // Act
            const result = await FeeService.createFee(feeData);

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockFee);
        });

        it('should require branch_id', async () => {
            // Act
            const result = await FeeService.createFee({
                name: 'Test Fee',
                amount: 1000,
            });

            // Assert
            expect(result.success).toBe(false);
            // The error message comes from the catch block when branch_id is undefined
            expect(result.message).toContain('Failed to create fee structure');
        });

        it('should enforce branch_id for non-SuperAdmin users', async () => {
            // Arrange
            const userContext = {
                role: { name: 'Admin' },
                branch_id: 'user-branch-123',
            };
            const feeData = {
                branch_id: 'different-branch',
                name: 'Fee',
                amount: 1000,
                due_date: '2024-12-31',
            };
            (prisma.fee.create as jest.Mock).mockResolvedValue({});

            // Act
            await FeeService.createFee(feeData, userContext);

            // Assert
            expect(prisma.fee.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    branch_id: 'user-branch-123',
                }),
            });
        });
    });

    describe('calculateFee', () => {
        it('should calculate fee with breakdown', async () => {
            // Arrange
            const mockStudent = {
                id: 'student-123',
                branch_id: 'branch-123',
                enrollments: [],
            };
            const mockFees = [
                {
                    id: 'fee-1',
                    fee_type: 'Tuition',
                    fee_name: 'Tuition Fee',
                    amount: new Decimal(5000),
                    due_date: new Date(),
                },
                {
                    id: 'fee-2',
                    fee_type: 'Library',
                    fee_name: 'Library Fee',
                    amount: new Decimal(500),
                    due_date: new Date(),
                },
            ];
            (prisma.student.findUnique as jest.Mock).mockResolvedValue(mockStudent);
            (prisma.fee.findMany as jest.Mock).mockResolvedValue(mockFees);
            (prisma.scholarship.findMany as jest.Mock).mockResolvedValue([]);

            // Act
            const result = await FeeService.calculateFee('student-123');

            // Assert
            expect(result.success).toBe(true);
            expect(result.data!.grossFee).toBe(5500);
            expect(result.data!.scholarshipDiscount).toBe(0);
            expect(result.data!.netFee).toBe(5500);
            expect(result.data!.breakdown.length).toBe(2);
        });

        it('should apply scholarship discount (percentage)', async () => {
            // Arrange
            const mockStudent = {
                id: 'student-123',
                branch_id: 'branch-123',
                enrollments: [],
            };
            const mockFees = [
                {
                    id: 'fee-1',
                    fee_type: 'Tuition',
                    fee_name: 'Tuition Fee',
                    amount: new Decimal(1000),
                    due_date: new Date(),
                },
            ];
            const mockScholarships = [
                {
                    id: 'scholarship-1',
                    student_id: 'student-123',
                    percentage: new Decimal(20), // 20% discount
                    amount: new Decimal(0),
                    status: 'active',
                },
            ];
            (prisma.student.findUnique as jest.Mock).mockResolvedValue(mockStudent);
            (prisma.fee.findMany as jest.Mock).mockResolvedValue(mockFees);
            (prisma.scholarship.findMany as jest.Mock).mockResolvedValue(mockScholarships);

            // Act
            const result = await FeeService.calculateFee('student-123');

            // Assert
            expect(result.success).toBe(true);
            expect(result.data!.grossFee).toBe(1000);
            expect(result.data!.scholarshipDiscount).toBe(200); // 20% of 1000
            expect(result.data!.netFee).toBe(800);
        });

        it('should return error when student not found', async () => {
            // Arrange
            (prisma.student.findUnique as jest.Mock).mockResolvedValue(null);

            // Act
            const result = await FeeService.calculateFee('nonexistent-id');

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toBe('Student not found');
        });
    });

    describe('processFeePayment', () => {
        it('should process payment successfully', async () => {
            // Arrange
            const mockPayment = {
                id: 'payment-123',
                student_id: 'student-123',
                fee_id: 'fee-123',
                amount_paid: new Decimal(1000),
                payment_date: new Date(),
                payment_method: 'Cash',
                receipt_number: 'RCP-123',
                status: 'completed',
            };
            (prisma.feePayment.create as jest.Mock).mockResolvedValue(mockPayment);

            // Act
            const result = await FeeService.processFeePayment(
                'student-123',
                'fee-123',
                1000,
                'Cash',
                'admin-123',
                'TXN-123'
            );

            // Assert
            expect(result.success).toBe(true);
            expect(result.data!.amount_paid.toNumber()).toBe(1000);
            expect(result.data!.payment_method).toBe('Cash');
            expect(result.data!.status).toBe('completed');
        });
    });

    describe('getOutstandingFees', () => {
        it('should calculate outstanding fees', async () => {
            // Arrange
            const mockStudent = { id: 'student-123', branch_id: 'branch-123' };
            const mockFees = [
                {
                    id: 'fee-1',
                    fee_type: 'Tuition',
                    fee_name: 'Tuition Fee',
                    amount: new Decimal(5000),
                    due_date: new Date(),
                },
            ];
            const mockPaidAmount = {
                _sum: { amount_paid: new Decimal(2000) },
            };
            (prisma.student.findUnique as jest.Mock).mockResolvedValue(mockStudent);
            (prisma.fee.findMany as jest.Mock).mockResolvedValue(mockFees);
            (prisma.feePayment.aggregate as jest.Mock).mockResolvedValue(mockPaidAmount);

            // Act
            const result = await FeeService.getOutstandingFees('student-123');

            // Assert
            expect(result.success).toBe(true);
            expect(result.data!.totalOutstanding).toBe(3000); // 5000 - 2000
            expect(result.data!.feeDetails.length).toBe(1);
            expect(result.data!.feeDetails[0].dueAmount).toBe(3000);
        });

        it('should exclude fully paid fees', async () => {
            // Arrange
            const mockStudent = { id: 'student-123', branch_id: 'branch-123' };
            const mockFees = [
                {
                    id: 'fee-1',
                    fee_type: 'Tuition',
                    fee_name: 'Tuition Fee',
                    amount: new Decimal(5000),
                    due_date: new Date(),
                },
            ];
            const mockPaidAmount = {
                _sum: { amount_paid: new Decimal(5000) }, // Fully paid
            };
            (prisma.student.findUnique as jest.Mock).mockResolvedValue(mockStudent);
            (prisma.fee.findMany as jest.Mock).mockResolvedValue(mockFees);
            (prisma.feePayment.aggregate as jest.Mock).mockResolvedValue(mockPaidAmount);

            // Act
            const result = await FeeService.getOutstandingFees('student-123');

            // Assert
            expect(result.success).toBe(true);
            expect(result.data!.totalOutstanding).toBe(0);
            expect(result.data!.feeDetails.length).toBe(0);
        });
    });

    describe('getFeeStatistics', () => {
        it('should return fee statistics', async () => {
            // Arrange
            (prisma.fee.count as jest.Mock).mockResolvedValue(10);
            (prisma.feePayment.aggregate as jest.Mock).mockResolvedValue({
                _sum: { amount_paid: new Decimal(50000) },
            });
            (prisma.feePayment.groupBy as jest.Mock).mockResolvedValue([
                {
                    payment_method: 'Cash',
                    _sum: { amount_paid: new Decimal(30000) },
                    _count: 15,
                },
                {
                    payment_method: 'Bank',
                    _sum: { amount_paid: new Decimal(20000) },
                    _count: 10,
                },
            ]);

            // Act
            const result = await FeeService.getFeeStatistics('branch-123');

            // Assert
            expect(result.success).toBe(true);
            expect(result.data!.totalFeeStructures).toBe(10);
            expect(result.data!.totalCollected).toBeDefined();
            expect(result.data!.byPaymentMethod.length).toBe(2);
        });
    });
});
