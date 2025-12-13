import { api } from '../lib/api';

export const subjectService = {
    async getAll() {
        const response = await api.get('/subjects');
        return response.data;
    },

    async create(data: any) {
        const response = await api.post('/subjects', data);
        return response.data;
    },

    async update(id: string, data: any) {
        const response = await api.put(`/subjects/${id}`, data);
        return response.data;
    },

    async delete(id: string) {
        const response = await api.delete(`/subjects/${id}`);
        return response.data;
    },
};
