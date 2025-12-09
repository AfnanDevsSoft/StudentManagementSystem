import { api, endpoints } from '../lib/api';

export const analyticsService = {
    async getDashboardStats() {
        const response = await api.get(endpoints.analytics.dashboard);
        return response.data;
    },

    async getReports(type: string, dateRange?: { start: string; end: string }) {
        const response = await api.get(endpoints.analytics.reports, {
            params: { type, ...dateRange }
        });
        return response.data;
    },

    async getMetrics(metric: string) {
        const response = await api.get(endpoints.analytics.metrics, {
            params: { metric }
        });
        return response.data;
    }
};
