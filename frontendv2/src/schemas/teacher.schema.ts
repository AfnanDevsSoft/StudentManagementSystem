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
    username: z.string().min(3, 'Username must be at least 3 characters').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

export type TeacherFormData = z.infer<typeof teacherSchema>;
