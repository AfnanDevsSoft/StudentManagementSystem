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
import { branchService } from '../../services/branch.service';
import type { Branch } from '../../services/branch.service';
import { branchSchema } from '../../schemas/branch.schema';
import type { BranchFormData } from '../../schemas/branch.schema';
import { useToast } from '../../hooks/use-toast';
import { Plus, Search, Edit, Trash2, Building, MapPin, Globe, Phone } from 'lucide-react';

export const BranchesPage: React.FC = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Fetch branches
    const { data: branchesData, isLoading } = useQuery({
        queryKey: ['branches'],
        queryFn: branchService.getAll,
    });

    const branches = branchesData?.data || [];

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<BranchFormData>({
        resolver: zodResolver(branchSchema),
        defaultValues: {
            name: '',
            code: '',
            address: '',
            city: '',
            state: '',
            country: '',
            phone: '',
            email: '',
            principal_name: '',
            principal_email: '',
            timezone: 'UTC',
            currency: 'USD',
        },
    });

    const createMutation = useMutation({
        mutationFn: branchService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['branches'] });
            toast({
                title: 'Success',
                description: 'Branch created successfully',
            });
            setIsDialogOpen(false);
            reset();
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to create branch',
                variant: 'destructive',
            });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<BranchFormData> }) =>
            branchService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['branches'] });
            toast({
                title: 'Success',
                description: 'Branch updated successfully',
            });
            setIsDialogOpen(false);
            setEditingBranch(null);
            reset();
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update branch',
                variant: 'destructive',
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: branchService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['branches'] });
            toast({
                title: 'Success',
                description: 'Branch deleted successfully',
            });
            setDeleteId(null);
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete branch',
                variant: 'destructive',
            });
        },
    });

    const onSubmit = (data: BranchFormData) => {
        if (editingBranch) {
            updateMutation.mutate({ id: editingBranch.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleEdit = (branch: Branch) => {
        setEditingBranch(branch);
        setValue('name', branch.name);
        setValue('code', branch.code);
        setValue('address', branch.address || '');
        setValue('city', branch.city || '');
        setValue('state', branch.state || '');
        setValue('country', branch.country || '');
        setValue('phone', branch.phone || '');
        setValue('email', branch.email || '');
        setValue('principal_name', branch.principal_name || '');
        setValue('principal_email', branch.principal_email || '');
        setValue('timezone', branch.timezone || 'UTC');
        setValue('currency', branch.currency || 'USD');
        setIsDialogOpen(true);
    };

    const handleAdd = () => {
        setEditingBranch(null);
        reset();
        setIsDialogOpen(true);
    };

    const handleDelete = () => {
        if (deleteId) {
            deleteMutation.mutate(deleteId);
        }
    };

    const filteredBranches = branches.filter((branch: Branch) =>
        `${branch.name} ${branch.code} ${branch.city}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: branches.length,
        active: branches.filter((b: Branch) => b.is_active).length,
        cities: new Set(branches.map((b: Branch) => b.city)).size,
        countries: new Set(branches.map((b: Branch) => b.country)).size,
    };

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">Loading branches...</p>
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
                        <h1 className="text-3xl font-bold">Branches</h1>
                        <p className="text-muted-foreground mt-1">Manage school campuses and locations</p>
                    </div>
                    <Button onClick={handleAdd} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Branch
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Branches</p>
                                    <h3 className="text-2xl font-bold mt-1">{stats.total}</h3>
                                </div>
                                <Building className="w-8 h-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Active</p>
                                    <h3 className="text-2xl font-bold mt-1 text-green-600">{stats.active}</h3>
                                </div>
                                <Building className="w-8 h-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Cities</p>
                                    <h3 className="text-2xl font-bold mt-1">{stats.cities}</h3>
                                </div>
                                <MapPin className="w-8 h-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Countries</p>
                                    <h3 className="text-2xl font-bold mt-1">{stats.countries}</h3>
                                </div>
                                <Globe className="w-8 h-8 text-orange-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent className="p-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search branches by name, code or city..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBranches.map((branch: Branch) => (
                        <Card key={branch.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-lg font-bold">{branch.name}</CardTitle>
                                <Badge variant={branch.is_active ? 'success' : 'secondary'}>
                                    {branch.code}
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-start text-sm text-muted-foreground">
                                        <MapPin className="mr-2 h-4 w-4 mt-0.5 shrink-0" />
                                        <span>
                                            {branch.address}<br />
                                            {branch.city}, {branch.state}<br />
                                            {branch.country}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Phone className="mr-2 h-4 w-4" />
                                        {branch.phone || 'N/A'}
                                    </div>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Building className="mr-2 h-4 w-4" />
                                        Principal: {branch.principal_name || 'N/A'}
                                    </div>

                                    <div className="flex items-center justify-end gap-2 pt-4">
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(branch)}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => setDeleteId(branch.id)}>
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {filteredBranches.length === 0 && (
                        <div className="col-span-full text-center py-12">
                            <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No branches found</h3>
                            <p className="text-muted-foreground">
                                {searchQuery ? 'Try adjusting your search' : 'Get started by adding a branch'}
                            </p>
                        </div>
                    )}
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingBranch ? 'Edit' : 'Add'} Branch</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">
                                        Branch Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        {...register('name')}
                                        className={errors.name ? 'border-destructive' : ''}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="code">
                                        Branch Code <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="code"
                                        {...register('code')}
                                        className={errors.code ? 'border-destructive' : ''}
                                    />
                                    {errors.code && (
                                        <p className="text-sm text-destructive mt-1">{errors.code.message}</p>
                                    )}
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
                                    <Label htmlFor="country">Country</Label>
                                    <Input id="country" {...register('country')} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input id="phone" {...register('phone')} />
                                </div>
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" {...register('email')} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="principal_name">Principal Name</Label>
                                    <Input id="principal_name" {...register('principal_name')} />
                                </div>
                                <div>
                                    <Label htmlFor="principal_email">Principal Email</Label>
                                    <Input id="principal_email" type="email" {...register('principal_email')} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="timezone">Timezone</Label>
                                    <Input id="timezone" {...register('timezone')} />
                                </div>
                                <div>
                                    <Label htmlFor="currency">Currency</Label>
                                    <Input id="currency" {...register('currency')} />
                                </div>
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
                                        setEditingBranch(null);
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
                                This action cannot be undone. This will permanently delete the branch data.
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
