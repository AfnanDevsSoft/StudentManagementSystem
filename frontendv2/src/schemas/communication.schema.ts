import { z } from 'zod';

export const messageSchema = z.object({
    subject: z.string().min(1, 'Subject is required'),
    content: z.string().min(1, 'Content is required'),
    receiver_id: z.string().min(1, 'Receiver is required'), // User ID
    sender_id: z.string().optional(), // Usually inferred from auth
    is_read: z.boolean().default(false),
});

export const announcementSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().min(1, 'Content is required'),
    target_audience: z.enum(['All', 'Students', 'Teachers', 'Parents', 'Staff']),
    priority: z.enum(['Low', 'Normal', 'High']),
});

export type MessageFormData = z.infer<typeof messageSchema>;
export type AnnouncementFormData = z.infer<typeof announcementSchema>;
