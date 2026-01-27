import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../hooks/use-toast';
import { workingDaysService } from '../../services/workingDays.service';
import type { WorkingDaysConfig, CreateWorkingDaysConfigDto } from '../../services/workingDays.service';
import { Plus, Calendar, Edit, Trash2, Calculator } from 'lucide-react';

export const WorkingDaysPage: React.FC = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingConfig, setEditingConfig] = useState<WorkingDaysConfig | null>(null);

    // Fetch all configs
    const { data: configsData, isLoading } = useQuery({
        queryKey: ['working-days-configs'],
        queryFn: () => workingDaysService.getAllConfigs(),
    });

    const configs = configsData?.data || [];

    // Form
    const { register, handleSubmit, reset, watch, setValue } = useForm<CreateWorkingDaysConfigDto>({
        defaultValues: {
            total_days: 180,
            start_date: '',
            end_date: '',
            is_active: true,
        },
    });

    const startDate = watch('start_date');
    const endDate = watch('end_date');

    // Calculate working days
    const calculateMutation = useMutation({
        mutationFn: (data: { start_date: string; end_date: string }) =>
            workingDaysService.calculateWorkingDays(data),
        onSuccess: (response) => {
            if (response.success && response.data) {
                setValue('total_days', response.data.working_days);
                toast({
                    title: 'Calculated',
                    description: `Working days: ${response.data.working_days}`,
                });
            }
        },
    });

    // Create/Update mutation
    const saveMutation = useMutation({
        mutationFn: (data: CreateWorkingDaysConfigDto) =>
            editingConfig
                ? workingDaysService.updateConfig(editingConfig.id, data)
                : workingDaysService.createConfig(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['working-days-configs'] });
            toast({
                title: 'Success',
                description: `Working days config ${editingConfig ? 'updated' : 'created'} successfully`,
            });
            setIsDialogOpen(false);
            setEditingConfig(null);
            reset();
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to save configuration',
                variant: 'destructive',
            });
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: workingDaysService.deleteConfig,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['working-days-configs'] });
            toast({
                title: 'Success',
                description: 'Configuration deleted successfully',
            });
        },
    });

    const handleEdit = (config: WorkingDaysConfig) => {
        setEditingConfig(config);
        setValue('total_days', config.total_days);
        setValue('start_date', config.start_date.split('T')[0]);
        setValue('end_date', config.end_date.split('T')[0]);
        setValue('is_active', config.is_active);
        setIsDialogOpen(true);
    };

    const handleAdd = () => {
        setEditingConfig(null);
        reset();
        setIsDialogOpen(true);
    };

    const onSubmit = (data: CreateWorkingDaysConfigDto) => {
        saveMutation.mutate(data);
    };

    const handleCalculate = () => {
        if (startDate && endDate) {
            calculateMutation.mutate({ start_date: startDate, end_date: endDate });
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Working Days Configuration</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage working days for attendance tracking
                        </p>
                    </div>
                    <Button onClick={handleAdd} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Configuration
                    </Button>
                </div>

                {/* Configurations List */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Configurations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-8">Loading...</div>
                        ) : configs.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>No configurations yet. Add one to get started.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {configs.map((config: WorkingDaysConfig) => (
                                    <div
                                        key={config.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-medium">
                                                    {config.academic_year?.year || 'General Configuration'}
                                                </h4>
                                                {config.is_active && (
                                                    <Badge variant="success">Active</Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(config.start_date).toLocaleDateString()} -{' '}
                                                {new Date(config.end_date).toLocaleDateString()}
                                            </p>
                                            <p className="text-sm font-semibold mt-1">
                                                Total Days: {config.total_days}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(config)}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deleteMutation.mutate(config.id)}
                                            >
                                                <Trash2 className="w-4 h-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Add/Edit Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingConfig ? 'Edit' : 'Add'} Working Days Configuration
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <Label htmlFor="start_date">Start Date *</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    {...register('start_date', { required: true })}
                                />
                            </div>

                            <div>
                                <Label htmlFor="end_date">End Date *</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    {...register('end_date', { required: true })}
                                />
                            </div>

                            <div>
                                <Label htmlFor="total_days">Total Working Days *</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="total_days"
                                        type="number"
                                        {...register('total_days', { required: true, min: 1 })}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleCalculate}
                                        disabled={!startDate || !endDate || calculateMutation.isPending}
                                    >
                                        <Calculator className="w-4 h-4 mr-2" />
                                        Calculate
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Click Calculate to auto-calculate working days (excludes weekends)
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" disabled={saveMutation.isPending}>
                                    {saveMutation.isPending ? 'Saving...' : 'Save'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsDialogOpen(false);
                                        setEditingConfig(null);
                                        reset();
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </MainLayout>
    );
};
