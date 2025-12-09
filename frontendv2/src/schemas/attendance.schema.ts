import { z } from 'zod';

export const attendanceSchema = z.object({
    student_id: z.string().min(1, 'Student is required'),
    date: z.string().min(1, 'Date is required'),
    status: z.enum(['Present', 'Absent', 'Late', 'Excused']),
    remarks: z.string().optional(),
});

export type AttendanceFormData = z.infer<typeof attendanceSchema>;
