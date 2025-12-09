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
import { payrollService } from '../../services/payroll.service';
import type { Payroll } from '../../services/payroll.service';
import { payrollSchema } from '../../schemas/payroll.schema';
import type { PayrollFormData } from '../../schemas/payroll.schema';
import { teacherService } from '../../services/teacher.service';
import { useToast } from '../../hooks/use-toast';
import { Plus, Search, Edit, Trash2, DollarSign, CreditCard, CheckCircle, Clock } from 'lucide-react';

export const PayrollPage: React.FC = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPayroll, setEditingPayroll] = useState<Payroll | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Fetch payrolls
    const { data: payrollsData, isLoading } = useQuery({
        queryKey: ['payrolls'],
        queryFn: payrollService.getAll,
    });

    // Fetch teachers
    const { data: teachersData } = useQuery({
        queryKey: ['teachers'],
        queryFn: teacherService.getAll,
    });

    const payrolls = payrollsData?.data || [];
    const teachers = teachersData?.data || [];

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<PayrollFormData>({
        resolver: zodResolver(payrollSchema),
        defaultValues: {
            teacher_id: '',
            salary_amount: 0,
            bonus: 0,
            deductions: 0,
            payment_date: new Date().toISOString().split('T')[0],
            payment_method: 'Bank Transfer',
            status: 'Pending',
            remarks: '',
        },
    });

    const selectedTeacher = watch('teacher_id');
    const selectedMethod = watch('payment_method');
    const selectedStatus = watch('status');

    const createMutation = useMutation({
        mutationFn: payrollService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payrolls'] });
            toast({
                title: 'Success',
                description: 'Payroll record created successfully',
            });
            setIsDialogOpen(false);
            reset();
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to create payroll',
                variant: 'destructive',
            });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<PayrollFormData> }) =>
            payrollService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payrolls'] });
            toast({
                title: 'Success',
                description: 'Payroll record updated successfully',
            });
            setIsDialogOpen(false);
            setEditingPayroll(null);
            reset();
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update payroll',
                variant: 'destructive',
            });
        },
    });

    const approveMutation = useMutation({
        mutationFn: payrollService.verify,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payrolls'] });
            toast({
                title: 'Success',
                description: 'Payroll approved successfully',
            });
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to approve payroll',
                variant: 'destructive',
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: payrollService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payrolls'] });
            toast({
                title: 'Success',
                description: 'Payroll record deleted successfully',
            });
            setDeleteId(null);
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete payroll',
                variant: 'destructive',
            });
        },
    });

    const onSubmit = (data: PayrollFormData) => {
        if (editingPayroll) {
            updateMutation.mutate({ id: editingPayroll.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleEdit = (payroll: Payroll) => {
        setEditingPayroll(payroll);
        setValue('teacher_id', payroll.teacher_id);
        setValue('salary_amount', payroll.salary_amount);
        setValue('bonus', payroll.bonus);
        setValue('deductions', payroll.deductions);
        setValue('payment_date', payroll.payment_date.split('T')[0]);
        setValue('payment_method', payroll.payment_method);
        setValue('status', payroll.status);
        setValue('remarks', payroll.remarks || '');
        setIsDialogOpen(true);
    };

    const handleAdd = () => {
        setEditingPayroll(null);
        reset();
        setIsDialogOpen(true);
    };

    const handleDelete = () => {
        if (deleteId) {
            deleteMutation.mutate(deleteId);
        }
    };

    const filteredPayrolls = payrolls.filter((payroll: Payroll) => {
        const teacherName = payroll.teacher
            ? `${payroll.teacher.first_name} ${payroll.teacher.last_name}`
            : '';
        return teacherName.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const stats = {
        total: payrolls.length,
        totalPaid: payrolls
            .filter((p: Payroll) => p.status === 'Paid')
            .reduce((acc: number, p: Payroll) => acc + (p.salary_amount + p.bonus - p.deductions), 0),
        pendingCount: payrolls.filter((p: Payroll) => p.status === 'Pending').length,
        processedCount: payrolls.filter((p: Payroll) => p.status === 'Processing').length,
    };

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">Loading payroll...</p>
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
                        <h1 className="text-3xl font-bold">Payroll</h1>
                        <p className="text-muted-foreground mt-1">Manage staff salaries and payments</p>
                    </div>
                    <Button onClick={handleAdd} className="gap-2">
                        <Plus className="w-4 h-4" />
                        New Payment
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
                                <DollarSign className="w-8 h-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Paid</p>
                                    <h3 className="text-2xl font-bold mt-1 text-green-600">
                                        ${stats.totalPaid.toLocaleString()}
                                    </h3>
                                </div>
                                <CreditCard className="w-8 h-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Pending</p>
                                    <h3 className="text-2xl font-bold mt-1 text-orange-600">{stats.pendingCount}</h3>
                                </div>
                                <Clock className="w-8 h-8 text-orange-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Processing</p>
                                    <h3 className="text-2xl font-bold mt-1 text-blue-600">{stats.processedCount}</h3>
                                </div>
                                <CheckCircle className="w-8 h-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent className="p-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by teacher name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Payment Records ({filteredPayrolls.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4 font-medium">Date</th>
                                        <th className="text-left p-4 font-medium">Teacher</th>
                                        <th className="text-left p-4 font-medium">Amount</th>
                                        <th className="text-left p-4 font-medium">Method</th>
                                        <th className="text-left p-4 font-medium">Status</th>
                                        <th className="text-right p-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPayrolls.map((payroll: Payroll) => (
                                        <tr key={payroll.id} className="border-b hover:bg-muted/50">
                                            <td className="p-4 font-medium">
                                                {new Date(payroll.payment_date).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                {payroll.teacher
                                                    ? `${payroll.teacher.first_name} ${payroll.teacher.last_name}`
                                                    : 'Unknown Teacher'}
                                            </td>
                                            <td className="p-4 font-medium">
                                                ${(payroll.salary_amount + payroll.bonus - payroll.deductions).toLocaleString()}
                                            </td>
                                            <td className="p-4 text-sm text-muted-foreground">{payroll.payment_method}</td>
                                            <td className="p-4">
                                                <Badge
                                                    variant={
                                                        payroll.status === 'Paid'
                                                            ? 'success'
                                                            : payroll.status === 'Pending'
                                                                ? 'destructive'
                                                                : 'secondary'
                                                    }
                                                >
                                                    {payroll.status}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    {payroll.status === 'Pending' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => approveMutation.mutate(payroll.id)}
                                                            className="text-green-600 hover:text-green-700"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(payroll)}>
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(payroll.id)}>
                                                        <Trash2 className="w-4 h-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredPayrolls.length === 0 && (
                                <div className="text-center py-12">
                                    <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No payment records found</h3>
                                    <p className="text-muted-foreground">
                                        {searchQuery ? 'Try adjusting your search' : 'Get started by creating a new payment'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingPayroll ? 'Edit' : 'New'} Payment</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="salary_amount">Basic Salary</Label>
                                    <Input
                                        id="salary_amount"
                                        type="number"
                                        {...register('salary_amount', { valueAsNumber: true })}
                                    />
                                    {errors.salary_amount && (
                                        <p className="text-sm text-destructive mt-1">{errors.salary_amount.message}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="bonus">Bonus</Label>
                                    <Input
                                        id="bonus"
                                        type="number"
                                        {...register('bonus', { valueAsNumber: true })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="deductions">Deductions</Label>
                                    <Input
                                        id="deductions"
                                        type="number"
                                        {...register('deductions', { valueAsNumber: true })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="payment_date">
                                        Date <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="payment_date"
                                        type="date"
                                        {...register('payment_date')}
                                        className={errors.payment_date ? 'border-destructive' : ''}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="payment_method">Method</Label>
                                    <Select
                                        value={selectedMethod}
                                        onValueChange={(value) => setValue('payment_method', value as any)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                            <SelectItem value="Check">Check</SelectItem>
                                            <SelectItem value="Cash">Cash</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                                            <SelectItem value="Paid">Paid</SelectItem>
                                            <SelectItem value="Processing">Processing</SelectItem>
                                            <SelectItem value="Pending">Pending</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                                        setEditingPayroll(null);
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
                                This action cannot be undone. This will permanently delete the payroll record.
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
