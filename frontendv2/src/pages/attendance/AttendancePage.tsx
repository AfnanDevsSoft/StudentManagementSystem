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
import { attendanceService } from '../../services/attendance.service';
import type { Attendance } from '../../services/attendance.service';
import { attendanceSchema } from '../../schemas/attendance.schema';
import type { AttendanceFormData } from '../../schemas/attendance.schema';
import { studentService } from '../../services/student.service';
import { useToast } from '../../hooks/use-toast';
import { Plus, Search, Edit, Trash2, Calendar, UserCheck, UserX, Clock } from 'lucide-react';

export const AttendancePage: React.FC = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Fetch attendance
    const { data: attendanceData, isLoading: isLoadingAttendance } = useQuery({
        queryKey: ['attendance'],
        queryFn: () => attendanceService.getAll(),
    });

    // Fetch students
    const { data: studentsData } = useQuery({
        queryKey: ['students'],
        queryFn: () => studentService.getAll(),
    });

    const attendanceList = attendanceData?.data || [];
    const students = studentsData?.data || [];

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<AttendanceFormData>({
        resolver: zodResolver(attendanceSchema),
        defaultValues: {
            student_id: '',
            date: new Date().toISOString().split('T')[0],
            status: 'Present',
            remarks: '',
        },
    });

    const selectedStatus = watch('status');
    const selectedStudent = watch('student_id');

    const createMutation = useMutation({
        mutationFn: attendanceService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance'] });
            toast({
                title: 'Success',
                description: 'Attendance marked successfully',
            });
            setIsDialogOpen(false);
            reset();
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to mark attendance',
                variant: 'destructive',
            });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<AttendanceFormData> }) =>
            attendanceService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance'] });
            toast({
                title: 'Success',
                description: 'Attendance updated successfully',
            });
            setIsDialogOpen(false);
            setEditingAttendance(null);
            reset();
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update attendance',
                variant: 'destructive',
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: attendanceService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance'] });
            toast({
                title: 'Success',
                description: 'Attendance record deleted successfully',
            });
            setDeleteId(null);
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete attendance',
                variant: 'destructive',
            });
        },
    });

    const onSubmit = (data: AttendanceFormData) => {
        if (editingAttendance) {
            updateMutation.mutate({ id: editingAttendance.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleEdit = (attendance: Attendance) => {
        setEditingAttendance(attendance);
        setValue('student_id', attendance.student_id);
        setValue('date', attendance.date.split('T')[0]);
        setValue('status', attendance.status);
        setValue('remarks', attendance.remarks || '');
        setIsDialogOpen(true);
    };

    const handleAdd = () => {
        setEditingAttendance(null);
        reset();
        setIsDialogOpen(true);
    };

    const handleDelete = () => {
        if (deleteId) {
            deleteMutation.mutate(deleteId);
        }
    };

    const filteredAttendance = attendanceList.filter((record: Attendance) => {
        const studentName = record.student
            ? `${record.student.first_name} ${record.student.last_name}`
            : 'Unknown Student';
        return studentName.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const stats = {
        total: attendanceList.length,
        present: attendanceList.filter((a: Attendance) => a.status === 'Present').length,
        absent: attendanceList.filter((a: Attendance) => a.status === 'Absent').length,
        late: attendanceList.filter((a: Attendance) => a.status === 'Late').length,
    };

    if (isLoadingAttendance) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">Loading attendance...</p>
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
                        <h1 className="text-3xl font-bold">Attendance</h1>
                        <p className="text-muted-foreground mt-1">Manage student attendance records</p>
                    </div>
                    <Button onClick={handleAdd} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Mark Attendance
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
                                <Calendar className="w-8 h-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Present</p>
                                    <h3 className="text-2xl font-bold mt-1 text-green-600">{stats.present}</h3>
                                </div>
                                <UserCheck className="w-8 h-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Absent</p>
                                    <h3 className="text-2xl font-bold mt-1 text-red-600">{stats.absent}</h3>
                                </div>
                                <UserX className="w-8 h-8 text-red-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Late</p>
                                    <h3 className="text-2xl font-bold mt-1 text-orange-600">{stats.late}</h3>
                                </div>
                                <Clock className="w-8 h-8 text-orange-500" />
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

                <Card>
                    <CardHeader>
                        <CardTitle>Attendance Records ({filteredAttendance.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4 font-medium">Date</th>
                                        <th className="text-left p-4 font-medium">Student</th>
                                        <th className="text-left p-4 font-medium">Status</th>
                                        <th className="text-left p-4 font-medium">Remarks</th>
                                        <th className="text-right p-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAttendance.map((record: Attendance) => (
                                        <tr key={record.id} className="border-b hover:bg-muted/50">
                                            <td className="p-4 font-medium">
                                                {new Date(record.date).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                {record.student
                                                    ? `${record.student.first_name} ${record.student.last_name} (${record.student.student_code})`
                                                    : 'Unknown Student'}
                                            </td>
                                            <td className="p-4">
                                                <Badge
                                                    variant={
                                                        record.status === 'Present'
                                                            ? 'success'
                                                            : record.status === 'Absent'
                                                                ? 'destructive'
                                                                : 'secondary'
                                                    }
                                                >
                                                    {record.status}
                                                </Badge>
                                            </td>
                                            <td className="p-4 text-sm text-muted-foreground">{record.remarks || '-'}</td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(record)}>
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(record.id)}>
                                                        <Trash2 className="w-4 h-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredAttendance.length === 0 && (
                                <div className="text-center py-12">
                                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No attendance records found</h3>
                                    <p className="text-muted-foreground">
                                        {searchQuery ? 'Try adjusting your search' : 'Get started by marking attendance'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingAttendance ? 'Edit' : 'Mark'} Attendance</DialogTitle>
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

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="date">
                                        Date <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        {...register('date')}
                                        className={errors.date ? 'border-destructive' : ''}
                                    />
                                    {errors.date && (
                                        <p className="text-sm text-destructive mt-1">{errors.date.message}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="status">
                                        Status <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={selectedStatus}
                                        onValueChange={(value) => setValue('status', value as any)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Present">Present</SelectItem>
                                            <SelectItem value="Absent">Absent</SelectItem>
                                            <SelectItem value="Late">Late</SelectItem>
                                            <SelectItem value="Excused">Excused</SelectItem>
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
                                        setEditingAttendance(null);
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
                                This action cannot be undone. This will delete the attendance record.
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
