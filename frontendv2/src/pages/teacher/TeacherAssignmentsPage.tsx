
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Plus, Users, Calendar, FileText, Loader2, AlertCircle, Trash } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { teacherService } from '../../services/teacher.service';
import { assignmentService } from '../../services/assignment.service';
import type { CreateAssignmentDto } from '../../services/assignment.service';
import { toast } from 'sonner';

export const TeacherAssignmentsPage: React.FC = () => {
    const { user } = useAuth();
    const teacherId = user?.teacherId;
    const queryClient = useQueryClient();

    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [viewSubmissionId, setViewSubmissionId] = useState<string | null>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [maxScore, setMaxScore] = useState('100');

    // Fetch Teacher Courses
    const { data: coursesData, isLoading: loadingCourses } = useQuery({
        queryKey: ['teacher-courses', teacherId],
        queryFn: () => teacherService.getCourses(teacherId!),
        enabled: !!teacherId,
    });

    const courses = Array.isArray(coursesData?.data) ? coursesData.data : (Array.isArray(coursesData) ? coursesData : []);

    useEffect(() => {
        if (courses.length > 0 && !selectedCourseId) {
            setSelectedCourseId(courses[0].id);
        }
    }, [courses, selectedCourseId]);

    // Fetch Assignments
    const { data: assignmentsData, isLoading: loadingAssignments } = useQuery({
        queryKey: ['course-assignments', selectedCourseId],
        queryFn: () => assignmentService.getByCourse(selectedCourseId),
        enabled: !!selectedCourseId,
    });

    const assignments = Array.isArray(assignmentsData?.data) ? assignmentsData.data : (Array.isArray(assignmentsData) ? assignmentsData : []);

    // Fetch Submissions
    const { data: submissionsData, isLoading: loadingSubmissions } = useQuery({
        queryKey: ['assignment-submissions', viewSubmissionId],
        queryFn: () => assignmentService.getSubmissions(viewSubmissionId!),
        enabled: !!viewSubmissionId
    });

    const submissions = Array.isArray(submissionsData?.data) ? submissionsData.data : (Array.isArray(submissionsData) ? submissionsData : []);

    // Create Mutation
    const createMutation = useMutation({
        mutationFn: (data: CreateAssignmentDto) => assignmentService.create(data),
        onSuccess: () => {
            toast.success('Assignment created successfully');
            queryClient.invalidateQueries({ queryKey: ['course-assignments', selectedCourseId] });
            setIsDialogOpen(false);
            resetForm();
        },
        onError: (error) => {
            toast.error('Failed to create assignment');
            console.error(error);
        }
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => assignmentService.delete(id),
        onSuccess: () => {
            toast.success('Assignment deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['course-assignments', selectedCourseId] });
        },
        onError: (error) => {
            toast.error('Failed to delete assignment');
            console.error(error);
        }
    });

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setDueDate('');
        setMaxScore('100');
    };

    const handleCreate = () => {
        if (!title || !dueDate || !selectedCourseId) {
            toast.error('Please fill in all required fields');
            return;
        }

        createMutation.mutate({
            title,
            description,
            due_date: new Date(dueDate).toISOString(),
            course_id: selectedCourseId,
            status: 'active',
            max_score: Number(maxScore)
        });
    };

    if (!teacherId) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                    <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold">Teacher Profile Not Found</h2>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Class Assignments</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage assignments for your courses
                        </p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button disabled={!selectedCourseId}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Assignment
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Assignment</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Midterm Project" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <textarea
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Assignment details..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Due Date</Label>
                                    <Input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Max Score</Label>
                                    <Input type="number" value={maxScore} onChange={(e) => setMaxScore(e.target.value)} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                                    {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Create
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="w-full md:w-64">
                    <label className="text-sm font-medium mb-2 block">Select Class</label>
                    <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a class" />
                        </SelectTrigger>
                        <SelectContent>
                            {courses.map((course: any) => (
                                <SelectItem key={course.id} value={course.id}>
                                    {course.course_name || course.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loadingCourses || loadingAssignments ? (
                        <div className="col-span-full flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : assignments.length > 0 ? (
                        assignments.map((assignment: any) => (
                            <Card key={assignment.id} className="flex flex-col">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="line-clamp-1" title={assignment.title}>{assignment.title}</CardTitle>
                                            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                                <FileText className="w-4 h-4" />
                                                <span>{assignment.max_score} pts</span>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-medium 
                                            ${assignment.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {assignment.status?.toUpperCase()}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col justify-between">
                                    <div className="space-y-4 mb-4">
                                        <div className="text-sm text-muted-foreground line-clamp-2">
                                            {assignment.description || 'No description provided.'}
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                                <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-auto">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => setViewSubmissionId(assignment.id)}
                                        >
                                            <Users className="w-4 h-4 mr-2" />
                                            Submissions
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => {
                                                if (confirm('Are you sure you want to delete this assignment?')) {
                                                    deleteMutation.mutate(assignment.id);
                                                }
                                            }}
                                        >
                                            <Trash className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            {selectedCourseId ? 'No assignments created yet' : 'Please select a class'}
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={!!viewSubmissionId} onOpenChange={(open) => !open && setViewSubmissionId(null)}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Assignment Submissions</DialogTitle>
                    </DialogHeader>

                    {loadingSubmissions ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : submissions.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Submitted At</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {submissions.map((sub: any) => (
                                    <TableRow key={sub.id}>
                                        <TableCell>
                                            <div className="font-medium">
                                                {sub.student?.first_name} {sub.student?.last_name}
                                            </div>
                                            <div className="text-xs text-muted-foreground">{sub.student?.student_code}</div>
                                        </TableCell>
                                        <TableCell>{new Date(sub.submitted_at).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {sub.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {sub.content_url && (
                                                <Button size="sm" variant="outline" onClick={() => window.open(sub.content_url, '_blank')}>
                                                    View Work
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            No submissions yet.
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </MainLayout >
    );
};
