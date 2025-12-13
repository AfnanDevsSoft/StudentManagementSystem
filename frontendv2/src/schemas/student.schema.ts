import { z } from 'zod';

export const studentSchema = z.object({
    first_name: z.string().min(2, 'First name must be at least 2 characters'),
    last_name: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().optional(),
    date_of_birth: z.string().min(1, 'Date of birth is required'),
    gender: z.enum(['Male', 'Female', 'Other']),
    blood_group: z.string().optional(),
    nationality: z.string().optional(),
    admission_date: z.string().min(1, 'Admission date is required'),
    current_grade_level_id: z.string().optional(),
    username: z.string().min(3, 'Username must be at least 3 characters').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

export type StudentFormData = z.infer<typeof studentSchema>;
