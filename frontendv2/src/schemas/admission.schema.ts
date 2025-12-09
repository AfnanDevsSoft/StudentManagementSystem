import { z } from 'zod';

export const admissionSchema = z.object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone number is required'),
    date_of_birth: z.string().min(1, 'Date of birth is required'),
    gender: z.enum(['Male', 'Female', 'Other']),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    previous_school: z.string().optional(),
    grade_applying_for: z.string().min(1, 'Grade is required'),
    application_date: z.string().min(1, 'Application date is required'),
    status: z.enum(['Pending', 'Reviewing', 'Accepted', 'Rejected', 'Waitlisted']),
    notes: z.string().optional(),
});

export type AdmissionFormData = z.infer<typeof admissionSchema>;
