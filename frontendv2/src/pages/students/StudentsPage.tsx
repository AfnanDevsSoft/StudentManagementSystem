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
import { studentService } from '../../services/student.service';
import type { Student } from '../../services/student.service';
import { studentSchema } from '../../schemas/student.schema';
import type { StudentFormData } from '../../schemas/student.schema';
import { useToast } from '../../hooks/use-toast';
import { Plus, Search, Edit, Trash2, Users, GraduationCap, UserCheck, UserX } from 'lucide-react';

export const StudentsPage: React.FC = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Fetch students
    const { data: studentsData, isLoading } = useQuery({
        queryKey: ['students'],
        queryFn: () => studentService.getAll(),
    });

    const students = (studentsData as any)?.data || [];

    // Form with validation
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<StudentFormData>({
        resolver: zodResolver(studentSchema),
        defaultValues: {
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            date_of_birth: '',
            gender: 'Male',
            blood_group: '',
            nationality: '',
            admission_date: new Date().toISOString().split('T')[0],
        },
    });

    const gender = watch('gender');

    // Create mutation
    const createMutation = useMutation({
        mutationFn: studentService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            toast({
                title: 'Success',
                description: 'Student created successfully',
            });
            setIsDialogOpen(false);
            reset();
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to create student',
                variant: 'destructive',
            });
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<StudentFormData> }) =>
            studentService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            toast({
                title: 'Success',
                description: 'Student updated successfully',
            });
            setIsDialogOpen(false);
            setEditingStudent(null);
            reset();
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update student',
                variant: 'destructive',
            });
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: studentService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            toast({
                title: 'Success',
                description: 'Student deleted successfully',
            });
            setDeleteId(null);
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete student',
                variant: 'destructive',
            });
        },
    });

    const onSubmit = (data: StudentFormData) => {
        if (editingStudent) {
            updateMutation.mutate({ id: editingStudent.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleEdit = (student: Student) => {
        setEditingStudent(student);
        setValue('first_name', student.first_name);
        setValue('last_name', student.last_name);
        setValue('email', student.email || '');
        setValue('phone', student.phone || '');
        setValue('date_of_birth', student.date_of_birth?.split('T')[0] || '');
        setValue('gender', student.gender as 'Male' | 'Female' | 'Other');
        setValue('blood_group', student.blood_group || '');
        setValue('nationality', student.nationality || '');
        setValue('admission_date', student.admission_date?.split('T')[0] || '');
        setIsDialogOpen(true);
    };

    const handleAdd = () => {
        setEditingStudent(null);
        reset();
        setIsDialogOpen(true);
    };

    const handleDelete = () => {
        if (deleteId) {
            deleteMutation.mutate(deleteId);
        }
    };

    const filteredStudents = students.filter((student: Student) =>
        `${student.first_name} ${student.last_name} ${student.student_code} ${student.admission_number || ''}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: students.length,
        active: students.filter((s: Student) => s.is_active).length,
        inactive: students.filter((s: Student) => !s.is_active).length,
        male: students.filter((s: Student) => s.gender === 'Male').length,
        female: students.filter((s: Student) => s.gender === 'Female').length,
    };

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">Loading students...</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Students</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage student records and enrollments
                        </p>
                    </div>
                    <Button onClick={handleAdd} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Student
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Students</p>
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
                                    <p className="text-sm text-muted-foreground">Inactive</p>
                                    <h3 className="text-2xl font-bold mt-1 text-red-600">{stats.inactive}</h3>
                                </div>
                                <UserX className="w-8 h-8 text-red-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Male</p>
                                    <h3 className="text-2xl font-bold mt-1">{stats.male}</h3>
                                </div>
                                <Users className="w-8 h-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Female</p>
                                    <h3 className="text-2xl font-bold mt-1">{stats.female}</h3>
                                </div>
                                <Users className="w-8 h-8 text-pink-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <Card>
                    <CardContent className="p-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, ID, or Admission No..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Students Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Students ({filteredStudents.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4 font-medium">Student ID</th>
                                        <th className="text-left p-4 font-medium">Adm. No</th>
                                        <th className="text-left p-4 font-medium">Name</th>
                                        <th className="text-left p-4 font-medium">Gender</th>
                                        <th className="text-left p-4 font-medium">Contact</th>
                                        <th className="text-left p-4 font-medium">Admission Date</th>
                                        <th className="text-left p-4 font-medium">Status</th>
                                        <th className="text-right p-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.map((student: Student) => (
                                        <tr key={student.id} className="border-b hover:bg-muted/50">
                                            <td className="p-4 font-medium">{student.student_code}</td>
                                            <td className="p-4 font-medium text-muted-foreground">{student.admission_number || '-'}</td>
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-medium">
                                                        {student.first_name} {student.last_name}
                                                    </p>
                                                    {student.email && (
                                                        <p className="text-sm text-muted-foreground">{student.email}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm">{student.gender}</td>
                                            <td className="p-4 text-sm">{student.phone || 'N/A'}</td>
                                            <td className="p-4 text-sm">
                                                {new Date(student.admission_date).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                <Badge variant={student.is_active ? 'success' : 'secondary'}>
                                                    {student.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(student)}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setDeleteId(student.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredStudents.length === 0 && (
                                <div className="text-center py-12">
                                    <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No students found</h3>
                                    <p className="text-muted-foreground">
                                        {searchQuery ? 'Try adjusting your search' : 'Get started by adding a student'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Add/Edit Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingStudent ? 'Edit' : 'Add'} Student</DialogTitle>
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
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" {...register('email')} />
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
                                    <Label htmlFor="date_of_birth">
                                        Date of Birth <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="date_of_birth"
                                        type="date"
                                        {...register('date_of_birth')}
                                        className={errors.date_of_birth ? 'border-destructive' : ''}
                                    />
                                    {errors.date_of_birth && (
                                        <p className="text-sm text-destructive mt-1">{errors.date_of_birth.message}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="gender">
                                        Gender <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={gender}
                                        onValueChange={(value) => setValue('gender', value as 'Male' | 'Female' | 'Other')}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="blood_group">Blood Group</Label>
                                    <Input id="blood_group" {...register('blood_group')} placeholder="e.g., A+" />
                                </div>
                                <div>
                                    <Label htmlFor="nationality">Nationality</Label>
                                    <Input id="nationality" {...register('nationality')} />
                                </div>
                            </div>

                            {!editingStudent && (
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

                            <div>
                                <Label htmlFor="admission_date">
                                    Admission Date <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="admission_date"
                                    type="date"
                                    {...register('admission_date')}
                                    className={errors.admission_date ? 'border-destructive' : ''}
                                />
                                {errors.admission_date && (
                                    <p className="text-sm text-destructive mt-1">{errors.admission_date.message}</p>
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
                                        setEditingStudent(null);
                                        reset();
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the student record.
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
