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
import { courseService } from '../../services/course.service';
import type { Course } from '../../services/course.service';
import { courseSchema } from '../../schemas/course.schema';
import type { CourseFormData } from '../../schemas/course.schema';
import { teacherService } from '../../services/teacher.service';
import { branchService } from '../../services/branch.service';
import { academicYearService } from '../../services/academic-year.service';
import { gradeLevelService } from '../../services/grade-level.service';
import { subjectService } from '../../services/subject.service';
import { useToast } from '../../hooks/use-toast';
import { Plus, Search, Edit, Trash2, BookOpen, Users, Building, GraduationCap } from 'lucide-react';

export const CoursesPage: React.FC = () => {
    // ... existing hooks
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const limit = 12; // 12 items per page for 3-column grid

    // Fetch courses with pagination
    const { data: coursesData, isLoading: isLoadingCourses } = useQuery({
        queryKey: ['courses', page, limit],
        queryFn: () => courseService.getAll({ page, limit }),
    });

    const courses = coursesData?.data || [];
    const pagination = coursesData?.pagination || { total: 0, pages: 1 };

    // Fetch teachers for dropdown (all teachers, not paginated)
    const { data: teachersData } = useQuery({
        queryKey: ['teachers-all'],
        queryFn: () => teacherService.getAll({ limit: 1000 }),
    });

    // Fetch branches for dropdown
    const { data: branchesData } = useQuery({
        queryKey: ['branches'],
        queryFn: branchService.getAll,
    });

    // Fetch academic years
    const { data: academicYearsData } = useQuery({
        queryKey: ['academic-years'],
        queryFn: academicYearService.getAll,
    });

    // Fetch grade levels
    const { data: gradeLevelsData } = useQuery({
        queryKey: ['grade-levels'],
        queryFn: gradeLevelService.getAll,
    });

    // Fetch subjects
    const { data: subjectsData } = useQuery({
        queryKey: ['subjects'],
        queryFn: subjectService.getAll,
    });

    const teachers = teachersData?.data || [];
    const branches = branchesData?.data || [];
    const academicYears = academicYearsData?.data || [];
    const gradeLevels = gradeLevelsData?.data || [];
    const subjects = subjectsData?.data || [];

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<CourseFormData>({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            course_code: '',
            course_name: '',
            subject_id: '',
            grade_level_id: '',
            teacher_id: '',
            academic_year_id: '',
            max_students: 30,
            room_number: '',
            building: '',
        },
    });

    const selectedTeacher = watch('teacher_id');

    const createMutation = useMutation({
        mutationFn: courseService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            toast({
                title: 'Success',
                description: 'Course created successfully',
            });
            setIsDialogOpen(false);
            reset();
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to create course',
                variant: 'destructive',
            });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            courseService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            toast({
                title: 'Success',
                description: 'Course updated successfully',
            });
            setIsDialogOpen(false);
            setEditingCourse(null);
            reset();
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update course',
                variant: 'destructive',
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: courseService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            toast({
                title: 'Success',
                description: 'Course deleted successfully',
            });
            setDeleteId(null);
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete course',
                variant: 'destructive',
            });
        },
    });

    const onSubmit = (data: CourseFormData) => {
        const pData = {
            ...data,
            max_students: data.max_students === '' ? undefined : Number(data.max_students),
        };
        if (editingCourse) {
            updateMutation.mutate({ id: editingCourse.id, data: pData });
        } else {
            createMutation.mutate(pData);
        }
    };

    const handleEdit = (course: Course) => {
        setEditingCourse(course);
        setValue('course_code', course.course_code);
        setValue('course_name', course.course_name);
        setValue('subject_id', course.subject_id);
        setValue('grade_level_id', course.grade_level_id);
        setValue('teacher_id', course.teacher_id);
        setValue('academic_year_id', course.academic_year_id);
        setValue('max_students', course.max_students || 30);
        setValue('room_number', course.room_number || '');
        setValue('building', course.building || '');
        setValue('branch_id', course.branch_id || '');
        setIsDialogOpen(true);
    };

    const handleAdd = () => {
        setEditingCourse(null);
        reset();
        setIsDialogOpen(true);
    };

    const handleDelete = () => {
        if (deleteId) {
            deleteMutation.mutate(deleteId);
        }
    };

    const filteredCourses = courses.filter((course: Course) =>
        `${course.course_name} ${course.course_code}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: courses.length,
        subjects: new Set(courses.map((c: Course) => c.subject_id)).size,
        avgCapacity: Math.round(
            courses.reduce((acc: number, c: Course) => acc + (c.max_students || 0), 0) / (courses.length || 1)
        ),
        totalTeachers: new Set(courses.map((c: Course) => c.teacher_id)).size,
    };

    if (isLoadingCourses) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">Loading courses...</p>
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
                        <h1 className="text-3xl font-bold">Courses</h1>
                        <p className="text-muted-foreground mt-1">Manage academic courses and curriculum</p>
                    </div>
                    <Button onClick={handleAdd} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Course
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Courses</p>
                                    <h3 className="text-2xl font-bold mt-1">{stats.total}</h3>
                                </div>
                                <BookOpen className="w-8 h-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Active Subjects</p>
                                    <h3 className="text-2xl font-bold mt-1">{stats.subjects}</h3>
                                </div>
                                <GraduationCap className="w-8 h-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Avg. Capacity</p>
                                    <h3 className="text-2xl font-bold mt-1">{stats.avgCapacity}</h3>
                                </div>
                                <Users className="w-8 h-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Assigned Teachers</p>
                                    <h3 className="text-2xl font-bold mt-1">{stats.totalTeachers}</h3>
                                </div>
                                <Users className="w-8 h-8 text-orange-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent className="p-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search courses by name or code..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course: Course) => (
                        <Card key={course.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-lg font-bold">{course.course_name}</CardTitle>
                                <Badge variant="outline">{course.course_code}</Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Users className="mr-2 h-4 w-4" />
                                        Teacher: {course.teacher?.first_name} {course.teacher?.last_name}
                                    </div>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Building className="mr-2 h-4 w-4" />
                                        Location: {course.building} - {course.room_number}
                                    </div>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Users className="mr-2 h-4 w-4" />
                                        Max Students: {course.max_students}
                                    </div>

                                    <div className="flex items-center justify-end gap-2 pt-4">
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(course)}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => setDeleteId(course.id)}>
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {filteredCourses.length === 0 && (
                        <div className="col-span-full text-center py-12">
                            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                            <p className="text-muted-foreground">
                                {searchQuery ? 'Try adjusting your search' : 'Get started by adding a course'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total || courses.length)} of {pagination.total || courses.length} courses
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

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingCourse ? 'Edit' : 'Add'} Course</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="course_name">
                                        Course Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="course_name"
                                        {...register('course_name')}
                                        className={errors.course_name ? 'border-destructive' : ''}
                                    />
                                    {errors.course_name && (
                                        <p className="text-sm text-destructive mt-1">{errors.course_name.message}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="course_code">
                                        Course Code <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="course_code"
                                        {...register('course_code')}
                                        className={errors.course_code ? 'border-destructive' : ''}
                                    />
                                    {errors.course_code && (
                                        <p className="text-sm text-destructive mt-1">{errors.course_code.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="subject_id">
                                        Subject <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={watch('subject_id')}
                                        onValueChange={(value) => setValue('subject_id', value)}
                                    >
                                        <SelectTrigger className={errors.subject_id ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Select subject" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {subjects?.map((subject: any) => (
                                                <SelectItem key={subject.id} value={subject.id}>
                                                    {subject.name} ({subject.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.subject_id && (
                                        <p className="text-sm text-destructive mt-1">{errors.subject_id.message}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="grade_level_id">
                                        Grade Level <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={watch('grade_level_id')}
                                        onValueChange={(value) => setValue('grade_level_id', value)}
                                    >
                                        <SelectTrigger className={errors.grade_level_id ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Select grade level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {gradeLevels?.map((level: any) => (
                                                <SelectItem key={level.id} value={level.id}>
                                                    {level.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.grade_level_id && (
                                        <p className="text-sm text-destructive mt-1">{errors.grade_level_id.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="teacher_id">
                                        Teacher <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={selectedTeacher}
                                        onValueChange={(value) => setValue('teacher_id', value)}
                                    >
                                        <SelectTrigger className={errors.teacher_id ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Select teacher" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {teachers.map((teacher: any) => (
                                                <SelectItem key={teacher.id} value={teacher.id}>
                                                    {teacher.first_name} {teacher.last_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.teacher_id && (
                                        <p className="text-sm text-destructive mt-1">{errors.teacher_id.message}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="academic_year_id">
                                        Academic Year <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={watch('academic_year_id')}
                                        onValueChange={(value) => setValue('academic_year_id', value)}
                                    >
                                        <SelectTrigger className={errors.academic_year_id ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Select year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {academicYears?.map((year: any) => (
                                                <SelectItem key={year.id} value={year.id}>
                                                    {year.year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.academic_year_id && (
                                        <p className="text-sm text-destructive mt-1">{errors.academic_year_id.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="max_students">Max Students</Label>
                                    <Input
                                        id="max_students"
                                        type="number"
                                        {...register('max_students', { valueAsNumber: true })}
                                    />
                                    {errors.max_students && (
                                        <p className="text-sm text-destructive mt-1">{errors.max_students.message}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="branch_id">Branch</Label>
                                    <Select
                                        value={watch('branch_id')}
                                        onValueChange={(value) => setValue('branch_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select branch" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {branches?.map((branch: any) => (
                                                <SelectItem key={branch.id} value={branch.id}>
                                                    {branch.name} ({branch.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="building">Building</Label>
                                    <Input
                                        id="building"
                                        {...register('building')}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="room_number">Room</Label>
                                    <Input
                                        id="room_number"
                                        {...register('room_number')}
                                    />
                                </div>
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
                                        setEditingCourse(null);
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
                                This action cannot be undone. This will permanently delete the course.
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
        </MainLayout >
    );
};
