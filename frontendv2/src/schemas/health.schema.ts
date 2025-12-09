import { z } from 'zod';

export const healthSchema = z.object({
    student_id: z.string().min(1, 'Student is required'),
    blood_group: z.string().optional(),
    height: z.number().min(0, 'Height must be positive').optional(),
    weight: z.number().min(0, 'Weight must be positive').optional(),
    allergies: z.string().optional(),
    medical_history: z.string().optional(),
    emergency_contact: z.string().optional(),
    emergency_phone: z.string().optional(),
    last_checkup_date: z.string().optional(),
    notes: z.string().optional(),
});

export type HealthFormData = z.infer<typeof healthSchema>;
