import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
    Plus,
    Shield,
    Users,
    CheckCircle2,
    XCircle,
    Edit,
    Trash2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { roleService } from '../../services/role.service';

const permissions = [
    { category: 'Students', view: true, create: true, edit: true, delete: true },
    { category: 'Teachers', view: true, create: true, edit: true, delete: false },
    { category: 'Courses', view: true, create: true, edit: true, delete: false },
    { category: 'Admissions', view: true, create: true, edit: true, delete: false },
    { category: 'Payroll', view: true, create: false, edit: false, delete: false },
    { category: 'Reports', view: true, create: true, edit: false, delete: false },
];

export const RolesPage: React.FC = () => {
    const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

    // Fetch Roles
    const { data: rolesResponse, isLoading, error } = useQuery({
        queryKey: ['roles'],
        queryFn: roleService.getAll,
    });

    const roles = (rolesResponse as any)?.data || [];
    const selectedRole = roles.find((r: any) => r.id === selectedRoleId) || roles[0];

    // Helper to get color based on role name (consistent UI)
    const getRoleColor = (name: string) => {
        const lower = name.toLowerCase();
        if (lower.includes('admin')) return 'from-red-500 to-red-600';
        if (lower.includes('teacher')) return 'from-purple-500 to-purple-600';
        if (lower.includes('student')) return 'from-cyan-500 to-cyan-600';
        if (lower.includes('parent')) return 'from-orange-500 to-orange-600';
        return 'from-blue-500 to-blue-600';
    };

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </MainLayout>
        );
    }

    if (error) {
        return (
            <MainLayout>
                <div className="text-center py-12 text-red-500">
                    Failed to load roles. Please try again later.
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Roles & Permissions</h1>
                        <p className="text-muted-foreground mt-1">Manage user roles and access control</p>
                    </div>
                    <Link to="/roles/new">
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Role
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Roles List */}
                    <div className="lg:col-span-1 space-y-3">
                        <h2 className="text-lg font-semibold mb-4">Roles</h2>
                        {roles.map((role: any) => (
                            <Card
                                key={role.id}
                                className={`p-4 cursor-pointer transition-all ${selectedRole?.id === role.id
                                    ? 'ring-2 ring-primary shadow-md'
                                    : 'hover:shadow-md'
                                    }`}
                                onClick={() => setSelectedRoleId(role.id)}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-10 h-10 bg-gradient-to-br ${getRoleColor(role.name)} rounded-lg flex items-center justify-center`}>
                                            <Shield className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{role.name}</h3>
                                            {/* Legacy roles are system roles essentially */}
                                            <Badge variant="outline" className="text-xs mt-1">System Role</Badge>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">{role.description || 'System defined role'}</p>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span className="flex items-center">
                                        <Users className="w-3 h-3 mr-1" />
                                        {/* Count not returned by legacy API yet, hardcode or hide */}
                                        -- users
                                    </span>
                                    <span>-- permissions</span>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Permissions Matrix */}
                    <div className="lg:col-span-2">
                        {selectedRole ? (
                            <Card className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold">{selectedRole.name}</h2>
                                        <p className="text-sm text-muted-foreground mt-1">{selectedRole.description || 'System Role'}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {/* Disable Edit/Delete for now until fully RBAC implemented */}
                                        <Button variant="outline" size="sm" disabled>
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit
                                        </Button>
                                    </div>
                                </div>

                                <div className="border border-border rounded-lg overflow-hidden">
                                    {/* Placeholder Static Permissions until Backend returns them */}
                                    <div className="p-4 bg-muted/20 text-center text-sm text-muted-foreground">
                                        Detailed permissions view coming soon with Full RBAC module.
                                        <br />
                                        Current permissions are defined in `seed.ts`.
                                    </div>
                                    <table className="w-full opacity-50">
                                        <thead className="bg-muted">
                                            <tr>
                                                <th className="text-left p-4 font-semibold">Resource</th>
                                                <th className="text-center p-4 font-semibold">View</th>
                                                <th className="text-center p-4 font-semibold">Create</th>
                                                <th className="text-center p-4 font-semibold">Edit</th>
                                                <th className="text-center p-4 font-semibold">Delete</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {permissions.map((perm, index) => (
                                                <tr key={perm.category} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                                                    <td className="p-4 font-medium">{perm.category}</td>
                                                    <td className="p-4 text-center">
                                                        <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        {/* Simulate admin vs others */}
                                                        {selectedRole.name === 'SuperAdmin' ? <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" /> : <XCircle className="w-5 h-5 text-gray-300 mx-auto" />}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        {selectedRole.name === 'SuperAdmin' ? <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" /> : <XCircle className="w-5 h-5 text-gray-300 mx-auto" />}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        {selectedRole.name === 'SuperAdmin' ? <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" /> : <XCircle className="w-5 h-5 text-gray-300 mx-auto" />}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-6 p-4 bg-muted rounded-lg">
                                    <h3 className="font-semibold mb-2">Assigned Users</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Users with this role are managed in the Users section.
                                    </p>
                                    <Link to={`/users?role=${selectedRole.id}`}>
                                        <Button className="mt-3" variant="outline">View Users</Button>
                                    </Link>
                                </div>
                            </Card>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                Select a role to view details
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};
