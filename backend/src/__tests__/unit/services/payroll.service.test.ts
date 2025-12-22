import { PayrollService } from '../../../services/payroll.service';
import { prisma } from '../../../lib/db';

jest.mock('../../../lib/db', () => ({
    prisma: {
        payrollRecord: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() },
        teacher: { findUnique: jest.fn() },
    },
}));

describe('PayrollService Unit Tests', () => {
    const mockPayroll = { id: 'pay-123', teacher_id: 't-123', month: 12, year: 2024, base_salary: 5000, status: 'draft' };
    const mockTeacher = { id: 't-123', branch_id: 'b-123', first_name: 'John', last_name: 'Doe' };

    beforeEach(() => { jest.clearAllMocks(); });

    describe('getSalaries', () => {
        it('should return salaries with pagination', async () => {
            (prisma.payrollRecord.findMany as jest.Mock).mockResolvedValue([mockPayroll]);
            (prisma.payrollRecord.count as jest.Mock).mockResolvedValue(1);
            const result = await PayrollService.getSalaries('b-123', 12, 2024);
            expect(result.success).toBe(true);
            expect(result.pagination).toBeDefined();
        });
    });

    describe('calculateSalary', () => {
        it('should calculate salary with allowances and deductions', async () => {
            (prisma.teacher.findUnique as jest.Mock).mockResolvedValue(mockTeacher);
            const result = await PayrollService.calculateSalary('t-123', 12, 2024, 5000);
            expect(result.success).toBe(true);
            expect(result.data!.grossSalary).toBeGreaterThan(5000);
        });

        it('should return error for non-existent teacher', async () => {
            (prisma.teacher.findUnique as jest.Mock).mockResolvedValue(null);
            const result = await PayrollService.calculateSalary('nonexistent', 12, 2024, 5000);
            expect(result.success).toBe(false);
            expect(result.message).toContain('not found');
        });
    });

    describe('processSalary', () => {
        it('should process and create payroll record', async () => {
            (prisma.payrollRecord.findUnique as jest.Mock).mockResolvedValue(null);
            (prisma.teacher.findUnique as jest.Mock).mockResolvedValue(mockTeacher);
            (prisma.payrollRecord.create as jest.Mock).mockResolvedValue(mockPayroll);
            const result = await PayrollService.processSalary('t-123', 'b-123', 12, 2024, 5000);
            expect(result.success).toBe(true);
            expect(result.message).toContain('processed successfully');
        });

        it('should reject if already processed', async () => {
            (prisma.payrollRecord.findUnique as jest.Mock).mockResolvedValue(mockPayroll);
            const result = await PayrollService.processSalary('t-123', 'b-123', 12, 2024, 5000);
            expect(result.success).toBe(false);
            expect(result.message).toContain('already processed');
        });
    });

    describe('approveSalary', () => {
        it('should approve payroll record', async () => {
            (prisma.payrollRecord.update as jest.Mock).mockResolvedValue({ ...mockPayroll, status: 'approved' });
            const result = await PayrollService.approveSalary('pay-123', 'admin-1');
            expect(result.success).toBe(true);
        });
    });

    describe('markAsPaid', () => {
        it('should mark payroll as paid', async () => {
            (prisma.payrollRecord.update as jest.Mock).mockResolvedValue({ ...mockPayroll, status: 'paid' });
            const result = await PayrollService.markAsPaid('pay-123');
            expect(result.success).toBe(true);
        });
    });
});
