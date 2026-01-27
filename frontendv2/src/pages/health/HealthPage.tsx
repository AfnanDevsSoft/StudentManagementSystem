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
import { healthService } from '../../services/health.service';
import type { HealthRecord } from '../../services/health.service';
import { healthSchema } from '../../schemas/health.schema';
import type { HealthFormData } from '../../schemas/health.schema';
import { studentService } from '../../services/student.service';
import { useToast } from '../../hooks/use-toast';
import { Plus, Search, Edit, Trash2, HeartPulse, Activity, FileHeart } from 'lucide-react';

export const HealthPage: React.FC = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Fetch health records
    const { data: healthData, isLoading } = useQuery({
        queryKey: ['health-records'],
        queryFn: () => healthService.getAll(),
    });

    // Fetch students
    const { data: studentsData } = useQuery({
        queryKey: ['students'],
        queryFn: () => studentService.getAll(),
    });

    const records = healthData?.data || [];
    const students = studentsData?.data || [];

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<HealthFormData>({
        resolver: zodResolver(healthSchema),
        defaultValues: {
            student_id: '',
            blood_group: '',
            height: undefined,
            weight: undefined,
            allergies: '',
            medical_history: '',
            emergency_contact: '',
            emergency_phone: '',
            last_checkup_date: new Date().toISOString().split('T')[0],
            notes: '',
        },
    });

    const selectedStudent = watch('student_id');
    const selectedBloodGroup = watch('blood_group');

    const createMutation = useMutation({
        mutationFn: healthService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['health-records'] });
            toast({
                title: 'Success',
                description: 'Health record created successfully',
            });
            setIsDialogOpen(false);
            reset();
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to create health record',
                variant: 'destructive',
            });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<HealthFormData> }) =>
            healthService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['health-records'] });
            toast({
                title: 'Success',
                description: 'Health record updated successfully',
            });
            setIsDialogOpen(false);
            setEditingRecord(null);
            reset();
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update health record',
                variant: 'destructive',
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: healthService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['health-records'] });
            toast({
                title: 'Success',
                description: 'Health record deleted successfully',
            });
            setDeleteId(null);
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete health record',
                variant: 'destructive',
            });
        },
    });

    const onSubmit = (data: HealthFormData) => {
        if (editingRecord) {
            updateMutation.mutate({ id: editingRecord.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleEdit = (record: HealthRecord) => {
        setEditingRecord(record);
        setValue('student_id', record.student_id);
        setValue('blood_group', record.blood_group || '');
        setValue('height', record.height);
        setValue('weight', record.weight);
        setValue('allergies', record.allergies || '');
        setValue('medical_history', record.medical_history || '');
        setValue('emergency_contact', record.emergency_contact || '');
        setValue('emergency_phone', record.emergency_phone || '');
        setValue('last_checkup_date', record.last_checkup_date ? record.last_checkup_date.split('T')[0] : '');
        setValue('notes', record.notes || '');
        setIsDialogOpen(true);
    };

    const handleAdd = () => {
        setEditingRecord(null);
        reset();
        setIsDialogOpen(true);
    };

    const handleDelete = () => {
        if (deleteId) {
            deleteMutation.mutate(deleteId);
        }
    };

    const filteredRecords = records.filter((record: HealthRecord) => {
        const studentName = record.student
            ? `${record.student.first_name} ${record.student.last_name}`
            : 'Unknown Student';
        return studentName.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const stats = {
        total: records.length,
        withAllergies: records.filter((r: HealthRecord) => r.allergies && r.allergies.length > 0).length,
        recentCheckups: records.filter((r: HealthRecord) => {
            if (!r.last_checkup_date) return false;
            const date = new Date(r.last_checkup_date);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - date.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 30;
        }).length,
    };

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">Loading health records...</p>
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
                        <h1 className="text-3xl font-bold">Health Records</h1>
                        <p className="text-muted-foreground mt-1">Manage student health and medical information</p>
                    </div>
                    <Button onClick={handleAdd} className="gap-2">
                        <Plus className="w-4 h-4" />
                        New Record
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Records</p>
                                    <h3 className="text-2xl font-bold mt-1">{stats.total}</h3>
                                </div>
                                <FileHeart className="w-8 h-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Students with Allergies</p>
                                    <h3 className="text-2xl font-bold mt-1 text-red-600">{stats.withAllergies}</h3>
                                </div>
                                <Activity className="w-8 h-8 text-red-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Recent Checkups (30d)</p>
                                    <h3 className="text-2xl font-bold mt-1 text-green-600">{stats.recentCheckups}</h3>
                                </div>
                                <HeartPulse className="w-8 h-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent className="p-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by student name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRecords.map((record: HealthRecord) => (
                        <Card key={record.id}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-bold">
                                        {record.student?.first_name} {record.student?.last_name}
                                    </CardTitle>
                                    <Badge variant="outline">{record.blood_group || 'N/A'}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">ID: {record.student?.student_code}</p>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 text-sm">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <span className="font-semibold">Height:</span> {record.height ? `${record.height} cm` : '-'}
                                        </div>
                                        <div>
                                            <span className="font-semibold">Weight:</span> {record.weight ? `${record.weight} kg` : '-'}
                                        </div>
                                    </div>

                                    <div>
                                        <span className="font-semibold block mb-1">Allergies:</span>
                                        {record.allergies ? (
                                            <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded text-xs">{record.allergies}</span>
                                        ) : (
                                            <span className="text-muted-foreground">None known</span>
                                        )}
                                    </div>

                                    <div>
                                        <span className="font-semibold block mb-1">Last Checkup:</span>
                                        {record.last_checkup_date ? new Date(record.last_checkup_date).toLocaleDateString() : 'Never'}
                                    </div>

                                    {record.emergency_contact && (
                                        <div className="bg-muted p-2 rounded mt-2">
                                            <span className="font-semibold block text-xs uppercase text-muted-foreground mb-1">Emergency Contact</span>
                                            <div className="flex justify-between items-center">
                                                <span>{record.emergency_contact}</span>
                                                <span className="font-mono">{record.emergency_phone}</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-end gap-2 pt-4 border-t mt-4">
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(record)}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => setDeleteId(record.id)}>
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {filteredRecords.length === 0 && (
                        <div className="col-span-full text-center py-12">
                            <FileHeart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No health records found</h3>
                            <p className="text-muted-foreground">
                                {searchQuery ? 'Try adjusting your search' : 'Get started by creating a new health record'}
                            </p>
                        </div>
                    )}
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>{editingRecord ? 'Edit' : 'New'} Health Record</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="blood_group">Blood Group</Label>
                                    <Select
                                        value={selectedBloodGroup}
                                        onValueChange={(value) => setValue('blood_group', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                                <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="height">Height (cm)</Label>
                                    <Input
                                        id="height"
                                        type="number"
                                        {...register('height', { valueAsNumber: true })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="weight">Weight (kg)</Label>
                                    <Input
                                        id="weight"
                                        type="number"
                                        {...register('weight', { valueAsNumber: true })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="allergies">Allergies</Label>
                                    <Input id="allergies" {...register('allergies')} placeholder="Comma separated..." />
                                </div>
                                <div>
                                    <Label htmlFor="last_checkup_date">Last Checkup</Label>
                                    <Input id="last_checkup_date" type="date" {...register('last_checkup_date')} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="emergency_contact">Emergency Contact Name</Label>
                                    <Input id="emergency_contact" {...register('emergency_contact')} />
                                </div>
                                <div>
                                    <Label htmlFor="emergency_phone">Emergency Contact Phone</Label>
                                    <Input id="emergency_phone" {...register('emergency_phone')} />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="medical_history">Medical History</Label>
                                <Input id="medical_history" {...register('medical_history')} />
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
                                        setEditingRecord(null);
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
                                This action cannot be undone. This will permanently delete the health record.
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
