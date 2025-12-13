import { api } from '../lib/api';

export const gradeLevelService = {
    async getAll() {
        const response = await api.get('/grade-levels');
        return response.data;
    },

    async create(data: any) {
        const response = await api.post('/grade-levels', data);
        return response.data;
    },

    async update(id: string, data: any) {
        const response = await api.put(`/grade-levels/${id}`, data);
        return response.data;
    },

    async delete(id: string) {
        const response = await api.delete(`/grade-levels/${id}`);
        return response.data;
    },
};
