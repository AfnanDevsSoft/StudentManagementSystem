"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/lib/apiClient";
import { adminSidebarItems } from "@/config/sidebarConfig";
import {
    FileText,
    Search,
    Filter,
    Plus,
    Eye,
    Check,
    X,
    Clock,
    UserPlus,
    TrendingUp,
    Calendar,
    ChevronRight,
    MoreVertical,
} from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/Modal";

interface Application {
    id: string;
    applicant_name: string;
    email: string;
    phone: string;
    date_of_birth: string;
    grade_applying: string;
    previous_school: string;
    status: "pending" | "under_review" | "approved" | "rejected" | "enrolled";
    applied_date: string;
    notes?: string;
}

export default function AdmissionsPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showNewAppModal, setShowNewAppModal] = useState(false);
    const [reviewNotes, setReviewNotes] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    // Form state for new application
    const [newApp, setNewApp] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        date_of_birth: "",
        grade_applying: "",
        previous_school: "",
        parent_name: "",
        parent_phone: "",
        address: "",
    });

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            // Try to fetch from API or use mock data
            try {
                const response = await apiClient.get("/admissions/applications");
                setApplications(Array.isArray(response.data) ? response.data : []);
            } catch {
                // Use mock data for demo
                setApplications([
                    {
                        id: "1",
                        applicant_name: "Ahmad Khan",
                        email: "ahmad.khan@email.com",
                        phone: "+92 300 1234567",
                        date_of_birth: "2010-05-15",
                        grade_applying: "Grade 6",
                        previous_school: "City Public School",
                        status: "pending",
                        applied_date: new Date().toISOString(),
                    },
                    {
                        id: "2",
                        applicant_name: "Sara Ahmed",
                        email: "sara.ahmed@email.com",
                        phone: "+92 321 7654321",
                        date_of_birth: "2011-08-22",
                        grade_applying: "Grade 5",
                        previous_school: "Model High School",
                        status: "under_review",
                        applied_date: new Date(Date.now() - 86400000).toISOString(),
                    },
                    {
                        id: "3",
                        applicant_name: "Ali Hassan",
                        email: "ali.hassan@email.com",
                        phone: "+92 333 9876543",
                        date_of_birth: "2009-12-10",
                        grade_applying: "Grade 7",
                        previous_school: "Grammar School",
                        status: "approved",
                        applied_date: new Date(Date.now() - 172800000).toISOString(),
                    },
                    {
                        id: "4",
                        applicant_name: "Fatima Zahra",
                        email: "fatima.z@email.com",
                        phone: "+92 345 1112233",
                        date_of_birth: "2010-03-25",
                        grade_applying: "Grade 6",
                        previous_school: "Beacon House",
                        status: "enrolled",
                        applied_date: new Date(Date.now() - 604800000).toISOString(),
                    },
                ]);
            }
        } catch (error) {
            console.error("Error fetching applications:", error);
            toast.error("Failed to load applications");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (appId: string, newStatus: Application["status"]) => {
        setActionLoading(true);
        try {
            // API call would go here
            setApplications(apps =>
                apps.map(app =>
                    app.id === appId ? { ...app, status: newStatus, notes: reviewNotes } : app
                )
            );
            toast.success(`Application ${newStatus === 'approved' ? 'approved' : newStatus === 'rejected' ? 'rejected' : 'updated'} successfully`);
            setShowReviewModal(false);
            setSelectedApp(null);
            setReviewNotes("");
        } catch (error) {
            toast.error("Failed to update application status");
        } finally {
            setActionLoading(false);
        }
    };

    const handleEnrollStudent = async (app: Application) => {
        setActionLoading(true);
        try {
            // Create student from application
            const nameParts = app.applicant_name.split(' ');
            const studentData = {
                first_name: nameParts[0],
                last_name: nameParts.slice(1).join(' ') || nameParts[0],
                personal_email: app.email,
                personal_phone: app.phone,
                date_of_birth: app.date_of_birth,
                previous_school: app.previous_school,
                admission_status: "enrolled",
                is_active: true,
                admission_date: new Date().toISOString(),
            };

            await apiClient.createStudent(studentData);

            // Update application status
            setApplications(apps =>
                apps.map(a =>
                    a.id === app.id ? { ...a, status: 'enrolled' as const } : a
                )
            );

            toast.success("Student enrolled successfully!");
        } catch (error) {
            console.error("Error enrolling student:", error);
            toast.error("Failed to enroll student");
        } finally {
            setActionLoading(false);
        }
    };

    const handleSubmitNewApp = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const newApplication: Application = {
                id: Date.now().toString(),
                applicant_name: `${newApp.first_name} ${newApp.last_name}`,
                email: newApp.email,
                phone: newApp.phone,
                date_of_birth: newApp.date_of_birth,
                grade_applying: newApp.grade_applying,
                previous_school: newApp.previous_school,
                status: "pending",
                applied_date: new Date().toISOString(),
            };

            setApplications([newApplication, ...applications]);
            toast.success("Application submitted successfully!");
            setShowNewAppModal(false);
            setNewApp({
                first_name: "",
                last_name: "",
                email: "",
                phone: "",
                date_of_birth: "",
                grade_applying: "",
                previous_school: "",
                parent_name: "",
                parent_phone: "",
                address: "",
            });
        } catch (error) {
            toast.error("Failed to submit application");
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadge = (status: Application["status"]) => {
        const styles = {
            pending: "bg-yellow-100 text-yellow-800",
            under_review: "bg-blue-100 text-blue-800",
            approved: "bg-green-100 text-green-800",
            rejected: "bg-red-100 text-red-800",
            enrolled: "bg-purple-100 text-purple-800",
        };
        const labels = {
            pending: "Pending",
            under_review: "Under Review",
            approved: "Approved",
            rejected: "Rejected",
            enrolled: "Enrolled",
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    const stats = [
        { label: "Total Applications", value: applications.length, icon: FileText, color: "bg-blue-500" },
        { label: "Pending Review", value: applications.filter(a => a.status === 'pending').length, icon: Clock, color: "bg-yellow-500" },
        { label: "Approved", value: applications.filter(a => a.status === 'approved').length, icon: Check, color: "bg-green-500" },
        { label: "Enrolled", value: applications.filter(a => a.status === 'enrolled').length, icon: UserPlus, color: "bg-purple-500" },
    ];

    const filteredApplications = applications.filter(app => {
        const matchesSearch =
            app.applicant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.grade_applying.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <ProtectedRoute>
            <DashboardLayout title="Admissions" sidebarItems={adminSidebarItems}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Admissions Management</h1>
                            <p className="text-gray-600">Process and track student applications</p>
                        </div>
                        <button
                            onClick={() => setShowNewAppModal(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <Plus size={18} />
                            <span>New Application</span>
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {stats.map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500">{stat.label}</p>
                                            <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                        </div>
                                        <div className={`p-3 rounded-xl ${stat.color} text-white`}>
                                            <Icon size={24} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or grade..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Filter size={20} className="text-gray-400" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="under_review">Under Review</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="enrolled">Enrolled</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Applications Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : filteredApplications.length === 0 ? (
                            <div className="text-center py-16">
                                <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-500">No applications found</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Applicant</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Contact</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Grade Applying</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Applied Date</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredApplications.map((app) => (
                                        <tr key={app.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                                        {app.applicant_name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{app.applicant_name}</p>
                                                        <p className="text-sm text-gray-500">{app.previous_school}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-900">{app.email}</p>
                                                <p className="text-sm text-gray-500">{app.phone}</p>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{app.grade_applying}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(app.applied_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">{getStatusBadge(app.status)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedApp(app);
                                                            setShowReviewModal(true);
                                                        }}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                        title="Review"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    {app.status === 'approved' && (
                                                        <button
                                                            onClick={() => handleEnrollStudent(app)}
                                                            disabled={actionLoading}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                                            title="Enroll Student"
                                                        >
                                                            <UserPlus size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Review Modal */}
                <Modal
                    isOpen={showReviewModal}
                    onClose={() => {
                        setShowReviewModal(false);
                        setSelectedApp(null);
                        setReviewNotes("");
                    }}
                    title="Review Application"
                    size="lg"
                >
                    {selectedApp && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Applicant Name</p>
                                    <p className="font-medium">{selectedApp.applicant_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium">{selectedApp.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="font-medium">{selectedApp.phone}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Date of Birth</p>
                                    <p className="font-medium">{new Date(selectedApp.date_of_birth).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Grade Applying For</p>
                                    <p className="font-medium">{selectedApp.grade_applying}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Previous School</p>
                                    <p className="font-medium">{selectedApp.previous_school}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Applied Date</p>
                                    <p className="font-medium">{new Date(selectedApp.applied_date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Current Status</p>
                                    {getStatusBadge(selectedApp.status)}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Review Notes
                                </label>
                                <textarea
                                    value={reviewNotes}
                                    onChange={(e) => setReviewNotes(e.target.value)}
                                    placeholder="Add any notes about this application..."
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex justify-between pt-4 border-t">
                                <button
                                    onClick={() => handleStatusChange(selectedApp.id, "rejected")}
                                    disabled={actionLoading || selectedApp.status === 'enrolled'}
                                    className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 transition"
                                >
                                    <X size={18} />
                                    <span>Reject</span>
                                </button>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => handleStatusChange(selectedApp.id, "under_review")}
                                        disabled={actionLoading || selectedApp.status === 'enrolled'}
                                        className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 transition"
                                    >
                                        <Clock size={18} />
                                        <span>Mark Under Review</span>
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange(selectedApp.id, "approved")}
                                        disabled={actionLoading || selectedApp.status === 'enrolled'}
                                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                                    >
                                        <Check size={18} />
                                        <span>Approve</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal>

                {/* New Application Modal */}
                <Modal
                    isOpen={showNewAppModal}
                    onClose={() => setShowNewAppModal(false)}
                    title="New Admission Application"
                    size="lg"
                >
                    <form onSubmit={handleSubmitNewApp} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={newApp.first_name}
                                    onChange={(e) => setNewApp({ ...newApp, first_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={newApp.last_name}
                                    onChange={(e) => setNewApp({ ...newApp, last_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                <input
                                    type="email"
                                    required
                                    value={newApp.email}
                                    onChange={(e) => setNewApp({ ...newApp, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                                <input
                                    type="tel"
                                    required
                                    value={newApp.phone}
                                    onChange={(e) => setNewApp({ ...newApp, phone: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                                <input
                                    type="date"
                                    required
                                    value={newApp.date_of_birth}
                                    onChange={(e) => setNewApp({ ...newApp, date_of_birth: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Grade Applying For *</label>
                                <select
                                    required
                                    value={newApp.grade_applying}
                                    onChange={(e) => setNewApp({ ...newApp, grade_applying: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Grade</option>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => (
                                        <option key={g} value={`Grade ${g}`}>Grade {g}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Previous School</label>
                                <input
                                    type="text"
                                    value={newApp.previous_school}
                                    onChange={(e) => setNewApp({ ...newApp, previous_school: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Parent/Guardian Name</label>
                                <input
                                    type="text"
                                    value={newApp.parent_name}
                                    onChange={(e) => setNewApp({ ...newApp, parent_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Phone</label>
                                <input
                                    type="tel"
                                    value={newApp.parent_phone}
                                    onChange={(e) => setNewApp({ ...newApp, parent_phone: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <textarea
                                    value={newApp.address}
                                    onChange={(e) => setNewApp({ ...newApp, address: e.target.value })}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={() => setShowNewAppModal(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={actionLoading}
                                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                            >
                                {actionLoading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                    <Plus size={18} />
                                )}
                                <span>Submit Application</span>
                            </button>
                        </div>
                    </form>
                </Modal>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
