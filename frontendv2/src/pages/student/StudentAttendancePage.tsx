import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuth } from '../../contexts/AuthContext';
import { StudentProfileError } from '../../components/student/StudentProfileError';
import { studentService } from '../../services/student.service';
import {
    ClipboardCheck,
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
    TrendingUp,
    AlertCircle,
    Loader2,
} from 'lucide-react';

export const StudentAttendancePage: React.FC = () => {
    const { user } = useAuth();
    const studentId = user?.studentId;
    const [selectedMonth] = useState('December 2024');

    // Fetch student attendance
    const { data: attendanceData, isLoading, error } = useQuery({
        queryKey: ['student-attendance', studentId],
        queryFn: () => studentService.getAttendance(studentId!),
        enabled: !!studentId,
    });

    const attendanceRecords = attendanceData?.data || attendanceData || [];

    // Calculate attendance stats
    const records = Array.isArray(attendanceRecords) ? attendanceRecords : [];
    const totalRecords = records.length;
    const presentCount = records.filter((a: any) =>
        a.status?.toLowerCase() === 'present' || a.status === 'P'
    ).length;
    const absentCount = records.filter((a: any) =>
        a.status?.toLowerCase() === 'absent' || a.status === 'A'
    ).length;
    const lateCount = records.filter((a: any) =>
        a.status?.toLowerCase() === 'late' || a.status === 'L'
    ).length;
    const attendancePercentage = totalRecords > 0
        ? ((presentCount / totalRecords) * 100).toFixed(1)
        : '100.0';

    // Group attendance by course
    const courseAttendance = records.reduce((acc: any, record: any) => {
        const courseName = record.course?.name || record.course_name || 'General';
        if (!acc[courseName]) {
            acc[courseName] = { present: 0, total: 0 };
        }
        acc[courseName].total++;
        if (record.status?.toLowerCase() === 'present' || record.status === 'P') {
            acc[courseName].present++;
        }
        return acc;
    }, {});

    const getStatusIcon = (status: string) => {
        const lower = status?.toLowerCase() || '';
        if (lower === 'present' || status === 'P') {
            return <CheckCircle className="w-4 h-4 text-green-500" />;
        }
        if (lower === 'absent' || status === 'A') {
            return <XCircle className="w-4 h-4 text-red-500" />;
        }
        if (lower === 'late' || status === 'L') {
            return <Clock className="w-4 h-4 text-yellow-500" />;
        }
        return null;
    };

    const getStatusColor = (status: string) => {
        const lower = status?.toLowerCase() || '';
        if (lower === 'present' || status === 'P') {
            return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        }
        if (lower === 'absent' || status === 'A') {
            return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        }
        if (lower === 'late' || status === 'L') {
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        }
        return '';
    };

    const formatStatus = (status: string) => {
        const lower = status?.toLowerCase() || '';
        if (lower === 'present' || status === 'P') return 'Present';
        if (lower === 'absent' || status === 'A') return 'Absent';
        if (lower === 'late' || status === 'L') return 'Late';
        return status;
    };

    if (!studentId) {
        return <StudentProfileError />;
    }

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">My Attendance</h1>
                        <p className="text-muted-foreground mt-1">
                            Track your attendance records across all courses
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{selectedMonth}</span>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <span className="ml-2 text-muted-foreground">Loading attendance...</span>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center py-12">
                        <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
                        <h2 className="text-xl font-semibold">Failed to load attendance</h2>
                        <p className="text-muted-foreground mt-2">
                            {(error as Error).message || 'An error occurred while fetching your attendance.'}
                        </p>
                    </div>
                )}

                {/* Content */}
                {!isLoading && !error && (
                    <>
                        {/* Overall Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Attendance Rate</p>
                                            <h3 className="text-3xl font-bold mt-1">{attendancePercentage}%</h3>
                                            <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                                                <TrendingUp className="w-3 h-3" />
                                                {parseFloat(attendancePercentage) >= 75 ? 'Good Standing' : 'Needs Improvement'}
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
                                            <ClipboardCheck className="w-6 h-6 text-green-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Present</p>
                                            <h3 className="text-3xl font-bold mt-1 text-green-600">{presentCount}</h3>
                                        </div>
                                        <CheckCircle className="w-10 h-10 text-green-500 opacity-50" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Absent</p>
                                            <h3 className="text-3xl font-bold mt-1 text-red-600">{absentCount}</h3>
                                        </div>
                                        <XCircle className="w-10 h-10 text-red-500 opacity-50" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Late</p>
                                            <h3 className="text-3xl font-bold mt-1 text-yellow-600">{lateCount}</h3>
                                        </div>
                                        <Clock className="w-10 h-10 text-yellow-500 opacity-50" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Content */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Recent Attendance */}
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="w-5 h-5" />
                                        Attendance Records
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {records.length > 0 ? (
                                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                            {records.slice(0, 20).map((record: any, index: number) => (
                                                <div
                                                    key={record.id || index}
                                                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-center min-w-[50px]">
                                                            <p className="text-xs text-muted-foreground">
                                                                {record.date
                                                                    ? new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' })
                                                                    : '-'
                                                                }
                                                            </p>
                                                            <p className="font-medium">
                                                                {record.date
                                                                    ? new Date(record.date).getDate()
                                                                    : '-'
                                                                }
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">
                                                                {record.course?.name || record.course_name || 'Class'}
                                                            </p>
                                                            {record.period && (
                                                                <p className="text-xs text-muted-foreground">
                                                                    Period: {record.period}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(record.status)}
                                                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(record.status)}`}>
                                                            {formatStatus(record.status)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <ClipboardCheck className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                            <p>No attendance records found</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Course-wise Attendance */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>By Course</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {Object.keys(courseAttendance).length > 0 ? (
                                        <div className="space-y-4">
                                            {Object.entries(courseAttendance).map(([course, data]: [string, any]) => {
                                                const percentage = data.total > 0
                                                    ? Math.round((data.present / data.total) * 100)
                                                    : 0;
                                                return (
                                                    <div key={course} className="space-y-2">
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="font-medium truncate">{course}</span>
                                                            <span className={`${percentage >= 90 ? 'text-green-600' :
                                                                percentage >= 75 ? 'text-yellow-600' :
                                                                    'text-red-600'
                                                                }`}>
                                                                {percentage}%
                                                            </span>
                                                        </div>
                                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${percentage >= 90 ? 'bg-green-500' :
                                                                    percentage >= 75 ? 'bg-yellow-500' :
                                                                        'bg-red-500'
                                                                    }`}
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            {data.present} / {data.total} classes
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <p>No course data available</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Alert if attendance is low */}
                        {parseFloat(attendancePercentage) < 75 && totalRecords > 0 && (
                            <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="w-6 h-6 text-red-600" />
                                        <div>
                                            <h4 className="font-medium text-red-800 dark:text-red-400">Attendance Warning</h4>
                                            <p className="text-sm text-red-600">
                                                Your attendance is below the required 75% threshold. Please improve your attendance to avoid academic penalties.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </div>
        </MainLayout>
    );
};
