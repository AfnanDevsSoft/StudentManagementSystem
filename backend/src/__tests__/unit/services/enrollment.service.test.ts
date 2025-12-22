import { EnrollmentService } from '../../../services/enrollment.service';
import { prisma } from '../../../lib/db';

jest.mock('../../../lib/db', () => ({
    prisma: {
        studentEnrollment: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        attendance: {
            upsert: jest.fn(),
        },
        grade: {
            create: jest.fn(),
        },
    },
}));

describe('EnrollmentService Unit Tests', () => {
    const mockEnrollment = {
        id: 'enrollment-123',
        student_id: 'student-123',
        course_id: 'course-123',
        enrollment_date: new Date(),
        status: 'enrolled',
        student: { first_name: 'John', last_name: 'Doe' },
        course: { course_name: 'Math 101' },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('enrollStudent', () => {
        it('should enroll student successfully', async () => {
            (prisma.studentEnrollment.findUnique as jest.Mock).mockResolvedValue(null);
            (prisma.studentEnrollment.create as jest.Mock).mockResolvedValue(mockEnrollment);

            const result = await EnrollmentService.enrollStudent('student-123', 'course-123');

            expect(result.success).toBe(true);
            expect(result.message).toContain('enrolled successfully');
        });

        it('should reject if already enrolled', async () => {
            (prisma.studentEnrollment.findUnique as jest.Mock).mockResolvedValue(mockEnrollment);

            const result = await EnrollmentService.enrollStudent('student-123', 'course-123');

            expect(result.success).toBe(false);
            expect(result.message).toContain('already enrolled');
        });
    });

    describe('dropCourse', () => {
        it('should drop course successfully', async () => {
            (prisma.studentEnrollment.update as jest.Mock).mockResolvedValue({
                ...mockEnrollment,
                status: 'dropped',
            });

            const result = await EnrollmentService.dropCourse('student-123', 'course-123');

            expect(result.success).toBe(true);
            expect(result.message).toContain('dropped successfully');
        });
    });

    describe('recordAttendance', () => {
        it('should record attendance successfully', async () => {
            const mockAttendance = { id: 'att-123', status: 'present' };
            (prisma.attendance.upsert as jest.Mock).mockResolvedValue(mockAttendance);

            const result = await EnrollmentService.recordAttendance(
                'student-123',
                'course-123',
                'present',
                new Date()
            );

            expect(result.success).toBe(true);
            expect(result.message).toContain('recorded successfully');
        });
    });

    describe('recordGrade', () => {
        it('should record grade successfully', async () => {
            const mockGrade = { id: 'grade-123', score: 85 };
            (prisma.grade.create as jest.Mock).mockResolvedValue(mockGrade);

            const result = await EnrollmentService.recordGrade('student-123', 'course-123', {
                academic_year_id: 'year-123',
                assessment_type: 'Exam',
                assessment_name: 'Midterm',
                score: 85,
            });

            expect(result.success).toBe(true);
            expect(result.message).toContain('recorded successfully');
        });
    });
});
