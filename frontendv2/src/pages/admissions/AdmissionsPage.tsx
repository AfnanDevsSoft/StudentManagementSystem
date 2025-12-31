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
import { admissionService } from '../../services/admission.service';
import { branchService } from '../../services/branch.service';
import type { Admission } from '../../services/admission.service';
import { admissionSchema } from '../../schemas/admission.schema';
import type { AdmissionFormData } from '../../schemas/admission.schema';
import { useToast } from '../../hooks/use-toast';
import { Plus, Search, Edit, Trash2, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';

export const AdmissionsPage: React.FC = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAdmission, setEditingAdmission] = useState<Admission | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const limit = 12;

    // Fetch admissions with pagination
    const { data: admissionsData, isLoading } = useQuery({
        queryKey: ['admissions', page, limit],
        queryFn: () => admissionService.getAll({ page, limit }),
    });

    const admissions = admissionsData?.data || [];
    const pagination = admissionsData?.pagination || { total: 0, pages: 1 };

    const { data: branchesData } = useQuery({
        queryKey: ['branches'],
        queryFn: branchService.getAll,
    });

    const branches = branchesData?.data || [];

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<AdmissionFormData>({
        resolver: zodResolver(admissionSchema),
        defaultValues: {
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            date_of_birth: '',
            gender: 'Male',
            address: '',
            city: '',
            state: '',
            previous_school: '',
            grade_applying_for: '',
            application_date: new Date().toISOString().split('T')[0],
            status: 'Pending',
            notes: '',
            branch_id: '',
        },
    });

    const selectedGender = watch('gender');
    const selectedStatus = watch('status');

    const createMutation = useMutation({
        mutationFn: admissionService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admissions'] });
            toast({
                title: 'Success',
                description: 'Application created successfully',
            });
            setIsDialogOpen(false);
            reset();
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to create application',
                variant: 'destructive',
            });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<AdmissionFormData> }) => {
            console.log("Mutating update:", id, data);
            return admissionService.update(id, data);
        },
        onSuccess: (data) => {
            console.log("Update success, invalidating queries. Response:", data);
            queryClient.invalidateQueries({ queryKey: ['admissions'] });
            toast({
                title: 'Success',
                description: 'Application updated successfully',
            });
            setIsDialogOpen(false);
            setEditingAdmission(null);
            reset();
        },
        onError: (error: any) => {
            console.error("Update error:", error);
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update application',
                variant: 'destructive',
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: admissionService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admissions'] });
            toast({
                title: 'Success',
                description: 'Application deleted successfully',
            });
            setDeleteId(null);
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete application',
                variant: 'destructive',
            });
        },
    });

    const onSubmit = (data: AdmissionFormData) => {
        console.log("Form submitted:", data);
        if (editingAdmission) {
            console.log("Editing admission:", editingAdmission.id);
            updateMutation.mutate({ id: editingAdmission.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleEdit = (admission: Admission) => {
        setEditingAdmission(admission);
        setValue('first_name', admission.first_name);
        setValue('last_name', admission.last_name);
        setValue('email', admission.email);
        setValue('phone', admission.phone);
        setValue('date_of_birth', admission.date_of_birth.split('T')[0]);
        setValue('gender', admission.gender);
        setValue('address', admission.address || '');
        setValue('city', admission.city || '');
        setValue('state', admission.state || '');
        setValue('previous_school', admission.previous_school || '');
        setValue('grade_applying_for', admission.grade_applying_for);
        setValue('application_date', admission.application_date.split('T')[0]);
        setValue('status', admission.status);
        setValue('notes', admission.notes || '');
        setValue('branch_id', admission.branch_id);
        setIsDialogOpen(true);
    };

    const handleAdd = () => {
        setEditingAdmission(null);
        reset();
        setIsDialogOpen(true);
    };

    const handleDelete = () => {
        if (deleteId) {
            deleteMutation.mutate(deleteId);
        }
    };

    const filteredAdmissions = admissions.filter((admission: Admission) =>
        `${admission.first_name} ${admission.last_name} ${admission.email}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: admissions.length,
        pending: admissions.filter((a: Admission) => a.status?.toLowerCase() === 'pending').length,
        reviewing: admissions.filter((a: Admission) => a.status?.toLowerCase() === 'reviewing').length,
        accepted: admissions.filter((a: Admission) => a.status?.toLowerCase() === 'accepted').length,
        rejected: admissions.filter((a: Admission) => a.status?.toLowerCase() === 'rejected').length,
    };

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">Loading admissions...</p>
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
                        <h1 className="text-3xl font-bold">Admissions</h1>
                        <p className="text-muted-foreground mt-1">Manage student applications and enrollment</p>
                    </div>
                    <Button onClick={handleAdd} className="gap-2">
                        <Plus className="w-4 h-4" />
                        New Application
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Applications</p>
                                    <h3 className="text-2xl font-bold mt-1">{stats.total}</h3>
                                </div>
                                <FileText className="w-8 h-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Pending</p>
                                    <h3 className="text-2xl font-bold mt-1 text-orange-600">{stats.pending}</h3>
                                </div>
                                <Clock className="w-8 h-8 text-orange-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Reviewing</p>
                                    <h3 className="text-2xl font-bold mt-1 text-blue-600">{stats.reviewing}</h3>
                                </div>
                                <FileText className="w-8 h-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Accepted</p>
                                    <h3 className="text-2xl font-bold mt-1 text-green-600">{stats.accepted}</h3>
                                </div>
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Rejected</p>
                                    <h3 className="text-2xl font-bold mt-1 text-red-600">{stats.rejected}</h3>
                                </div>
                                <XCircle className="w-8 h-8 text-red-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent className="p-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search applications by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAdmissions.map((admission: Admission) => (
                        <Card key={admission.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-lg font-bold">
                                    {admission.first_name} {admission.last_name}
                                </CardTitle>
                                <Badge
                                    variant={
                                        admission.status === 'Accepted'
                                            ? 'success'
                                            : admission.status === 'Rejected'
                                                ? 'destructive'
                                                : admission.status === 'Waitlisted'
                                                    ? 'warning'
                                                    : 'secondary'
                                    }
                                >
                                    {admission.status}
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="text-sm text-muted-foreground">
                                        <p>Grade: {admission.grade_applying_for}</p>
                                        <p>Applied: {new Date(admission.application_date).toLocaleDateString()}</p>
                                        <p>Email: {admission.email}</p>
                                        <p>Phone: {admission.phone}</p>
                                    </div>

                                    <div className="flex items-center justify-end gap-2 pt-4">
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(admission)}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => setDeleteId(admission.id)}>
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {filteredAdmissions.length === 0 && (
                        <div className="col-span-full text-center py-12">
                            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No applications found</h3>
                            <p className="text-muted-foreground">
                                {searchQuery ? 'Try adjusting your search' : 'Get started by creating a new application'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total || admissions.length)} of {pagination.total || admissions.length} applications
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
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingAdmission ? 'Edit' : 'New'} Application</DialogTitle>
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
                                    <Label htmlFor="phone">
                                        Phone <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="phone"
                                        {...register('phone')}
                                        className={errors.phone ? 'border-destructive' : ''}
                                    />
                                    {errors.phone && (
                                        <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                                    )}
                                </div>
                            </div>



                            <div>
                                <Label htmlFor="branch">Branch <span className="text-destructive">*</span></Label>
                                <Select
                                    value={watch('branch_id')}
                                    onValueChange={(value) => setValue('branch_id', value)}
                                >
                                    <SelectTrigger className={errors.branch_id ? 'border-destructive' : ''}>
                                        <SelectValue placeholder="Select Branch" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {branches.map((branch: any) => (
                                            <SelectItem key={branch.id} value={branch.id}>
                                                {branch.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.branch_id && (
                                    <p className="text-sm text-destructive mt-1">{errors.branch_id.message}</p>
                                )}
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
                                    <Label htmlFor="gender">Gender</Label>
                                    <Select
                                        value={selectedGender}
                                        onValueChange={(value) => setValue('gender', value as any)}
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

                            <div>
                                <Label htmlFor="address">Address</Label>
                                <Input id="address" {...register('address')} />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="city">City</Label>
                                    <Input id="city" {...register('city')} />
                                </div>
                                <div>
                                    <Label htmlFor="state">State</Label>
                                    <Input id="state" {...register('state')} />
                                </div>
                                <div>
                                    <Label htmlFor="previous_school">Previous School</Label>
                                    <Input id="previous_school" {...register('previous_school')} />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="grade_applying_for">
                                        Grade Applying For <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="grade_applying_for"
                                        {...register('grade_applying_for')}
                                        className={errors.grade_applying_for ? 'border-destructive' : ''}
                                    />
                                    {errors.grade_applying_for && (
                                        <p className="text-sm text-destructive mt-1">{errors.grade_applying_for.message}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="application_date">
                                        Application Date <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="application_date"
                                        type="date"
                                        {...register('application_date')}
                                        className={errors.application_date ? 'border-destructive' : ''}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={selectedStatus}
                                        onValueChange={(value) => setValue('status', value as any)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Pending">Pending</SelectItem>
                                            <SelectItem value="Reviewing">Reviewing</SelectItem>
                                            <SelectItem value="Accepted">Accepted</SelectItem>
                                            <SelectItem value="Rejected">Rejected</SelectItem>
                                            <SelectItem value="Waitlisted">Waitlisted</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="notes">Notes</Label>
                                <Input id="notes" {...register('notes')} />
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
                                        setEditingAdmission(null);
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
                                This action cannot be undone. This will permanently delete the application.
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
