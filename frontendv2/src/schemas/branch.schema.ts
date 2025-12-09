import { z } from 'zod';

export const branchSchema = z.object({
    name: z.string().min(3, 'Branch name must be at least 3 characters'),
    code: z.string().min(2, 'Branch code must be at least 2 characters'),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    principal_name: z.string().optional(),
    principal_email: z.string().email('Invalid email address').optional().or(z.literal('')),
    timezone: z.string().optional(),
    currency: z.string().optional(),
});

export type BranchFormData = z.infer<typeof branchSchema>;
