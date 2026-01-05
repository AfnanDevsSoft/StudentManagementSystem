import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[]; // Array of allowed roles (e.g., ['admin', 'teacher'])
    requiredPermission?: string; // Optional: specific permission required for this route
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles, requiredPermission }) => {
    const { user, isAuthenticated, loading, hasPermission } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Permission-based access control (if requiredPermission is specified)
    if (requiredPermission) {
        if (!hasPermission(requiredPermission)) {
            return <Navigate to="/unauthorized" replace />;
        }
        // If permission check passes, allow access
        return <>{children}</>;
    }

    // Role-based access control
    if (allowedRoles && user?.role) {
        const userRole = user.role.name.toLowerCase();

        // SuperAdmin bypass - always has access
        if (userRole === 'superadmin') {
            return <>{children}</>;
        }

        // Check if user's role is in the allowed list
        const hasRoleAccess = allowedRoles.some(role => role.toLowerCase() === userRole);

        // If role is not in the list, check if user has any permissions at all
        // This allows custom roles with valid permissions to access routes
        if (!hasRoleAccess) {
            // Custom role check: user must have at least some permissions
            const hasAnyPermissions = user.permissions && user.permissions.length > 0;

            if (!hasAnyPermissions) {
                return <Navigate to="/unauthorized" replace />;
            }
            // Custom role with permissions - allow access
        }
    }

    return <>{children}</>;
};
