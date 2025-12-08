"use client";

import { useAuthStore } from "@/stores/authStore";
import { canAccess } from "@/lib/rbac";
import { ReactNode } from "react";

interface PermissionGuardProps {
    permission: string;
    children: ReactNode;
    fallback?: ReactNode;
    requireAll?: boolean; // If true, user must have ALL permissions
}

/**
 * PermissionGuard Component
 * 
 * Conditionally renders children based on user permissions.
 * 
 * @example
 * <PermissionGuard permission="manage_students">
 *   <CreateStudentButton />
 * </PermissionGuard>
 * 
 * @example Multiple permissions (any)
 * <PermissionGuard permission="manage_students,view_students">
 *   <StudentList />
 * </PermissionGuard>
 * 
 * @example Multiple permissions (all required)
 * <PermissionGuard permission="manage_students,manage_courses" requireAll>
 *   <AdminPanel />
 * </PermissionGuard>
 */
export default function PermissionGuard({
    permission,
    children,
    fallback = null,
    requireAll = false,
}: PermissionGuardProps) {
    const { user } = useAuthStore();

    if (!user) {
        return <>{fallback}</>;
    }

    // Handle multiple permissions (comma-separated)
    const permissions = permission.split(",").map((p) => p.trim());

    let hasPermission = false;

    if (requireAll) {
        // User must have ALL permissions
        hasPermission = permissions.every((perm) => canAccess(user, perm));
    } else {
        // User must have ANY permission
        hasPermission = permissions.some((perm) => canAccess(user, perm));
    }

    return hasPermission ? <>{children}</> : <>{fallback}</>;
}

/**
 * Hook version for conditional logic
 * 
 * @example
 * const canManageStudents = usePermission("manage_students");
 * 
 * if (canManageStudents) {
 *   // Show admin features
 * }
 */
export function usePermission(permission: string): boolean {
    const { user } = useAuthStore();

    if (!user) return false;

    return canAccess(user, permission);
}

/**
 * Multiple permissions hook
 * 
 * @example
 * const { canManage, canView } = usePermissions({
 *   canManage: "manage_students",
 *   canView: "view_students"
 * });
 */
export function usePermissions<T extends Record<string, string>>(
    permissions: T
): Record<keyof T, boolean> {
    const { user } = useAuthStore();

    if (!user) {
        return Object.keys(permissions).reduce((acc, key) => {
            acc[key as keyof T] = false;
            return acc;
        }, {} as Record<keyof T, boolean>);
    }

    return Object.entries(permissions).reduce((acc, [key, perm]) => {
        acc[key as keyof T] = canAccess(user, perm as string);
        return acc;
    }, {} as Record<keyof T, boolean>);
}
