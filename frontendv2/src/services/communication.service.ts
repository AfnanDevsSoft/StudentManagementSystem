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
        // Backwards-compatible getAll - fetches inbox messages
        async getAll() {
            const response = await api.get(endpoints.messages.inbox);
            return response.data;
        },
        async getInbox() {
            const response = await api.get(endpoints.messages.inbox);
            return response.data;
        },
        async getSent() {
            const response = await api.get(endpoints.messages.sent);
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
        async getAll() {
            const response = await api.get(endpoints.announcements.list);
            return response.data;
        },
        async getGeneral() {
            const response = await api.get(endpoints.announcements.general);
            return response.data;
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

