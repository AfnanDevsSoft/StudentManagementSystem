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
import { teacherService } from '../../services/teacher.service';
import type { Teacher } from '../../services/teacher.service';
import { teacherSchema } from '../../schemas/teacher.schema';
import type { TeacherFormData } from '../../schemas/teacher.schema';
import { useToast } from '../../hooks/use-toast';
import { Plus, Search, Edit, Trash2, Users, Briefcase, GraduationCap, UserCheck } from 'lucide-react';

export const TeachersPage: React.FC = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const { data: teachersData, isLoading } = useQuery({
        queryKey: ['teachers'],
        queryFn: teacherService.getAll,
    });

    const teachers = teachersData?.data || [];

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<TeacherFormData>({
        resolver: zodResolver(teacherSchema),
        defaultValues: {
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            hire_date: new Date().toISOString().split('T')[0],
            employment_type: 'Full-Time',
            department: '',
            designation: '',
            qualification: '',
        },
    });

    const employmentType = watch('employment_type');

    const createMutation = useMutation({
        mutationFn: teacherService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teachers'] });
            toast({
                title: 'Success',
                description: 'Teacher created successfully',
            });
            setIsDialogOpen(false);
            reset();
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to create teacher',
                variant: 'destructive',
            });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<TeacherFormData> }) => {
            const payload = {
                ...data,
                years_experience: data.years_experience === '' ? undefined : data.years_experience
            } as any; // Cast to any or Specific Partial<CreateTeacherDto> to bypass strict check
            return teacherService.update(id, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teachers'] });
            toast({
                title: 'Success',
                description: 'Teacher updated successfully',
            });
            setIsDialogOpen(false);
            setEditingTeacher(null);
            reset();
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update teacher',
                variant: 'destructive',
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: teacherService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teachers'] });
            toast({
                title: 'Success',
                description: 'Teacher deleted successfully',
            });
            setDeleteId(null);
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete teacher',
                variant: 'destructive',
            });
        },
    });

    const onSubmit = (data: TeacherFormData) => {
        const payload = {
            ...data,
            years_experience: data.years_experience === '' ? undefined : data.years_experience
        } as import('../../services/teacher.service').CreateTeacherDto;

        if (editingTeacher) {
            updateMutation.mutate({ id: editingTeacher.id, data }); // We act on form data generally, but logic inside handles payload
        } else {
            createMutation.mutate(payload);
        }
    };

    const handleEdit = (teacher: Teacher) => {
        setEditingTeacher(teacher);
        setValue('first_name', teacher.first_name);
        setValue('last_name', teacher.last_name);
        setValue('email', teacher.email);
        setValue('phone', teacher.phone || '');
        setValue('hire_date', teacher.hire_date?.split('T')[0] || '');
        setValue('employment_type', teacher.employment_type as 'Full-Time' | 'Part-Time' | 'Contract');
        setValue('department', teacher.department || '');
        setValue('designation', teacher.designation || '');
        setValue('qualification', teacher.qualification || '');
        setIsDialogOpen(true);
    };

    const handleAdd = () => {
        setEditingTeacher(null);
        reset();
        setIsDialogOpen(true);
    };

    const handleDelete = () => {
        if (deleteId) {
            deleteMutation.mutate(deleteId);
        }
    };

    const filteredTeachers = teachers.filter((teacher: Teacher) =>
        `${teacher.first_name} ${teacher.last_name} ${teacher.employee_code}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: teachers.length,
        active: teachers.filter((t: Teacher) => t.is_active).length,
        fullTime: teachers.filter((t: Teacher) => t.employment_type === 'Full-Time').length,
        partTime: teachers.filter((t: Teacher) => t.employment_type === 'Part-Time').length,
    };

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">Loading teachers...</p>
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
                        <h1 className="text-3xl font-bold">Teachers</h1>
                        <p className="text-muted-foreground mt-1">Manage teaching staff and faculty</p>
                    </div>
                    <Button onClick={handleAdd} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Teacher
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Teachers</p>
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
                                    <p className="text-sm text-muted-foreground">Active</p>
                                    <h3 className="text-2xl font-bold mt-1 text-green-600">{stats.active}</h3>
                                </div>
                                <UserCheck className="w-8 h-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Full-Time</p>
                                    <h3 className="text-2xl font-bold mt-1">{stats.fullTime}</h3>
                                </div>
                                <Briefcase className="w-8 h-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Part-Time</p>
                                    <h3 className="text-2xl font-bold mt-1">{stats.partTime}</h3>
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
                                placeholder="Search teachers by name or code..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>All Teachers ({filteredTeachers.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4 font-medium">Teacher ID</th>
                                        <th className="text-left p-4 font-medium">Name</th>
                                        <th className="text-left p-4 font-medium">Contact</th>
                                        <th className="text-left p-4 font-medium">Employment</th>
                                        <th className="text-left p-4 font-medium">Department</th>
                                        <th className="text-left p-4 font-medium">Status</th>
                                        <th className="text-right p-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTeachers.map((teacher: Teacher) => (
                                        <tr key={teacher.id} className="border-b hover:bg-muted/50">
                                            <td className="p-4 font-medium">{teacher.employee_code}</td>
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-medium">
                                                        {teacher.first_name} {teacher.last_name}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">{teacher.designation || 'N/A'}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm">
                                                    <p>{teacher.email}</p>
                                                    <p className="text-muted-foreground">{teacher.phone || 'N/A'}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <Badge variant="outline">{teacher.employment_type}</Badge>
                                            </td>
                                            <td className="p-4 text-sm">{teacher.department || 'N/A'}</td>
                                            <td className="p-4">
                                                <Badge variant={teacher.is_active ? 'success' : 'secondary'}>
                                                    {teacher.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(teacher)}>
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(teacher.id)}>
                                                        <Trash2 className="w-4 h-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredTeachers.length === 0 && (
                                <div className="text-center py-12">
                                    <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No teachers found</h3>
                                    <p className="text-muted-foreground">
                                        {searchQuery ? 'Try adjusting your search' : 'Get started by adding a teacher'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingTeacher ? 'Edit' : 'Add'} Teacher</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="first_name">
                                        First Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="first_name"
                                        {...register('first_name')}
                                        className={errors.first_name ? 'border-destructive' : ''}
                                    />
                                    {errors.first_name && (
                                        <p className="text-sm text-destructive mt-1">{errors.first_name.message}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="last_name">
                                        Last Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="last_name"
                                        {...register('last_name')}
                                        className={errors.last_name ? 'border-destructive' : ''}
                                    />
                                    {errors.last_name && (
                                        <p className="text-sm text-destructive mt-1">{errors.last_name.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="email">
                                        Email <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        {...register('email')}
                                        className={errors.email ? 'border-destructive' : ''}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input id="phone" {...register('phone')} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="hire_date">
                                        Hire Date <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="hire_date"
                                        type="date"
                                        {...register('hire_date')}
                                        className={errors.hire_date ? 'border-destructive' : ''}
                                    />
                                    {errors.hire_date && (
                                        <p className="text-sm text-destructive mt-1">{errors.hire_date.message}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="employment_type">
                                        Employment Type <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={employmentType}
                                        onValueChange={(value) => setValue('employment_type', value as any)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Full-Time">Full-Time</SelectItem>
                                            <SelectItem value="Part-Time">Part-Time</SelectItem>
                                            <SelectItem value="Contract">Contract</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {!editingTeacher && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="username">Username</Label>
                                        <Input
                                            id="username"
                                            {...register('username')}
                                            className={errors.username ? 'border-destructive' : ''}
                                            placeholder="For login access"
                                        />
                                        {errors.username && (
                                            <p className="text-sm text-destructive mt-1">{errors.username.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            {...register('password')}
                                            className={errors.password ? 'border-destructive' : ''}
                                            placeholder="Min. 6 characters"
                                        />
                                        {errors.password && (
                                            <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="department">Department</Label>
                                    <Input id="department" {...register('department')} />
                                </div>
                                <div>
                                    <Label htmlFor="designation">Designation</Label>
                                    <Input id="designation" {...register('designation')} />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="qualification">Qualification</Label>
                                <Input id="qualification" {...register('qualification')} placeholder="e.g., M.Ed, Ph.D" />
                            </div>

                            <div>
                                <Label htmlFor="years_experience">Years of Experience</Label>
                                <Input
                                    id="years_experience"
                                    type="number"
                                    {...register('years_experience', { valueAsNumber: true })}
                                    placeholder="e.g., 5"
                                />
                                {errors.years_experience && (
                                    <p className="text-sm text-destructive mt-1">{errors.years_experience.message}</p>
                                )}
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
                                        setEditingTeacher(null);
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
                                This action cannot be undone. This will permanently delete the teacher record.
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
