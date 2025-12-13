import { api, endpoints } from '../lib/api';

export interface Role {
    id: string;
    name: string;
    description?: string;
    is_system?: boolean;
    branch_id?: string;
    permissions: string[];
}

export interface CreateRoleDto {
    name: string;
    description?: string;
    permissions: string[];
}

export const roleService = {
    async getAll() {
        const response = await api.get(endpoints.roles.list);
        return response.data;
    },

    async getById(id: string) {
        const response = await api.get(endpoints.roles.get(id));
        return response.data;
    },

    async create(data: CreateRoleDto) {
        const response = await api.post(endpoints.roles.create, data);
        return response.data;
    },

    async update(id: string, data: Partial<CreateRoleDto>) {
        const response = await api.put(endpoints.roles.update(id), data);
        return response.data;
    },

    async delete(id: string) {
        const response = await api.delete(endpoints.roles.delete(id));
        return response.data;
    },

    async getPermissions() {
        const response = await api.get(endpoints.roles.permissions);
        return response.data;
    },
};
