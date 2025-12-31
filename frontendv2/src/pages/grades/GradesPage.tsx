import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { gradeService } from '../../services/grade.service';
import type { Grade } from '../../services/grade.service';
import { gradeSchema } from '../../schemas/grade.schema';
import type { GradeFormData } from '../../schemas/grade.schema';
import { studentService } from '../../services/student.service';
import { courseService } from '../../services/course.service';
import { useToast } from '../../hooks/use-toast';
import { Plus, Search, Edit, Trash2, GraduationCap, Award, BookOpen, Calculator } from 'lucide-react';

export const GradesPage: React.FC = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const limit = 20;

    // Fetch grades with pagination
    const { data: gradesData, isLoading: isLoadingGrades } = useQuery({
        queryKey: ['grades', page, limit],
        queryFn: () => gradeService.getAll({ page, limit }),
    });

    // Fetch students for dropdown (all students)
    const { data: studentsData } = useQuery({
        queryKey: ['students-all'],
        queryFn: () => studentService.getAll({ limit: 1000 }),
    });

    // Fetch courses for dropdown (all courses)
    const { data: coursesData } = useQuery({
        queryKey: ['courses-all'],
        queryFn: () => courseService.getAll({ limit: 1000 }),
    });

    const grades = gradesData?.data || [];
    const pagination = gradesData?.pagination || { total: 0, pages: 1 };
    const students = studentsData?.data || [];
    const courses = coursesData?.data || [];

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<GradeFormData>({
        resolver: zodResolver(gradeSchema),
        defaultValues: {
            student_id: '',
            course_id: '',
            grade: '',
            marks_obtained: 0,
            total_marks: 100,
            remarks: '',
            exam_date: new Date().toISOString().split('T')[0],
            grading_period: 'Semester 1',
        },
    });

    const selectedStudent = watch('student_id');
    const selectedCourse = watch('course_id');

    const createMutation = useMutation({
        mutationFn: gradeService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['grades'] });
            toast({
                title: 'Success',
                description: 'Grade recorded successfully',
            });
            setIsDialogOpen(false);
            reset();
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to record grade',
                variant: 'destructive',
            });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<GradeFormData> }) =>
            gradeService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['grades'] });
            toast({
                title: 'Success',
                description: 'Grade updated successfully',
            });
            setIsDialogOpen(false);
            setEditingGrade(null);
            reset();
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update grade',
                variant: 'destructive',
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: gradeService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['grades'] });
            toast({
                title: 'Success',
                description: 'Grade deleted successfully',
            });
            setDeleteId(null);
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete grade',
                variant: 'destructive',
            });
        },
    });

    const onSubmit = (data: GradeFormData) => {
        if (editingGrade) {
            updateMutation.mutate({ id: editingGrade.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleEdit = (grade: Grade) => {
        setEditingGrade(grade);
        setValue('student_id', grade.student_id);
        setValue('course_id', grade.course_id);
        setValue('grade', grade.grade);
        setValue('marks_obtained', grade.marks_obtained);
        setValue('total_marks', grade.total_marks);
        setValue('remarks', grade.remarks || '');
        setValue('exam_date', grade.exam_date.split('T')[0]);
        setValue('grading_period', grade.grading_period || '');
        setIsDialogOpen(true);
    };

    const handleAdd = () => {
        setEditingGrade(null);
        reset();
        setIsDialogOpen(true);
    };

    const handleDelete = () => {
        if (deleteId) {
            deleteMutation.mutate(deleteId);
        }
    };

    const filteredGrades = grades.filter((grade: Grade) => {
        const studentName = grade.student
            ? `${grade.student.first_name} ${grade.student.last_name}`
            : '';
        const courseName = grade.course?.course_name || '';
        return (
            studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            courseName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    const stats = {
        total: grades.length,
        average: Math.round(
            grades.reduce((acc: number, g: Grade) => acc + (g.marks_obtained / g.total_marks * 100), 0) / (grades.length || 1)
        ),
        passing: grades.filter((g: Grade) => (g.marks_obtained / g.total_marks) >= 0.4).length, // Assuming 40% passing
        courses: new Set(grades.map((g: Grade) => g.course_id)).size,
    };

    if (isLoadingGrades) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">Loading grades...</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Grades</h1>
                        <p className="text-muted-foreground mt-1">Manage student assessments and results</p>
                    </div>
                    <Button onClick={handleAdd} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Record Grade
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Records</p>
                                    <h3 className="text-2xl font-bold mt-1">{stats.total}</h3>
                                </div>
                                <GraduationCap className="w-8 h-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Class Average</p>
                                    <h3 className="text-2xl font-bold mt-1">{stats.average}%</h3>
                                </div>
                                <Calculator className="w-8 h-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Passed</p>
                                    <h3 className="text-2xl font-bold mt-1 text-green-600">{stats.passing}</h3>
                                </div>
                                <Award className="w-8 h-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Courses Graded</p>
                                    <h3 className="text-2xl font-bold mt-1">{stats.courses}</h3>
                                </div>
                                <BookOpen className="w-8 h-8 text-orange-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent className="p-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by student or course..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Grade Records ({filteredGrades.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4 font-medium">Student</th>
                                        <th className="text-left p-4 font-medium">Course</th>
                                        <th className="text-left p-4 font-medium">Grade</th>
                                        <th className="text-left p-4 font-medium">Score</th>
                                        <th className="text-left p-4 font-medium">Date</th>
                                        <th className="text-right p-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredGrades.map((grade: Grade) => (
                                        <tr key={grade.id} className="border-b hover:bg-muted/50">
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-medium">
                                                        {grade.student?.first_name} {grade.student?.last_name}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">{grade.student?.student_code}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-medium">{grade.course?.course_name}</p>
                                                    <p className="text-sm text-muted-foreground">{grade.grading_period}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <Badge variant="outline" className="text-lg font-bold">
                                                    {grade.grade}
                                                </Badge>
                                            </td>
                                            <td className="p-4 font-medium">
                                                {grade.marks_obtained} / {grade.total_marks}
                                            </td>
                                            <td className="p-4 text-sm">
                                                {new Date(grade.exam_date).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(grade)}>
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(grade.id)}>
                                                        <Trash2 className="w-4 h-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredGrades.length === 0 && (
                                <div className="text-center py-12">
                                    <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No grades found</h3>
                                    <p className="text-muted-foreground">
                                        {searchQuery ? 'Try adjusting your search' : 'Get started by recording a grade'}
                                    </p>
                                </div>
                            )}
                        </div>
                        {/* Pagination Controls */}
                        <div className="flex items-center justify-between px-4 py-4 border-t">
                            <div className="text-sm text-muted-foreground">
                                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total || grades.length)} of {pagination.total || grades.length} grades
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    Previous
                                </Button>
                                <span className="flex items-center px-3 text-sm">
                                    Page {page} of {pagination.pages || 1}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={page >= (pagination.pages || 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{editingGrade ? 'Edit' : 'Record'} Grade</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="student_id">
                                        Student <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={selectedStudent}
                                        onValueChange={(value) => setValue('student_id', value)}
                                    >
                                        <SelectTrigger className={errors.student_id ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Select student" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {students.map((student: any) => (
                                                <SelectItem key={student.id} value={student.id}>
                                                    {student.first_name} {student.last_name} ({student.student_code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.student_id && (
                                        <p className="text-sm text-destructive mt-1">{errors.student_id.message}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="course_id">
                                        Course <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={selectedCourse}
                                        onValueChange={(value) => setValue('course_id', value)}
                                    >
                                        <SelectTrigger className={errors.course_id ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Select course" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {courses.map((course: any) => (
                                                <SelectItem key={course.id} value={course.id}>
                                                    {course.course_name} ({course.course_code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.course_id && (
                                        <p className="text-sm text-destructive mt-1">{errors.course_id.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="grade">
                                        Grade Letter <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="grade"
                                        {...register('grade')}
                                        className={errors.grade ? 'border-destructive' : ''}
                                        placeholder="e.g., A, B+"
                                    />
                                    {errors.grade && (
                                        <p className="text-sm text-destructive mt-1">{errors.grade.message}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="marks_obtained">Marks Obtained</Label>
                                    <Input
                                        id="marks_obtained"
                                        type="number"
                                        {...register('marks_obtained', { valueAsNumber: true })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="total_marks">Total Marks</Label>
                                    <Input
                                        id="total_marks"
                                        type="number"
                                        {...register('total_marks', { valueAsNumber: true })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="exam_date">
                                        Exam Date <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="exam_date"
                                        type="date"
                                        {...register('exam_date')}
                                        className={errors.exam_date ? 'border-destructive' : ''}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="grading_period">Grading Period</Label>
                                    <Input id="grading_period" {...register('grading_period')} placeholder="e.g., Semester 1" />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="remarks">Remarks</Label>
                                <Input id="remarks" {...register('remarks')} />
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                    {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsDialogOpen(false);
                                        setEditingGrade(null);
                                        reset();
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the grade record.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </MainLayout>
    );
};
