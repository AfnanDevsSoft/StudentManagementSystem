import React from 'react';
import { Navigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { TeacherDashboard } from './TeacherDashboard';
import { StudentDashboard } from './StudentDashboard';

export const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const roleName = user?.role?.name?.toLowerCase() || 'student';

    // Check if user has any permissions (indicates a custom role with RBAC access)
    const hasPermissions = user?.permissions && user.permissions.length > 0;

    // Route to role-specific dashboard
    const renderDashboard = () => {
        switch (roleName) {
            case 'superadmin':
            case 'admin':
            case 'branchadmin':
                return <Navigate to="/admin" replace />;
            case 'teacher':
                return <TeacherDashboard />;
            case 'student':
                return <StudentDashboard />;
            default:
                // Custom role - if user has permissions, treat as admin-like role
                // Otherwise, show a helpful message
                if (hasPermissions) {
                    return <Navigate to="/admin" replace />;
                }
                // Fallback for users without permissions configured
                return <StudentDashboard />;
        }
    };

    return (
        <MainLayout>
            {renderDashboard()}
        </MainLayout>
    );
};
