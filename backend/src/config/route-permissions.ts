/**
 * Permission Mapping for All Routes
 * 
 * This file defines which permissions are required for each route endpoint.
 * Use this as a reference when applying permission middleware to routes.
 */

export const ROUTE_PERMISSIONS = {
    // STUDENTS
    students: {
        'GET /': 'students:read',
        'GET /:id': 'students:read',
        'GET /:id/enrollment': 'students:read',
        'GET /:id/grades': 'students:read',
        'GET /:id/attendance': 'students:read',
        'POST /': 'students:create',
        'PUT /:id': 'students:update',
        'DELETE /:id': 'students:delete',
    },

    // TEACHERS
    teachers: {
        'GET /': 'teachers:read',
        'GET /:id': 'teachers:read',
        'GET /:id/courses': 'teachers:read',
        'GET /:id/attendance': 'teachers:read',
        'POST /': 'teachers:create',
        'PUT /:id': 'teachers:update',
        'DELETE /:id': 'teachers:delete',
    },

    // USERS
    users: {
        'GET /': 'users:read',
        'GET /:id': 'users:read',
        'GET /roles': 'roles:read',
        'POST /': 'users:create',
        'PUT /:id': 'users:update',
        'PATCH /:id': 'users:update',
        'DELETE /:id': 'users:delete',
    },

    // COURSES
    courses: {
        'GET /': 'courses:read',
        'GET /:id': 'courses:read',
        'GET /:id/students': 'courses:read',
        'POST /': 'courses:create',
        'PUT /:id': 'courses:update',
        'DELETE /:id': 'courses:delete',
    },

    // GRADES
    grades: {
        'GET /': 'grades:read',
        'GET /student/:studentId': 'grades:read',  // Or grades:read_own for students
        'GET /course/:courseId': 'grades:read',
        'POST /': 'grades:create',
        'PUT /:id': 'grades:update',
        'DELETE /:id': 'grades:delete',
    },

    // ATTENDANCE
    attendance: {
        'GET /': 'attendance:read',
        'GET /student/:studentId': 'attendance:read',  // Or attendance:read_own
        'GET /course/:courseId': 'attendance:read',
        'POST /': 'attendance:create',
        'PUT /:id': 'attendance:update',
        'DELETE /:id': 'attendance:delete',
    },

    // ADMISSIONS
    admissions: {
        'GET /': 'admissions:read',
        'GET /:id': 'admissions:read',
        'POST /': 'admissions:create',
        'PUT /:id': 'admissions:update',
        'DELETE /:id': 'admissions:delete',
    },

    // FEE/FINANCE
    finance: {
        'GET /': 'finance:read',
        'GET /student/:studentId': 'finance:read',  // Or finance:read_own
        'POST /': 'finance:create',
        'PUT /:id': 'finance:update',
    },

    // PAYROLL
    payroll: {
        'GET /': 'payroll:read',
        'GET /teacher/:teacherId': 'payroll:read',  // Or payroll:read_own
        'POST /': 'payroll:create',
        'PUT /:id': 'payroll:update',
    },

    // LIBRARY
    library: {
        'GET /books': 'library:read',
        'GET /books/:id': 'library:read',
        'POST /books': 'library:create',
        'PUT /books/:id': 'library:update',
        'DELETE /books/:id': 'library:delete',
        'POST /issue': 'library:create',
        'POST /return': 'library:update',
    },

    // ANNOUNCEMENTS
    announcements: {
        'GET /': 'announcements:read',
        'GET /:id': 'announcements:read',
        'POST /': 'announcements:create',
        'PUT /:id': 'announcements:create',  // Same permission
        'DELETE /:id': 'announcements:create',
    },

    // MESSAGING
    messaging: {
        'GET /': 'messaging:read',
        'GET /:id': 'messaging:read',
        'POST /': 'messaging:send',
        'PUT /:id/read': 'messaging:read',
    },

    // ASSIGNMENTS
    assignments: {
        'GET /': 'assignments:read',
        'GET /:id': 'assignments:read',
        'GET /:id/submissions': 'assignments:read',
        'POST /': 'assignments:create',
        'POST /:id/submit': 'assignments:submit',  // For students
        'PUT /:id': 'assignments:update',
    },

    // BRANCHES
    branches: {
        'GET /': 'branches:read',
        'GET /:id': 'branches:read',
        'POST /': 'branches:create',
        'PUT /:id': 'branches:update',
        'DELETE /:id': 'branches:delete',
    },

    // ANALYTICS & REPORTS
    analytics: {
        'GET /dashboard': 'analytics:read',
        'GET /students': 'analytics:read',
        'GET /teachers': 'analytics:read',
        'GET /attendance': 'analytics:read',
    },

    reports: {
        'GET /': 'reports:generate',
        'POST /generate': 'reports:generate',
        'GET /export': 'reports:export',
    },

    // HEALTH RECORDS
    health: {
        'GET /': 'health:read',
        'GET /student/:studentId': 'health:read',
        'POST /': 'health:create',
        'PUT /:id': 'health:update',
    },

    // TIMETABLE
    timetable: {
        'GET /': 'courses:read',  // Use courses permission
        'POST /': 'courses:create',
        'PUT /:id': 'courses:update',
    },
};

/**
 * Public routes that don't require authentication or permissions
 */
export const PUBLIC_ROUTES = [
    '/api/v1/auth/login',
    '/api/v1/auth/register',
    '/api/v1/auth/refresh',
    '/health',
    '/api/docs',
];

/**
 * SuperAdmin-only routes
 */
export const SUPERADMIN_ROUTES = [
    '/api/v1/system/settings',
    '/api/v1/system/audit',
    '/api/v1/system/backup',
    '/api/v1/branches',  // Branch management
];
