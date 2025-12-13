import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { useToast } from '../../../hooks/use-toast';
import { academicYearService } from '../../../services/academic-year.service';
import { gradeLevelService } from '../../../services/grade-level.service';
import { subjectService } from '../../../services/subject.service';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Switch } from '../../../components/ui/switch';

export const SchoolConfigTab: React.FC = () => {
    return (
        <div className="space-y-6">
            <Tabs defaultValue="subjects" className="w-full">
                <TabsList>
                    <TabsTrigger value="subjects">Subjects</TabsTrigger>
                    <TabsTrigger value="grade-levels">Grade Levels</TabsTrigger>
                    <TabsTrigger value="academic-years">Academic Years</TabsTrigger>
                </TabsList>

                <TabsContent value="subjects">
                    <SubjectsManager />
                </TabsContent>

                <TabsContent value="grade-levels">
                    <GradeLevelsManager />
                </TabsContent>

                <TabsContent value="academic-years">
                    <AcademicYearsManager />
                </TabsContent>
            </Tabs>
        </div>
    );
};

const SubjectsManager = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    const { data: subjects, isLoading } = useQuery({
        queryKey: ['subjects'],
        queryFn: subjectService.getAll,
    });

    const createMutation = useMutation({
        mutationFn: subjectService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subjects'] });
            toast({ title: 'Success', description: 'Subject created' });
            setIsDialogOpen(false);
        },
        onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: any) => subjectService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subjects'] });
            toast({ title: 'Success', description: 'Subject updated' });
            setIsDialogOpen(false);
            setEditingItem(null);
        },
        onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
    });

    const deleteMutation = useMutation({
        mutationFn: subjectService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subjects'] });
            toast({ title: 'Success', description: 'Subject deleted' });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const data = {
            name: formData.get('name'),
            code: formData.get('code'),
            credits: Number(formData.get('credits')),
            description: formData.get('description'),
        };

        if (editingItem) {
            updateMutation.mutate({ id: editingItem.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Subjects</CardTitle>
                    <CardDescription>Manage subjects offered in your school.</CardDescription>
                </div>
                <Button onClick={() => { setEditingItem(null); setIsDialogOpen(true); }}>
                    <Plus className="w-4 h-4 mr-2" /> Add Subject
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Credits</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {subjects?.data?.map((subject: any) => (
                            <TableRow key={subject.id}>
                                <TableCell className="font-medium">{subject.name}</TableCell>
                                <TableCell><Badge variant="outline">{subject.code}</Badge></TableCell>
                                <TableCell>{subject.credits}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="ghost" size="icon" onClick={() => { setEditingItem(subject); setIsDialogOpen(true); }}>
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(subject.id)}>
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingItem ? 'Edit' : 'Add'} Subject</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label>Subject Name</Label>
                                <Input name="name" defaultValue={editingItem?.name} required />
                            </div>
                            <div>
                                <Label>Code</Label>
                                <Input name="code" defaultValue={editingItem?.code} required />
                            </div>
                            <div>
                                <Label>Credits</Label>
                                <Input name="credits" type="number" defaultValue={editingItem?.credits || 3} required />
                            </div>
                            <div>
                                <Label>Description</Label>
                                <Input name="description" defaultValue={editingItem?.description} />
                            </div>
                            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                Save
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
};

const GradeLevelsManager = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    const { data: grades } = useQuery({
        queryKey: ['grade-levels'],
        queryFn: gradeLevelService.getAll,
    });

    const createMutation = useMutation({
        mutationFn: gradeLevelService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['grade-levels'] });
            toast({ title: 'Success', description: 'Grade level created' });
            setIsDialogOpen(false);
        },
        onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: any) => gradeLevelService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['grade-levels'] });
            setIsDialogOpen(false);
            setEditingItem(null);
        },
        onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
    });

    const deleteMutation = useMutation({
        mutationFn: gradeLevelService.delete,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['grade-levels'] }),
        onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const data = {
            name: formData.get('name'),
            code: formData.get('code'),
        };

        if (editingItem) updateMutation.mutate({ id: editingItem.id, data });
        else createMutation.mutate(data);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Grade Levels</CardTitle>
                    <CardDescription>Define grade levels (e.g., Grade 9, Grade 10).</CardDescription>
                </div>
                <Button onClick={() => { setEditingItem(null); setIsDialogOpen(true); }}>
                    <Plus className="w-4 h-4 mr-2" /> Add Grade Level
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {grades?.data?.map((level: any) => (
                            <TableRow key={level.id}>
                                <TableCell className="font-medium">{level.name}</TableCell>
                                <TableCell><Badge variant="outline">{level.code}</Badge></TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="ghost" size="icon" onClick={() => { setEditingItem(level); setIsDialogOpen(true); }}>
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(level.id)}>
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingItem ? 'Edit' : 'Add'} Grade Level</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div><Label>Name</Label><Input name="name" defaultValue={editingItem?.name} required /></div>
                            <div><Label>Code</Label><Input name="code" defaultValue={editingItem?.code} required /></div>
                            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>Save</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
};

const AcademicYearsManager = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    const { data: years } = useQuery({
        queryKey: ['academic-years'],
        queryFn: academicYearService.getAll,
    });

    const createMutation = useMutation({
        mutationFn: academicYearService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['academic-years'] });
            toast({ title: 'Success', description: 'Academic year created' });
            setIsDialogOpen(false);
        },
        onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: any) => academicYearService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['academic-years'] });
            setIsDialogOpen(false);
        },
        onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
    });

    const deleteMutation = useMutation({
        mutationFn: academicYearService.delete,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['academic-years'] }),
        onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const data = {
            year: formData.get('year'),
            start_date: formData.get('start_date'),
            end_date: formData.get('end_date'),
            is_current: formData.get('is_current') === 'on',
        };

        if (editingItem) updateMutation.mutate({ id: editingItem.id, data });
        else createMutation.mutate(data);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Academic Years</CardTitle>
                    <CardDescription>Manage academic sessions.</CardDescription>
                </div>
                <Button onClick={() => { setEditingItem(null); setIsDialogOpen(true); }}>
                    <Plus className="w-4 h-4 mr-2" /> Add Year
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Year</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>End Date</TableHead>
                            <TableHead>Current</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {years?.data?.map((year: any) => (
                            <TableRow key={year.id}>
                                <TableCell className="font-medium">{year.year}</TableCell>
                                <TableCell>{new Date(year.start_date).toLocaleDateString()}</TableCell>
                                <TableCell>{new Date(year.end_date).toLocaleDateString()}</TableCell>
                                <TableCell>{year.is_current ? <Badge>Current</Badge> : <Badge variant="secondary">Past</Badge>}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="ghost" size="icon" onClick={() => { setEditingItem(year); setIsDialogOpen(true); }}>
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(year.id)}>
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingItem ? 'Edit' : 'Add'} Academic Year</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div><Label>Year (e.g. 2025-2026)</Label><Input name="year" defaultValue={editingItem?.year} required /></div>
                            <div><Label>Start Date</Label><Input name="start_date" type="date" defaultValue={editingItem?.start_date ? new Date(editingItem.start_date).toISOString().split('T')[0] : ''} required /></div>
                            <div><Label>End Date</Label><Input name="end_date" type="date" defaultValue={editingItem?.end_date ? new Date(editingItem.end_date).toISOString().split('T')[0] : ''} required /></div>
                            <div className="flex items-center space-x-2">
                                <Switch name="is_current" defaultChecked={editingItem?.is_current} />
                                <Label>Set as Current Year</Label>
                            </div>
                            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>Save</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
};
