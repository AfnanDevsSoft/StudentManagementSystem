import { z } from 'zod';

export const teacherSchema = z.object({
    first_name: z.string().min(2, 'First name must be at least 2 characters'),
    last_name: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    hire_date: z.string().min(1, 'Hire date is required'),
    employment_type: z.enum(['Full-Time', 'Part-Time', 'Contract']),
    department: z.string().optional(),
    designation: z.string().optional(),
    qualification: z.string().optional(),
    years_experience: z.number().min(0).optional().or(z.literal('')),
});

export type TeacherFormData = z.infer<typeof teacherSchema>;
