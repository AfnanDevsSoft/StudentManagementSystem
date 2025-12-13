import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { TeacherProfileError } from '../../components/teacher/TeacherProfileError';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { teacherService } from '../../services/teacher.service';
import {
    BookOpen,
    Users,
    Clock,
    Calendar,
    ChevronRight,
    ClipboardCheck,
    FileText,
    Loader2,
    AlertCircle,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

export const TeacherClassesPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const teacherId = user?.teacherId;

    // Fetch teacher's courses
    const { data: coursesData, isLoading, error } = useQuery({
        queryKey: ['teacher-courses', teacherId],
        queryFn: () => teacherService.getCourses(teacherId!),
        enabled: !!teacherId,
    });

    const courses = coursesData?.data || coursesData || [];

    // Calculate stats
    const totalClasses = Array.isArray(courses) ? courses.length : 0;
    const totalStudents = Array.isArray(courses)
        ? courses.reduce((sum: number, c: any) => sum + (c.enrollments?.length || c.students?.length || 0), 0)
        : 0;

    if (!teacherId) {
        return <TeacherProfileError />;
    }

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">My Classes</h1>
                        <p className="text-muted-foreground mt-1">
                            {isLoading
                                ? 'Loading your classes...'
                                : `You are teaching ${totalClasses} classes this semester`
                            }
                        </p>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <span className="ml-2 text-muted-foreground">Loading classes...</span>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center py-12">
                        <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
                        <h2 className="text-xl font-semibold">Failed to load classes</h2>
                        <p className="text-muted-foreground mt-2">
                            {(error as Error).message || 'An error occurred while fetching your classes.'}
                        </p>
                    </div>
                )}

                {/* Content */}
                {!isLoading && !error && (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                                            <BookOpen className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Total Classes</p>
                                            <h3 className="text-2xl font-bold">{totalClasses}</h3>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
                                            <Users className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Total Students</p>
                                            <h3 className="text-2xl font-bold">{totalStudents}</h3>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                                            <FileText className="w-6 h-6 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Active Courses</p>
                                            <h3 className="text-2xl font-bold">{totalClasses}</h3>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                                            <Clock className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">This Semester</p>
                                            <h3 className="text-2xl font-bold">{totalClasses}</h3>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Classes Grid */}
                        {Array.isArray(courses) && courses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {courses.map((course: any, index: number) => (
                                    <Card key={course.id || index} className="hover:shadow-lg transition-shadow">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                                                    {course.course_code || course.code}
                                                </span>
                                                <span className="text-xs bg-green-100 text-green-600 dark:bg-green-900/30 px-2 py-1 rounded">
                                                    {course.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <CardTitle className="text-lg mt-2">
                                                {course.course_name || course.name}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Users className="w-4 h-4" />
                                                    <span>
                                                        {course.enrollments?.length || course.students?.length || 0} students
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{course.room_number || 'Room TBD'}</span>
                                                </div>
                                            </div>

                                            {course.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {course.description}
                                                </p>
                                            )}

                                            <div className="flex gap-2 pt-2">
                                                <Button
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() => navigate(`/teacher/attendance?courseId=${course.id}`)}
                                                >
                                                    <ClipboardCheck className="w-4 h-4 mr-1" />
                                                    Attendance
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex-1"
                                                    onClick={() => navigate(`/teacher/grades?courseId=${course.id}`)}
                                                >
                                                    <FileText className="w-4 h-4 mr-1" />
                                                    Grades
                                                </Button>

                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                                <h2 className="text-xl font-semibold">No Classes Assigned</h2>
                                <p className="text-muted-foreground mt-2">
                                    You don't have any classes assigned yet. Contact the administrator for class assignments.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </MainLayout>
    );
};
