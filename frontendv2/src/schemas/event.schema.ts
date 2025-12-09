import { z } from 'zod';

export const eventSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().min(1, 'End date is required'),
    location: z.string().optional(),
    organizer: z.string().optional(),
    participants: z.string().optional(), // Could be JSON-stringified array or simple csv
    type: z.enum(['Academic', 'Sports', 'Cultural', 'Administrative', 'Other']),
});

export type EventFormData = z.infer<typeof eventSchema>;
