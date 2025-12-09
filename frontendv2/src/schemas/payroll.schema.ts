import { z } from 'zod';

export const payrollSchema = z.object({
    teacher_id: z.string().min(1, 'Teacher is required'),
    salary_amount: z.number().min(0, 'Salary must be positive'),
    bonus: z.number().min(0).default(0),
    deductions: z.number().min(0).default(0),
    payment_date: z.string().min(1, 'Payment date is required'),
    payment_method: z.enum(['Bank Transfer', 'Check', 'Cash']),
    status: z.enum(['Paid', 'Pending', 'Processing']),
    remarks: z.string().optional(),
});

export type PayrollFormData = z.infer<typeof payrollSchema>;
