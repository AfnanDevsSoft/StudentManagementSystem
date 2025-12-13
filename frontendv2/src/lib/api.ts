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

// API Endpoints - Aligned with backend routes
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
    // Roles - Backend uses /rbac/* but Users need legacy roles for creation
    roles: {
        list: '/users/roles', // Changed from /rbac/roles to fetch legacy compatible roles
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
        enrollment: (id: string) => `/students/${id}/enrollment`,
    },
    // Teachers
    teachers: {
        list: '/teachers',
        create: '/teachers',
        get: (id: string) => `/teachers/${id}`,
        update: (id: string) => `/teachers/${id}`,
        delete: (id: string) => `/teachers/${id}`,
        courses: (id: string) => `/teachers/${id}/courses`,
    },
    // Courses
    courses: {
        list: '/courses',
        create: '/courses',
        get: (id: string) => `/courses/${id}`,
        update: (id: string) => `/courses/${id}`,
        delete: (id: string) => `/courses/${id}`,
        enrollments: (id: string) => `/courses/${id}/enrollments`,
        students: (id: string) => `/courses/${id}/students`,
        enroll: (id: string) => `/courses/${id}/enroll`,
    },
    // Admissions - Backend uses /admission (singular)
    admissions: {
        list: '/admission',
        create: '/admission/apply',
        get: (id: string) => `/admission/${id}`,
        update: (id: string) => `/admission/${id}`,
        delete: (id: string) => `/admission/${id}`,
        approve: (id: string) => `/admission/${id}/approve`,
        reject: (id: string) => `/admission/${id}/reject`,
        statistics: '/admission/statistics',
    },
    // Payroll - Backend uses /payroll/*
    payroll: {
        list: '/payroll/salaries',
        process: '/payroll/process',
        get: (id: string) => `/payroll/${id}`,
        update: (id: string) => `/payroll/${id}`,
        approve: (id: string) => `/payroll/${id}/approve`,
        teacherPayroll: (teacherId: string) => `/payroll/teacher/${teacherId}`,
    },
    // Finance/Fees - Backend uses /fees/*
    finance: {
        structures: '/fees/structures',
        records: '/fees/records',
        payment: '/fees/payment',
        studentOutstanding: (studentId: string) => `/fees/${studentId}/outstanding`,
        studentPaymentHistory: (studentId: string) => `/fees/${studentId}/payment-history`,
    },
    // Library - Backend uses /library/*
    library: {
        books: '/library/books',
        bookById: (id: string) => `/library/books/${id}`,
        loansOverdue: '/library/loans/overdue',
        loansByBorrower: (borrowerId: string) => `/library/loans/borrower/${borrowerId}`,
        issue: '/library/loans/issue',
        return: (loanId: string) => `/library/loans/${loanId}/return`,
        renew: (loanId: string) => `/library/loans/${loanId}/renew`,
        fines: '/library/fines',
        waiveFine: (fineId: string) => `/library/fines/${fineId}/waive`,
    },
    // Health/Medical - Backend uses /medical/*
    health: {
        studentRecord: (studentId: string) => `/medical/student/${studentId}`,
        summary: (studentId: string) => `/medical/summary/${studentId}`,
        checkups: (studentId: string) => `/medical/checkups/${studentId}`,
        vaccinations: (studentId: string) => `/medical/vaccinations/${studentId}`,
        incidents: (studentId: string) => `/medical/incidents/${studentId}`,
    },
    // Events - Backend uses /events
    events: {
        list: '/events',
        create: '/events',
        get: (id: string) => `/events/${id}`,
        update: (id: string) => `/events/${id}`,
        delete: (id: string) => `/events/${id}`,
        monthly: (branchId: string, year: number, month: number) => `/events/calendar/${branchId}/${year}/${month}`,
    },
    // Messages - Backend uses /messages/*
    messages: {
        inbox: '/messages/inbox',
        sent: '/messages/sent',
        send: '/messages/send',
        get: (id: string) => `/messages/${id}`,
        markRead: (id: string) => `/messages/${id}/read`,
    },
    // Announcements - Backend uses /announcements/*
    announcements: {
        list: '/announcements',
        create: '/announcements',
        get: (id: string) => `/announcements/${id}`,
        update: (id: string) => `/announcements/${id}`,
        delete: (id: string) => `/announcements/${id}`,
        byCourse: (courseId: string) => `/announcements/course/${courseId}`,
        general: '/announcements/general',
    },
    // Analytics - Backend uses /analytics/*
    analytics: {
        overview: '/analytics/dashboard', // Backend uses /dashboard not /overview
        dashboard: '/analytics/dashboard',
        enrollment: '/analytics/enrollment',
        revenue: '/analytics/fees', // Backend uses /fees for revenue/fee metrics
        attendance: '/analytics/attendance',
        fees: '/analytics/fees',
        teachers: '/analytics/teachers',
        trends: (metricType: string) => `/analytics/trends/${metricType}`,
    },
    // Leave Management - Backend uses /leaves/*
    leaves: {
        request: '/leaves/request',
        list: '/leaves',
        pending: '/leaves/pending',
        approve: (id: string) => `/leaves/${id}/approve`,
        reject: (id: string) => `/leaves/${id}/reject`,
        teacherLeaves: (teacherId: string) => `/leaves/teacher/${teacherId}`,
    },
    // Course Content - Backend uses /course-content/*
    courseContent: {
        list: (courseId: string) => `/course-content/course/${courseId}`,
        create: (courseId: string) => `/course-content/course/${courseId}`,
        get: (id: string) => `/course-content/${id}`,
        update: (id: string) => `/course-content/${id}`,
        delete: (id: string) => `/course-content/${id}`,
    },
    // Assignments
    assignments: {
        listByCourse: (courseId: string) => `/assignments/course/${courseId}`,
        create: '/assignments',
        get: (id: string) => `/assignments/${id}`,
        update: (id: string) => `/assignments/${id}`,
        delete: (id: string) => `/assignments/${id}`,
        submissions: (id: string) => `/assignments/${id}/submissions`,
    },
    // Notifications - Backend uses /notifications/*
    notifications: {
        list: '/notifications',
        markRead: (id: string) => `/notifications/${id}/read`,
        markAllRead: '/notifications/mark-all-read',
    },
};

export default api;
