import { api, endpoints } from '../lib/api';

export interface Admission {
    id: string;
    application_number: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    date_of_birth: string;
    gender: 'Male' | 'Female' | 'Other';
    address?: string;
    city?: string;
    state?: string;
    previous_school?: string;
    grade_applying_for: string;
    application_date: string;
    status: 'Pending' | 'Reviewing' | 'Accepted' | 'Rejected' | 'Waitlisted';
    notes?: string;
    branch_id: string;
}

export interface CreateAdmissionDto {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    date_of_birth: string;
    gender: 'Male' | 'Female' | 'Other';
    address?: string;
    city?: string;
    state?: string;
    previous_school?: string;
    grade_applying_for: string;
    application_date: string;
    status: 'Pending' | 'Reviewing' | 'Accepted' | 'Rejected' | 'Waitlisted';
    notes?: string;
    branch_id?: string;
}

export const admissionService = {
    async getAll() {
        const response = await api.get(endpoints.admissions.list);
        return response.data;
    },

    async getById(id: string) {
        const response = await api.get(endpoints.admissions.get(id));
        return response.data;
    },

    async create(data: CreateAdmissionDto) {
        // Handle branch_id logic
        let branch_id = data.branch_id;
        if (!branch_id) {
            try {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    branch_id = user?.branch_id || user?.branch?.id;
                }
            } catch (e) {
                console.error('Error parsing user from localStorage:', e);
            }
        }

        const payload = {
            branchId: branch_id,
            applicantEmail: data.email,
            applicantPhone: data.phone,
            applicantData: data,
        };

        const response = await api.post(endpoints.admissions.create, payload);
        return response.data;
    },

    async update(id: string, data: Partial<CreateAdmissionDto>) {
        console.log("Service: calling update API for", id, data);
        const response = await api.put(endpoints.admissions.update(id), data);
        console.log("Service: API response:", response.data);
        return response.data;
    },

    async delete(id: string) {
        const response = await api.delete(endpoints.admissions.delete(id));
        return response.data;
    },
};
