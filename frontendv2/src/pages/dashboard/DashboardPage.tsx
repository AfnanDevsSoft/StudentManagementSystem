import React from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { AdminDashboard } from './AdminDashboard';
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
                return <AdminDashboard />;
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
