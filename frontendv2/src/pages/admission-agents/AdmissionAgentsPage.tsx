import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { userService } from '../../services/user.service';
import { branchService } from '../../services/branch.service';
import { api, endpoints } from '../../lib/api';
import { useToast } from '../../hooks/use-toast';
import {
    Plus, Search, Edit, Trash2, Users, UserCheck, UserX,
    FileText, CheckCircle, XCircle, GraduationCap, Clock
} from 'lucide-react';

interface AgentStats {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    is_active: boolean;
    created_at: string;
    branch?: { id: string; name: string; code: string };
    stats: {
        submitted: number;
        approved: number;
        rejected: number;
        enrolled: number;
        total: number;
    };
}

export const AdmissionAgentsPage: React.FC = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        username: '',
        password: '',
        branch_id: '',
    });

    // Fetch agent stats (includes agent list with per-agent admission progress)
    const { data: agentStatsData, isLoading } = useQuery({
        queryKey: ['admission-agent-stats'],
        queryFn: async () => {
            const response = await api.get(endpoints.admissions.agentStats);
            return response.data;
        },
    });

    const agents: AgentStats[] = agentStatsData?.data || [];

    // Fetch branches for the create form
    const { data: branchesData } = useQuery({
        queryKey: ['branches'],
        queryFn: branchService.getAll,
    });
    const branches = branchesData?.data || [];

    // Fetch roles to get the Admission Agent role_id
    const { data: rolesData } = useQuery({
        queryKey: ['roles'],
        queryFn: async () => {
            const response = await api.get('/users/roles');
            return response.data;
        },
    });
    const roles = rolesData?.data || [];
    const agentRole = roles.find((r: any) =>
        r.name.toLowerCase() === 'admission agent' || r.name.toLowerCase() === 'admission_agent'
    );

    // Create agent mutation
    const createMutation = useMutation({
        mutationFn: (data: any) => userService.create(data),
        onSuccess: (result: any) => {
            queryClient.invalidateQueries({ queryKey: ['admission-agent-stats'] });
            const tempPassword = result?.data?.tempPassword;
            toast({
                title: 'Agent Created',
                description: tempPassword
                    ? `Agent created. Temp password: ${tempPassword}`
                    : 'Admission agent created successfully',
            });
            setIsDialogOpen(false);
            resetForm();
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to create agent',
                variant: 'destructive',
            });
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: userService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admission-agent-stats'] });
            toast({ title: 'Success', description: 'Agent deleted successfully' });
            setDeleteId(null);
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete agent',
                variant: 'destructive',
            });
        },
    });

    const resetForm = () => {
        setFormData({
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            username: '',
            password: '',
            branch_id: '',
        });
    };

    const handleAdd = () => {
        resetForm();
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        if (!formData.first_name || !formData.last_name || !formData.email || !formData.username || !formData.password) {
            toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
            return;
        }
        if (formData.password.length < 6) {
            toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
            return;
        }
        if (!agentRole) {
            toast({ title: 'Error', description: 'Admission Agent role not found in system. Please create it first.', variant: 'destructive' });
            return;
        }

        createMutation.mutate({
            ...formData,
            role_id: agentRole.id,
            branch_id: formData.branch_id || undefined,
        });
    };

    const handleDelete = () => {
        if (deleteId) {
            deleteMutation.mutate(deleteId);
        }
    };

    const filteredAgents = agents.filter((agent) =>
        `${agent.first_name} ${agent.last_name} ${agent.username} ${agent.email}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
    );

    const totalStats = {
        totalAgents: agents.length,
        activeAgents: agents.filter((a) => a.is_active).length,
        totalApplications: agents.reduce((sum, a) => sum + a.stats.total, 0),
        totalEnrolled: agents.reduce((sum, a) => sum + a.stats.enrolled, 0),
    };

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">Loading agents...</p>
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
                        <h1 className="text-3xl font-bold">Admission Agents</h1>
                        <p className="text-muted-foreground mt-1">Manage admission agents and track their progress</p>
                    </div>
                    <Button onClick={handleAdd} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Agent
                    </Button>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Agents</p>
                                    <h3 className="text-2xl font-bold mt-1">{totalStats.totalAgents}</h3>
                                </div>
                                <Users className="w-8 h-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Active Agents</p>
                                    <h3 className="text-2xl font-bold mt-1 text-green-600">{totalStats.activeAgents}</h3>
                                </div>
                                <UserCheck className="w-8 h-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Applications</p>
                                    <h3 className="text-2xl font-bold mt-1 text-blue-600">{totalStats.totalApplications}</h3>
                                </div>
                                <FileText className="w-8 h-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Enrolled</p>
                                    <h3 className="text-2xl font-bold mt-1 text-green-600">{totalStats.totalEnrolled}</h3>
                                </div>
                                <GraduationCap className="w-8 h-8 text-green-500" />
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
                                placeholder="Search agents by name, username, or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Agents Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Agents ({filteredAgents.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4 font-medium">Agent</th>
                                        <th className="text-left p-4 font-medium">Branch</th>
                                        <th className="text-left p-4 font-medium">Status</th>
                                        <th className="text-center p-4 font-medium">
                                            <div className="flex items-center justify-center gap-1">
                                                <FileText className="w-3.5 h-3.5" /> Total
                                            </div>
                                        </th>
                                        <th className="text-center p-4 font-medium">
                                            <div className="flex items-center justify-center gap-1">
                                                <Clock className="w-3.5 h-3.5 text-blue-500" /> Submitted
                                            </div>
                                        </th>
                                        <th className="text-center p-4 font-medium">
                                            <div className="flex items-center justify-center gap-1">
                                                <CheckCircle className="w-3.5 h-3.5 text-orange-500" /> Approved
                                            </div>
                                        </th>
                                        <th className="text-center p-4 font-medium">
                                            <div className="flex items-center justify-center gap-1">
                                                <GraduationCap className="w-3.5 h-3.5 text-green-500" /> Enrolled
                                            </div>
                                        </th>
                                        <th className="text-center p-4 font-medium">
                                            <div className="flex items-center justify-center gap-1">
                                                <XCircle className="w-3.5 h-3.5 text-red-500" /> Rejected
                                            </div>
                                        </th>
                                        <th className="text-right p-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAgents.map((agent) => (
                                        <tr key={agent.id} className="border-b hover:bg-muted/50">
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-medium">{agent.first_name} {agent.last_name}</p>
                                                    <p className="text-sm text-muted-foreground">@{agent.username}</p>
                                                    <p className="text-xs text-muted-foreground">{agent.email}</p>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm">
                                                {agent.branch ? (
                                                    <Badge variant="outline">{agent.branch.name}</Badge>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <Badge variant={agent.is_active ? 'success' : 'secondary'}>
                                                    {agent.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </td>
                                            <td className="p-4 text-center font-bold">{agent.stats.total}</td>
                                            <td className="p-4 text-center text-blue-600 font-medium">{agent.stats.submitted}</td>
                                            <td className="p-4 text-center text-orange-600 font-medium">{agent.stats.approved}</td>
                                            <td className="p-4 text-center text-green-600 font-medium">{agent.stats.enrolled}</td>
                                            <td className="p-4 text-center text-red-600 font-medium">{agent.stats.rejected}</td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(agent.id)}>
                                                        <Trash2 className="w-4 h-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredAgents.length === 0 && (
                                <div className="text-center py-12">
                                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No agents found</h3>
                                    <p className="text-muted-foreground">
                                        {searchQuery ? 'Try adjusting your search' : 'Get started by adding an admission agent'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Create Agent Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Add Admission Agent</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>First Name <span className="text-destructive">*</span></Label>
                                    <Input
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        placeholder="First name"
                                    />
                                </div>
                                <div>
                                    <Label>Last Name <span className="text-destructive">*</span></Label>
                                    <Input
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                        placeholder="Last name"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Email <span className="text-destructive">*</span></Label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="agent@example.com"
                                    />
                                </div>
                                <div>
                                    <Label>Phone</Label>
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="Phone number"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Branch <span className="text-destructive">*</span></Label>
                                <Select
                                    value={formData.branch_id}
                                    onValueChange={(value) => setFormData({ ...formData, branch_id: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Branch" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {branches.map((branch: any) => (
                                            <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Username <span className="text-destructive">*</span></Label>
                                    <Input
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        placeholder="Login username"
                                    />
                                </div>
                                <div>
                                    <Label>Password <span className="text-destructive">*</span></Label>
                                    <Input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="Min 6 characters"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                                    {createMutation.isPending ? 'Creating...' : 'Create Agent'}
                                </Button>
                                <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation */}
                <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will delete this admission agent account. Their submitted applications will remain in the system.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </MainLayout>
    );
};
