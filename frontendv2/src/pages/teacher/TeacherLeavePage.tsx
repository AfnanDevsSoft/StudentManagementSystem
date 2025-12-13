import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../components/ui/dialog';
import { Calendar as CalendarIcon, Clock, CheckCircle, Plus, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { CreateLeaveRequestDto, LeaveRequest } from '../../services/leave.service';
import { leaveService } from '../../services/leave.service';
import { TeacherProfileError } from '../../components/teacher/TeacherProfileError';
import { toast } from 'sonner';

export const TeacherLeavePage: React.FC = () => {
    const { user } = useAuth();
    const teacherId = user?.teacherId;
    const queryClient = useQueryClient();

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form State
    const [type, setType] = useState<string>('sick');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');

    // Fetch Leaves
    const { data: leavesData, isLoading } = useQuery({
        queryKey: ['teacher-leaves', teacherId],
        queryFn: () => leaveService.getTeacherLeaves(teacherId!),
        enabled: !!teacherId,
    });

    const requests: LeaveRequest[] = Array.isArray(leavesData?.data) ? leavesData.data : (Array.isArray(leavesData) ? leavesData : []);

    // Stats Calculation
    const approvedCount = requests.filter(r => r.status === 'approved').length;
    const pendingCount = requests.filter(r => r.status === 'pending').length;

    // Mutation
    const createMutation = useMutation({
        mutationFn: (data: CreateLeaveRequestDto) => leaveService.requestLeave(data),
        onSuccess: () => {
            toast.success('Leave request submitted successfully');
            queryClient.invalidateQueries({ queryKey: ['teacher-leaves', teacherId] });
            setIsDialogOpen(false);
            resetForm();
        },
        onError: (error) => {
            toast.error('Failed to submit leave request');
            console.error(error);
        }
    });

    const resetForm = () => {
        setType('sick');
        setStartDate('');
        setEndDate('');
        setReason('');
    };

    const handleCreate = () => {
        if (!startDate || !endDate || !reason) {
            toast.error('Please fill in all required fields');
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);


        createMutation.mutate({
            leaveType: type,
            startDate: start.toISOString(),
            endDate: end.toISOString(),
            reason,
            teacherId: teacherId
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    if (!teacherId) {
        return <TeacherProfileError />;
    }

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Leave Management</h1>
                        <p className="text-muted-foreground mt-1">
                            Request and track your leave applications
                        </p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                New Request
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Request Leave</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Leave Type</Label>
                                    <Select value={type} onValueChange={setType}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="sick">Sick Leave</SelectItem>
                                            <SelectItem value="casual">Casual Leave</SelectItem>
                                            <SelectItem value="annual">Annual Leave</SelectItem>
                                            <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Start Date</Label>
                                        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>End Date</Label>
                                        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Reason</Label>
                                    <textarea
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="Reason for leave..."
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                                    {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Submit Request
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 text-blue-700 rounded-full">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Available Leaves</p>
                                    <h3 className="text-2xl font-bold">12 Days</h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-100 text-green-700 rounded-full">
                                    <CheckCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Approved (YTD)</p>
                                    <h3 className="text-2xl font-bold">{approvedCount} Days</h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-orange-100 text-orange-700 rounded-full">
                                    <CalendarIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Pending</p>
                                    <h3 className="text-2xl font-bold">{pendingCount} Request{pendingCount !== 1 ? 's' : ''}</h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : requests.length > 0 ? (
                            <div className="space-y-4">
                                {requests.map((req) => (
                                    <div key={req.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold capitalize">{req.type} Leave</span>
                                                <span className={`px-2 py-0.5 rounded text-xs uppercase ${getStatusColor(req.status)}`}>
                                                    {req.status}
                                                </span>
                                            </div>
                                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                <CalendarIcon className="w-3 h-3" />
                                                <span>{new Date(req.start_date).toLocaleDateString()} to {new Date(req.end_date).toLocaleDateString()}</span>
                                                <span>•</span>
                                                <span>{req.days} Day(s)</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">Reason: {req.reason}</p>
                                            {req.rejection_reason && (
                                                <p className="text-sm text-red-500">Rejection Reason: {req.rejection_reason}</p>
                                            )}
                                        </div>
                                        <Button variant="outline" size="sm">Details</Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                No leave requests found.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
};
