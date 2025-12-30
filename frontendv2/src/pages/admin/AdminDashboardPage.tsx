import React from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { AdminDashboard } from '../dashboard/AdminDashboard';

export const AdminDashboardPage: React.FC = () => {
    return (
        <AdminLayout>
            <AdminDashboard />
        </AdminLayout>
    );
};
