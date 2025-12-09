import { api, endpoints } from '../lib/api';

export interface HealthRecord {
    id: string;
    student_id: string;
    blood_group?: string;
    height?: number;
    weight?: number;
    allergies?: string;
    medical_history?: string;
    emergency_contact?: string;
    emergency_phone?: string;
    last_checkup_date?: string;
    notes?: string;
    student?: {
        first_name: string;
        last_name: string;
        student_code: string;
        date_of_birth: string;
    };
}

export interface CreateHealthRecordDto {
    student_id: string;
    blood_group?: string;
    height?: number;
    weight?: number;
    allergies?: string;
    medical_history?: string;
    emergency_contact?: string;
    emergency_phone?: string;
    last_checkup_date?: string;
    notes?: string;
}

export const healthService = {
    async getAll() {
        const response = await api.get(endpoints.health.records);
        return response.data;
    },

    async getById(id: string) {
        const response = await api.get(`${endpoints.health.records}/${id}`);
        return response.data;
    },

    async create(data: CreateHealthRecordDto) {
        const response = await api.post(endpoints.health.records, data);
        return response.data;
    },

    async update(id: string, data: Partial<CreateHealthRecordDto>) {
        const response = await api.put(`${endpoints.health.records}/${id}`, data);
        return response.data;
    },

    async delete(id: string) {
        const response = await api.delete(`${endpoints.health.records}/${id}`);
        return response.data;
    },
};
