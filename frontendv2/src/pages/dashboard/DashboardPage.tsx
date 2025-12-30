import React from 'react';
import { Navigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { TeacherDashboard } from './TeacherDashboard';
import { StudentDashboard } from './StudentDashboard';

export const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const roleName = user?.role?.name?.toLowerCase() || 'student';

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
            default:
                return <StudentDashboard />;
        }
    };

    return (
        <MainLayout>
            {renderDashboard()}
        </MainLayout>
    );
};
