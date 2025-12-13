import { api } from '../lib/api';

export const academicYearService = {
    async getAll() {
        const response = await api.get('/academic-years');
        return response.data;
    },

    async create(data: any) {
        const response = await api.post('/academic-years', data);
        return response.data;
    },

    async update(id: string, data: any) {
        const response = await api.put(`/academic-years/${id}`, data);
        return response.data;
    },

    async delete(id: string) {
        const response = await api.delete(`/academic-years/${id}`);
        return response.data;
    },
};
