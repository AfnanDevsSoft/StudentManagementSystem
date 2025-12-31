import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { useToast } from '../../hooks/use-toast';
import { roleService } from '../../services/role.service';
import { ArrowLeft, Save } from 'lucide-react';

const availablePermissions = [
    { id: 'students', label: 'Student Management' },
    { id: 'teachers', label: 'Teacher Management' },
    { id: 'courses', label: 'Course Management' },
    { id: 'admissions', label: 'Admissions' },
    { id: 'finance', label: 'Finance & Fees' },
    { id: 'payroll', label: 'Payroll' },
    { id: 'library', label: 'Library' },
    { id: 'reports', label: 'Reports & Analytics' },
    { id: 'settings', label: 'System Settings' }
];

export const CreateRolePage: React.FC = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        roleName: '',
        description: '',
        permissions: [] as string[]
    });

    const handlePermissionToggle = (permissionId: string) => {
        setFormData(prev => {
            const current = prev.permissions;
            if (current.includes(permissionId)) {
                return { ...prev, permissions: current.filter(p => p !== permissionId) };
            } else {
                return { ...prev, permissions: [...current, permissionId] };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.roleName) {
            toast({
                title: "Validation Error",
                description: "Role Name is required",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);

        try {
            // Roles are global (no branchId)
            await roleService.create({
                roleName: formData.roleName,
                description: formData.description,
                permissions: formData.permissions,
                branchId: ''  // Empty for global roles
            });

            toast({
                title: "Success",
                description: "Role created successfully",
            });

            navigate('/roles');
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to create role",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/roles')}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Create New Role</h1>
                        <p className="text-muted-foreground">Define a new role and assign permissions</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="roleName">Role Name *</Label>
                                <Input
                                    id="roleName"
                                    placeholder="e.g. Academic Coordinator"
                                    value={formData.roleName}
                                    onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    placeholder="Brief description of the role's responsibilities"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="text-lg font-semibold">Permissions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {availablePermissions.map((perm) => (
                                    <div key={perm.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <Switch
                                            id={`perm-${perm.id}`}
                                            checked={formData.permissions.includes(perm.id)}
                                            onCheckedChange={() => handlePermissionToggle(perm.id)}
                                        />
                                        <Label htmlFor={`perm-${perm.id}`} className="cursor-pointer font-medium">
                                            {perm.label}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="button" variant="outline" className="mr-4" onClick={() => navigate('/roles')}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                <Save className="w-4 h-4 mr-2" />
                                {isLoading ? 'Creating...' : 'Create Role'}
                            </Button>
                        </div>
                    </Card>
                </form>
            </div>
        </MainLayout>
    );
};
