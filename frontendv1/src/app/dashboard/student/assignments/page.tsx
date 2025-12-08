"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/lib/apiClient";
import {
    FileText,
    Calendar,
    Clock,
    Upload,
    CheckCircle,
    AlertCircle,
    XCircle,
    Download,
    Eye,
    Filter,
} from "lucide-react";
import toast from "react-hot-toast";

interface Assignment {
    id: string;
    title: string;
    description: string;
    subject: string;
    dueDate: string;
    totalMarks: number;
    status: "pending" | "submitted" | "late" | "graded";
    submittedDate?: string;
    obtainedMarks?: number;
    feedback?: string;
    attachments?: string[];
}

export default function StudentAssignments() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);

    useEffect(() => {
        fetchAssignments();
    }, [user]);

    const fetchAssignments = async () => {
        try {
            setLoading(true);

            if (!user?.id) {
                toast.error("User not authenticated");
                return;
            }

            // API Integration: Fetch student's enrolled courses first, then get assignments
            const enrollmentResponse = await apiClient.getStudentEnrollment(user.id);

            if (!enrollmentResponse.success || !Array.isArray(enrollmentResponse.data)) {
                setAssignments([]);
                return;
            }

            const courses = enrollmentResponse.data;
            const allAssignments: Assignment[] = [];

            // Fetch course content (assignments) for each enrolled course
            for (const courseData of courses) {
                const courseId = courseData.course_id || courseData.id;

                try {
                    const contentResponse = await apiClient.getCourseContent(courseId, {
                        type: 'assignment'
                    });

                    if (contentResponse.success && Array.isArray(contentResponse.data)) {
                        const courseAssignments = contentResponse.data.map((item: any) => {
                            // Determine status based on dates and submission
                            const dueDate = new Date(item.due_date || item.dueDate);
                            const now = new Date();
                            const isOverdue = dueDate < now;
                            const hasSubmission = item.submission_date || item.submittedDate;

                            let status: Assignment["status"] = "pending";
                            if (item.is_graded || item.obtained_marks !== undefined) {
                                status = "graded";
                            } else if (hasSubmission) {
                                status = isOverdue ? "late" : "submitted";
                            } else if (isOverdue) {
                                status = "late";
                            }

                            return {
                                id: item.id || item.content_id,
                                title: item.title || item.name,
                                description: item.description || item.content || "",
                                subject: courseData.course_name || courseData.name || "General",
                                dueDate: item.due_date || item.dueDate,
                                totalMarks: Number(item.total_marks || item.totalMarks || 0),
                                status,
                                submittedDate: item.submission_date || item.submittedDate,
                                obtainedMarks: item.obtained_marks ? Number(item.obtained_marks) : undefined,
                                feedback: item.feedback || item.teacher_feedback,
                                attachments: item.attachments || [],
                            };
                        });
                        allAssignments.push(...courseAssignments);
                    }
                } catch (error) {
                    console.error(`Error fetching assignments for course ${courseId}:`, error);
                    // Continue with other courses
                }
            }

            // Sort by due date (earliest first)
            allAssignments.sort((a, b) =>
                new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
            );

            setAssignments(allAssignments);

        } catch (error: any) {
            console.error("Error fetching assignments:", error);

            if (error.response?.status === 404) {
                toast.error("No assignments found");
                setAssignments([]);
            } else if (error.response?.status === 401) {
                // Handled by interceptor
                return;
            } else {
                toast.error(
                    error.response?.data?.message ||
                    "Failed to load assignments. Please try again later."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: Assignment["status"]) => {
        const badges = {
            pending: {
                color: "bg-yellow-100 text-yellow-800",
                icon: <Clock size={14} />,
                label: "Pending",
            },
            submitted: {
                color: "bg-blue-100 text-blue-800",
                icon: <Upload size={14} />,
                label: "Submitted",
            },
            late: {
                color: "bg-red-100 text-red-800",
                icon: <XCircle size={14} />,
                label: "Late",
            },
            graded: {
                color: "bg-green-100 text-green-800",
                icon: <CheckCircle size={14} />,
                label: "Graded",
            },
        };

        const badge = badges[status];
        return (
            <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}
            >
                {badge.icon}
                {badge.label}
            </span>
        );
    };

    const getDaysRemaining = (dueDate: string) => {
        const due = new Date(dueDate);
        const now = new Date();
        const diff = due.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days;
    };

    const handleSubmit = async () => {
        if (!uploadedFile) {
            toast.error("Please select a file to upload");
            return;
        }

        if (!selectedAssignment || !user?.id) {
            toast.error("Invalid request");
            return;
        }

        try {
            // Get course ID from assignment (we need to track this)
            // For now, we'll need to find the course from enrollments
            const enrollmentResponse = await apiClient.getStudentEnrollment(user.id);

            if (!enrollmentResponse.success) {
                toast.error("Unable to submit assignment");
                return;
            }

            // Find the course for this assignment based on subject
            const course = enrollmentResponse.data.find((c: any) =>
                (c.course_name || c.name) === selectedAssignment.subject
            );

            if (!course) {
                toast.error("Course not found for this assignment");
                return;
            }

            const courseId = course.course_id || course.id;

            // API Integration: Upload assignment file
            const formData = new FormData();
            formData.append('file', uploadedFile);
            formData.append('type', 'assignment_submission');
            formData.append('assignment_id', selectedAssignment.id);
            formData.append('student_id', user.id);
            formData.append('title', `${selectedAssignment.title} - Submission`);
            formData.append('description', `Submission for ${selected Assignment.title}`);

            const response = await apiClient.uploadCourseContent(courseId, formData);

            if (response.success) {
                toast.success("Assignment submitted successfully!");
                setShowSubmitModal(false);
                setUploadedFile(null);
                setSelectedAssignment(null);
                fetchAssignments();
            } else {
                toast.error(response.message || "Failed to submit assignment");
            }
        } catch (error: any) {
            console.error("Error submitting assignment:", error);
            toast.error(
                error.response?.data?.message || 
                "Failed to submit assignment. Please try again."
            );
        }
    };

    const filteredAssignments = assignments.filter((assignment) => {
        if (filterStatus === "all") return true;
        return assignment.status === filterStatus;
    });

    const stats = {
        total: assignments.length,
        pending: assignments.filter((a) => a.status === "pending").length,
        submitted: assignments.filter((a) => a.status === "submitted").length,
        graded: assignments.filter((a) => a.status === "graded").length,
    };

    const sidebarItems = [
        {
            label: "Dashboard",
            href: "/dashboard/student",
            icon: <FileText size={20} />,
        },
        {
            label: "My Timetable",
            href: "/dashboard/student/timetable",
            icon: <Calendar size={20} />,
        },
        {
            label: "Assignments",
            href: "/dashboard/student/assignments",
            icon: <FileText size={20} />,
        },
        {
            label: "Fees",
            href: "/dashboard/student/fees",
            icon: <FileText size={20} />,
        },
    ];

    if (loading) {
        return (
            <ProtectedRoute>
                <DashboardLayout title="My Assignments" sidebarItems={sidebarItems}>
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-500">Loading assignments...</p>
                        </div>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <DashboardLayout title="My Assignments" sidebarItems={sidebarItems}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold flex items-center gap-2">
                                    <FileText size={28} />
                                    My Assignments
                                </h1>
                                <p className="text-blue-100 mt-1">
                                    Track and submit your homework & assignments
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                                <FileText className="text-gray-400" size={32} />
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Pending</p>
                                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                                </div>
                                <Clock className="text-yellow-400" size={32} />
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Submitted</p>
                                    <p className="text-2xl font-bold text-blue-600">{stats.submitted}</p>
                                </div>
                                <Upload className="text-blue-400" size={32} />
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Graded</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.graded}</p>
                                </div>
                                <CheckCircle className="text-green-400" size={32} />
                            </div>
                        </div>
                    </div>

                    {/* Filter */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <div className="flex items-center gap-3">
                            <Filter size={20} className="text-gray-400" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Assignments</option>
                                <option value="pending">Pending</option>
                                <option value="submitted">Submitted</option>
                                <option value="graded">Graded</option>
                                <option value="late">Late</option>
                            </select>
                        </div>
                    </div>

                    {/* Assignments List */}
                    <div className="space-y-4">
                        {filteredAssignments.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                                <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500">No assignments found</p>
                            </div>
                        ) : (
                            filteredAssignments.map((assignment) => {
                                const daysRemaining = getDaysRemaining(assignment.dueDate);
                                const isUrgent = daysRemaining <= 2 && assignment.status === "pending";

                                return (
                                    <div
                                        key={assignment.id}
                                        className={`bg - white rounded - xl shadow - sm border ${
            isUrgent ? "border-red-300 bg-red-50/30" : "border-gray-100"
        } p - 6 hover: shadow - md transition`}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-bold text-gray-900">
                                                        {assignment.title}
                                                    </h3>
                                                    {getStatusBadge(assignment.status)}
                                                    {isUrgent && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                                                            <AlertCircle size={12} />
                                                            Urgent
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mb-3">
                                                    {assignment.description}
                                                </p>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={14} />
                                                        Subject: <span className="font-medium">{assignment.subject}</span>
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={14} />
                                                        Due:{" "}
                                                        <span className="font-medium">
                                                            {new Date(assignment.dueDate).toLocaleDateString("en-US", {
                                                                month: "short",
                                                                day: "numeric",
                                                                year: "numeric",
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })}
                                                        </span>
                                                        {assignment.status === "pending" && (
                                                            <span
                                                                className={`ml - 2 ${
            daysRemaining < 0
            ? "text-red-600"
            : daysRemaining <= 2
                ? "text-orange-600"
                : "text-gray-600"
        } `}
                                                            >
                                                                ({daysRemaining < 0 ? "Overdue" : `${ daysRemaining } days left`})
                                                            </span>
                                                        )}
                                                    </span>
                                                    <span>Marks: {assignment.totalMarks}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {assignment.status === "graded" && (
                                            <div className="bg-green-50 rounded-lg p-4 mb-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="font-semibold text-green-900">Graded</p>
                                                    <p className="text-lg font-bold text-green-700">
                                                        {assignment.obtainedMarks}/{assignment.totalMarks}
                                                    </p>
                                                </div>
                                                {assignment.feedback && (
                                                    <p className="text-sm text-green-800">
                                                        <span className="font-medium">Feedback:</span> {assignment.feedback}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {assignment.status === "submitted" && assignment.submittedDate && (
                                            <div className="bg-blue-50 rounded-lg p-3 mb-4">
                                                <p className="text-sm text-blue-800">
                                                    Submitted on:{" "}
                                                    {new Date(assignment.submittedDate).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-3">
                                            {assignment.status === "pending" && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedAssignment(assignment);
                                                        setShowSubmitModal(true);
                                                    }}
                                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center gap-2"
                                                >
                                                    <Upload size={16} />
                                                    Submit Assignment
                                                </button>
                                            )}
                                            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition flex items-center gap-2">
                                                <Eye size={16} />
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Submit Modal */}
                {showSubmitModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                Submit Assignment
                            </h3>
                            <p className="text-gray-600 mb-4">{selectedAssignment?.title}</p>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload File
                                </label>
                                <input
                                    type="file"
                                    onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {uploadedFile && (
                                    <p className="mt-2 text-sm text-green-600">
                                        Selected: {uploadedFile.name}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleSubmit}
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                                >
                                    Submit
                                </button>
                                <button
                                    onClick={() => {
                                        setShowSubmitModal(false);
                                        setUploadedFile(null);
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        </ProtectedRoute>
    );
}
