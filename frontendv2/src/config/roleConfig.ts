/**
 * Role-Based Access Control Configuration
 * Defines navigation items and permissions for each user role
 */

import {
    LayoutDashboard,
    Users,
    GraduationCap,
    BookOpen,
    ClipboardCheck,
    Award,
    FileText,
    DollarSign,
    Heart,
    BarChart3,
    Settings,
    Building2,
    Shield,
    Receipt,
    Calendar,
    MessageSquare,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type UserRole = 'admin' | 'teacher' | 'student' | 'SuperAdmin';

export interface NavigationItem {
    name: string;
    href: string;
    icon: LucideIcon;
    group?: string;
}

export interface NavigationGroup {
    name: string;
    items: NavigationItem[];
}

// Admin Navigation - Full system access
export const adminNavigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Branches', href: '/branches', icon: Building2, group: 'Management' },
    { name: 'Roles & Permissions', href: '/roles', icon: Shield, group: 'Management' },
    { name: 'Users', href: '/users', icon: Users, group: 'Management' },
    { name: 'Students', href: '/students', icon: GraduationCap, group: 'Management' },
    { name: 'Teachers', href: '/teachers', icon: Users, group: 'Management' },
    { name: 'Courses', href: '/courses', icon: BookOpen, group: 'Academic' },
    { name: 'Admissions', href: '/admissions', icon: FileText, group: 'Academic' },
    { name: 'Attendance', href: '/attendance', icon: ClipboardCheck, group: 'Academic' },
    { name: 'Grades', href: '/grades', icon: Award, group: 'Academic' },
    { name: 'Finance', href: '/finance', icon: DollarSign, group: 'Finance' },
    { name: 'Payroll', href: '/payroll', icon: Receipt, group: 'Finance' },

    { name: 'Health Records', href: '/health', icon: Heart, group: 'Operations' },
    { name: 'Chat', href: '/chat', icon: MessageSquare, group: 'Communication' },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
];

// Teacher Navigation - Teaching and class management
export const teacherNavigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Classes', href: '/teacher/classes', icon: BookOpen, group: 'Teaching' },
    { name: 'My Students', href: '/teacher/students', icon: GraduationCap, group: 'Teaching' },
    { name: 'Attendance', href: '/teacher/attendance', icon: ClipboardCheck, group: 'Teaching' },
    { name: 'Grades', href: '/teacher/grades', icon: Award, group: 'Teaching' },

    { name: 'Assignments', href: '/teacher/assignments', icon: FileText, group: 'Content' },
    { name: 'Leave Requests', href: '/teacher/leave', icon: Calendar, group: 'HR' },
    { name: 'My Payroll', href: '/teacher/payroll', icon: DollarSign, group: 'HR' },
    { name: 'Chat', href: '/chat', icon: MessageSquare, group: 'Communication' },
    { name: 'Settings', href: '/settings', icon: Settings },
];

// Student Navigation - Learning and self-service
export const studentNavigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Courses', href: '/student/courses', icon: BookOpen, group: 'Learning' },

    { name: 'Assignments', href: '/student/assignments', icon: FileText, group: 'Learning' },
    { name: 'My Grades', href: '/student/grades', icon: Award, group: 'Performance' },
    { name: 'My Attendance', href: '/student/attendance', icon: ClipboardCheck, group: 'Performance' },
    { name: 'Fee Status', href: '/student/fees', icon: DollarSign, group: 'Finance' },
    { name: 'Chat', href: '/chat', icon: MessageSquare, group: 'Communication' },

    { name: 'Settings', href: '/settings', icon: Settings },
];

// Branch Admin Navigation - Assigned branch management
export const branchAdminNavigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    // Branch Admin does not manage Branches or Roles globally
    { name: 'Users', href: '/users', icon: Users, group: 'Management' },
    { name: 'Students', href: '/students', icon: GraduationCap, group: 'Management' },
    { name: 'Teachers', href: '/teachers', icon: Users, group: 'Management' },
    { name: 'Courses', href: '/courses', icon: BookOpen, group: 'Academic' },
    { name: 'Admissions', href: '/admissions', icon: FileText, group: 'Academic' },
    { name: 'Attendance', href: '/attendance', icon: ClipboardCheck, group: 'Academic' },
    { name: 'Grades', href: '/grades', icon: Award, group: 'Academic' },
    { name: 'Finance', href: '/finance', icon: DollarSign, group: 'Finance' },
    { name: 'Payroll', href: '/payroll', icon: Receipt, group: 'Finance' },

    { name: 'Health Records', href: '/health', icon: Heart, group: 'Operations' },
    { name: 'Chat', href: '/chat', icon: MessageSquare, group: 'Communication' },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
];

