import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { analyticsService } from '../../services/analytics.service';
import { studentService } from '../../services/student.service';
import { teacherService } from '../../services/teacher.service';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Users, GraduationCap, DollarSign, Activity } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
    // Fetch dashboard data from analytics API
    const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
        queryKey: ['analytics-dashboard'],
        queryFn: analyticsService.getDashboardStats,
        retry: false
    });

    // Also fetch student and teacher counts directly as backup
    const { data: studentsData } = useQuery({
        queryKey: ['students-analytics'],
        queryFn: () => studentService.getAll(),
        retry: false
    });

    const { data: teachersData } = useQuery({
        queryKey: ['teachers-analytics'],
        queryFn: () => teacherService.getAll(),
        retry: false
    });

    // Extract data from responses - handle nested structure
    const apiStats = dashboardData?.data || {};
    const studentsArray = Array.isArray(studentsData) ? studentsData : (studentsData as any)?.data || [];
    const teachersArray = Array.isArray(teachersData) ? teachersData : (teachersData as any)?.data || [];

    // Build stats object with real data, falling back to defaults if API fails
    const stats = {
        totalStudents: apiStats.totalStudents ?? (Array.isArray(studentsArray) ? studentsArray.length : 0),
        totalTeachers: apiStats.totalTeachers ?? (Array.isArray(teachersArray) ? teachersArray.length : 0),
        totalCourses: apiStats.totalCourses ?? 0,
        monthlyRevenue: apiStats.monthlyRevenue ?? 25000,
        attendanceRate: apiStats.attendanceRate ?? 92,
        avgGrade: apiStats.avgGrade ?? 85
    };

    // Use real attendance/revenue/grade data from API or defaults
    const attendanceData = apiStats.attendanceHistory || dashboardData?.attendanceHistory || [
        { name: 'Mon', present: 110, absent: 10 },
        { name: 'Tue', present: 115, absent: 5 },
        { name: 'Wed', present: 108, absent: 12 },
        { name: 'Thu', present: 112, absent: 8 },
        { name: 'Fri', present: 105, absent: 15 },
    ];

    const gradeData = apiStats.gradeDistribution || dashboardData?.gradeDistribution || [
        { name: 'A', count: 30 },
        { name: 'B', count: 45 },
        { name: 'C', count: 25 },
        { name: 'D', count: 15 },
        { name: 'F', count: 5 },
    ];

    const revenueData = apiStats.revenueHistory || dashboardData?.revenueHistory || [
        { name: 'Jan', income: 4000, expense: 2400 },
        { name: 'Feb', income: 3000, expense: 1398 },
        { name: 'Mar', income: 2000, expense: 9800 },
        { name: 'Apr', income: 2780, expense: 3908 },
        { name: 'May', income: 1890, expense: 4800 },
        { name: 'Jun', income: 2390, expense: 3800 },
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF0000'];

    if (dashboardLoading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">Loading analytics...</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Overview of school performance and metrics</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalStudents}</div>
                            <p className="text-xs text-muted-foreground">+2% from last month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg. Attendance</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
                            <p className="text-xs text-muted-foreground">+1% from last week</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg. Grade</CardTitle>
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.avgGrade}%</div>
                            <p className="text-xs text-muted-foreground">+4% from last term</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${stats.monthlyRevenue.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">+10% from last month</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Attendance Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Attendance Trends</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={attendanceData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Area type="monotone" dataKey="present" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                                        <Area type="monotone" dataKey="absent" stackId="1" stroke="#ff8042" fill="#ff8042" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Revenue Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Financial Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={revenueData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="income" fill="#8884d8" />
                                        <Bar dataKey="expense" fill="#82ca9d" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Grade Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Grade Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] flex justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={gradeData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="count"
                                        >
                                            {gradeData.map((_: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">New student admission</p>
                                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Fees collected from Grade 10</p>
                                        <p className="text-xs text-muted-foreground">5 hours ago</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Staff meeting scheduled</p>
                                        <p className="text-xs text-muted-foreground">Yesterday</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Server maintenance alert</p>
                                        <p className="text-xs text-muted-foreground">2 days ago</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
};
