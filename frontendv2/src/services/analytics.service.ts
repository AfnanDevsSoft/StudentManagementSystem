import { api, endpoints } from '../lib/api';

export const analyticsService = {
    // Backwards-compatible alias
    async getDashboardStats() {
        const response = await api.get(endpoints.analytics.overview);
        return response.data;
    },

    async getOverview(branchId?: string) {
        const params = branchId ? { branch_id: branchId } : {};
        const response = await api.get(endpoints.analytics.overview, { params });
        return response.data;
    },

    async getEnrollmentStats(params?: { branchId?: string; startDate?: string; endDate?: string }) {
        const response = await api.get(endpoints.analytics.enrollment, { params });
        return response.data;
    },

    async getRevenueStats(params?: { branchId?: string; startDate?: string; endDate?: string }) {
        const response = await api.get(endpoints.analytics.revenue, { params });
        return response.data;
    },

    async getAttendanceStats(params?: { branchId?: string; startDate?: string; endDate?: string }) {
        const response = await api.get(endpoints.analytics.attendance, { params });
        return response.data;
    },
};
