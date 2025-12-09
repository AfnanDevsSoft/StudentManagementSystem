import { z } from 'zod';

export const gradeSchema = z.object({
    student_id: z.string().min(1, 'Student is required'),
    course_id: z.string().min(1, 'Course is required'),
    grade: z.string().min(1, 'Grade is required'),
    marks_obtained: z.number().min(0).max(100),
    total_marks: z.number().min(1).default(100),
    remarks: z.string().optional(),
    exam_date: z.string().min(1, 'Exam date is required'),
    grading_period: z.string().optional(),
});

export type GradeFormData = z.infer<typeof gradeSchema>;
