import { api, endpoints } from '../lib/api';

export interface Event {
    id: string;
    title: string;
    description?: string;
    start_date: string;
    end_date: string;
    location?: string;
    organizer?: string;
    participants?: string;
    type: 'Academic' | 'Sports' | 'Cultural' | 'Administrative' | 'Other';
}

export interface CreateEventDto {
    title: string;
    description?: string;
    start_date: string;
    end_date: string;
    location?: string;
    organizer?: string;
    participants?: string;
    type: string;
}

export const eventService = {
    async getAll() {
        // Checking for endpoints.events
        // Assuming endpoints.events.list exists
        const response = await api.get(endpoints.events.list);
        return response.data;
    },

    async getById(id: string) {
        const response = await api.get(`${endpoints.events.list}/${id}`);
        return response.data;
    },

    async create(data: CreateEventDto) {
        const response = await api.post(endpoints.events.create, data);
        return response.data;
    },

    async update(id: string, data: Partial<CreateEventDto>) {
        const response = await api.put(`${endpoints.events.list}/${id}`, data);
        return response.data;
    },

    async delete(id: string) {
        const response = await api.delete(`${endpoints.events.list}/${id}`);
        return response.data;
    },
};
