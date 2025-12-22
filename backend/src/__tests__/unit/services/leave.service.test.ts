import { LeaveService } from '../../../services/leave.service';
import { prisma } from '../../../lib/db';

jest.mock('../../../lib/db', () => ({
    prisma: {
        leaveRequest: { create: jest.fn(), update: jest.fn(), findMany: jest.fn(), count: jest.fn(), groupBy: jest.fn() },
    },
}));

describe('LeaveService Unit Tests', () => {
    const mockLeave = { id: 'leave-123', teacher_id: 't-123', leave_type: 'annual', days_count: 5, status: 'pending' };

    beforeEach(() => { jest.clearAllMocks(); });

    describe('requestLeave', () => {
        it('should create leave request successfully', async () => {
            (prisma.leaveRequest.create as jest.Mock).mockResolvedValue(mockLeave);
            const result = await LeaveService.requestLeave('t-123', 'annual', new Date(), new Date(), 'Vacation');
            expect(result.success).toBe(true);
            expect(result.message).toContain('submitted successfully');
        });

        it('should reject if end date before start date', async () => {
            const endDate = new Date('2024-01-01');
            const startDate = new Date('2024-01-10');
            const result = await LeaveService.requestLeave('t-123', 'annual', startDate, endDate, 'Test');
            expect(result.success).toBe(false);
            expect(result.message).toContain('End date cannot be before');
        });
    });

    describe('approveLeave', () => {
        it('should approve leave request', async () => {
            (prisma.leaveRequest.update as jest.Mock).mockResolvedValue({ ...mockLeave, status: 'approved' });
            const result = await LeaveService.approveLeave('leave-123', 'admin-1');
            expect(result.success).toBe(true);
        });
    });

    describe('rejectLeave', () => {
        it('should reject leave with reason', async () => {
            (prisma.leaveRequest.update as jest.Mock).mockResolvedValue({ ...mockLeave, status: 'rejected' });
            const result = await LeaveService.rejectLeave('leave-123', 'admin-1', 'Not enough coverage');
            expect(result.success).toBe(true);
            expect(result.message).toContain('rejected');
        });
    });

    describe('getLeaveBalance', () => {
        it('should calculate remaining leaves', async () => {
            (prisma.leaveRequest.findMany as jest.Mock).mockResolvedValue([{ ...mockLeave, leave_type: 'annual', days_count: 5 }]);
            const result = await LeaveService.getLeaveBalance('t-123', 2024);
            expect(result.success).toBe(true);
            expect(result.data!.remaining.annual).toBe(15); // 20 - 5
        });
    });

    describe('getLeaveHistory', () => {
        it('should return paginated leave history', async () => {
            (prisma.leaveRequest.findMany as jest.Mock).mockResolvedValue([mockLeave]);
            (prisma.leaveRequest.count as jest.Mock).mockResolvedValue(1);
            const result = await LeaveService.getLeaveHistory('t-123');
            expect(result.success).toBe(true);
            expect(result.pagination).toBeDefined();
        });
    });

    describe('getPendingLeaves', () => {
        it('should return pending leaves for admin', async () => {
            (prisma.leaveRequest.findMany as jest.Mock).mockResolvedValue([mockLeave]);
            (prisma.leaveRequest.count as jest.Mock).mockResolvedValue(1);
            const result = await LeaveService.getPendingLeaves();
            expect(result.success).toBe(true);
        });
    });

    describe('getLeaveStatistics', () => {
        it('should return leave statistics', async () => {
            (prisma.leaveRequest.count as jest.Mock).mockResolvedValue(10);
            (prisma.leaveRequest.groupBy as jest.Mock).mockResolvedValue([]);
            const result = await LeaveService.getLeaveStatistics(2024);
            expect(result.success).toBe(true);
            expect(result.data!.total).toBe(10);
        });
    });
});
