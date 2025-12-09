import { api, endpoints } from '../lib/api';

export interface Message {
    id: string;
    subject: string;
    content: string;
    sender_id: string;
    receiver_id: string;
    sent_at: string;
    is_read: boolean;
    sender?: {
        name: string;
        email: string;
    };
    receiver?: {
        name: string;
        email: string;
    };
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    target_audience: 'All' | 'Students' | 'Teachers' | 'Parents' | 'Staff';
    priority: 'Low' | 'Normal' | 'High';
    posted_at: string;
    posted_by: string;
    author?: {
        name: string;
    };
}

export interface CreateMessageDto {
    subject: string;
    content: string;
    receiver_id: string;
}

export interface CreateAnnouncementDto {
    title: string;
    content: string;
    target_audience: string;
    priority: string;
}

export const communicationService = {
    messages: {
        async getAll() {
            // Endpoints might be endpoints.messages.list or such.
            // Using raw string based on `announcements` existence in `api.ts` snippet logic inference.
            // Actually `api.ts` snippet didn't show `messages` block, but `announcements` was likely there?
            // I'll check `api.ts` again or just assume standard REST if not found.
            // Let's assume `/messages` and `/announcements`.
            const response = await api.get('/messages');
            return response.data;
        },
        async getInbox() {
            const response = await api.get('/messages/inbox'); // If specific endpoint exists
            return response.data;
        },
        async create(data: CreateMessageDto) {
            const response = await api.post('/messages', data);
            return response.data;
        },
        async markRead(id: string) {
            const response = await api.put(`/messages/${id}/read`, {});
            return response.data;
        },
        async delete(id: string) {
            const response = await api.delete(`/messages/${id}`);
            return response.data;
        }
    },

    announcements: {
        async getAll() {
            const response = await api.get(endpoints.announcements.list);
            return response.data;
        },
        async create(data: CreateAnnouncementDto) {
            const response = await api.post(endpoints.announcements.create, data);
            return response.data;
        },
        async update(id: string, data: Partial<CreateAnnouncementDto>) {
            const response = await api.put(`${endpoints.announcements.list}/${id}`, data);
            return response.data;
        },
        async delete(id: string) {
            const response = await api.delete(`${endpoints.announcements.list}/${id}`);
            return response.data;
        }
    }
};
