import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { teacherService } from '../../services/teacher.service';
import { toast } from 'sonner';
import {
    CheckCircle2,
    XCircle,
    Clock,
    Loader2,
    Calendar,
    User,
    AlertCircle,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

export const AdminLeaveRequestsPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [selectedTab, setSelectedTab] = useState('pending');
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    // Fetch pending leave requests
    const { data: requestsData, isLoading } = useQuery({
        queryKey: ['leave-requests'],
        queryFn: () => teacherService.getPendingLeaves(),
    });

    // Approve mutation
    const approveMutation = useMutation({
        mutationFn: (leaveRequestId: string) => teacherService.approveLeave(leaveRequestId),
        onSuccess: () => {
            toast.success('Leave request approved successfully');
            queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to approve leave request');
        },
    });

    // Reject mutation
    const rejectMutation = useMutation({
        mutationFn: ({ leaveRequestId, reason }: { leaveRequestId: string; reason?: string }) =>
            teacherService.rejectLeave(leaveRequestId, reason),
        onSuccess: () => {
            toast.success('Leave request rejected');
            queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
            setRejectDialogOpen(false);
            setRejectionReason('');
            setSelectedRequest(null);
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to reject leave request');
        },
    });

    const handleApprove = (leaveRequestId: string) => {
        if (window.confirm('Are you sure you want to approve this leave request?')) {
            approveMutation.mutate(leaveRequestId);
        }
    };

    const handleRejectClick = (request: any) => {
        setSelectedRequest(request);
        setRejectDialogOpen(true);
    };

    const handleRejectConfirm = () => {
        if (selectedRequest) {
            rejectMutation.mutate({
                leaveRequestId: selectedRequest.id,
                reason: rejectionReason,
            });
        }
    };

    const requests = requestsData?.data || [];
    const pendingRequests = requests.filter((r: any) => r.status === 'pending');
    const approvedRequests = requests.filter((r: any) => r.status === 'approved');
    const rejectedRequests = requests.filter((r: any) => r.status === 'rejected');

    const getStatusIcon = (status: string) => {
        if (status === 'approved') return <CheckCircle2 className="w-4 h-4 text-green-500" />;
        if (status === 'rejected') return <XCircle className="w-4 h-4 text-red-500" />;
        return <Clock className="w-4 h-4 text-yellow-500" />;
    };

    const getStatusColor = (status: string) => {
        if (status === 'approved')
            return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        if (status === 'rejected')
            return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    };

    const renderRequestCard = (request: any) => (
        <div
            key={request.id}
            className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors gap-4"
        >
            <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">
                            {request.teacher?.first_name} {request.teacher?.last_name}
                        </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                        ({request.teacher?.employee_code})
                    </span>
                    <span
                        className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getStatusColor(
                            request.status
                        )}`}
                    >
                        {getStatusIcon(request.status)}
                        {request.status}
                    </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span className="capitalize">{request.leave_type} Leave</span>
                    </div>
                    <span>•</span>
                    <span>
                        {new Date(request.start_date).toLocaleDateString()} -{' '}
                        {new Date(request.end_date).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span>{request.days_count} day(s)</span>
                </div>
                {request.reason && (
                    <p className="text-sm text-muted-foreground italic">
                        Reason: "{request.reason}"
                    </p>
                )}
                {request.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                        <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleApprove(request.id)}
                            disabled={approveMutation.isPending}
                        >
                            {approveMutation.isPending ? (
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                            )}
                            Approve
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectClick(request)}
                            disabled={rejectMutation.isPending}
                        >
                            {rejectMutation.isPending ? (
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                                <XCircle className="w-4 h-4 mr-1" />
                            )}
                            Reject
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">Leave Requests Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Review and manage teacher leave requests
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Pending</p>
                                    <h3 className="text-2xl font-bold mt-1">{pendingRequests.length}</h3>
                                </div>
                                <Clock className="w-10 h-10 text-yellow-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Approved</p>
                                    <h3 className="text-2xl font-bold mt-1">{approvedRequests.length}</h3>
                                </div>
                                <CheckCircle2 className="w-10 h-10 text-green-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Rejected</p>
                                    <h3 className="text-2xl font-bold mt-1">{rejectedRequests.length}</h3>
                                </div>
                                <XCircle className="w-10 h-10 text-red-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Requests List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Leave Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="pending">
                                    Pending ({pendingRequests.length})
                                </TabsTrigger>
                                <TabsTrigger value="approved">
                                    Approved ({approvedRequests.length})
                                </TabsTrigger>
                                <TabsTrigger value="rejected">
                                    Rejected ({rejectedRequests.length})
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="pending" className="space-y-4 mt-4">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : pendingRequests.length > 0 ? (
                                    pendingRequests.map(renderRequestCard)
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>No pending requests</p>
                                    </div>
                                )}
                            </TabsContent>
                            <TabsContent value="approved" className="space-y-4 mt-4">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : approvedRequests.length > 0 ? (
                                    approvedRequests.map(renderRequestCard)
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>No approved requests</p>
                                    </div>
                                )}
                            </TabsContent>
                            <TabsContent value="rejected" className="space-y-4 mt-4">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : rejectedRequests.length > 0 ? (
                                    rejectedRequests.map(renderRequestCard)
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>No rejected requests</p>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Reject Dialog */}
                <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Reject Leave Request</DialogTitle>
                            <DialogDescription>
                                Please provide a reason for rejecting this leave request (optional)
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Label htmlFor="rejection-reason">Rejection Reason</Label>
                            <textarea
                                id="rejection-reason"
                                placeholder="Enter reason for rejection..."
                                value={rejectionReason}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectionReason(e.target.value)}
                                rows={4}
                                className="mt-2 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleRejectConfirm}
                                disabled={rejectMutation.isPending}
                            >
                                {rejectMutation.isPending && (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                )}
                                Reject Request
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </MainLayout>
    );
};
