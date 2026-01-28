
import { api, endpoints } from '../lib/api';

export interface Role {
    id: string;
    name: string;
    description?: string;
    isSystem?: boolean;
    permissions?: any;
    usersCount?: number;
    color?: string; // For UI
    branchId?: string;
}

export interface CreateRoleDTO {
    branchId: string;
    roleName: string;
    description?: string;
    permissions?: string[];
}

export interface UpdateRoleDTO {
    permissionIds: string[];
}

export const roleService = {
    // RBAC roles - for Roles & Permissions page
    getAll: async () => {
        const response = await api.get(endpoints.roles.list);
        const responseData = response.data;
        // Roles might be returned as direct array or { data: [], success: true }
        const rolesList = Array.isArray(responseData) ? responseData :
            (Array.isArray(responseData?.data) ? responseData.data : []);
        return { data: rolesList };
    },

    // Legacy roles - for User assignment (FK constraint requires legacy Role IDs)
    getLegacyRoles: async () => {
        const response = await api.get('/users/roles');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(endpoints.roles.get(id));
        return response.data;
    },

    create: async (data: CreateRoleDTO) => {
        const response = await api.post(endpoints.roles.create, data);
        return response.data;
    },

    update: async (id: string, data: UpdateRoleDTO) => {
        const response = await api.put(endpoints.roles.update(id), data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(endpoints.roles.delete(id));
        return response.data;
    },

    // RBAC Specific
    getAllPermissions: async () => {
        const response = await api.get(endpoints.roles.permissions);
        return response.data;
    }
};

