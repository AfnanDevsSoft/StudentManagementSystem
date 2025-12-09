import { api, endpoints } from '../lib/api';

export interface Branch {
    id: string;
    name: string;
    code: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    phone?: string;
    email?: string;
    principal_name?: string;
    principal_email?: string;
    timezone?: string;
    currency?: string;
    is_active: boolean;
}

export interface CreateBranchDto {
    name: string;
    code: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    phone?: string;
    email?: string;
    principal_name?: string;
    principal_email?: string;
    timezone?: string;
    currency?: string;
}

export const branchService = {
    async getAll() {
        const response = await api.get(endpoints.branches.list);
        return response.data;
    },

    async getById(id: string) {
        const response = await api.get(endpoints.branches.get(id));
        return response.data;
    },

    async create(data: CreateBranchDto) {
        const response = await api.post(endpoints.branches.create, data);
        return response.data;
    },

    async update(id: string, data: Partial<CreateBranchDto>) {
        const response = await api.put(endpoints.branches.update(id), data);
        return response.data;
    },

    async delete(id: string) {
        const response = await api.delete(endpoints.branches.delete(id));
        return response.data;
    },
};
