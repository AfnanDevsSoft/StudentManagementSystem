import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { analyticsService } from '../../services/analytics.service';
import { studentService } from '../../services/student.service';
import { teacherService } from '../../services/teacher.service';
import {
    Users,
    GraduationCap,
    DollarSign,
    TrendingUp,
    UserPlus,
    ClipboardCheck,
    AlertCircle,
    Building2,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
    // Fetch analytics data
    const { data: analyticsData } = useQuery({
        queryKey: ['analytics-overview'],
        queryFn: () => analyticsService.getOverview(),
    });

    const { data: studentsData } = useQuery({
        queryKey: ['students-count'],
        queryFn: () => studentService.getAll(),
    });

    const { data: teachersData } = useQuery({
        queryKey: ['teachers-count'],
        queryFn: () => teacherService.getAll(),
    });

    const stats = analyticsData?.data || analyticsData || {};
    const students = (studentsData as any)?.data || studentsData || [];
    const teachers = (teachersData as any)?.data || teachersData || [];

    const dashboardStats = [
        {
            title: 'Total Students',
            value: Array.isArray(students) ? students.length : stats.totalStudents || 0,
            icon: GraduationCap,
            color: 'text-blue-500',
            bgColor: 'bg-blue-100 dark:bg-blue-900/30',
            change: '+12%',
            changeType: 'positive' as const,
        },
        {
            title: 'Total Teachers',
            value: Array.isArray(teachers) ? teachers.length : stats.totalTeachers || 0,
            icon: Users,
            color: 'text-green-500',
            bgColor: 'bg-green-100 dark:bg-green-900/30',
            change: '+3%',
            changeType: 'positive' as const,
        },
        {
            title: 'Revenue This Month',
            value: `$${(stats.monthlyRevenue || 125000).toLocaleString()}`,
            icon: DollarSign,
            color: 'text-emerald-500',
            bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
            change: '+8%',
            changeType: 'positive' as const,
        },
        {
            title: 'Attendance Rate',
            value: `${stats.attendanceRate || 94}%`,
            icon: ClipboardCheck,
            color: 'text-purple-500',
            bgColor: 'bg-purple-100 dark:bg-purple-900/30',
            change: '+2%',
            changeType: 'positive' as const,
        },
    ];

    // Recent activities would come from an activities/audit API
    // For now, show empty state - could be connected to notifications or audit logs endpoint
    const recentActivities: any[] = [];

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Overview of your school management system
                    </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Building2 className="w-4 h-4" />
                    <span>All Branches</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {dashboardStats.map((stat) => (
                    <Card key={stat.title} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                                    <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                                    <p className={`text-sm mt-1 ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {stat.change} from last month
                                    </p>
                                </div>
                                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activities */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Recent Activities
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentActivities.length > 0 ? (
                            <div className="space-y-4">
                                {recentActivities.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${activity.type === 'admission' ? 'bg-blue-100 text-blue-600' :
                                                activity.type === 'payment' ? 'bg-green-100 text-green-600' :
                                                    activity.type === 'leave' ? 'bg-yellow-100 text-yellow-600' :
                                                        'bg-red-100 text-red-600'
                                                }`}>
                                                {activity.type === 'admission' && <UserPlus className="w-4 h-4" />}
                                                {activity.type === 'payment' && <DollarSign className="w-4 h-4" />}
                                                {activity.type === 'leave' && <ClipboardCheck className="w-4 h-4" />}
                                                {activity.type === 'alert' && <AlertCircle className="w-4 h-4" />}
                                            </div>
                                            <span className="text-sm">{activity.message}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No recent activities</p>
                                <p className="text-xs mt-1">System activity will appear here</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <a
                            href="/students"
                            className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                        >
                            <GraduationCap className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-medium">Add New Student</span>
                        </a>
                        <a
                            href="/teachers"
                            className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                        >
                            <Users className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium">Add New Teacher</span>
                        </a>
                        <a
                            href="/finance"
                            className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                        >
                            <DollarSign className="w-5 h-5 text-emerald-600" />
                            <span className="text-sm font-medium">View Fee Collection</span>
                        </a>
                        <a
                            href="/analytics"
                            className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                        >
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                            <span className="text-sm font-medium">View Analytics</span>
                        </a>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
