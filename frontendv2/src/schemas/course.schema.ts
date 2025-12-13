import { z } from 'zod';

export const courseSchema = z.object({
    course_code: z.string().min(2, 'Course code must be at least 2 characters'),
    course_name: z.string().min(3, 'Course name must be at least 3 characters'),
    subject_id: z.string().min(1, 'Subject is required'),
    grade_level_id: z.string().min(1, 'Grade level is required'),
    teacher_id: z.string().min(1, 'Teacher is required'),
    academic_year_id: z.string().min(1, 'Academic year is required'),
    max_students: z.number().min(1).max(100).optional().or(z.literal('')),
    room_number: z.string().optional(),
    building: z.string().optional(),
    branch_id: z.string().optional(),
});

export type CourseFormData = z.infer<typeof courseSchema>;
