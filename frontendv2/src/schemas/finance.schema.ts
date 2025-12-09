import { z } from 'zod';

export const feeSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    amount: z.number().min(0, 'Amount must be positive'),
    due_date: z.string().min(1, 'Due date is required'),
    description: z.string().optional(),
    academic_year_id: z.string().optional(),
});

export const paymentSchema = z.object({
    student_id: z.string().min(1, 'Student is required'),
    fee_id: z.string().min(1, 'Fee is required'),
    amount_paid: z.number().min(0, 'Amount must be positive'),
    payment_date: z.string().min(1, 'Payment date is required'),
    payment_method: z.enum(['Cash', 'Credit Card', 'Bank Transfer', 'Online']),
    transaction_id: z.string().optional(),
    status: z.enum(['Pending', 'Completed', 'Failed']),
});

export const scholarshipSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    amount: z.number().min(0, 'Amount must be positive'),
    student_id: z.string().min(1, 'Student is required'),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().min(1, 'End date is required'),
    conditions: z.string().optional(),
});

export type FeeFormData = z.infer<typeof feeSchema>;
export type PaymentFormData = z.infer<typeof paymentSchema>;
export type ScholarshipFormData = z.infer<typeof scholarshipSchema>;
