import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { studentService } from '../../services/student.service';
import { workingDaysService } from '../../services/workingDays.service';
import { AttendanceSummaryCard } from '../../components/attendance/AttendanceSummaryCard';
import {
    BookOpen,
    ClipboardCheck,
    FileText,
    Award,
    DollarSign,
    Bell,
    ChevronRight,
    TrendingUp,
    AlertCircle,
    Loader2,
} from 'lucide-react';
import { StudentProfileError } from '../../components/student/StudentProfileError';

export const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const studentId = user?.studentId;

    // Fetch student enrollments (courses)
    const { data: enrollmentsData, isLoading: loadingEnrollments } = useQuery({
        queryKey: ['student-enrollments', studentId],
        queryFn: () => studentService.getEnrollments(studentId!),
        enabled: !!studentId,
    });

    // Fetch student grades
    const { data: gradesData, isLoading: loadingGrades } = useQuery({
        queryKey: ['student-grades', studentId],
        queryFn: () => studentService.getGrades(studentId!),
        enabled: !!studentId,
    });

    // Fetch student attendance
    const { data: attendanceData, isLoading: loadingAttendance } = useQuery({
        queryKey: ['student-attendance', studentId],
        queryFn: () => studentService.getAttendance(studentId!),
        enabled: !!studentId,
    });

    // Fetch student fees
    const { data: feesData, isLoading: loadingFees } = useQuery({
        queryKey: ['student-fees', studentId],
        queryFn: () => studentService.getFees(studentId!),
        enabled: !!studentId,
    });

    // Fetch attendance summary
    const { data: attendanceSummaryData, isLoading: loadingAttendanceSummary } = useQuery({
        queryKey: ['student-attendance-summary', studentId],
        queryFn: () => workingDaysService.getStudentSummary(studentId!),
        enabled: !!studentId,
    });

    const isLoading = loadingEnrollments || loadingGrades || loadingAttendance || loadingFees || loadingAttendanceSummary;

    // Extract data
    const enrollments = enrollmentsData?.data || enrollmentsData || [];
    const grades = gradesData?.data || gradesData || [];
    const attendanceRecords = attendanceData?.data || attendanceData || [];
    const fees = feesData?.data || feesData || {};

    // Calculate stats
    const totalCourses = Array.isArray(enrollments) ? enrollments.length : 0;
    const attendanceCount = Array.isArray(attendanceRecords) ? attendanceRecords.length : 0;
    const presentCount = Array.isArray(attendanceRecords)
        ? attendanceRecords.filter((a: any) => a.status === 'present' || a.status === 'Present').length
        : 0;
    const attendanceRate = attendanceCount > 0 ? Math.round((presentCount / attendanceCount) * 100) : 100;

    // Calculate GPA from grades
    const gradePoints: Record<string, number> = { 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'D': 1.0, 'F': 0 };
    const validGrades = Array.isArray(grades) ? grades.filter((g: any) => g.grade) : [];
    const totalGradePoints = validGrades.reduce((sum: number, g: any) => {
        const points = gradePoints[g.grade] || parseFloat(g.grade) || 0;
        return sum + points;
    }, 0);
    const gpa = validGrades.length > 0 ? (totalGradePoints / validGrades.length).toFixed(2) : '0.00';

    // Fee calculations
    const pendingFees = fees?.outstanding || fees?.pending_amount || 0;

    const studentStats = [
        { name: 'Attendance', value: `${attendanceRate}%`, icon: ClipboardCheck, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
        { name: 'Current GPA', value: gpa, icon: Award, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
        { name: 'Courses', value: totalCourses, icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
        { name: 'Pending Fees', value: `$${pendingFees.toLocaleString()}`, icon: DollarSign, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
    ];

    // Notifications would come from a notifications API - for now show empty state
    // This can be connected to the notifications endpoint when ready
    const notifications: any[] = [];

    if (!studentId) {
        return <StudentProfileError />;
    }

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Welcome back, {user?.first_name || 'Student'}!
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {totalCourses > 0
                                ? `You are enrolled in ${totalCourses} courses this semester`
                                : 'Check your dashboard for updates'
                            }
                        </p>
                    </div>
                    <div className="hidden md:block">
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Today's Date</p>
                            <p className="text-lg font-semibold">
                                {new Date().toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {studentStats.map((stat) => (
                        <Card key={stat.name} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${stat.bg}`}>
                                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">{stat.name}</p>
                                        <h3 className="text-xl font-bold">{stat.value}</h3>
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
                    entityType="student"
                    showDetails={true}
                />
            )}

            {/* Main Content Grid */}
            {!isLoading && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Enrolled Courses */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5" />
                                My Courses
                            </CardTitle>
                            <Button variant="ghost" size="sm" asChild>
                                <a href="/student/courses">
                                    View All <ChevronRight className="w-4 h-4 ml-1" />
                                </a>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {Array.isArray(enrollments) && enrollments.length > 0 ? (
                                <div className="space-y-3">
                                    {enrollments.slice(0, 4).map((enrollment: any, index: number) => {
                                        const course = enrollment.course || enrollment;
                                        return (
                                            <div
                                                key={enrollment.id || index}
                                                className={`flex items-center gap-4 p-3 rounded-lg ${index === 0
                                                    ? 'bg-primary/10 border border-primary/20'
                                                    : 'bg-muted/50'
                                                    }`}
                                            >
                                                <div className="flex-1">
                                                    <h4 className="font-medium">{course.name || course.course_name}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {course.code || course.course_code} • {course.teacher?.first_name} {course.teacher?.last_name || 'Faculty'}
                                                    </p>
                                                </div>
                                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded dark:bg-green-900/30 dark:text-green-400">
                                                    {enrollment.status || 'Enrolled'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>No courses enrolled yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Notifications */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="w-5 h-5" />
                                Notifications
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {notifications.length > 0 ? (
                                <div className="space-y-3">
                                    {notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                        >
                                            <div className={`p-2 rounded-full ${notif.type === 'assignment' ? 'bg-blue-100 text-blue-600' :
                                                notif.type === 'grade' ? 'bg-green-100 text-green-600' :
                                                    'bg-orange-100 text-orange-600'
                                                }`}>
                                                {notif.type === 'assignment' && <FileText className="w-3 h-3" />}
                                                {notif.type === 'grade' && <Award className="w-3 h-3" />}
                                                {notif.type === 'fee' && <DollarSign className="w-3 h-3" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm">{notif.message}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-muted-foreground">
                                    <Bell className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No new notifications</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Recent Grades */}
            {!isLoading && Array.isArray(grades) && grades.length > 0 && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Award className="w-5 h-5" />
                            Recent Grades
                        </CardTitle>
                        <Button variant="outline" size="sm" asChild>
                            <a href="/student/grades">View All Grades</a>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {grades.slice(0, 3).map((grade: any, index: number) => (
                                <div
                                    key={grade.id || index}
                                    className="p-4 rounded-lg border bg-card"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                                            {grade.course?.name || grade.course_name || 'Course'}
                                        </span>
                                        <span className="text-xs text-green-600 flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3" />
                                            {grade.grade || grade.score || 'N/A'}
                                        </span>
                                    </div>
                                    <h4 className="font-medium">{grade.assessment_type || grade.type || 'Assessment'}</h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Score: {grade.score || grade.marks || 'N/A'}/{grade.max_score || grade.total_marks || 100}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Quick Access */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <a
                    href="/student/courses"
                    className="flex flex-col items-center gap-2 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                    <BookOpen className="w-8 h-8 text-blue-600" />
                    <span className="text-sm font-medium">My Courses</span>
                </a>
                <a
                    href="/student/grades"
                    className="flex flex-col items-center gap-2 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                >
                    <Award className="w-8 h-8 text-green-600" />
                    <span className="text-sm font-medium">My Grades</span>
                </a>
                <a
                    href="/student/attendance"
                    className="flex flex-col items-center gap-2 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                >
                    <ClipboardCheck className="w-8 h-8 text-purple-600" />
                    <span className="text-sm font-medium">My Attendance</span>
                </a>
                <a
                    href="/student/fees"
                    className="flex flex-col items-center gap-2 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                >
                    <DollarSign className="w-8 h-8 text-orange-600" />
                    <span className="text-sm font-medium">Fee Status</span>
                </a>
            </div>
        </div>
    );
};
