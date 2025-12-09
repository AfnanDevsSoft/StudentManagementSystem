import React, { useState } from 'react';
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

const roles = [
    {
        id: '1',
        name: 'Administrator',
        description: 'Full system access with all permissions',
        usersCount: 5,
        permissionsCount: 45,
        isSystem: true,
        color: 'from-red-500 to-red-600',
    },
    {
        id: '2',
        name: 'Principal',
        description: 'Branch-level management and oversight',
        usersCount: 3,
        permissionsCount: 38,
        isSystem: true,
        color: 'from-blue-500 to-blue-600',
    },
    {
        id: '3',
        name: 'Teacher',
        description: 'Course and student management permissions',
        usersCount: 142,
        permissionsCount: 22,
        isSystem: true,
        color: 'from-purple-500 to-purple-600',
    },
    {
        id: '4',
        name: 'Accountant',
        description: 'Financial and payroll management',
        usersCount: 8,
        permissionsCount: 18,
        isSystem: false,
        color: 'from-green-500 to-green-600',
    },
    {
        id: '5',
        name: 'Librarian',
        description: 'Library and book management',
        usersCount: 4,
        permissionsCount: 12,
        isSystem: false,
        color: 'from-orange-500 to-orange-600',
    },
    {
        id: '6',
        name: 'Student',
        description: 'Limited access for student portal',
        usersCount: 2543,
        permissionsCount: 8,
        isSystem: true,
        color: 'from-cyan-500 to-cyan-600',
    },
];

const permissions = [
    { category: 'Students', view: true, create: true, edit: true, delete: true },
    { category: 'Teachers', view: true, create: true, edit: true, delete: false },
    { category: 'Courses', view: true, create: true, edit: true, delete: false },
    { category: 'Admissions', view: true, create: true, edit: true, delete: false },
    { category: 'Payroll', view: true, create: false, edit: false, delete: false },
    { category: 'Reports', view: true, create: true, edit: false, delete: false },
];

export const RolesPage: React.FC = () => {
    const [selectedRole, setSelectedRole] = useState(roles[0]);

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
                        {roles.map((role) => (
                            <Card
                                key={role.id}
                                className={`p-4 cursor-pointer transition-all ${selectedRole.id === role.id
                                        ? 'ring-2 ring-primary shadow-md'
                                        : 'hover:shadow-md'
                                    }`}
                                onClick={() => setSelectedRole(role)}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-10 h-10 bg-gradient-to-br ${role.color} rounded-lg flex items-center justify-center`}>
                                            <Shield className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{role.name}</h3>
                                            {role.isSystem && (
                                                <Badge variant="outline" className="text-xs mt-1">System Role</Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">{role.description}</p>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span className="flex items-center">
                                        <Users className="w-3 h-3 mr-1" />
                                        {role.usersCount} users
                                    </span>
                                    <span>{role.permissionsCount} permissions</span>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Permissions Matrix */}
                    <div className="lg:col-span-2">
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold">{selectedRole.name}</h2>
                                    <p className="text-sm text-muted-foreground mt-1">{selectedRole.description}</p>
                                </div>
                                {!selectedRole.isSystem && (
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit
                                        </Button>
                                        <Button variant="outline" size="sm" className="text-destructive">
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="border border-border rounded-lg overflow-hidden">
                                <table className="w-full">
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
                                                    {perm.view ? (
                                                        <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                                                    ) : (
                                                        <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                                                    )}
                                                </td>
                                                <td className="p-4 text-center">
                                                    {perm.create ? (
                                                        <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                                                    ) : (
                                                        <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                                                    )}
                                                </td>
                                                <td className="p-4 text-center">
                                                    {perm.edit ? (
                                                        <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                                                    ) : (
                                                        <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                                                    )}
                                                </td>
                                                <td className="p-4 text-center">
                                                    {perm.delete ? (
                                                        <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                                                    ) : (
                                                        <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-6 p-4 bg-muted rounded-lg">
                                <h3 className="font-semibold mb-2">Assigned Users ({selectedRole.usersCount})</h3>
                                <p className="text-sm text-muted-foreground">
                                    Click "View Details" to see all users with this role and manage assignments.
                                </p>
                                <Link to={`/roles/${selectedRole.id}`}>
                                    <Button className="mt-3" variant="outline">View Details</Button>
                                </Link>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};
