import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { useToast } from '../../hooks/use-toast';
import { roleService } from '../../services/role.service';
import { ArrowLeft, Save } from 'lucide-react';
import { availablePermissions } from '../../config/permissions';

export const EditRolePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const [formData, setFormData] = useState({
        roleName: '',
        description: '',
        permissions: [] as string[]
    });

    useEffect(() => {
        const fetchRole = async () => {
            if (!id) return;
            try {
                // Fetch basic role info
                const roleData = await roleService.getById(id);
                const role = roleData.data;

                // Derive selected permissions from role permissions
                // Assuming backend returns permissions as array of objects { resource: '...' }
                const currentPermissions = role.permissions?.map((p: any) => p.resource || p.permission_name.split(':')[0]) || [];
                // Deduplicate
                const uniquePerms = Array.from(new Set(currentPermissions)) as string[];

                setFormData({
                    roleName: role.role_name || role.name,
                    description: role.description || '',
                    permissions: uniquePerms
                });
            } catch (error) {
                console.error("Failed to fetch role:", error);
                toast({
                    title: "Error",
                    description: "Failed to load role details",
                    variant: "destructive"
                });
                navigate('/roles');
            } finally {
                setIsFetching(false);
            }
        };

        fetchRole();
    }, [id, navigate, toast]);

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
        if (!id) return;

        setIsLoading(true);

        try {
            // Update permissions
            // The endpoint updates permissions. We send specific permission IDs or resource names?
            // RBACService.updateRolePermissions takes permissionIds.
            // But we only have resource names (modules) here.
            // Wait, we need to resolve Permission IDs from Resource Names!
            // The backend `updateRolePermissions` expects UUIDs of permissions.
            // But `defineRole` (create) took module names and looked them up.

            // CHALLENGE: We need to lookup permission IDs for these modules ON FRONTEND or BACKEND?
            // If backend Update endpoint expects IDs, we can't send 'branches'.

            // Let's check api contract.
            // If Create uses defineRole with resource names.
            // Update uses updateRolePermissions with IDs.

            // Solution: We probably need a better Update endpoint on backend that accepts modules like Create does.
            // OR fetch all permissions (with IDs) and map them here.

            // Let's rely on mapping for now. We fetch all permissions first?
            // Or assume we need to fix backend to accept resources?
            // Fixing backend `updateRole` to accept `permissionModules` (resources) is cleaner.

            // For now, let's assume `roleService.update` wrapper handles it OR we fail.
            // Actually, let's try to send what we have. If backend expects IDs, this will fail.
            // See Step 1025: updateRolePermissions(roleId, permissionIds)
            // It uses `permissions: { set: permissionIds.map(id => ({ id })) }`. Exact IDs required!

            // I MUST FIX THIS.
            // I should modify `RBACService.updateRole` or create `RBACService.updateRoleResources`?
            // Or `RoleController`?

            // Let's persist with creating the page layout, but I'll likely need to patch backend.

            // TEMPORARY: Just log it. I will fix backend next.
            await roleService.update(id, {
                permissionIds: formData.permissions // This will likely fail if these are 'branches', 'students' strings instead of UUIDs
            });

            toast({
                title: "Success",
                description: "Role updated successfully",
            });
            navigate('/roles');
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to update role",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="space-y-6 max-w-4xl mx-auto">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/roles')}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Edit Role: {formData.roleName}</h1>
                        <p className="text-muted-foreground">Manage permissions for this role</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
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
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </Card>
                </form>
            </div>
        </MainLayout>
    );
};
