import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { financeService } from '../../services/finance.service';
import { feeSchema, paymentSchema, scholarshipSchema } from '../../schemas/finance.schema';
import type { FeeFormData, PaymentFormData, ScholarshipFormData } from '../../schemas/finance.schema';
import { studentService } from '../../services/student.service';
import { useToast } from '../../hooks/use-toast';
import { Plus, Edit, Trash2, DollarSign, CreditCard, Award, Wallet } from 'lucide-react';

export const FinancePage: React.FC = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<'fees' | 'payments' | 'scholarships'>('fees');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Pagination state per tab
    const [feesPage, setFeesPage] = useState(1);
    const [paymentsPage, setPaymentsPage] = useState(1);
    const [scholarshipsPage, setScholarshipsPage] = useState(1);
    const limit = 20;

    // Fetch data with pagination
    const { data: feesData } = useQuery({
        queryKey: ['fees', feesPage, limit],
        queryFn: () => financeService.fees.getAll({ page: feesPage, limit })
    });
    const { data: paymentsData } = useQuery({
        queryKey: ['payments', paymentsPage, limit],
        queryFn: () => financeService.payments.getAll({ page: paymentsPage, limit })
    });
    const { data: scholarshipsData } = useQuery({
        queryKey: ['scholarships', scholarshipsPage, limit],
        queryFn: () => financeService.scholarships.getAll({ page: scholarshipsPage, limit })
    });
    const { data: studentsData } = useQuery({
        queryKey: ['students-all'],
        queryFn: () => studentService.getAll({ limit: 1000 })
    });

    const fees = feesData?.data || [];
    const feesPagination = feesData?.pagination || { total: fees.length, pages: 1 };
    const payments = paymentsData?.data || [];
    const paymentsPagination = paymentsData?.pagination || { total: payments.length, pages: 1 };
    const scholarships = scholarshipsData?.data || [];
    const scholarshipsPagination = scholarshipsData?.pagination || { total: scholarships.length, pages: 1 };
    const students = studentsData?.data || [];

    // Forms
    const feeForm = useForm<FeeFormData>({
        resolver: zodResolver(feeSchema),
        defaultValues: { name: '', amount: 0, due_date: '', description: '' }
    });

    const paymentForm = useForm<PaymentFormData>({
        resolver: zodResolver(paymentSchema),
        defaultValues: { student_id: '', fee_id: '', amount_paid: 0, payment_date: '', payment_method: 'Cash', status: 'Pending' }
    });

    const scholarshipForm = useForm<ScholarshipFormData>({
        resolver: zodResolver(scholarshipSchema),
        defaultValues: { name: '', amount: 0, student_id: '', start_date: '', end_date: '', conditions: '' }
    });

    // Mutations
    const feeMutation = useMutation({
        mutationFn: editingItem ? (data: any) => financeService.fees.update(editingItem.id, data) : financeService.fees.create,
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['fees'] }); closeModal(); }
    });

    const paymentMutation = useMutation({
        mutationFn: editingItem ? (data: any) => financeService.payments.update(editingItem.id, data) : financeService.payments.create,
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['payments'] }); closeModal(); }
    });

    const scholarshipMutation = useMutation({
        mutationFn: editingItem ? (data: any) => financeService.scholarships.update(editingItem.id, data) : financeService.scholarships.create,
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['scholarships'] }); closeModal(); }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => {
            if (activeTab === 'fees') return financeService.fees.delete(id);
            if (activeTab === 'payments') return financeService.payments.delete(id);
            return financeService.scholarships.delete(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [activeTab] });
            toast({ title: 'Success', description: 'Item deleted successfully' });
            setDeleteId(null);
        }
    });

    const closeModal = () => {
        setIsDialogOpen(false);
        setEditingItem(null);
        feeForm.reset();
        paymentForm.reset();
        scholarshipForm.reset();
    };

    const handleEdit = (item: any) => {
        setEditingItem(item);
        if (activeTab === 'fees') {
            feeForm.setValue('name', item.fee_name || item.name); // Handle both
            feeForm.setValue('amount', Number(item.amount));
            feeForm.setValue('due_date', item.due_date.split('T')[0]);
            feeForm.setValue('description', item.description || '');
        } else if (activeTab === 'payments') {
            paymentForm.setValue('student_id', item.student_id);
            paymentForm.setValue('fee_id', item.fee_id);
            paymentForm.setValue('amount_paid', item.amount_paid);
            paymentForm.setValue('payment_date', item.payment_date.split('T')[0]);
            paymentForm.setValue('payment_method', item.payment_method);
            paymentForm.setValue('status', item.status);
            paymentForm.setValue('transaction_id', item.transaction_id || '');
        } else {
            scholarshipForm.setValue('name', item.name);
            scholarshipForm.setValue('amount', item.amount);
            scholarshipForm.setValue('student_id', item.student_id);
            scholarshipForm.setValue('start_date', item.start_date.split('T')[0]);
            scholarshipForm.setValue('end_date', item.end_date.split('T')[0]);
            scholarshipForm.setValue('conditions', item.conditions || '');
        }
        setIsDialogOpen(true);
    };

    const onSubmit = (data: any) => {
        if (activeTab === 'fees') feeMutation.mutate(data);
        else if (activeTab === 'payments') paymentMutation.mutate(data);
        else scholarshipMutation.mutate(data);
    };

    const stats = {
        totalFees: fees.reduce((acc: number, f: any) => acc + Number(f.amount), 0),
        collected: payments.filter((p: any) => p.status?.toLowerCase() === 'completed').reduce((acc: number, p: any) => acc + Number(p.amount_paid), 0),
        pending: payments.filter((p: any) => p.status?.toLowerCase() === 'pending').reduce((acc: number, p: any) => acc + Number(p.amount_paid), 0),
        scholarships: scholarships.reduce((acc: number, s: any) => acc + Number(s.amount), 0),
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Finance</h1>
                        <p className="text-muted-foreground mt-1">Manage fees, payments, and scholarships</p>
                    </div>
                    <Button onClick={() => { setEditingItem(null); setIsDialogOpen(true); }} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add {activeTab === 'fees' ? 'Fee' : activeTab === 'payments' ? 'Payment' : 'Scholarship'}
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Fees Set</p>
                                    <h3 className="text-2xl font-bold mt-1">${stats.totalFees.toLocaleString()}</h3>
                                </div>
                                <DollarSign className="w-8 h-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Collected</p>
                                    <h3 className="text-2xl font-bold mt-1 text-green-600">${stats.collected.toLocaleString()}</h3>
                                </div>
                                <Wallet className="w-8 h-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Pending</p>
                                    <h3 className="text-2xl font-bold mt-1 text-orange-600">${stats.pending.toLocaleString()}</h3>
                                </div>
                                <CreditCard className="w-8 h-8 text-orange-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Scholarships</p>
                                    <h3 className="text-2xl font-bold mt-1 text-blue-600">${stats.scholarships.toLocaleString()}</h3>
                                </div>
                                <Award className="w-8 h-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex space-x-2 border-b">
                    <Button
                        variant={activeTab === 'fees' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('fees')}
                        className="rounded-b-none"
                    >
                        Fees Structure
                    </Button>
                    <Button
                        variant={activeTab === 'payments' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('payments')}
                        className="rounded-b-none"
                    >
                        Payments
                    </Button>
                    <Button
                        variant={activeTab === 'scholarships' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('scholarships')}
                        className="rounded-b-none"
                    >
                        Scholarships
                    </Button>
                </div>

                <Card>
                    <CardContent className="p-6">
                        {activeTab === 'fees' && (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4">Fee Name</th>
                                        <th className="text-left p-4">Amount</th>
                                        <th className="text-left p-4">Due Date</th>
                                        <th className="text-right p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fees.map((fee: any) => (
                                        <tr key={fee.id} className="border-b">
                                            <td className="p-4">{fee.fee_name}</td>
                                            <td className="p-4">${Number(fee.amount)}</td>
                                            <td className="p-4">{new Date(fee.due_date).toLocaleDateString()}</td>
                                            <td className="text-right p-4">
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(fee)}><Edit className="w-4 h-4" /></Button>
                                                <Button variant="ghost" size="sm" onClick={() => setDeleteId(fee.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'payments' && (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4">Student</th>
                                        <th className="text-left p-4">Fee Type</th>
                                        <th className="text-left p-4">Amount</th>
                                        <th className="text-left p-4">Date</th>
                                        <th className="text-left p-4">Status</th>
                                        <th className="text-right p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((payment: any) => (
                                        <tr key={payment.id} className="border-b">
                                            <td className="p-4">{payment.student?.first_name} {payment.student?.last_name}</td>
                                            <td className="p-4">{payment.fee?.fee_name} ({payment.fee?.fee_type})</td>
                                            <td className="p-4">${Number(payment.amount_paid)}</td>
                                            <td className="p-4">{new Date(payment.payment_date).toLocaleDateString()}</td>
                                            <td className="p-4"><Badge variant={payment.status === 'Completed' ? 'success' : 'secondary'}>{payment.status}</Badge></td>
                                            <td className="text-right p-4">
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(payment)}><Edit className="w-4 h-4" /></Button>
                                                <Button variant="ghost" size="sm" onClick={() => setDeleteId(payment.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'scholarships' && (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4">Name</th>
                                        <th className="text-left p-4">Student</th>
                                        <th className="text-left p-4">Amount</th>
                                        <th className="text-left p-4">Duration</th>
                                        <th className="text-right p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {scholarships.map((scholarship: any) => (
                                        <tr key={scholarship.id} className="border-b">
                                            <td className="p-4">{scholarship.name}</td>
                                            <td className="p-4">{scholarship.student?.first_name} {scholarship.student?.last_name}</td>
                                            <td className="p-4">${scholarship.amount}</td>
                                            <td className="p-4">{new Date(scholarship.start_date).toLocaleDateString()} - {new Date(scholarship.end_date).toLocaleDateString()}</td>
                                            <td className="text-right p-4">
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(scholarship)}><Edit className="w-4 h-4" /></Button>
                                                <Button variant="ghost" size="sm" onClick={() => setDeleteId(scholarship.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {/* Pagination Controls */}
                        <div className="flex items-center justify-between px-4 py-4 border-t">
                            <div className="text-sm text-muted-foreground">
                                {activeTab === 'fees' && (
                                    <>Showing {((feesPage - 1) * limit) + 1} to {Math.min(feesPage * limit, feesPagination.total)} of {feesPagination.total} fees</>
                                )}
                                {activeTab === 'payments' && (
                                    <>Showing {((paymentsPage - 1) * limit) + 1} to {Math.min(paymentsPage * limit, paymentsPagination.total)} of {paymentsPagination.total} payments</>
                                )}
                                {activeTab === 'scholarships' && (
                                    <>Showing {((scholarshipsPage - 1) * limit) + 1} to {Math.min(scholarshipsPage * limit, scholarshipsPagination.total)} of {scholarshipsPagination.total} scholarships</>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        if (activeTab === 'fees') setFeesPage(p => Math.max(1, p - 1));
                                        else if (activeTab === 'payments') setPaymentsPage(p => Math.max(1, p - 1));
                                        else setScholarshipsPage(p => Math.max(1, p - 1));
                                    }}
                                    disabled={
                                        (activeTab === 'fees' && feesPage === 1) ||
                                        (activeTab === 'payments' && paymentsPage === 1) ||
                                        (activeTab === 'scholarships' && scholarshipsPage === 1)
                                    }
                                >
                                    Previous
                                </Button>
                                <span className="flex items-center px-3 text-sm">
                                    Page {
                                        activeTab === 'fees' ? feesPage :
                                            activeTab === 'payments' ? paymentsPage : scholarshipsPage
                                    } of {
                                        activeTab === 'fees' ? feesPagination.pages :
                                            activeTab === 'payments' ? paymentsPagination.pages : scholarshipsPagination.pages
                                    }
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        if (activeTab === 'fees') setFeesPage(p => p + 1);
                                        else if (activeTab === 'payments') setPaymentsPage(p => p + 1);
                                        else setScholarshipsPage(p => p + 1);
                                    }}
                                    disabled={
                                        (activeTab === 'fees' && feesPage >= feesPagination.pages) ||
                                        (activeTab === 'payments' && paymentsPage >= paymentsPagination.pages) ||
                                        (activeTab === 'scholarships' && scholarshipsPage >= scholarshipsPagination.pages)
                                    }
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingItem ? 'Edit' : 'Add'} {activeTab === 'fees' ? 'Fee' : activeTab === 'payments' ? 'Payment' : 'Scholarship'}</DialogTitle>
                        </DialogHeader>
                        {activeTab === 'fees' && (
                            <form onSubmit={feeForm.handleSubmit(onSubmit)} className="space-y-4">
                                <div><Label>Name</Label><Input {...feeForm.register('name')} /></div>
                                <div><Label>Amount</Label><Input type="number" {...feeForm.register('amount', { valueAsNumber: true })} /></div>
                                <div><Label>Due Date</Label><Input type="date" {...feeForm.register('due_date')} /></div>
                                <Button type="submit">Save</Button>
                            </form>
                        )}
                        {activeTab === 'payments' && (
                            <form onSubmit={paymentForm.handleSubmit(onSubmit)} className="space-y-4">
                                <div>
                                    <Label>Student</Label>
                                    <Select onValueChange={(v) => paymentForm.setValue('student_id', v)} defaultValue={paymentForm.watch('student_id')}>
                                        <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                                        <SelectContent>{students.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.first_name} {s.last_name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Fee</Label>
                                    <Select onValueChange={(v) => paymentForm.setValue('fee_id', v)} defaultValue={paymentForm.watch('fee_id')}>
                                        <SelectTrigger><SelectValue placeholder="Select fee" /></SelectTrigger>
                                        <SelectContent>{fees.map((f: any) => <SelectItem key={f.id} value={f.id}>{f.name} (${f.amount})</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div><Label>Amount Paid</Label><Input type="number" {...paymentForm.register('amount_paid', { valueAsNumber: true })} /></div>
                                <div><Label>Date</Label><Input type="date" {...paymentForm.register('payment_date')} /></div>
                                <Button type="submit">Save</Button>
                            </form>
                        )}
                        {activeTab === 'scholarships' && (
                            <form onSubmit={scholarshipForm.handleSubmit(onSubmit)} className="space-y-4">
                                <div><Label>Name</Label><Input {...scholarshipForm.register('name')} /></div>
                                <div><Label>Amount</Label><Input type="number" {...scholarshipForm.register('amount', { valueAsNumber: true })} /></div>
                                <div>
                                    <Label>Student</Label>
                                    <Select onValueChange={(v) => scholarshipForm.setValue('student_id', v)} defaultValue={scholarshipForm.watch('student_id')}>
                                        <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                                        <SelectContent>{students.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.first_name} {s.last_name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><Label>Start Date</Label><Input type="date" {...scholarshipForm.register('start_date')} /></div>
                                    <div><Label>End Date</Label><Input type="date" {...scholarshipForm.register('end_date')} /></div>
                                </div>
                                <Button type="submit">Save</Button>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>

                <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </MainLayout>
    );
};
