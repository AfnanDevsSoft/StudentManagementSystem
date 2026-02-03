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
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { admissionService } from '../../services/admission.service';
import { branchService } from '../../services/branch.service';
import type { Admission, AdmissionDocument } from '../../services/admission.service';
import { admissionSchema } from '../../schemas/admission.schema';
import type { AdmissionFormData } from '../../schemas/admission.schema';
import { useToast } from '../../hooks/use-toast';
import { useAuth } from '../../contexts/AuthContext';
import {
    Plus, Search, Edit, Trash2, FileText, CheckCircle, XCircle, Clock,
    Upload, X, Eye, UserPlus, Download, GraduationCap
} from 'lucide-react';

const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'approved':
            return <Badge variant="secondary" className="bg-orange-100 text-orange-700">Approved</Badge>;
        case 'enrolled':
            return <Badge variant="secondary" className="bg-green-100 text-green-700">Enrolled</Badge>;
        case 'rejected':
            return <Badge variant="destructive">Rejected</Badge>;
        case 'submitted':
        default:
            return <Badge variant="secondary">Submitted</Badge>;
    }
};

export const AdmissionsPage: React.FC = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAdmission, setEditingAdmission] = useState<Admission | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [page, setPage] = useState(1);
    const limit = 12;

    // View dialog state
    const [viewingAdmission, setViewingAdmission] = useState<Admission | null>(null);

    // Approve dialog state
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [approvingAdmission, setApprovingAdmission] = useState<Admission | null>(null);
    const [offerLetterFile, setOfferLetterFile] = useState<File | null>(null);
    const [approveNotes, setApproveNotes] = useState('');

    // Reject dialog state
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectingAdmission, setRejectingAdmission] = useState<Admission | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    // Set credentials dialog state
    const [credentialsDialogOpen, setCredentialsDialogOpen] = useState(false);
    const [credentialsAdmission, setCredentialsAdmission] = useState<Admission | null>(null);
    const [studentUsername, setStudentUsername] = useState('');
    const [studentPassword, setStudentPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const roleName = user?.role?.name?.toLowerCase() || '';
    const isAdmin = roleName === 'superadmin' || roleName === 'branchadmin' || roleName === 'branch admin';
    const isAgent = roleName === 'admission agent' || roleName === 'admission_agent';

    // Fetch admissions with pagination
    const { data: admissionsData, isLoading } = useQuery({
        queryKey: ['admissions', page, limit],
        queryFn: () => admissionService.getAll({ page, limit }),
    });

    const admissions = admissionsData?.data || [];
    const pagination = admissionsData?.pagination || { total: 0, pages: 1 };

    const { data: branchesData } = useQuery({
        queryKey: ['branches'],
        queryFn: branchService.getAll,
    });

    const branches = branchesData?.data || [];

    // Username suggestions
    const { data: usernameSuggestions } = useQuery({
        queryKey: ['username-suggestions', credentialsAdmission?.id],
        queryFn: () => admissionService.suggestUsername(credentialsAdmission!.id),
        enabled: !!credentialsAdmission?.id && credentialsDialogOpen,
    });

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<AdmissionFormData>({
        resolver: zodResolver(admissionSchema),
        defaultValues: {
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            date_of_birth: '',
            gender: 'Male',
            address: '',
            city: '',
            state: '',
            previous_school: '',
            previous_institution_type: undefined,
            previous_marks: '',
            previous_percentage: '',
            previous_grade: '',
            grade_applying_for: '',
            application_date: new Date().toISOString().split('T')[0],
            notes: '',
            branch_id: '',
        },
    });

    const selectedGender = watch('gender');
    const selectedInstitutionType = watch('previous_institution_type');

    const createMutation = useMutation({
        mutationFn: ({ data, files }: { data: AdmissionFormData; files: File[] }) =>
            admissionService.create(data, files),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admissions'] });
            toast({ title: 'Success', description: 'Application created successfully' });
            setIsDialogOpen(false);
            setUploadedFiles([]);
            reset();
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to create application',
                variant: 'destructive',
            });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<AdmissionFormData> }) =>
            admissionService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admissions'] });
            toast({ title: 'Success', description: 'Application updated successfully' });
            setIsDialogOpen(false);
            setEditingAdmission(null);
            setUploadedFiles([]);
            reset();
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update application',
                variant: 'destructive',
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: admissionService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admissions'] });
            toast({ title: 'Success', description: 'Application deleted successfully' });
            setDeleteId(null);
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete application',
                variant: 'destructive',
            });
        },
    });

    const approveMutation = useMutation({
        mutationFn: ({ id, file, notes }: { id: string; file: File; notes?: string }) =>
            admissionService.approve(id, file, notes),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admissions'] });
            toast({ title: 'Success', description: 'Application approved successfully' });
            setApproveDialogOpen(false);
            setApprovingAdmission(null);
            setOfferLetterFile(null);
            setApproveNotes('');
            setViewingAdmission(null);
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to approve application',
                variant: 'destructive',
            });
        },
    });

    const rejectMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) =>
            admissionService.reject(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admissions'] });
            toast({ title: 'Success', description: 'Application rejected' });
            setRejectDialogOpen(false);
            setRejectingAdmission(null);
            setRejectReason('');
            setViewingAdmission(null);
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to reject application',
                variant: 'destructive',
            });
        },
    });

    const credentialsMutation = useMutation({
        mutationFn: ({ id, username, password }: { id: string; username: string; password: string }) =>
            admissionService.setCredentials(id, username, password),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admissions'] });
            toast({ title: 'Success', description: 'Student enrolled successfully! Account created.' });
            setCredentialsDialogOpen(false);
            setCredentialsAdmission(null);
            setStudentUsername('');
            setStudentPassword('');
            setConfirmPassword('');
            setViewingAdmission(null);
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to set credentials',
                variant: 'destructive',
            });
        },
    });

    const onSubmit = (data: AdmissionFormData) => {
        if (editingAdmission) {
            updateMutation.mutate({ id: editingAdmission.id, data });
        } else {
            createMutation.mutate({ data, files: uploadedFiles });
        }
    };

    const handleEdit = (admission: Admission) => {
        setEditingAdmission(admission);
        setValue('first_name', admission.first_name);
        setValue('last_name', admission.last_name);
        setValue('email', admission.email);
        setValue('phone', admission.phone);
        setValue('date_of_birth', admission.date_of_birth?.split('T')[0] || '');
        setValue('gender', admission.gender);
        setValue('address', admission.address || '');
        setValue('city', admission.city || '');
        setValue('state', admission.state || '');
        setValue('previous_school', admission.previous_school || '');
        setValue('previous_institution_type', (admission as any).previous_institution_type || undefined);
        setValue('previous_marks', (admission as any).previous_marks || '');
        setValue('previous_percentage', (admission as any).previous_percentage || '');
        setValue('previous_grade', (admission as any).previous_grade || '');
        setValue('grade_applying_for', admission.grade_applying_for);
        setValue('application_date', admission.application_date?.split('T')[0] || '');
        setValue('notes', admission.notes || '');
        setValue('branch_id', admission.branch_id);
        setIsDialogOpen(true);
    };

    const handleAdd = () => {
        setEditingAdmission(null);
        setUploadedFiles([]);
        reset();
        setIsDialogOpen(true);
    };

    const handleDelete = () => {
        if (deleteId) {
            deleteMutation.mutate(deleteId);
        }
    };

    const handleView = (admission: Admission) => {
        setViewingAdmission(admission);
    };

    const handleApproveClick = (admission: Admission) => {
        setApprovingAdmission(admission);
        setApproveDialogOpen(true);
    };

    const handleRejectClick = (admission: Admission) => {
        setRejectingAdmission(admission);
        setRejectDialogOpen(true);
    };

    const handleSetCredentialsClick = (admission: Admission) => {
        setCredentialsAdmission(admission);
        setCredentialsDialogOpen(true);
        setStudentUsername('');
        setStudentPassword('');
        setConfirmPassword('');
    };

    const handleApproveSubmit = () => {
        if (!approvingAdmission || !offerLetterFile) return;
        approveMutation.mutate({
            id: approvingAdmission.id,
            file: offerLetterFile,
            notes: approveNotes || undefined,
        });
    };

    const handleRejectSubmit = () => {
        if (!rejectingAdmission || !rejectReason.trim()) return;
        rejectMutation.mutate({ id: rejectingAdmission.id, reason: rejectReason });
    };

    const handleCredentialsSubmit = () => {
        if (!credentialsAdmission || !studentUsername || !studentPassword) return;
        if (studentPassword !== confirmPassword) {
            toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
            return;
        }
        if (studentPassword.length < 6) {
            toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
            return;
        }
        credentialsMutation.mutate({
            id: credentialsAdmission.id,
            username: studentUsername,
            password: studentPassword,
        });
    };

    const handleDocumentDownload = (doc: AdmissionDocument) => {
        const url = admissionService.getDocumentDownloadUrl(doc.id);
        const token = localStorage.getItem('token');
        // Use fetch with auth header to download
        fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.blob())
            .then((blob) => {
                const blobUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = doc.file_name;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(blobUrl);
            })
            .catch(() => {
                toast({ title: 'Error', description: 'Failed to download document', variant: 'destructive' });
            });
    };

    const filteredAdmissions = admissions.filter((admission: Admission) =>
        `${admission.first_name} ${admission.last_name} ${admission.email}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: admissions.length,
        submitted: admissions.filter((a: Admission) => a.status?.toLowerCase() === 'submitted').length,
        approved: admissions.filter((a: Admission) => a.status?.toLowerCase() === 'approved').length,
        rejected: admissions.filter((a: Admission) => a.status?.toLowerCase() === 'rejected').length,
        enrolled: admissions.filter((a: Admission) => a.status?.toLowerCase() === 'enrolled').length,
    };

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">Loading admissions...</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Admissions</h1>
                        <p className="text-muted-foreground mt-1">Manage student applications and enrollment</p>
                    </div>
                    {(isAgent || isAdmin) && (
                        <Button onClick={handleAdd} className="gap-2">
                            <Plus className="w-4 h-4" />
                            New Application
                        </Button>
                    )}
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total</p>
                                    <h3 className="text-2xl font-bold mt-1">{stats.total}</h3>
                                </div>
                                <FileText className="w-8 h-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Submitted</p>
                                    <h3 className="text-2xl font-bold mt-1 text-blue-600">{stats.submitted}</h3>
                                </div>
                                <Clock className="w-8 h-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Approved</p>
                                    <h3 className="text-2xl font-bold mt-1 text-orange-600">{stats.approved}</h3>
                                </div>
                                <CheckCircle className="w-8 h-8 text-orange-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Enrolled</p>
                                    <h3 className="text-2xl font-bold mt-1 text-green-600">{stats.enrolled}</h3>
                                </div>
                                <GraduationCap className="w-8 h-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Rejected</p>
                                    <h3 className="text-2xl font-bold mt-1 text-red-600">{stats.rejected}</h3>
                                </div>
                                <XCircle className="w-8 h-8 text-red-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <Card>
                    <CardContent className="p-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search applications by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Application Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAdmissions.map((admission: Admission) => (
                        <Card key={admission.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-lg font-bold">
                                    {admission.first_name} {admission.last_name}
                                </CardTitle>
                                {getStatusBadge(admission.status)}
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="text-sm text-muted-foreground">
                                        <p>Grade: {admission.grade_applying_for}</p>
                                        <p>Applied: {new Date(admission.application_date).toLocaleDateString()}</p>
                                        <p>Email: {admission.email}</p>
                                        <p>Phone: {admission.phone}</p>
                                        {admission.documents && admission.documents.length > 0 && (
                                            <p className="text-xs mt-1">
                                                {admission.documents.filter(d => d.document_type === 'attachment').length} document(s) attached
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-end gap-2 pt-4">
                                        <Button variant="ghost" size="sm" onClick={() => handleView(admission)} title="View Details">
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                        {admission.status === 'submitted' && (isAgent || isAdmin) && (
                                            <Button variant="ghost" size="sm" onClick={() => handleEdit(admission)} title="Edit">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                        )}
                                        {isAdmin && (
                                            <Button variant="ghost" size="sm" onClick={() => setDeleteId(admission.id)} title="Delete">
                                                <Trash2 className="w-4 h-4 text-destructive" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {filteredAdmissions.length === 0 && (
                        <div className="col-span-full text-center py-12">
                            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No applications found</h3>
                            <p className="text-muted-foreground">
                                {searchQuery ? 'Try adjusting your search' : 'Get started by creating a new application'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total || admissions.length)} of {pagination.total || admissions.length} applications
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                            Previous
                        </Button>
                        <span className="flex items-center px-3 text-sm">Page {page} of {pagination.pages || 1}</span>
                        <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= (pagination.pages || 1)}>
                            Next
                        </Button>
                    </div>
                </div>

                {/* ===== VIEW APPLICATION DIALOG ===== */}
                <Dialog open={!!viewingAdmission} onOpenChange={() => setViewingAdmission(null)}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Application Details</DialogTitle>
                        </DialogHeader>
                        {viewingAdmission && (
                            <div className="space-y-6">
                                {/* Status & Application Info */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Application #{viewingAdmission.application_number}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Applied: {new Date(viewingAdmission.application_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {getStatusBadge(viewingAdmission.status)}
                                </div>

                                {/* Personal Details */}
                                <div className="border rounded-lg p-4 space-y-3">
                                    <h3 className="font-semibold">Personal Information</h3>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div><span className="text-muted-foreground">Name:</span> {viewingAdmission.first_name} {viewingAdmission.last_name}</div>
                                        <div><span className="text-muted-foreground">Gender:</span> {viewingAdmission.gender}</div>
                                        <div><span className="text-muted-foreground">Email:</span> {viewingAdmission.email}</div>
                                        <div><span className="text-muted-foreground">Phone:</span> {viewingAdmission.phone}</div>
                                        <div><span className="text-muted-foreground">Date of Birth:</span> {viewingAdmission.date_of_birth ? new Date(viewingAdmission.date_of_birth).toLocaleDateString() : '-'}</div>
                                        <div><span className="text-muted-foreground">Grade Applying:</span> {viewingAdmission.grade_applying_for}</div>
                                        {viewingAdmission.address && <div className="col-span-2"><span className="text-muted-foreground">Address:</span> {viewingAdmission.address}{viewingAdmission.city ? `, ${viewingAdmission.city}` : ''}{viewingAdmission.state ? `, ${viewingAdmission.state}` : ''}</div>}
                                    </div>
                                </div>

                                {/* Previous Education */}
                                {viewingAdmission.previous_school && (
                                    <div className="border rounded-lg p-4 space-y-3">
                                        <h3 className="font-semibold">Previous Education</h3>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div><span className="text-muted-foreground">Institution:</span> {viewingAdmission.previous_school}</div>
                                            {viewingAdmission.previous_institution_type && <div><span className="text-muted-foreground">Type:</span> {viewingAdmission.previous_institution_type}</div>}
                                            {viewingAdmission.previous_marks && <div><span className="text-muted-foreground">Marks:</span> {viewingAdmission.previous_marks}</div>}
                                            {viewingAdmission.previous_percentage && <div><span className="text-muted-foreground">Percentage:</span> {viewingAdmission.previous_percentage}</div>}
                                            {viewingAdmission.previous_grade && <div><span className="text-muted-foreground">Grade:</span> {viewingAdmission.previous_grade}</div>}
                                        </div>
                                    </div>
                                )}

                                {/* Notes */}
                                {viewingAdmission.notes && (
                                    <div className="border rounded-lg p-4">
                                        <h3 className="font-semibold mb-2">Notes</h3>
                                        <p className="text-sm">{viewingAdmission.notes}</p>
                                    </div>
                                )}

                                {/* Documents */}
                                {viewingAdmission.documents && viewingAdmission.documents.length > 0 && (
                                    <div className="border rounded-lg p-4 space-y-3">
                                        <h3 className="font-semibold">Documents</h3>
                                        <div className="space-y-2">
                                            {viewingAdmission.documents
                                                .filter(d => d.document_type === 'attachment')
                                                .map((doc) => (
                                                    <div key={doc.id} className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-2">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                                                            <span className="text-sm truncate">{doc.file_name}</span>
                                                            <span className="text-xs text-muted-foreground shrink-0">
                                                                ({(doc.file_size / 1024).toFixed(1)} KB)
                                                            </span>
                                                        </div>
                                                        <Button variant="ghost" size="sm" onClick={() => handleDocumentDownload(doc)}>
                                                            <Download className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                        </div>

                                        {/* Offer Letter */}
                                        {viewingAdmission.documents.filter(d => d.document_type === 'offer_letter').length > 0 && (
                                            <div className="mt-4">
                                                <h4 className="text-sm font-semibold mb-2">Offer Letter</h4>
                                                {viewingAdmission.documents
                                                    .filter(d => d.document_type === 'offer_letter')
                                                    .map((doc) => (
                                                        <div key={doc.id} className="flex items-center justify-between bg-green-50 rounded-md px-3 py-2">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <FileText className="w-4 h-4 text-green-600 shrink-0" />
                                                                <span className="text-sm truncate">{doc.file_name}</span>
                                                            </div>
                                                            <Button variant="ghost" size="sm" onClick={() => handleDocumentDownload(doc)}>
                                                                <Download className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Rejection Reason */}
                                {viewingAdmission.status === 'rejected' && viewingAdmission.rejection_reason && (
                                    <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                                        <h3 className="font-semibold text-red-700 mb-2">Rejection Reason</h3>
                                        <p className="text-sm text-red-600">{viewingAdmission.rejection_reason}</p>
                                    </div>
                                )}

                                {/* Enrolled Info */}
                                {viewingAdmission.status === 'enrolled' && (
                                    <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                                        <h3 className="font-semibold text-green-700 mb-2">Enrollment Details</h3>
                                        <p className="text-sm"><span className="text-muted-foreground">Username:</span> {viewingAdmission.student_username}</p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-2 pt-4 border-t">
                                    {/* SA/BA can approve/reject submitted applications */}
                                    {isAdmin && viewingAdmission.status === 'submitted' && (
                                        <>
                                            <Button onClick={() => handleApproveClick(viewingAdmission)} className="gap-2 bg-green-600 hover:bg-green-700">
                                                <CheckCircle className="w-4 h-4" />
                                                Approve
                                            </Button>
                                            <Button variant="destructive" onClick={() => handleRejectClick(viewingAdmission)} className="gap-2">
                                                <XCircle className="w-4 h-4" />
                                                Reject
                                            </Button>
                                        </>
                                    )}

                                    {/* Agent can set credentials for approved applications */}
                                    {isAgent && viewingAdmission.status === 'approved' && (
                                        <Button onClick={() => handleSetCredentialsClick(viewingAdmission)} className="gap-2">
                                            <UserPlus className="w-4 h-4" />
                                            Set Credentials
                                        </Button>
                                    )}

                                    <Button variant="outline" onClick={() => setViewingAdmission(null)}>
                                        Close
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* ===== CREATE/EDIT APPLICATION DIALOG ===== */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingAdmission ? 'Edit' : 'New'} Application</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="first_name">First Name <span className="text-destructive">*</span></Label>
                                    <Input id="first_name" {...register('first_name')} className={errors.first_name ? 'border-destructive' : ''} />
                                    {errors.first_name && <p className="text-sm text-destructive mt-1">{errors.first_name.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="last_name">Last Name <span className="text-destructive">*</span></Label>
                                    <Input id="last_name" {...register('last_name')} className={errors.last_name ? 'border-destructive' : ''} />
                                    {errors.last_name && <p className="text-sm text-destructive mt-1">{errors.last_name.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                                    <Input id="email" type="email" {...register('email')} className={errors.email ? 'border-destructive' : ''} />
                                    {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="phone">Phone <span className="text-destructive">*</span></Label>
                                    <Input id="phone" {...register('phone')} className={errors.phone ? 'border-destructive' : ''} />
                                    {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="branch">Branch <span className="text-destructive">*</span></Label>
                                <Select value={watch('branch_id')} onValueChange={(value) => setValue('branch_id', value)}>
                                    <SelectTrigger className={errors.branch_id ? 'border-destructive' : ''}>
                                        <SelectValue placeholder="Select Branch" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {branches.map((branch: any) => (
                                            <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.branch_id && <p className="text-sm text-destructive mt-1">{errors.branch_id.message}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="date_of_birth">Date of Birth <span className="text-destructive">*</span></Label>
                                    <Input id="date_of_birth" type="date" {...register('date_of_birth')} className={errors.date_of_birth ? 'border-destructive' : ''} />
                                    {errors.date_of_birth && <p className="text-sm text-destructive mt-1">{errors.date_of_birth.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="gender">Gender</Label>
                                    <Select value={selectedGender} onValueChange={(value) => setValue('gender', value as any)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="address">Address</Label>
                                <Input id="address" {...register('address')} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="city">City</Label>
                                    <Input id="city" {...register('city')} />
                                </div>
                                <div>
                                    <Label htmlFor="state">State</Label>
                                    <Input id="state" {...register('state')} />
                                </div>
                            </div>

                            {/* Previous Education */}
                            <div className="space-y-4 border rounded-lg p-4">
                                <h3 className="text-sm font-semibold">Previous Education</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="previous_school">Institution Name</Label>
                                        <Input id="previous_school" {...register('previous_school')} />
                                    </div>
                                    <div>
                                        <Label htmlFor="previous_institution_type">Institution Type</Label>
                                        <Select value={selectedInstitutionType || ''} onValueChange={(value) => setValue('previous_institution_type', value as any)}>
                                            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="College">College</SelectItem>
                                                <SelectItem value="School">School</SelectItem>
                                                <SelectItem value="University">University</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                {selectedInstitutionType && (
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="previous_marks">Marks</Label>
                                            <Input id="previous_marks" {...register('previous_marks')} placeholder="e.g. 450" />
                                        </div>
                                        <div>
                                            <Label htmlFor="previous_percentage">Percentage</Label>
                                            <Input id="previous_percentage" {...register('previous_percentage')} placeholder="e.g. 85%" />
                                        </div>
                                        <div>
                                            <Label htmlFor="previous_grade">Grade</Label>
                                            <Input id="previous_grade" {...register('previous_grade')} placeholder="e.g. A+" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="grade_applying_for">Grade Applying For <span className="text-destructive">*</span></Label>
                                    <Input id="grade_applying_for" {...register('grade_applying_for')} className={errors.grade_applying_for ? 'border-destructive' : ''} />
                                    {errors.grade_applying_for && <p className="text-sm text-destructive mt-1">{errors.grade_applying_for.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="application_date">Application Date <span className="text-destructive">*</span></Label>
                                    <Input id="application_date" type="date" {...register('application_date')} className={errors.application_date ? 'border-destructive' : ''} />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="notes">Notes</Label>
                                <Input id="notes" {...register('notes')} />
                            </div>

                            {/* File Upload */}
                            {!editingAdmission && (
                                <div className="space-y-3 border rounded-lg p-4">
                                    <h3 className="text-sm font-semibold">Attachments</h3>
                                    <p className="text-xs text-muted-foreground">Upload supporting documents (transcripts, certificates, ID copies, etc.)</p>
                                    <div>
                                        <label
                                            htmlFor="file-upload"
                                            className="flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-4 cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors"
                                        >
                                            <Upload className="w-5 h-5 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">Click to upload files</span>
                                        </label>
                                        <input
                                            id="file-upload"
                                            type="file"
                                            multiple
                                            className="hidden"
                                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                            onChange={(e) => {
                                                if (e.target.files) {
                                                    setUploadedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                                                }
                                                e.target.value = '';
                                            }}
                                        />
                                    </div>
                                    {uploadedFiles.length > 0 && (
                                        <div className="space-y-2">
                                            {uploadedFiles.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-2">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                                                        <span className="text-sm truncate">{file.name}</span>
                                                        <span className="text-xs text-muted-foreground shrink-0">({(file.size / 1024).toFixed(1)} KB)</span>
                                                    </div>
                                                    <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 shrink-0" onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}>
                                                        <X className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-2 pt-4">
                                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                    {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); setEditingAdmission(null); setUploadedFiles([]); reset(); }}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* ===== APPROVE DIALOG ===== */}
                <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Approve Application</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Approving application for <strong>{approvingAdmission?.first_name} {approvingAdmission?.last_name}</strong>.
                                Please upload the offer letter.
                            </p>

                            <div>
                                <Label>Offer Letter <span className="text-destructive">*</span></Label>
                                <label className="flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-4 cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors mt-1">
                                    <Upload className="w-5 h-5 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                        {offerLetterFile ? offerLetterFile.name : 'Click to upload offer letter'}
                                    </span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,.doc,.docx"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) setOfferLetterFile(e.target.files[0]);
                                        }}
                                    />
                                </label>
                                {offerLetterFile && (
                                    <div className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-2 mt-2">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm">{offerLetterFile.name}</span>
                                            <span className="text-xs text-muted-foreground">({(offerLetterFile.size / 1024).toFixed(1)} KB)</span>
                                        </div>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setOfferLetterFile(null)}>
                                            <X className="w-3 h-3" />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label>Review Notes (Optional)</Label>
                                <Textarea
                                    value={approveNotes}
                                    onChange={(e) => setApproveNotes(e.target.value)}
                                    placeholder="Add any notes about this approval..."
                                    className="mt-1"
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button
                                    onClick={handleApproveSubmit}
                                    disabled={!offerLetterFile || approveMutation.isPending}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {approveMutation.isPending ? 'Approving...' : 'Approve'}
                                </Button>
                                <Button variant="outline" onClick={() => { setApproveDialogOpen(false); setOfferLetterFile(null); setApproveNotes(''); }}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* ===== REJECT DIALOG ===== */}
                <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Reject Application</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Rejecting application for <strong>{rejectingAdmission?.first_name} {rejectingAdmission?.last_name}</strong>.
                            </p>

                            <div>
                                <Label>Reason <span className="text-destructive">*</span></Label>
                                <Textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Provide a reason for rejection..."
                                    className="mt-1"
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button
                                    variant="destructive"
                                    onClick={handleRejectSubmit}
                                    disabled={!rejectReason.trim() || rejectMutation.isPending}
                                >
                                    {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
                                </Button>
                                <Button variant="outline" onClick={() => { setRejectDialogOpen(false); setRejectReason(''); }}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* ===== SET CREDENTIALS DIALOG ===== */}
                <Dialog open={credentialsDialogOpen} onOpenChange={setCredentialsDialogOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Set Student Credentials</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Create login credentials for <strong>{credentialsAdmission?.first_name} {credentialsAdmission?.last_name}</strong>.
                                This will create the student account and enroll them.
                            </p>

                            {/* Username Suggestions */}
                            {usernameSuggestions?.data && usernameSuggestions.data.length > 0 && (
                                <div>
                                    <Label className="text-xs text-muted-foreground">Suggested Usernames</Label>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {usernameSuggestions.data.map((s: { username: string; available: boolean }) => (
                                            <Button
                                                key={s.username}
                                                type="button"
                                                variant={s.available ? 'outline' : 'ghost'}
                                                size="sm"
                                                className={`text-xs ${!s.available ? 'line-through opacity-50' : ''}`}
                                                disabled={!s.available}
                                                onClick={() => setStudentUsername(s.username)}
                                            >
                                                {s.username}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <Label>Username <span className="text-destructive">*</span></Label>
                                <Input
                                    value={studentUsername}
                                    onChange={(e) => setStudentUsername(e.target.value)}
                                    placeholder="Enter username"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label>Password <span className="text-destructive">*</span></Label>
                                <Input
                                    type="password"
                                    value={studentPassword}
                                    onChange={(e) => setStudentPassword(e.target.value)}
                                    placeholder="Enter password (min 6 characters)"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label>Confirm Password <span className="text-destructive">*</span></Label>
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm password"
                                    className="mt-1"
                                />
                                {confirmPassword && studentPassword !== confirmPassword && (
                                    <p className="text-sm text-destructive mt-1">Passwords do not match</p>
                                )}
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button
                                    onClick={handleCredentialsSubmit}
                                    disabled={
                                        !studentUsername || !studentPassword || !confirmPassword ||
                                        studentPassword !== confirmPassword ||
                                        studentPassword.length < 6 ||
                                        credentialsMutation.isPending
                                    }
                                >
                                    {credentialsMutation.isPending ? 'Creating...' : 'Create Account & Enroll'}
                                </Button>
                                <Button variant="outline" onClick={() => { setCredentialsDialogOpen(false); setStudentUsername(''); setStudentPassword(''); setConfirmPassword(''); }}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* ===== DELETE CONFIRMATION ===== */}
                <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the application.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </MainLayout>
    );
};
