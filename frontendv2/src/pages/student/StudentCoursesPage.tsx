import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { StudentProfileError } from '../../components/student/StudentProfileError';
import { studentService } from '../../services/student.service';
import {
    BookOpen,
    Clock,
    User,
    Calendar,
    FileText,
    Loader2,
    AlertCircle,
} from 'lucide-react';

export const StudentCoursesPage: React.FC = () => {
    const { user } = useAuth();
    const studentId = user?.studentId;

    // Fetch student enrollments (courses)
    const { data: enrollmentsData, isLoading, error } = useQuery({
        queryKey: ['student-enrollments', studentId],
        queryFn: () => studentService.getEnrollments(studentId!),
        enabled: !!studentId,
    });

    const enrollments = enrollmentsData?.data || enrollmentsData || [];

    if (!studentId) {
        return <StudentProfileError />;
    }

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">My Courses</h1>
                        <p className="text-muted-foreground mt-1">
                            {isLoading
                                ? 'Loading your courses...'
                                : `You are enrolled in ${Array.isArray(enrollments) ? enrollments.length : 0} courses this semester`
                            }
                        </p>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <span className="ml-2 text-muted-foreground">Loading courses...</span>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center py-12">
                        <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
                        <h2 className="text-xl font-semibold">Failed to load courses</h2>
                        <p className="text-muted-foreground mt-2">
                            {(error as Error).message || 'An error occurred while fetching your courses.'}
                        </p>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && (!Array.isArray(enrollments) || enrollments.length === 0) && (
                    <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <h2 className="text-xl font-semibold">No Courses Enrolled</h2>
                        <p className="text-muted-foreground mt-2">
                            You are not enrolled in any courses yet. Contact your administrator for course enrollment.
                        </p>
                    </div>
                )}

                {/* Courses Grid */}
                {!isLoading && !error && Array.isArray(enrollments) && enrollments.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {enrollments.map((enrollment: any, index: number) => {
                            const course = enrollment.course || enrollment;
                            const teacher = course.teacher || {};

                            return (
                                <Card key={enrollment.id || index} className="hover:shadow-lg transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                                                {course.code || course.course_code || 'COURSE'}
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded ${enrollment.status === 'active' || enrollment.status === 'enrolled'
                                                ? 'bg-green-100 text-green-600 dark:bg-green-900/30'
                                                : 'bg-gray-100 text-gray-600 dark:bg-gray-900/30'
                                                }`}>
                                                {enrollment.status || 'Enrolled'}
                                            </span>
                                        </div>
                                        <CardTitle className="text-lg mt-2">
                                            {course.name || course.course_name || 'Course Name'}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Teacher */}
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <User className="w-4 h-4" />
                                            <span>
                                                {teacher.first_name && teacher.last_name
                                                    ? `${teacher.first_name} ${teacher.last_name}`
                                                    : 'Faculty TBD'
                                                }
                                            </span>
                                        </div>

                                        {/* Schedule */}
                                        {course.schedule && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="w-4 h-4" />
                                                <span>{course.schedule}</span>
                                            </div>
                                        )}

                                        {/* Credits */}
                                        {course.credits && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Clock className="w-4 h-4" />
                                                <span>{course.credits} Credits</span>
                                            </div>
                                        )}

                                        {/* Description */}
                                        {course.description && (
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {course.description}
                                            </p>
                                        )}

                                        {/* Enrollment Date */}
                                        {enrollment.enrolled_at && (
                                            <p className="text-xs text-muted-foreground">
                                                Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                                            </p>
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-2">
                                            <Button size="sm" className="flex-1" disabled>
                                                <BookOpen className="w-4 h-4 mr-1" />
                                                Materials
                                            </Button>
                                            <Button size="sm" variant="outline" className="flex-1" disabled>
                                                <FileText className="w-4 h-4 mr-1" />
                                                Assignments
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </MainLayout>
    );
};
