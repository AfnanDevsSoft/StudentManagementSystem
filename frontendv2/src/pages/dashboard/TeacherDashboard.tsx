import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { teacherService } from '../../services/teacher.service';
import { leaveService } from '../../services/leave.service';
import { workingDaysService } from '../../services/workingDays.service';
import { AttendanceSummaryCard } from '../../components/attendance/AttendanceSummaryCard';
import {
    BookOpen,
    Users,
    ClipboardCheck,
    FileText,
    Clock,
    Calendar,
    ChevronRight,
    AlertCircle,
    Loader2,
} from 'lucide-react';
import { TeacherProfileError } from '../../components/teacher/TeacherProfileError';

export const TeacherDashboard: React.FC = () => {
    const { user } = useAuth();
    const teacherId = user?.teacherId;

    // Fetch teacher's courses
    const { data: coursesData, isLoading: loadingCourses } = useQuery({
        queryKey: ['teacher-courses', teacherId],
        queryFn: () => teacherService.getCourses(teacherId!),
        enabled: !!teacherId,
    });

    // Fetch teacher's leave requests
    const { data: leaveData, isLoading: loadingLeave } = useQuery({
        queryKey: ['teacher-leaves', teacherId],
        queryFn: () => leaveService.getTeacherLeaves(teacherId!),
        enabled: !!teacherId,
    });

    // Fetch attendance summary
    const { data: attendanceSummaryData, isLoading: loadingAttendanceSummary } = useQuery({
        queryKey: ['teacher-attendance-summary', teacherId],
        queryFn: () => workingDaysService.getTeacherSummary(teacherId!),
        enabled: !!teacherId,
    });

    const isLoading = loadingCourses || loadingLeave || loadingAttendanceSummary;

    // Extract data
    const courses = coursesData?.data || coursesData || [];
    const leaveRequests = leaveData?.data || leaveData || [];

    // Calculate stats
    const totalClasses = Array.isArray(courses) ? courses.length : 0;
    const totalStudents = Array.isArray(courses)
        ? courses.reduce((sum: number, c: any) => sum + (c.enrollments?.length || c.students?.length || 0), 0)
        : 0;
    const pendingLeaveCount = Array.isArray(leaveRequests)
        ? leaveRequests.filter((l: any) => l.status === 'pending').length
        : 0;

    const classStats = [
        { name: 'My Classes', value: totalClasses, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
        { name: 'Total Students', value: totalStudents, icon: Users, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
        { name: 'Pending Leaves', value: pendingLeaveCount, icon: FileText, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
        { name: 'Active Courses', value: totalClasses, icon: Clock, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    ];



    // ... inside component ...
    if (!teacherId) {
        return <TeacherProfileError />;
    }

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">
                        Good Morning, {user?.first_name || 'Teacher'}!
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {totalClasses > 0
                            ? `You have ${totalClasses} classes with ${totalStudents} students`
                            : 'Here\'s your schedule and tasks for today'
                        }
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        View Full Schedule
                    </Button>
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Loading your data...</span>
                </div>
            )}

            {/* Stats Grid */}
            {!isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {classStats.map((stat) => (
                        <Card key={stat.name} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">{stat.name}</p>
                                        <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                                    </div>
                                    <div className={`p-3 rounded-xl ${stat.bg}`}>
                                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Attendance Summary Card */}
            {!isLoading && attendanceSummaryData?.success && attendanceSummaryData?.data && (
                <AttendanceSummaryCard
                    summary={attendanceSummaryData.data}
                    entityType="teacher"
                    showDetails={true}
                />
            )}

            {/* Main Content Grid */}
            {!isLoading && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* My Courses */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5" />
                                My Courses
                            </CardTitle>
                            <Button variant="ghost" size="sm" asChild>
                                <a href="/teacher/classes">
                                    View All <ChevronRight className="w-4 h-4 ml-1" />
                                </a>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {Array.isArray(courses) && courses.length > 0 ? (
                                <div className="space-y-3">
                                    {courses.slice(0, 4).map((course: any, index: number) => (
                                        <div
                                            key={course.id || index}
                                            className={`p-4 rounded-lg border ${index === 0
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border bg-muted/30'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-medium">
                                                        {course.course_name || course.name}
                                                    </h4>
                                                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                                        <span>{course.course_code || course.code}</span>
                                                        <span>
                                                            {course.enrollments?.length || course.students?.length || 0} students
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline">
                                                        <ClipboardCheck className="w-4 h-4 mr-1" />
                                                        Manage
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>No courses assigned yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Leave Requests */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                Recent Leave Requests
                            </CardTitle>
                            <Button variant="ghost" size="sm" asChild>
                                <a href="/teacher/leave">
                                    View All <ChevronRight className="w-4 h-4 ml-1" />
                                </a>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {Array.isArray(leaveRequests) && leaveRequests.length > 0 ? (
                                <div className="space-y-3">
                                    {leaveRequests.slice(0, 4).map((leave: any, index: number) => (
                                        <div
                                            key={leave.id || index}
                                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                                        >
                                            <div>
                                                <p className="font-medium">{leave.leave_type || leave.type}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {leave.start_date
                                                        ? new Date(leave.start_date).toLocaleDateString()
                                                        : 'N/A'
                                                    } - {leave.end_date
                                                        ? new Date(leave.end_date).toLocaleDateString()
                                                        : 'N/A'
                                                    }
                                                </p>
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded-full ${leave.status === 'approved'
                                                ? 'bg-green-100 text-green-600 dark:bg-green-900/30'
                                                : leave.status === 'rejected'
                                                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30'
                                                    : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30'
                                                }`}>
                                                {leave.status || 'Pending'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>No leave requests</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <a
                            href="/teacher/attendance"
                            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                        >
                            <ClipboardCheck className="w-8 h-8 text-blue-600" />
                            <span className="text-sm font-medium text-center">Mark Attendance</span>
                        </a>
                        <a
                            href="/teacher/grades"
                            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                        >
                            <FileText className="w-8 h-8 text-green-600" />
                            <span className="text-sm font-medium text-center">Enter Grades</span>
                        </a>
                        <a
                            href="/teacher/content"
                            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                        >
                            <BookOpen className="w-8 h-8 text-purple-600" />
                            <span className="text-sm font-medium text-center">Upload Content</span>
                        </a>
                        <a
                            href="/teacher/leave"
                            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                        >
                            <Calendar className="w-8 h-8 text-orange-600" />
                            <span className="text-sm font-medium text-center">Request Leave</span>
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
