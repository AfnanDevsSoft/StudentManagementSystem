import { api, endpoints } from '../lib/api';

export interface User {
    id: string;
    username: string;
    employee_id?: string;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    is_active: boolean;
    role_id: string;
    branch_id: string;
    role?: {
        id: string;
        name: string;
    };
    branch?: {
        id: string;
        name: string;
    }
}

export interface CreateUserDto {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    role_id: string;
    branch_id: string;
}

export const userService = {
    async getAll(params?: { page?: number; limit?: number; search?: string }) {
        const response = await api.get(endpoints.users.list, { params });
        return response.data;
    },

    async getById(id: string) {
        const response = await api.get(endpoints.users.get(id));
        return response.data;
    },

    async create(data: CreateUserDto) {
        const response = await api.post(endpoints.users.create, data);
        return response.data;
    },

    async update(id: string, data: Partial<Omit<CreateUserDto, 'password'>>) {
        const response = await api.put(endpoints.users.update(id), data);
        return response.data;
    },

    async delete(id: string) {
        const response = await api.delete(endpoints.users.delete(id));
        return response.data;
    },

    async changePassword(id: string, oldPassword: string, newPassword: string) {
        const response = await api.put(`/users/${id}/password`, {
            old_password: oldPassword,
            new_password: newPassword,
        });
        return response.data;
    },
};
