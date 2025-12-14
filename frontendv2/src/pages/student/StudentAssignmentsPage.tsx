import React, { useMemo, useState } from 'react';
import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { FileText, Clock, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { StudentProfileError } from '../../components/student/StudentProfileError';
import { studentService } from '../../services/student.service';
import { assignmentService } from '../../services/assignment.service';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';

export const StudentAssignmentsPage: React.FC = () => {
    const { user } = useAuth();
    const studentId = user?.studentId;
    const queryClient = useQueryClient();

    const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
    const [submissionUrl, setSubmissionUrl] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const submitMutation = useMutation({
        mutationFn: (data: any) => assignmentService.submitAssignment(selectedAssignment.id, data),
        onSuccess: () => {
            toast.success('Assignment submitted successfully');
            setIsDialogOpen(false);
            setSubmissionUrl('');
            queryClient.invalidateQueries({ queryKey: ['course-assignments'] });
        },
        onError: (err: any) => {
            toast.error(err.message || 'Failed to submit');
        }
    });

    const handleViewDetails = (assignment: any) => {
        setSelectedAssignment(assignment);
        setIsDialogOpen(true);
        setSubmissionUrl('');
    };

    const handleSubmit = () => {
        if (!submissionUrl) {
            toast.error('Please enter a URL');
            return;
        }
        submitMutation.mutate({ content_url: submissionUrl });
    };

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
                const res = await assignmentService.getStudentAssignments(enrollment.course_id);
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
                                    {(() => {
                                        const isSubmitted = assignment.submissions && assignment.submissions.length > 0;
                                        return (
                                            <span className={`px-2 py-1 rounded text-xs font-medium 
                                                ${isSubmitted ? 'bg-blue-100 text-blue-800' :
                                                    assignment.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {isSubmitted ? 'SUBMITTED' : assignment.status?.toUpperCase() || 'UNKNOWN'}
                                            </span>
                                        );
                                    })()}
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
                                            <Button onClick={() => handleViewDetails(assignment)}>
                                                {assignment.submissions?.length > 0 ? 'View Submission' : 'Submit Assignment'}
                                            </Button>
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

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedAssignment?.title}</DialogTitle>
                        <DialogDescription>
                            {selectedAssignment?.courseCode} - {selectedAssignment?.courseName}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Due: {selectedAssignment?.due_date ? new Date(selectedAssignment.due_date).toLocaleString() : ''}</span>
                            <span>Max Score: {selectedAssignment?.max_score}</span>
                        </div>

                        <div className="bg-muted p-4 rounded-md text-sm">
                            {selectedAssignment?.description || 'No description provided.'}
                        </div>

                        {selectedAssignment?.submissions?.length > 0 ? (
                            <div className="space-y-2 pt-4 border-t">
                                <Label>Your Submission</Label>
                                <div className="p-3 bg-blue-50 text-blue-800 rounded-md text-sm">
                                    <p className="font-medium">Submitted on {new Date(selectedAssignment.submissions[0].submitted_at).toLocaleString()}</p>
                                    {selectedAssignment.submissions[0].content_url && (
                                        <a href={selectedAssignment.submissions[0].content_url} target="_blank" rel="noreferrer" className="underline mt-1 block">
                                            View Work
                                        </a>
                                    )}
                                    {selectedAssignment.submissions[0].grade !== null && (
                                        <p className="mt-2 font-bold">Grade: {selectedAssignment.submissions[0].grade} / {selectedAssignment.max_score}</p>
                                    )}
                                </div>
                            </div>
                        ) : selectedAssignment?.status === 'active' && (
                            <div className="space-y-2 pt-4 border-t">
                                <Label>Submission URL</Label>
                                <Input
                                    placeholder="https://docs.google.com/..."
                                    value={submissionUrl}
                                    onChange={(e) => setSubmissionUrl(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Provide a link to your work (Google Doc, PDF, GitHub, etc.)
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Close</Button>
                        {!selectedAssignment?.submissions?.length && selectedAssignment?.status === 'active' && (
                            <Button onClick={handleSubmit} disabled={submitMutation.isPending}>
                                {submitMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Submit Assignment
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </MainLayout>
    );
};
