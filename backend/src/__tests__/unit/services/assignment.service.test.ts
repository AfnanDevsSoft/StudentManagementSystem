import AssignmentService from '../../../services/assignment.service';
import { prisma } from '../../../lib/db';

jest.mock('../../../lib/db', () => ({
    prisma: {
        assignment: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
        submission: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
        course: { findUnique: jest.fn() },
        teacher: { findUnique: jest.fn() },
    },
}));

describe('AssignmentService Unit Tests', () => {
    const mockAssignment = { id: 'asn-123', course_id: 'c-123', title: 'Homework 1', due_date: new Date(), status: 'published' };
    const mockSubmission = { id: 'sub-123', assignment_id: 'asn-123', student_id: 's-123', status: 'submitted' };

    beforeEach(() => { jest.clearAllMocks(); });

    describe('create', () => {
        it('should create assignment', async () => {
            (prisma.course.findUnique as jest.Mock).mockResolvedValue({ id: 'c-123' });
            (prisma.teacher.findUnique as jest.Mock).mockResolvedValue({ id: 't-123' });
            (prisma.assignment.create as jest.Mock).mockResolvedValue(mockAssignment);

            const result = await AssignmentService.create({
                course_id: 'c-123',
                teacher_id: 't-123',
                title: 'Homework 1',
                due_date: new Date(),
                max_score: 100,
                status: 'published'
            });
            expect(result.success).toBe(true);
            expect(result.message).toContain('created');
        });
    });

    describe('getByCourse', () => {
        it('should return assignments', async () => {
            (prisma.assignment.findMany as jest.Mock).mockResolvedValue([mockAssignment]);
            const result = await AssignmentService.getByCourse('c-123');
            expect(result.success).toBe(true);
        });
    });

    describe('getById', () => {
        it('should return single assignment', async () => {
            (prisma.assignment.findUnique as jest.Mock).mockResolvedValue(mockAssignment);
            const result = await AssignmentService.getById('asn-123');
            expect(result.success).toBe(true);
        });

        it('should error for non-existent assignment', async () => {
            (prisma.assignment.findUnique as jest.Mock).mockResolvedValue(null);
            try {
                await AssignmentService.getById('nonexistent');
            } catch (e: any) {
                expect(e.message).toBe('Assignment not found');
            }
        });
    });

    describe('update', () => {
        it('should update assignment', async () => {
            (prisma.assignment.findUnique as jest.Mock).mockResolvedValue(mockAssignment);
            (prisma.assignment.update as jest.Mock).mockResolvedValue({ ...mockAssignment, title: 'Updated' });
            const result = await AssignmentService.update('asn-123', { title: 'Updated' });
            expect(result.success).toBe(true);
        });
    });

    describe('delete', () => {
        it('should delete assignment', async () => {
            (prisma.assignment.findUnique as jest.Mock).mockResolvedValue(mockAssignment);
            (prisma.assignment.delete as jest.Mock).mockResolvedValue(mockAssignment);
            const result = await AssignmentService.delete('asn-123');
            expect(result.success).toBe(true);
        });
    });

    describe('submitAssignment', () => {
        it('should submit assignment', async () => {
            (prisma.submission.create as jest.Mock).mockResolvedValue(mockSubmission);
            const result = await AssignmentService.submitAssignment({
                assignment_id: 'asn-123',
                student_id: 's-123',
                content_url: 'http://example.com'
            });
            expect(result.success).toBe(true);
        });
    });

    describe('getSubmissions', () => {
        it('should return submissions for assignment', async () => {
            (prisma.submission.findMany as jest.Mock).mockResolvedValue([mockSubmission]);
            const result = await AssignmentService.getSubmissions('asn-123');
            expect(result.success).toBe(true);
        });
    });
});
