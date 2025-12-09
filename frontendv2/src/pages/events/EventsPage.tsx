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
import { eventService } from '../../services/event.service';
import type { Event } from '../../services/event.service';
import { eventSchema } from '../../schemas/event.schema';
import type { EventFormData } from '../../schemas/event.schema';
import { useToast } from '../../hooks/use-toast';
import { Plus, Search, Edit, Trash2, Calendar, MapPin, Users, Tag } from 'lucide-react';

export const EventsPage: React.FC = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Fetch events
    const { data: eventsData, isLoading } = useQuery({
        queryKey: ['events'],
        queryFn: eventService.getAll,
    });

    const events = eventsData?.data || [];

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<EventFormData>({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            title: '',
            description: '',
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date().toISOString().split('T')[0],
            location: '',
            organizer: '',
            participants: '',
            type: 'Academic',
        },
    });

    const selectedType = watch('type');

    const createMutation = useMutation({
        mutationFn: eventService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            toast({
                title: 'Success',
                description: 'Event created successfully',
            });
            setIsDialogOpen(false);
            reset();
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to create event',
                variant: 'destructive',
            });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<EventFormData> }) =>
            eventService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            toast({
                title: 'Success',
                description: 'Event updated successfully',
            });
            setIsDialogOpen(false);
            setEditingEvent(null);
            reset();
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update event',
                variant: 'destructive',
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: eventService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            toast({
                title: 'Success',
                description: 'Event deleted successfully',
            });
            setDeleteId(null);
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete event',
                variant: 'destructive',
            });
        },
    });

    const onSubmit = (data: EventFormData) => {
        if (editingEvent) {
            updateMutation.mutate({ id: editingEvent.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleEdit = (event: Event) => {
        setEditingEvent(event);
        setValue('title', event.title);
        setValue('description', event.description || '');
        setValue('start_date', event.start_date.split('T')[0]);
        setValue('end_date', event.end_date.split('T')[0]);
        setValue('location', event.location || '');
        setValue('organizer', event.organizer || '');
        setValue('participants', event.participants || '');
        setValue('type', event.type);
        setIsDialogOpen(true);
    };

    const handleAdd = () => {
        setEditingEvent(null);
        reset();
        setIsDialogOpen(true);
    };

    const handleDelete = () => {
        if (deleteId) {
            deleteMutation.mutate(deleteId);
        }
    };

    const filteredEvents = events.filter((event: Event) =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const stats = {
        total: events.length,
        upcoming: events.filter((e: Event) => new Date(e.start_date) > new Date()).length,
        past: events.filter((e: Event) => new Date(e.end_date) < new Date()).length,
    };

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">Loading events...</p>
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
                        <h1 className="text-3xl font-bold">Events</h1>
                        <p className="text-muted-foreground mt-1">Manage school events and calendar (Calendar View Coming Soon)</p>
                    </div>
                    <Button onClick={handleAdd} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Create Event
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Events</p>
                                    <h3 className="text-2xl font-bold mt-1">{stats.total}</h3>
                                </div>
                                <Calendar className="w-8 h-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Upcoming</p>
                                    <h3 className="text-2xl font-bold mt-1 text-blue-600">{stats.upcoming}</h3>
                                </div>
                                <Calendar className="w-8 h-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Past Events</p>
                                    <h3 className="text-2xl font-bold mt-1 text-muted-foreground">{stats.past}</h3>
                                </div>
                                <Calendar className="w-8 h-8 text-gray-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent className="p-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by title or description..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map((event: Event) => (
                        <Card key={event.id} className="flex flex-col">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg font-bold line-clamp-1">{event.title}</CardTitle>
                                    <Badge variant="outline">{event.type}</Badge>
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground mt-2">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    <span>
                                        {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                                    </span>
                                </div>
                                {event.location && (
                                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                                        <MapPin className="w-4 h-4 mr-2" />
                                        <span>{event.location}</span>
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent className="flex-1">
                                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                                    {event.description || 'No description provided.'}
                                </p>
                                {event.organizer && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                        <strong>Organizer:</strong> {event.organizer}
                                    </p>
                                )}
                            </CardContent>
                            <div className="p-4 pt-0 mt-auto flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(event)}>
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setDeleteId(event.id)}>
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                    {filteredEvents.length === 0 && (
                        <div className="col-span-full text-center py-12">
                            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No events found</h3>
                            <p className="text-muted-foreground">
                                {searchQuery ? 'Try adjusting your search' : 'Get started by creating a new event'}
                            </p>
                        </div>
                    )}
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{editingEvent ? 'Edit' : 'Create'} Event</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <Label htmlFor="title">
                                    Title <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    {...register('title')}
                                    className={errors.title ? 'border-destructive' : ''}
                                />
                                {errors.title && (
                                    <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="start_date">
                                        Start Date <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        {...register('start_date')}
                                        className={errors.start_date ? 'border-destructive' : ''}
                                    />
                                    {errors.start_date && (
                                        <p className="text-sm text-destructive mt-1">{errors.start_date.message}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="end_date">
                                        End Date <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        {...register('end_date')}
                                        className={errors.end_date ? 'border-destructive' : ''}
                                    />
                                    {errors.end_date && (
                                        <p className="text-sm text-destructive mt-1">{errors.end_date.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="location">Location</Label>
                                    <Input id="location" {...register('location')} />
                                </div>
                                <div>
                                    <Label htmlFor="type">Type</Label>
                                    <Select
                                        value={selectedType}
                                        onValueChange={(value) => setValue('type', value as any)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Academic">Academic</SelectItem>
                                            <SelectItem value="Sports">Sports</SelectItem>
                                            <SelectItem value="Cultural">Cultural</SelectItem>
                                            <SelectItem value="Administrative">Administrative</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="organizer">Organizer</Label>
                                <Input id="organizer" {...register('organizer')} placeholder="e.g., Student Council" />
                            </div>

                            <div>
                                <Label htmlFor="participants">Participants</Label>
                                <Input id="participants" {...register('participants')} placeholder="e.g., All Students, Grade 10" />
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Input id="description" {...register('description')} className="h-20" />
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
                                        setEditingEvent(null);
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
                                This action cannot be undone. This will permanently delete the event.
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
