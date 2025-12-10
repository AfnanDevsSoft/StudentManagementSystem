import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useToast } from '../../hooks/use-toast';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/user.service';

const profileSchema = z.object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email'),
    phone: z.string().optional(),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export const SettingsPage: React.FC = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [notifications, setNotifications] = React.useState({
        email: localStorage.getItem('notify_email') !== 'false',
        push: localStorage.getItem('notify_push') === 'true',
    });

    const handleNotificationChange = (type: 'email' | 'push', value: boolean) => {
        setNotifications(prev => ({ ...prev, [type]: value }));
        localStorage.setItem(`notify_${type}`, String(value));
        toast({
            title: 'Settings updated',
            description: `${type === 'email' ? 'Email' : 'Push'} notifications turned ${value ? 'on' : 'off'}.`,
        });
    };

    const profileForm = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            first_name: user?.first_name || '',
            last_name: user?.last_name || '',
            email: user?.email || '',
            phone: user?.phone || '',
        }
    });

    const passwordForm = useForm({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        }
    });

    const onProfileSubmit = async (data: any) => {
        try {
            if (!user?.id) return;
            await userService.update(user.id, data);
            toast({ title: 'Success', description: 'Profile updated successfully' });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
        }
    };

    const onPasswordSubmit = async (data: any) => {
        try {
            if (!user?.id) return;
            await userService.changePassword(user.id, data.currentPassword, data.newPassword);
            toast({ title: 'Success', description: 'Password changed successfully' });
            passwordForm.reset();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to change password', variant: 'destructive' });
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Settings</h1>
                    <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    <aside className="w-full md:w-64 space-y-2">
                        <div className="bg-muted/30 p-4 rounded-lg">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                    {user?.first_name?.[0] || 'U'}
                                </div>
                                <div>
                                    <p className="font-medium">{user?.first_name} {user?.last_name}</p>
                                    <p className="text-xs text-muted-foreground capitalize">{user?.role?.name}</p>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <div className="flex-1">
                        <Tabs defaultValue="profile" className="w-full">
                            <TabsList className="mb-4">
                                <TabsTrigger value="profile">Profile</TabsTrigger>
                                <TabsTrigger value="security">Security</TabsTrigger>
                                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                            </TabsList>

                            <TabsContent value="profile">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Profile Information</CardTitle>
                                        <CardDescription>Update your personal details.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label>First Name</Label>
                                                    <Input {...profileForm.register('first_name')} />
                                                    {profileForm.formState.errors.first_name && <p className="text-sm text-destructive">{profileForm.formState.errors.first_name.message as string}</p>}
                                                </div>
                                                <div>
                                                    <Label>Last Name</Label>
                                                    <Input {...profileForm.register('last_name')} />
                                                    {profileForm.formState.errors.last_name && <p className="text-sm text-destructive">{profileForm.formState.errors.last_name.message as string}</p>}
                                                </div>
                                            </div>
                                            <div>
                                                <Label>Email</Label>
                                                <Input {...profileForm.register('email')} />
                                                {profileForm.formState.errors.email && <p className="text-sm text-destructive">{profileForm.formState.errors.email.message as string}</p>}
                                            </div>
                                            <div>
                                                <Label>Phone</Label>
                                                <Input {...profileForm.register('phone')} />
                                                {profileForm.formState.errors.phone && <p className="text-sm text-destructive">{profileForm.formState.errors.phone.message as string}</p>}
                                            </div>
                                            <Button type="submit" disabled={profileForm.formState.isSubmitting}>Save Changes</Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="security">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Change Password</CardTitle>
                                        <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                                            <div>
                                                <Label>Current Password</Label>
                                                <Input type="password" {...passwordForm.register('currentPassword')} />
                                                {passwordForm.formState.errors.currentPassword && <p className="text-sm text-destructive">{passwordForm.formState.errors.currentPassword.message as string}</p>}
                                            </div>
                                            <div>
                                                <Label>New Password</Label>
                                                <Input type="password" {...passwordForm.register('newPassword')} />
                                                {passwordForm.formState.errors.newPassword && <p className="text-sm text-destructive">{passwordForm.formState.errors.newPassword.message as string}</p>}
                                            </div>
                                            <div>
                                                <Label>Confirm Password</Label>
                                                <Input type="password" {...passwordForm.register('confirmPassword')} />
                                                {passwordForm.formState.errors.confirmPassword && <p className="text-sm text-destructive">{passwordForm.formState.errors.confirmPassword.message as string}</p>}
                                            </div>
                                            <Button type="submit" disabled={passwordForm.formState.isSubmitting}>Change Password</Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="notifications">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Notifications</CardTitle>
                                        <CardDescription>Configure how you receive notifications.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>Email Notifications</Label>
                                                <p className="text-sm text-muted-foreground">Receive emails about your activity.</p>
                                            </div>
                                            <Switch
                                                checked={notifications.email}
                                                onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>Push Notifications</Label>
                                                <p className="text-sm text-muted-foreground">Receive push notifications on your device.</p>
                                            </div>
                                            <Switch
                                                checked={notifications.push}
                                                onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};
