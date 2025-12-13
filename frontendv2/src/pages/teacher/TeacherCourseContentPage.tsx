import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { useAuth } from '../../contexts/AuthContext';
import { teacherService } from '../../services/teacher.service';
import { TeacherProfileError } from '../../components/teacher/TeacherProfileError';
import { courseContentService } from '../../services/courseContent.service';
import type { CreateCourseContentDto } from '../../services/courseContent.service';
import { File, Video, Link as LinkIcon, Trash, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';

export const TeacherCourseContentPage: React.FC = () => {
    const { user } = useAuth();
    const teacherId = user?.teacherId;
    const queryClient = useQueryClient();

    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [type, setType] = useState<'document' | 'video' | 'link'>('document');
    const [fileUrl, setFileUrl] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [description, setDescription] = useState('');

    // Fetch Teacher Courses
    const { data: coursesData, isLoading: loadingCourses } = useQuery({
        queryKey: ['teacher-courses', teacherId],
        queryFn: () => teacherService.getCourses(teacherId!),
        enabled: !!teacherId,
    });

    const courses = Array.isArray(coursesData?.data) ? coursesData.data : (Array.isArray(coursesData) ? coursesData : []);

    useEffect(() => {
        if (courses.length > 0 && !selectedCourseId) {
            setSelectedCourseId(courses[0].id);
        }
    }, [courses, selectedCourseId]);

    // Fetch Materials
    const { data: materialsData, isLoading: loadingMaterials } = useQuery({
        queryKey: ['course-materials', selectedCourseId],
        queryFn: () => courseContentService.getByCourse(selectedCourseId),
        enabled: !!selectedCourseId,
    });

    const materials = Array.isArray(materialsData?.data) ? materialsData.data : (Array.isArray(materialsData) ? materialsData : []);

    // Create Mutation
    const createMutation = useMutation({
        mutationFn: (data: CreateCourseContentDto) => courseContentService.create(selectedCourseId, data),
        onSuccess: () => {
            toast.success('Material added successfully');
            queryClient.invalidateQueries({ queryKey: ['course-materials', selectedCourseId] });
            setIsDialogOpen(false);
            resetForm();
        },
        onError: (error) => {
            toast.error('Failed to add material');
            console.error(error);
        }
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => courseContentService.delete(id),
        onSuccess: () => {
            toast.success('Material deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['course-materials', selectedCourseId] });
        },
        onError: (error) => {
            toast.error('Failed to delete material');
            console.error(error);
        }
    });

    const resetForm = () => {
        setTitle('');
        setType('document');
        setFileUrl('');
        setLinkUrl('');
        setDescription('');
    };

    const handleCreate = () => {
        if (!title || (!fileUrl && !linkUrl)) {
            toast.error('Please provide a title and a URL');
            return;
        }

        createMutation.mutate({
            title,
            type,
            file_url: type !== 'link' ? fileUrl : undefined,
            link_url: type === 'link' ? linkUrl : undefined,
            description,
            course_id: selectedCourseId
        });
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'video': return <Video className="w-8 h-8 text-blue-500" />;
            case 'link': return <LinkIcon className="w-8 h-8 text-green-500" />;
            default: return <File className="w-8 h-8 text-orange-500" />;
        }
    };

    if (!teacherId) {
        return <TeacherProfileError />;
    }

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Course Content</h1>
                        <p className="text-muted-foreground mt-1">
                            Upload and manage learning materials
                        </p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button disabled={!selectedCourseId}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Material
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Course Material</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Lecture 1 Slides" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select value={type} onValueChange={(v: any) => setType(v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="document">Document (PDF/Doc)</SelectItem>
                                            <SelectItem value="video">Video</SelectItem>
                                            <SelectItem value="link">Link</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {type === 'link' ? (
                                    <div className="space-y-2">
                                        <Label>URL</Label>
                                        <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://..." />
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Label>File URL (S3/Cloudinary)</Label>
                                        <Input value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="https://storage.com/file.pdf" />
                                        <p className="text-xs text-muted-foreground">In a real app, upload functionality would go here.</p>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label>Description (Optional)</Label>
                                    <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description..." />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                                    {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Add Material
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="w-full md:w-64">
                    <label className="text-sm font-medium mb-2 block">Select Class</label>
                    <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a class" />
                        </SelectTrigger>
                        <SelectContent>
                            {courses.map((course: any) => (
                                <SelectItem key={course.id} value={course.id}>
                                    {course.course_name || course.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Materials List</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loadingCourses || loadingMaterials ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : materials.length > 0 ? (
                            <div className="divide-y">
                                {materials.map((item: any) => (
                                    <div key={item.id} className="p-4 hover:bg-muted/50 transition-colors flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-muted rounded-lg">
                                                {getIcon(item.type)}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{item.title}</h3>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <span>{item.type.toUpperCase()}</span>
                                                    <span>•</span>
                                                    <span>{new Date(item.created_at || item.date).toLocaleDateString()}</span>
                                                    {item.description && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="truncate max-w-[200px]">{item.description}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <a href={item.file_url || item.link_url} target="_blank" rel="noopener noreferrer">
                                                    <LinkIcon className="w-4 h-4" />
                                                </a>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-600"
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to delete this material?')) {
                                                        deleteMutation.mutate(item.id);
                                                    }
                                                }}
                                            >
                                                <Trash className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                {selectedCourseId ? 'No materials uploaded yet' : 'Please select a class'}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
};
