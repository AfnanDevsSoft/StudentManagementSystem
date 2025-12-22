import { AdmissionService } from '../../../services/admission.service';
import { prisma } from '../../../lib/db';

jest.mock('../../../lib/db', () => ({
    prisma: {
        admissionApplication: {
            create: jest.fn(),
            update: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            count: jest.fn(),
        },
    },
}));

describe('AdmissionService Unit Tests', () => {
    const mockApplication = {
        id: 'app-123',
        branch_id: 'b-123',
        application_number: 'ADM-12345',
        applicant_email: 'test@example.com',
        applicant_phone: '+1234567890',
        applicant_data: { first_name: 'John', last_name: 'Doe' },
        status: 'submitted',
        payment_status: 'pending',
    };

    beforeEach(() => { jest.clearAllMocks(); });

    describe('submitApplication', () => {
        it('should submit application successfully', async () => {
            (prisma.admissionApplication.create as jest.Mock).mockResolvedValue(mockApplication);

            const result = await AdmissionService.submitApplication(
                'b-123', { first_name: 'John' }, 'test@example.com', '+1234567890'
            );

            expect(result.success).toBe(true);
            expect(result.message).toContain('submitted successfully');
        });
    });

    describe('approveApplication', () => {
        it('should approve application', async () => {
            (prisma.admissionApplication.update as jest.Mock).mockResolvedValue({ ...mockApplication, status: 'approved' });

            const result = await AdmissionService.approveApplication('app-123', 'admin-1', 'Good candidate');

            expect(result.success).toBe(true);
            expect(result.message).toContain('approved');
        });
    });

    describe('rejectApplication', () => {
        it('should reject application', async () => {
            (prisma.admissionApplication.update as jest.Mock).mockResolvedValue({ ...mockApplication, status: 'rejected' });

            const result = await AdmissionService.rejectApplication('app-123', 'admin-1', 'Incomplete documents');

            expect(result.success).toBe(true);
            expect(result.message).toContain('rejected');
        });
    });

    describe('getApplications', () => {
        it('should return paginated applications', async () => {
            (prisma.admissionApplication.findMany as jest.Mock).mockResolvedValue([mockApplication]);
            (prisma.admissionApplication.count as jest.Mock).mockResolvedValue(1);

            const result = await AdmissionService.getApplications('b-123');

            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(1);
            expect(result.pagination).toBeDefined();
        });

        it('should filter by status', async () => {
            (prisma.admissionApplication.findMany as jest.Mock).mockResolvedValue([mockApplication]);
            (prisma.admissionApplication.count as jest.Mock).mockResolvedValue(1);

            await AdmissionService.getApplications('b-123', 'submitted');

            expect(prisma.admissionApplication.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ where: expect.objectContaining({ status: 'submitted' }) })
            );
        });
    });

    describe('getApplicationDetails', () => {
        it('should return application details', async () => {
            (prisma.admissionApplication.findUnique as jest.Mock).mockResolvedValue(mockApplication);

            const result = await AdmissionService.getApplicationDetails('app-123');

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
        });

        it('should return error for non-existent application', async () => {
            (prisma.admissionApplication.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await AdmissionService.getApplicationDetails('nonexistent');

            expect(result.success).toBe(false);
            expect(result.message).toContain('not found');
        });
    });

    describe('getAdmissionStats', () => {
        it('should return admission statistics', async () => {
            (prisma.admissionApplication.count as jest.Mock)
                .mockResolvedValueOnce(100) // total
                .mockResolvedValueOnce(50)  // submitted
                .mockResolvedValueOnce(30)  // approved
                .mockResolvedValueOnce(15)  // rejected
                .mockResolvedValueOnce(20); // paymentPending

            const result = await AdmissionService.getAdmissionStats('b-123');

            expect(result.success).toBe(true);
            expect(result.data!.total).toBe(100);
            expect(result.data!.approved).toBe(30);
        });
    });

    describe('updatePaymentStatus', () => {
        it('should update payment status', async () => {
            (prisma.admissionApplication.update as jest.Mock).mockResolvedValue({
                ...mockApplication, payment_status: 'completed'
            });

            const result = await AdmissionService.updatePaymentStatus('app-123', 'completed');

            expect(result.success).toBe(true);
        });
    });
});
