export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: '/dashboard',
    STUDENTS: '/students',
    TEACHERS: '/teachers',
    COURSES: '/courses',
    ADMISSIONS: '/admissions',
    PAYROLL: '/payroll',
    FEES: '/fees',
    BRANCHES: '/branches',
    USERS: '/users',
    ROLES: '/roles',
    REPORTS: '/reports',
    ANALYTICS: '/analytics',
    MESSAGES: '/messages',
    ANNOUNCEMENTS: '/announcements',
    NOTIFICATIONS: '/notifications',
    TIMETABLE: '/timetable',
    HEALTH: '/health-records',
    LIBRARY: '/library',
    EVENTS: '/events',
} as const;

export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER: 'user',
    CURRENT_BRANCH: 'current_branch',
} as const;

export const STUDENT_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    GRADUATED: 'graduated',
    SUSPENDED: 'suspended',
} as const;

export const ADMISSION_STATUS = {
    SUBMITTED: 'submitted',
    APPROVED: 'approved',
    REJECTED: 'rejected',
} as const;

export const PAYROLL_STATUS = {
    DRAFT: 'draft',
    APPROVED: 'approved',
    PAID: 'paid',
} as const;
