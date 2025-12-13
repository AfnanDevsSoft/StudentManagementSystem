import React, { useMemo } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { FileText, Clock, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { StudentProfileError } from '../../components/student/StudentProfileError';
import { studentService } from '../../services/student.service';
import { assignmentService } from '../../services/assignment.service';

export const StudentAssignmentsPage: React.FC = () => {
    const { user } = useAuth();
    const studentId = user?.studentId;

    // 1. Fetch Enrollments
    const { data: enrollmentsData, isLoading: loadingEnrollments } = useQuery({
        queryKey: ['student-enrollments', studentId],
        queryFn: () => studentService.getEnrollments(studentId!),
        enabled: !!studentId,
    });

    const enrollments = useMemo(() => {
        if (!enrollmentsData) return [];
        return Array.isArray(enrollmentsData) ? enrollmentsData : (Array.isArray(enrollmentsData?.data) ? enrollmentsData.data : []);
    }, [enrollmentsData]);

    // 2. Fetch Assignments for each enrolled course
    const assignmentQueries = useQueries({
        queries: enrollments.map((enrollment: any) => ({
            queryKey: ['course-assignments', enrollment.course_id],
            queryFn: async () => {
                const res = await assignmentService.getByCourse(enrollment.course_id);
                // Attach course code/name to assignment for display
                const assignments = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
                return assignments.map((a: any) => ({
                    ...a,
                    courseName: enrollment.course?.name || enrollment.course_name || 'Unknown Course',
                    courseCode: enrollment.course?.code || enrollment.course_code || ''
                }));
            },
            enabled: !!enrollment.course_id,
        }))
    });

    const loadingAssignments = assignmentQueries.some(q => q.isLoading);

    // Flatten assignments
    const assignments = useMemo(() => {
        return assignmentQueries.flatMap(q => q.data || []);
    }, [assignmentQueries]);

    if (!studentId) {
        return <StudentProfileError />;
    }

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Assignments</h1>
                        <p className="text-muted-foreground mt-1">
                            View your course assignments
                        </p>
                    </div>
                </div>

                {loadingEnrollments || loadingAssignments ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : assignments.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                        {assignments.map((assignment: any) => (
                            <Card key={assignment.id}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl font-semibold">
                                            {assignment.title}
                                        </CardTitle>
                                        <div className="text-sm text-muted-foreground">
                                            {assignment.courseCode} - {assignment.courseName}
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-medium 
                                        ${assignment.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {assignment.status?.toUpperCase() || 'UNKNOWN'}
                                    </span>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center text-sm text-muted-foreground gap-4">
                                            <div className="flex items-center gap-1">
                                                <FileText className="w-4 h-4" />
                                                <span>Max Score: {assignment.max_score}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        <p className="text-sm">{assignment.description || 'No description provided.'}</p>

                                        <div className="flex justify-end">
                                            <Button>View Details</Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        No assignments found for your courses.
                    </div>
                )}
            </div>
        </MainLayout>
    );
};
