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
import { communicationService } from '../../services/communication.service';
import { messageSchema, announcementSchema } from '../../schemas/communication.schema';
import type { MessageFormData, AnnouncementFormData } from '../../schemas/communication.schema';
import { userService } from '../../services/user.service';
import { useToast } from '../../hooks/use-toast';
import { Plus, Search, Edit, Trash2, Mail, Bell, Send, User } from 'lucide-react';

export const CommunicationsPage: React.FC = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<'messages' | 'announcements'>('messages');
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Fetch data
    const { data: messagesData } = useQuery({ queryKey: ['messages'], queryFn: communicationService.messages.getAll });
    const { data: announcementsData } = useQuery({ queryKey: ['announcements'], queryFn: communicationService.announcements.getAll });
    const { data: usersData } = useQuery({ queryKey: ['users'], queryFn: userService.getAll });

    const messages = messagesData?.data || [];
    const announcements = announcementsData?.data || [];
    const users = usersData?.data || [];

    // Forms
    const messageForm = useForm<MessageFormData>({
        resolver: zodResolver(messageSchema),
        defaultValues: { subject: '', content: '', receiver_id: '' }
    });

    const announcementForm = useForm<AnnouncementFormData>({
        resolver: zodResolver(announcementSchema),
        defaultValues: { title: '', content: '', target_audience: 'All', priority: 'Normal' }
    });

    // Mutations
    const messageMutation = useMutation({
        mutationFn: communicationService.messages.create,
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['messages'] }); closeModal(); }
    });

    const announcementMutation = useMutation({
        mutationFn: editingItem ? (data: any) => communicationService.announcements.update(editingItem.id, data) : communicationService.announcements.create,
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['announcements'] }); closeModal(); }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => {
            if (activeTab === 'messages') return communicationService.messages.delete(id);
            return communicationService.announcements.delete(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [activeTab] });
            toast({ title: 'Success', description: 'Item deleted successfully' });
            setDeleteId(null);
        }
    });

    const closeModal = () => {
        setIsDialogOpen(false);
        setEditingItem(null);
        messageForm.reset();
        announcementForm.reset();
    };

    const handleEdit = (item: any) => {
        setEditingItem(item);
        if (activeTab === 'announcements') {
            announcementForm.setValue('title', item.title);
            announcementForm.setValue('content', item.content);
            announcementForm.setValue('target_audience', item.target_audience);
            announcementForm.setValue('priority', item.priority);
            setIsDialogOpen(true);
        }
        // Messages usually aren't edited, only created
    };

    const onSubmit = (data: any) => {
        if (activeTab === 'messages') messageMutation.mutate(data);
        else announcementMutation.mutate(data);
    };

    const stats = {
        totalMessages: messages.length,
        unread: messages.filter((m: any) => !m.is_read).length,
        activeAnnouncements: announcements.length, // Placeholder logic
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Communications</h1>
                        <p className="text-muted-foreground mt-1">Inbox and Announcements</p>
                    </div>
                    <Button onClick={() => { setEditingItem(null); setIsDialogOpen(true); }} className="gap-2">
                        <Plus className="w-4 h-4" />
                        {activeTab === 'messages' ? 'New Message' : 'New Announcement'}
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Inbox</p>
                                    <h3 className="text-2xl font-bold mt-1">{stats.totalMessages}</h3>
                                </div>
                                <Mail className="w-8 h-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Unread</p>
                                    <h3 className="text-2xl font-bold mt-1 text-orange-600">{stats.unread}</h3>
                                </div>
                                <Mail className="w-8 h-8 text-orange-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Announcements</p>
                                    <h3 className="text-2xl font-bold mt-1 text-blue-600">{stats.activeAnnouncements}</h3>
                                </div>
                                <Bell className="w-8 h-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex space-x-2 border-b">
                    <Button
                        variant={activeTab === 'messages' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('messages')}
                        className="rounded-b-none"
                    >
                        Messages
                    </Button>
                    <Button
                        variant={activeTab === 'announcements' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('announcements')}
                        className="rounded-b-none"
                    >
                        Announcements
                    </Button>
                </div>

                <Card>
                    <CardContent className="p-6">
                        {activeTab === 'messages' && (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4">Subject</th>
                                        <th className="text-left p-4">From</th>
                                        <th className="text-left p-4">Date</th>
                                        <th className="text-left p-4">Status</th>
                                        <th className="text-right p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {messages.map((msg: any) => (
                                        <tr key={msg.id} className="border-b">
                                            <td className="p-4 font-medium">{msg.subject}</td>
                                            <td className="p-4">{msg.sender?.name || 'Unknown'}</td>
                                            <td className="p-4">{new Date(msg.sent_at).toLocaleDateString()}</td>
                                            <td className="p-4"><Badge variant={msg.is_read ? 'secondary' : 'default'}>{msg.is_read ? 'Read' : 'New'}</Badge></td>
                                            <td className="text-right p-4">
                                                <Button variant="ghost" size="sm" onClick={() => setDeleteId(msg.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'announcements' && (
                            <div className="space-y-4">
                                {announcements.map((ann: any) => (
                                    <Card key={ann.id} className="border hover:shadow-md transition-shadow">
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between">
                                                <CardTitle className="text-lg">{ann.title}</CardTitle>
                                                <div className="flex gap-2">
                                                    <Badge variant={ann.priority === 'High' ? 'destructive' : ann.priority === 'Normal' ? 'default' : 'secondary'}>{ann.priority}</Badge>
                                                    <Badge variant="outline">{ann.target_audience}</Badge>
                                                </div>
                                            </div>
                                            <p className="text-xs text-muted-foreground">{new Date(ann.posted_at).toLocaleDateString()} by {ann.author?.name || 'Admin'}</p>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-foreground">{ann.content}</p>
                                            <div className="flex justify-end mt-4 gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(ann)}><Edit className="w-4 h-4" /></Button>
                                                <Button variant="ghost" size="sm" onClick={() => setDeleteId(ann.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingItem ? 'Edit' : 'Create'} {activeTab === 'messages' ? 'Message' : 'Announcement'}</DialogTitle>
                        </DialogHeader>
                        {activeTab === 'messages' && (
                            <form onSubmit={messageForm.handleSubmit(onSubmit)} className="space-y-4">
                                <div>
                                    <Label>To</Label>
                                    <Select onValueChange={(v) => messageForm.setValue('receiver_id', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
                                        <SelectContent>{users.map((u: any) => <SelectItem key={u.id} value={u.id}>{u.name} ({u.role?.name})</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div><Label>Subject</Label><Input {...messageForm.register('subject')} /></div>
                                <div><Label>Content</Label><Input {...messageForm.register('content')} className="h-20" /></div>
                                <Button type="submit">Send</Button>
                            </form>
                        )}
                        {activeTab === 'announcements' && (
                            <form onSubmit={announcementForm.handleSubmit(onSubmit)} className="space-y-4">
                                <div><Label>Title</Label><Input {...announcementForm.register('title')} /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Target Audience</Label>
                                        <Select onValueChange={(v) => announcementForm.setValue('target_audience', v as any)} defaultValue="All">
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {['All', 'Students', 'Teachers', 'Parents', 'Staff'].map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Priority</Label>
                                        <Select onValueChange={(v) => announcementForm.setValue('priority', v as any)} defaultValue="Normal">
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {['Low', 'Normal', 'High'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div><Label>Content</Label><Input {...announcementForm.register('content')} className="h-20" /></div>
                                <Button type="submit">Post</Button>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>

                <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader><DialogTitle>Are you sure?</DialogTitle></AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </MainLayout>
    );
};
