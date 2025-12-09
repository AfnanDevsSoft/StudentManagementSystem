import { z } from 'zod';

export const userSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    first_name: z.string().min(2, 'First name must be at least 2 characters'),
    last_name: z.string().min(2, 'Last name must be at least 2 characters'),
    phone: z.string().optional(),
    role_id: z.string().min(1, 'Role is required'),
    branch_id: z.string().min(1, 'Branch is required'),
});

export type UserFormData = z.infer<typeof userSchema>;
