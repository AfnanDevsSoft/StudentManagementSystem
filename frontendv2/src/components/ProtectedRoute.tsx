import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[]; // Array of allowed roles (e.g., ['admin', 'teacher'])
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { user, isAuthenticated, loading } = useAuth();

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

    // Role-based access control
    if (allowedRoles && user?.role) {
        const userRole = user.role.name.toLowerCase();
        // Handle SuperAdmin having access to everything usually, or handle specific checks
        const hasAccess = allowedRoles.some(role => role.toLowerCase() === userRole) || userRole === 'superadmin';

        if (!hasAccess) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return <>{children}</>;
};
