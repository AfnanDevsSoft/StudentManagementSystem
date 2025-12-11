import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { libraryService } from '../../services/library.service';
import { bookSchema, issueBookSchema } from '../../schemas/library.schema';
import type { BookFormData, IssueBookFormData } from '../../schemas/library.schema';
import { studentService } from '../../services/student.service';
import { useToast } from '../../hooks/use-toast';
import { Plus, Edit, Trash2, BookOpen, Clock, CheckCircle, RotateCcw } from 'lucide-react';

export const LibraryPage: React.FC = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<'books' | 'issued'>('books');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Fetch data
    const { data: booksData } = useQuery({ queryKey: ['books'], queryFn: () => libraryService.books.getAll() });
    const { data: issuedData } = useQuery({ queryKey: ['issued_books'], queryFn: () => libraryService.issued.getAll() });
    const { data: studentsData } = useQuery({ queryKey: ['students'], queryFn: () => studentService.getAll() });

    const books = (booksData as any)?.data || booksData || [];
    const issuedBooks = (issuedData as any)?.data || issuedData || [];
    const students = (studentsData as any)?.data || studentsData || [];

    // Forms
    const bookForm = useForm<BookFormData>({
        resolver: zodResolver(bookSchema),
        defaultValues: { title: '', author: '', isbn: '', category: '', total_copies: 1 }
    });

    const issueForm = useForm<IssueBookFormData>({
        resolver: zodResolver(issueBookSchema),
        defaultValues: { book_id: '', student_id: '', issue_date: new Date().toISOString().split('T')[0], due_date: '', status: 'Issued' }
    });

    // Mutations
    const bookMutation = useMutation({
        mutationFn: editingItem ? (data: any) => libraryService.books.update(editingItem.id, data) : libraryService.books.create,
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['books'] }); closeModal(); }
    });

    const issueMutation = useMutation({
        mutationFn: editingItem ? (data: any) => libraryService.issued.update(editingItem.id, data) : libraryService.issued.issue,
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['issued_books'] }); closeModal(); }
    });

    const returnMutation = useMutation({
        mutationFn: (data: { id: string, return_date: string }) => libraryService.issued.return(data.id, { return_date: data.return_date }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['issued_books'] });
            toast({ title: 'Success', description: 'Book returned successfully' });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => libraryService.books.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['books'] });
            toast({ title: 'Success', description: 'Book deleted successfully' });
            setDeleteId(null);
        }
    });

    const closeModal = () => {
        setIsDialogOpen(false);
        setEditingItem(null);
        bookForm.reset();
        issueForm.reset();
    };

    const handleEdit = (item: any) => {
        setEditingItem(item);
        if (activeTab === 'books') {
            bookForm.setValue('title', item.title);
            bookForm.setValue('author', item.author);
            bookForm.setValue('isbn', item.isbn);
            bookForm.setValue('category', item.category);
            bookForm.setValue('total_copies', item.total_copies);
        } else {
            issueForm.setValue('book_id', item.book_id);
            issueForm.setValue('student_id', item.student_id);
            issueForm.setValue('issue_date', item.issue_date.split('T')[0]);
            issueForm.setValue('due_date', item.due_date.split('T')[0]);
        }
        setIsDialogOpen(true);
    };

    const onSubmit = (data: any) => {
        if (activeTab === 'books') bookMutation.mutate(data);
        else issueMutation.mutate(data);
    };

    const stats = {
        totalBooks: books.reduce((acc: number, b: any) => acc + b.total_copies, 0),
        issued: issuedBooks.filter((i: any) => i.status === 'Issued').length,
        available: books.reduce((acc: number, b: any) => acc + b.copies_available, 0),
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Library</h1>
                        <p className="text-muted-foreground mt-1">Manage books and library records</p>
                    </div>
                    <Button onClick={() => { setEditingItem(null); setIsDialogOpen(true); }} className="gap-2">
                        <Plus className="w-4 h-4" />
                        {activeTab === 'books' ? 'Add Book' : 'Issue Book'}
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Books</p>
                                    <h3 className="text-2xl font-bold mt-1">{stats.totalBooks}</h3>
                                </div>
                                <BookOpen className="w-8 h-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Currently Issued</p>
                                    <h3 className="text-2xl font-bold mt-1 text-orange-600">{stats.issued}</h3>
                                </div>
                                <Clock className="w-8 h-8 text-orange-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Available Copies</p>
                                    <h3 className="text-2xl font-bold mt-1 text-green-600">{stats.available}</h3>
                                </div>
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex space-x-2 border-b">
                    <Button
                        variant={activeTab === 'books' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('books')}
                        className="rounded-b-none"
                    >
                        Books
                    </Button>
                    <Button
                        variant={activeTab === 'issued' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('issued')}
                        className="rounded-b-none"
                    >
                        Issued Records
                    </Button>
                </div>

                <Card>
                    <CardContent className="p-6">
                        {activeTab === 'books' && (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4">Title</th>
                                        <th className="text-left p-4">Author</th>
                                        <th className="text-left p-4">ISBN</th>
                                        <th className="text-left p-4">Available / Total</th>
                                        <th className="text-right p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {books.map((book: any) => (
                                        <tr key={book.id} className="border-b">
                                            <td className="p-4">{book.title}</td>
                                            <td className="p-4">{book.author}</td>
                                            <td className="p-4">{book.isbn}</td>
                                            <td className="p-4">{book.copies_available} / {book.total_copies}</td>
                                            <td className="text-right p-4">
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(book)}><Edit className="w-4 h-4" /></Button>
                                                <Button variant="ghost" size="sm" onClick={() => setDeleteId(book.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'issued' && (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4">Book</th>
                                        <th className="text-left p-4">Student</th>
                                        <th className="text-left p-4">Issued Date</th>
                                        <th className="text-left p-4">Due Date</th>
                                        <th className="text-left p-4">Status</th>
                                        <th className="text-right p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {issuedBooks.map((record: any) => (
                                        <tr key={record.id} className="border-b">
                                            <td className="p-4">{record.book?.title}</td>
                                            <td className="p-4">{record.student?.first_name} {record.student?.last_name}</td>
                                            <td className="p-4">{new Date(record.issue_date).toLocaleDateString()}</td>
                                            <td className="p-4">{new Date(record.due_date).toLocaleDateString()}</td>
                                            <td className="p-4"><Badge variant={record.status === 'Returned' ? 'success' : record.status === 'Overdue' ? 'destructive' : 'default'}>{record.status}</Badge></td>
                                            <td className="text-right p-4">
                                                {record.status === 'Issued' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => returnMutation.mutate({ id: record.id, return_date: new Date().toISOString() })}
                                                        title="Mark Returned"
                                                    >
                                                        <RotateCcw className="w-4 h-4 text-blue-500" />
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(record)}><Edit className="w-4 h-4" /></Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </CardContent>
                </Card>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingItem ? 'Edit' : 'Add'} {activeTab === 'books' ? 'Book' : 'Library Record'}</DialogTitle>
                        </DialogHeader>
                        {activeTab === 'books' && (
                            <form onSubmit={bookForm.handleSubmit(onSubmit)} className="space-y-4">
                                <div><Label>Title</Label><Input {...bookForm.register('title')} /></div>
                                <div><Label>Author</Label><Input {...bookForm.register('author')} /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><Label>ISBN</Label><Input {...bookForm.register('isbn')} /></div>
                                    <div><Label>Category</Label><Input {...bookForm.register('category')} /></div>
                                </div>
                                <div><Label>Total Copies</Label><Input type="number" {...bookForm.register('total_copies', { valueAsNumber: true })} /></div>
                                <Button type="submit">Save</Button>
                            </form>
                        )}
                        {activeTab === 'issued' && (
                            <form onSubmit={issueForm.handleSubmit(onSubmit)} className="space-y-4">
                                <div>
                                    <Label>Book</Label>
                                    <Select onValueChange={(v) => issueForm.setValue('book_id', v)} defaultValue={issueForm.watch('book_id')}>
                                        <SelectTrigger><SelectValue placeholder="Select book" /></SelectTrigger>
                                        <SelectContent>{books.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Student</Label>
                                    <Select onValueChange={(v) => issueForm.setValue('student_id', v)} defaultValue={issueForm.watch('student_id')}>
                                        <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                                        <SelectContent>{students.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.first_name} {s.last_name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><Label>Issue Date</Label><Input type="date" {...issueForm.register('issue_date')} /></div>
                                    <div><Label>Due Date</Label><Input type="date" {...issueForm.register('due_date')} /></div>
                                </div>
                                <Button type="submit">Save</Button>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>

                <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
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
