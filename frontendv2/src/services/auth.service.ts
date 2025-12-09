import api from '@/lib/api';
import type { LoginCredentials, AuthResponse, User, Branch } from '@/types/auth.types';

export const authService = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    async register(data: any): Promise<AuthResponse> {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    async getMe(): Promise<{ success: boolean; user: User }> {
        const response = await api.get('/auth/me');
        return response.data;
    },

    async logout(): Promise<void> {
        await api.post('/auth/logout');
    },

    async getUserBranches(userId: string): Promise<{ success: boolean; branches: Branch[] }> {
        const response = await api.get(`/users/${userId}/branches`);
        return response.data;
    },
};
