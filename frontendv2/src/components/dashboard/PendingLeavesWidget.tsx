import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { leaveService } from '../../services/leave.service';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { Check, X, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export const PendingLeavesWidget: React.FC = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: leavesData, isLoading } = useQuery({
        queryKey: ['pending-leaves'],
        queryFn: leaveService.getPending,
    });

    const pendingLeaves = (leavesData as any)?.data || leavesData || [];

    const approveMutation = useMutation({
        mutationFn: (id: string) => leaveService.approve(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pending-leaves'] });
            toast({
                title: 'Success',
                description: 'Leave request approved',
            });
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.message || 'Failed to approve request',
                variant: 'destructive',
            });
        },
    });

    const rejectMutation = useMutation({
        mutationFn: (id: string) => leaveService.reject(id, 'Admin Rejected'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pending-leaves'] });
            toast({
                title: 'Success',
                description: 'Leave request rejected',
            });
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.message || 'Failed to reject request',
                variant: 'destructive',
            });
        },
    });

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-500" />
                        Pending Approvals
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-40 flex items-center justify-center text-muted-foreground">
                        Loading...
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    Pending Approvals
                    {pendingLeaves.length > 0 && (
                        <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                            {pendingLeaves.length}
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {pendingLeaves.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg">
                        <Check className="w-8 h-8 mx-auto mb-2 text-green-500 opacity-50" />
                        <p>No pending approvals</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingLeaves.map((leave: any) => (
                            <div
                                key={leave.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                            >
                                <div className="space-y-1 mb-3 sm:mb-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">{leave.teacher?.first_name} {leave.teacher?.last_name}</span>
                                        <span className="text-xs text-muted-foreground">({leave.leave_type})</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="w-3 h-3" />
                                        <span>
                                            {format(new Date(leave.start_date), 'MMM d')} - {format(new Date(leave.end_date), 'MMM d')}
                                        </span>
                                        <span className="text-xs bg-muted px-1.5 rounded">
                                            {leave.days_count} days
                                        </span>
                                    </div>
                                    <p className="text-sm italic text-muted-foreground mt-1">"{leave.reason}"</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                        onClick={() => approveMutation.mutate(leave.id)}
                                        disabled={approveMutation.isPending || rejectMutation.isPending}
                                    >
                                        <Check className="w-4 h-4 mr-1" />
                                        Approve
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                        onClick={() => rejectMutation.mutate(leave.id)}
                                        disabled={approveMutation.isPending || rejectMutation.isPending}
                                    >
                                        <X className="w-4 h-4 mr-1" />
                                        Reject
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
