import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding auth token and branch filtering
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add current branch to all requests
        const currentBranch = localStorage.getItem('current_branch');
        if (currentBranch) {
            try {
                const branch = JSON.parse(currentBranch);
                // Don't add branch_id if it's the main branch viewing all data
                if (branch.id !== 'main') {
                    config.params = {
                        ...config.params,
                        branch_id: branch.id,
                    };
                }
            } catch (e) {
                console.error('Error parsing current branch:', e);
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling errors and token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retried, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (refreshToken) {
                    const response = await axios.post(`${API_BASE_URL}/v1/auth/refresh`, {
                        refresh_token: refreshToken,
                    });

                    const { access_token, refresh_token: newRefreshToken } = response.data;
                    localStorage.setItem('access_token', access_token);
                    localStorage.setItem('refresh_token', newRefreshToken);

                    originalRequest.headers.Authorization = `Bearer ${access_token}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, logout user
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
                localStorage.removeItem('current_branch');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// API Endpoints
export const endpoints = {
    // Auth
    auth: {
        login: '/auth/login',
        register: '/auth/register',
        logout: '/auth/logout',
        me: '/auth/me',
    },
    // Branches
    branches: {
        list: '/branches',
        create: '/branches',
        get: (id: string) => `/branches/${id}`,
        update: (id: string) => `/branches/${id}`,
        delete: (id: string) => `/branches/${id}`,
    },
    // Users
    users: {
        list: '/users',
        create: '/users',
        get: (id: string) => `/users/${id}`,
        update: (id: string) => `/users/${id}`,
        delete: (id: string) => `/users/${id}`,
    },
    // Roles
    roles: {
        list: '/rbac/roles',
        create: '/rbac/roles',
        get: (id: string) => `/rbac/roles/${id}`,
        update: (id: string) => `/rbac/roles/${id}`,
        delete: (id: string) => `/rbac/roles/${id}`,
        permissions: '/rbac/permissions',
    },
    // Students
    students: {
        list: '/students',
        create: '/students',
        get: (id: string) => `/students/${id}`,
        update: (id: string) => `/students/${id}`,
        delete: (id: string) => `/students/${id}`,
        attendance: (id: string) => `/students/${id}/attendance`,
        grades: (id: string) => `/students/${id}/grades`,
    },
    // Teachers
    teachers: {
        list: '/teachers',
        create: '/teachers',
        get: (id: string) => `/teachers/${id}`,
        update: (id: string) => `/teachers/${id}`,
        delete: (id: string) => `/teachers/${id}`,
        attendance: (id: string) => `/teachers/${id}/attendance`,
        payroll: (id: string) => `/teachers/${id}/payroll`,
    },
    // Courses
    courses: {
        list: '/courses',
        create: '/courses',
        get: (id: string) => `/courses/${id}`,
        update: (id: string) => `/courses/${id}`,
        delete: (id: string) => `/courses/${id}`,
        enrollments: (id: string) => `/courses/${id}/enrollments`,
    },
    // Admissions
    admissions: {
        list: '/admissions',
        create: '/admissions',
        get: (id: string) => `/admissions/${id}`,
        update: (id: string) => `/admissions/${id}`,
        delete: (id: string) => `/admissions/${id}`,
    },
    // Attendance
    attendance: {
        list: '/attendance',
        mark: '/attendance',
        reports: '/attendance/reports',
    },
    // Grades
    grades: {
        list: '/grades',
        create: '/grades',
        reports: '/grades/reports',
    },
    // Payroll
    payroll: {
        list: '/payroll',
        create: '/payroll',
        get: (id: string) => `/payroll/${id}`,
        update: (id: string) => `/payroll/${id}`,
        approve: (id: string) => `/payroll/${id}/approve`,
    },
    // Finance
    finance: {
        fees: '/fees',
        payments: '/fee-payments',
        scholarships: '/scholarships',
    },
    // Library
    library: {
        books: '/library/books',
        loans: '/library/loans',
        issue: '/library/loans/issue',
        return: '/library/loans/return',
    },
    // Health
    health: {
        records: '/health/records',
        checkups: '/health/checkups',
        vaccinations: '/health/vaccinations',
        incidents: '/health/incidents',
    },
    // Events
    events: {
        list: '/events',
        create: '/events',
        get: (id: string) => `/events/${id}`,
        update: (id: string) => `/events/${id}`,
        delete: (id: string) => `/events/${id}`,
    },
    // Messages
    messages: {
        list: '/messages',
        send: '/messages',
        get: (id: string) => `/messages/${id}`,
    },
    // Announcements
    announcements: {
        list: '/announcements',
        create: '/announcements',
        get: (id: string) => `/announcements/${id}`,
        update: (id: string) => `/announcements/${id}`,
        delete: (id: string) => `/announcements/${id}`,
    },
    // Analytics
    analytics: {
        dashboard: '/analytics/dashboard',
        reports: '/analytics/reports',
        metrics: '/analytics/metrics',
    },
};

export default api;
