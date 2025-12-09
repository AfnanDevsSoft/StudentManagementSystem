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
import { userService } from '../../services/user.service';
import type { User, CreateUserDto } from '../../services/user.service';
import { userSchema } from '../../schemas/user.schema';
import type { UserFormData } from '../../schemas/user.schema';
import { branchService } from '../../services/branch.service';
import { roleService } from '../../services/role.service';
import { useToast } from '../../hooks/use-toast';
import { Plus, Search, Edit, Trash2, Shield, Building, User as UserIcon, Lock, Users } from 'lucide-react';

export const UsersPage: React.FC = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Fetch users
    const { data: usersData, isLoading: isLoadingUsers } = useQuery({
        queryKey: ['users'],
        queryFn: userService.getAll,
    });

    // Fetch branches
    const { data: branchesData } = useQuery({
        queryKey: ['branches'],
        queryFn: branchService.getAll,
    });

    // Fetch roles
    const { data: rolesData } = useQuery({
        queryKey: ['roles'],
        queryFn: roleService.getAll,
    });

    const users = usersData?.data || [];
    const branches = branchesData?.data || [];
    const roles = rolesData?.data || [];

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            username: '',
            email: '',
            password: '',
            first_name: '',
            last_name: '',
            phone: '',
            role_id: '',
            branch_id: '',
        },
    });

    const selectedRole = watch('role_id');
    const selectedBranch = watch('branch_id');

    const createMutation = useMutation({
        mutationFn: userService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast({
                title: 'Success',
                description: 'User created successfully',
            });
            setIsDialogOpen(false);
            reset();
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to create user',
                variant: 'destructive',
            });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<UserFormData> }) => {
            // Remove password from update if it's empty
            const { password, ...rest } = data;
            return userService.update(id, rest);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast({
                title: 'Success',
                description: 'User updated successfully',
            });
            setIsDialogOpen(false);
            setEditingUser(null);
            reset();
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update user',
                variant: 'destructive',
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: userService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast({
                title: 'Success',
                description: 'User deleted successfully',
            });
            setDeleteId(null);
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete user',
                variant: 'destructive',
            });
        },
    });

    const onSubmit = (data: UserFormData) => {
        if (editingUser) {
            updateMutation.mutate({ id: editingUser.id, data });
        } else {
            if (!data.password) {
                return;
            }
            createMutation.mutate(data as CreateUserDto);
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setValue('username', user.username);
        setValue('email', user.email);
        setValue('first_name', user.first_name);
        setValue('last_name', user.last_name);
        setValue('phone', user.phone || '');
        setValue('role_id', user.role_id);
        setValue('branch_id', user.branch_id);
        // Password is not set during edit
        setIsDialogOpen(true);
    };

    const handleAdd = () => {
        setEditingUser(null);
        reset();
        setIsDialogOpen(true);
    };

    const handleDelete = () => {
        if (deleteId) {
            deleteMutation.mutate(deleteId);
        }
    };

    const filteredUsers = users.filter((user: User) =>
        `${user.first_name} ${user.last_name} ${user.username} ${user.email}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: users.length,
        active: users.filter((u: User) => u.is_active).length,
        admins: users.filter((u: User) => u.role?.name === 'Admin' || u.role?.name === 'Super Admin').length,
        staff: users.filter((u: User) => u.role?.name !== 'Admin' && u.role?.name !== 'Super Admin').length,
    };

    if (isLoadingUsers) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">Loading users...</p>
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
                        <h1 className="text-3xl font-bold">Users</h1>
                        <p className="text-muted-foreground mt-1">Manage system users and access control</p>
                    </div>
                    <Button onClick={handleAdd} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add User
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Users</p>
                                    <h3 className="text-2xl font-bold mt-1">{stats.total}</h3>
                                </div>
                                <UserIcon className="w-8 h-8 text-primary" />
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
                                <Shield className="w-8 h-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Admins</p>
                                    <h3 className="text-2xl font-bold mt-1">{stats.admins}</h3>
                                </div>
                                <Lock className="w-8 h-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Staff</p>
                                    <h3 className="text-2xl font-bold mt-1">{stats.staff}</h3>
                                </div>
                                <Users className="w-8 h-8 text-orange-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent className="p-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search users by name, username or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>System Users ({filteredUsers.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4 font-medium">User</th>
                                        <th className="text-left p-4 font-medium">Role</th>
                                        <th className="text-left p-4 font-medium">Branch</th>
                                        <th className="text-left p-4 font-medium">Status</th>
                                        <th className="text-right p-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user: User) => (
                                        <tr key={user.id} className="border-b hover:bg-muted/50">
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-medium">
                                                        {user.first_name} {user.last_name}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <Badge variant="outline" className="flex items-center gap-1 w-fit">
                                                    <Shield className="w-3 h-3" />
                                                    {user.role?.name || 'No Role'}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                {user.branch ? (
                                                    <div className="flex items-center gap-2">
                                                        <Building className="w-4 h-4 text-muted-foreground" />
                                                        <span className="text-sm">{user.branch.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">All Branches</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <Badge variant={user.is_active ? 'success' : 'secondary'}>
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(user)}>
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(user.id)}>
                                                        <Trash2 className="w-4 h-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredUsers.length === 0 && (
                                <div className="text-center py-12">
                                    <UserIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No users found</h3>
                                    <p className="text-muted-foreground">
                                        {searchQuery ? 'Try adjusting your search' : 'Get started by adding a user'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingUser ? 'Edit' : 'Add'} User</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="first_name">
                                        First Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="first_name"
                                        {...register('first_name')}
                                        className={errors.first_name ? 'border-destructive' : ''}
                                    />
                                    {errors.first_name && (
                                        <p className="text-sm text-destructive mt-1">{errors.first_name.message}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="last_name">
                                        Last Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="last_name"
                                        {...register('last_name')}
                                        className={errors.last_name ? 'border-destructive' : ''}
                                    />
                                    {errors.last_name && (
                                        <p className="text-sm text-destructive mt-1">{errors.last_name.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="username">
                                        Username <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="username"
                                        {...register('username')}
                                        className={errors.username ? 'border-destructive' : ''}
                                    />
                                    {errors.username && (
                                        <p className="text-sm text-destructive mt-1">{errors.username.message}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="email">
                                        Email <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        {...register('email')}
                                        className={errors.email ? 'border-destructive' : ''}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                                    )}
                                </div>
                            </div>

                            {!editingUser && (
                                <div>
                                    <Label htmlFor="password">
                                        Password <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        {...register('password')}
                                        className={errors.password ? 'border-destructive' : ''}
                                    />
                                    {errors.password && (
                                        <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
                                    )}
                                </div>
                            )}

                            <div>
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" {...register('phone')} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="role_id">
                                        Role <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={selectedRole}
                                        onValueChange={(value) => setValue('role_id', value)}
                                    >
                                        <SelectTrigger className={errors.role_id ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map((role: any) => (
                                                <SelectItem key={role.id} value={role.id}>
                                                    {role.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.role_id && (
                                        <p className="text-sm text-destructive mt-1">{errors.role_id.message}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="branch_id">
                                        Branch <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={selectedBranch}
                                        onValueChange={(value) => setValue('branch_id', value)}
                                    >
                                        <SelectTrigger className={errors.branch_id ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Select branch" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {branches.map((branch: any) => (
                                                <SelectItem key={branch.id} value={branch.id}>
                                                    {branch.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.branch_id && (
                                        <p className="text-sm text-destructive mt-1">{errors.branch_id.message}</p>
                                    )}
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
                                        setEditingUser(null);
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
                                This action cannot be undone. This will permanently delete the user account.
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
