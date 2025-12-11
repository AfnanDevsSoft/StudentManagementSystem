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
    recipientId: string;
    subject: string;
    messageBody: string;
}

export interface CreateAnnouncementDto {
    title: string;
    content: string;
    target_audience: string;
    priority: string;
    courseId?: string;
}

export const communicationService = {
    messages: {
        // Get inbox messages - requires userId
        async getAll(userId?: string) {
            if (!userId) {
                // Return empty array if no userId provided instead of making request
                return { data: [], success: false, message: 'User ID required for messages' };
            }
            const response = await api.get(endpoints.messages.inbox, { params: { userId } });
            return response.data;
        },
        async getInbox(userId?: string) {
            if (!userId) {
                return { data: [], success: false, message: 'User ID required for inbox' };
            }
            const response = await api.get(endpoints.messages.inbox, { params: { userId } });
            return response.data;
        },
        async getSent(userId?: string) {
            if (!userId) {
                return { data: [], success: false, message: 'User ID required for sent messages' };
            }
            const response = await api.get(endpoints.messages.sent, { params: { userId } });
            return response.data;
        },
        async getById(id: string) {
            const response = await api.get(endpoints.messages.get(id));
            return response.data;
        },
        async send(data: CreateMessageDto) {
            const response = await api.post(endpoints.messages.send, data);
            return response.data;
        },
        // Backwards-compatible create - alias for send
        async create(data: CreateMessageDto | any) {
            const response = await api.post(endpoints.messages.send, data);
            return response.data;
        },
        async markRead(id: string) {
            const response = await api.put(endpoints.messages.markRead(id), {});
            return response.data;
        },
        async delete(id: string) {
            const response = await api.delete(`/messages/${id}`);
            return response.data;
        },
    },

    announcements: {
        async getAll(params?: { limit?: number; offset?: number; targetAudience?: string }) {
            // Announcements might not be available - catch errors gracefully
            try {
                const response = await api.get(endpoints.announcements.list, { params });
                return response.data;
            } catch (error) {
                // Return empty array if announcements endpoint not available
                return { data: [], success: false, message: 'Announcements not available' };
            }
        },
        async getGeneral() {
            try {
                const response = await api.get(endpoints.announcements.general);
                return response.data;
            } catch (error) {
                return { data: [], success: false, message: 'General announcements not available' };
            }
        },
        async getByCourse(courseId: string) {
            const response = await api.get(endpoints.announcements.byCourse(courseId));
            return response.data;
        },
        async getById(id: string) {
            const response = await api.get(endpoints.announcements.get(id));
            return response.data;
        },
        async create(data: CreateAnnouncementDto) {
            const response = await api.post(endpoints.announcements.create, data);
            return response.data;
        },
        async update(id: string, data: Partial<CreateAnnouncementDto>) {
            const response = await api.put(endpoints.announcements.update(id), data);
            return response.data;
        },
        async delete(id: string) {
            const response = await api.delete(endpoints.announcements.delete(id));
            return response.data;
        }
    }
};

