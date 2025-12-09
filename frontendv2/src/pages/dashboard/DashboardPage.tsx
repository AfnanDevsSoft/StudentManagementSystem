import React from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card } from '../../components/ui/card';
import {
    Users,
    GraduationCap,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Calendar,
    Bell,
    Award,
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const stats = [
    {
        name: 'Total Students',
        value: '2,543',
        change: '+12.5%',
        trend: 'up',
        icon: GraduationCap,
        color: 'from-blue-500 to-blue-600',
    },
    {
        name: 'Total Teachers',
        value: '142',
        change: '+3.2%',
        trend: 'up',
        icon: Users,
        color: 'from-purple-500 to-purple-600',
    },
    {
        name: 'Monthly Revenue',
        value: '$124,500',
        change: '+8.1%',
        trend: 'up',
        icon: DollarSign,
        color: 'from-green-500 to-green-600',
    },
    {
        name: 'Attendance Rate',
        value: '94.2%',
        change: '-1.3%',
        trend: 'down',
        icon: Award,
        color: 'from-orange-500 to-orange-600',
    },
];

const enrollmentData = [
    { month: 'Jan', students: 2100 },
    { month: 'Feb', students: 2200 },
    { month: 'Mar', students: 2300 },
    { month: 'Apr', students: 2400 },
    { month: 'May', students: 2450 },
    { month: 'Jun', students: 2543 },
];

const attendanceData = [
    { day: 'Mon', rate: 95 },
    { day: 'Tue', rate: 93 },
    { day: 'Wed', rate: 96 },
    { day: 'Thu', rate: 94 },
    { day: 'Fri', rate: 92 },
];

const gradeDistribution = [
    { name: 'A', value: 30, color: '#10b981' },
    { name: 'B', value: 35, color: '#3b82f6' },
    { name: 'C', value: 25, color: '#f59e0b' },
    { name: 'D', value: 8, color: '#ef4444' },
    { name: 'F', value: 2, color: '#6b7280' },
];

const recentActivities = [
    { id: 1, type: 'admission', message: 'New admission application from John Doe', time: '5 min ago' },
    { id: 2, type: 'payment', message: 'Fee payment received from Sarah Smith', time: '15 min ago' },
    { id: 3, type: 'grade', message: 'Grades published for Mathematics - Grade 10', time: '1 hour ago' },
    { id: 4, type: 'event', message: 'Parent-Teacher meeting scheduled for next week', time: '2 hours ago' },
];

const upcomingEvents = [
    { id: 1, title: 'Parent-Teacher Meeting', date: 'Dec 15, 2024', time: '10:00 AM' },
    { id: 2, title: 'Annual Sports Day', date: 'Dec 20, 2024', time: '9:00 AM' },
    { id: 3, title: 'Winter Break Starts', date: 'Dec 22, 2024', time: 'All Day' },
];

export const DashboardPage: React.FC = () => {
    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening today.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat) => (
                        <Card key={stat.name} className="p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{stat.name}</p>
                                    <h3 className="text-2xl font-bold mt-2">{stat.value}</h3>
                                    <div className="flex items-center mt-2 space-x-1">
                                        {stat.trend === 'up' ? (
                                            <TrendingUp className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <TrendingDown className="w-4 h-4 text-red-500" />
                                        )}
                                        <span className={`text-sm ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                                            {stat.change}
                                        </span>
                                        <span className="text-sm text-muted-foreground">vs last month</span>
                                    </div>
                                </div>
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Enrollment Trend */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Student Enrollment Trend</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={enrollmentData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                                <YAxis stroke="hsl(var(--muted-foreground))" />
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                                <Line type="monotone" dataKey="students" stroke="hsl(var(--primary))" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>

                    {/* Attendance Rate */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Weekly Attendance Rate</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={attendanceData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                                <YAxis stroke="hsl(var(--muted-foreground))" />
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                                <Bar dataKey="rate" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Grade Distribution */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Grade Distribution</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={gradeDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {gradeDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap gap-3 mt-4">
                            {gradeDistribution.map((grade) => (
                                <div key={grade.name} className="flex items-center space-x-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: grade.color }}></div>
                                    <span className="text-sm">Grade {grade.name}: {grade.value}%</span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Recent Activity */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Recent Activity</h3>
                            <Bell className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="space-y-4">
                            {recentActivities.map((activity) => (
                                <div key={activity.id} className="flex items-start space-x-3">
                                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                                    <div className="flex-1">
                                        <p className="text-sm">{activity.message}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Upcoming Events */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Upcoming Events</h3>
                            <Calendar className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="space-y-4">
                            {upcomingEvents.map((event) => (
                                <div key={event.id} className="border-l-2 border-primary pl-3">
                                    <h4 className="font-medium text-sm">{event.title}</h4>
                                    <p className="text-xs text-muted-foreground mt-1">{event.date} • {event.time}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
};