/**
 * Get navigation items based on user role
 * @param role - The role name (e.g., 'superadmin', 'teacher', 'student')
 * @param permissions - Optional array of user permissions for custom roles
 */
export function getNavigationByRole(role: string, permissions?: string[]): NavigationItem[] {
    const normalizedRole = role?.toLowerCase() || '';

    switch (normalizedRole) {
        case 'superadmin':
            return adminNavigation; // Super Admin gets full access
        case 'admin':
        case 'branchadmin':
            return branchAdminNavigation; // Branch Admin gets restricted access
        case 'teacher':
            return teacherNavigation;
        case 'student':
            return studentNavigation;
        case 'admission agent':
        case 'admission_agent':
            return [
                { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
                { name: 'Admissions', href: '/admissions', icon: FileText, group: 'Academic' },
                { name: 'Settings', href: '/settings', icon: Settings },
            ];
        default:
            // Custom role - if user has permissions, give admin-like navigation
            // This allows custom roles with RBAC permissions to navigate the system
            if (permissions && permissions.length > 0) {
                return branchAdminNavigation; // Give admin-like navigation
            }
            // Default to minimal navigation for unknown roles without permissions
            return [
                { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
                { name: 'Settings', href: '/settings', icon: Settings },
            ];
    }
}

/**
 * Check if a user has access to a specific route
 */
export function hasRouteAccess(role: string, pathToCheck: string): boolean {
    const navigation = getNavigationByRole(role);

    // Check if path matches any navigation item
    return navigation.some(item => {
        if (pathToCheck === item.href) return true;
        // Check for nested routes (e.g., /students/123 should match /students)
        if (pathToCheck.startsWith(item.href + '/')) return true;
        return false;
    });
}

/**
 * Get the default dashboard route for a role
 */
export function getDefaultRoute(role: string): string {
    const normalizedRole = role?.toLowerCase() || '';
    if (['superadmin', 'admin', 'branchadmin'].includes(normalizedRole)) {
        return '/admin';
    }
    return '/dashboard';
}

/**
 * Permission definitions for specific actions
 */
export const rolePermissions = {
    admin: {
        canManageUsers: true,
        canManageBranches: true,
        canManageRoles: true,
        canViewAllStudents: true,
        canViewAllTeachers: true,
        canManageFinance: true,
        canManagePayroll: true,
        canViewAnalytics: true,
        canManageAdmissions: true,
        canManageLibrary: true,
        canManageHealth: true,
        canSendAnnouncements: true,
    },
    teacher: {
        canManageUsers: false,
        canManageBranches: false,
        canManageRoles: false,
        canViewAllStudents: false,
        canViewAllTeachers: false,
        canManageFinance: false,
        canManagePayroll: false,
        canViewAnalytics: false,
        canManageAdmissions: false,
        canManageLibrary: false,
        canManageHealth: false,
        canSendAnnouncements: false,
        // Teacher-specific
        canMarkAttendance: true,
        canEnterGrades: true,
        canUploadContent: true,
        canViewOwnStudents: true,
        canRequestLeave: true,
    },
    student: {
        canManageUsers: false,
        canManageBranches: false,
        canManageRoles: false,
        canViewAllStudents: false,
        canViewAllTeachers: false,
        canManageFinance: false,
        canManagePayroll: false,
        canViewAnalytics: false,
        canManageAdmissions: false,
        canManageLibrary: false,
        canManageHealth: false,
        canSendAnnouncements: false,
        // Student-specific
        canViewOwnGrades: true,
        canViewOwnAttendance: true,
        canSubmitAssignments: true,
        canViewOwnFees: true,
        canBorrowBooks: true,
    },
};

/**
 * Get permissions for a role
 */
export function getRolePermissions(role: string): Record<string, boolean> {
    const normalizedRole = role?.toLowerCase() || '';

    switch (normalizedRole) {
        case 'superadmin':
        case 'admin':
        case 'branchadmin':
            return rolePermissions.admin;
        case 'teacher':
            return rolePermissions.teacher;
        case 'student':
            return rolePermissions.student;
        case 'admission agent':
        case 'admission_agent':
            return {
                ...rolePermissions.student, // Base permissions
                canManageAdmissions: true,
                canViewAllStudents: true, // Needed to see students? Maybe restricted to admission view
            };
        default:
            return {};
    }
}
