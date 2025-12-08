"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/lib/apiClient";
import {
    Calendar,
    Plus,
    CheckCircle,
    XCircle,
    Clock,
    FileText,
    TrendingUp,
    AlertCircle,
    Users,
    BarChart3,
    MessageCircle,
} from "lucide-react";
import toast from "react-hot-toast";

interface LeaveRequest {
    id: string;
    type: "casual" | "sick" | "annual" | "emergency";
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
    status: "pending" | "approved" | "rejected";
    appliedDate: string;
    approvedBy?: string;
    rejectionReason?: string;
}

interface LeaveBalance {
    type: string;
    total: number;
    used: number;
    remaining: number;
}

export default function TeacherLeaveManagement() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [formData, setFormData] = useState({
        type: "casual",
        startDate: "",
        endDate: "",
        reason: "",
    });

    useEffect(() => {
        fetchLeaveData();
    }, [user]);

    const fetchLeaveData = async () => {
        try {
            setLoading(true);

            if (!user?.id) {
                toast.error("User not authenticated");
                return;
            }

            // API Integration: Fetch leave requests and balance
            const [requestsResponse, balanceResponse] = await Promise.all([
                apiClient.getLeaveRequests({ employeeId: user.id }),
                apiClient.getLeaveBalance(user.id)
            ]);

            // Process leave requests
            if (requestsResponse.success && Array.isArray(requestsResponse.data)) {
                const requestsData: LeaveRequest[] = requestsResponse.data.map((req: any) => {
                    // Map status
                    let status: LeaveRequest["status"] = "pending";
                    if (req.status === "approved" || req.is_approved) status = "approved";
                    else if (req.status === "rejected" || req.is_rejected) status = "rejected";

                    // Calculate days between dates
                    const start = new Date(req.start_date || req.startDate);
                    const end = new Date(req.end_date || req.endDate);
                    const diffTime = Math.abs(end.getTime() - start.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

                    return {
                        id: req.id || req.leave_id,
                        type: (req.leave_type || req.type || "casual").toLowerCase() as LeaveRequest["type"],
                        startDate: req.start_date || req.startDate,
                        endDate: req.end_date || req.endDate,
                        days: req.days || diffDays,
                        reason: req.reason || req.description,
                        status,
                        appliedDate: req.created_at || req.appliedDate || req.request_date,
                        approvedBy: req.approved_by_name || req.approvedBy,
                        rejectionReason: req.rejection_reason || req.rejectionReason,
                    };
                });
                setLeaveRequests(requestsData);
            }

            // Process leave balance
            if (balanceResponse.success && balanceResponse.data) {
                const balanceData = balanceResponse.data;
                const balances: LeaveBalance[] = [
                    {
                        type: "Casual Leave",
                        total: Number(balanceData.casual_total || balanceData.casualTotal || 12),
                        used: Number(balanceData.casual_used || balanceData.casualUsed || 0),
                        remaining: Number(balanceData.casual_remaining || balanceData.casualRemaining || 12),
                    },
                    {
                        type: "Sick Leave",
                        total: Number(balanceData.sick_total || balanceData.sickTotal || 10),
                        used: Number(balanceData.sick_used || balanceData.sickUsed || 0),
                        remaining: Number(balanceData.sick_remaining || balanceData.sickRemaining || 10),
                    },
                    {
                        type: "Annual Leave",
                        total: Number(balanceData.annual_total || balanceData.annualTotal || 20),
                        used: Number(balanceData.annual_used || balanceData.annualUsed || 0),
                        remaining: Number(balanceData.annual_remaining || balanceData.annualRemaining || 20),
                    },
                    {
                        type: "Emergency Leave",
                        total: Number(balanceData.emergency_total || balanceData.emergencyTotal || 5),
                        used: Number(balanceData.emergency_used || balanceData.emergencyUsed || 0),
                        remaining: Number(balanceData.emergency_remaining || balanceData.emergencyRemaining || 5),
                    },
                ];
                setLeaveBalances(balances);
            }

        } catch (error: any) {
            console.error("Error fetching leave data:", error);

            if (error.response?.status === 404) {
                toast.error("No leave records found");
                setLeaveRequests([]);
                // Set default balances
                setLeaveBalances([
                    { type: "Casual Leave", total: 12, used: 0, remaining: 12 },
                    { type: "Sick Leave", total: 10, used: 0, remaining: 10 },
                    { type: "Annual Leave", total: 20, used: 0, remaining: 20 },
                    { type: "Emergency Leave", total: 5, used: 0, remaining: 5 },
                ]);
            } else if (error.response?.status === 401) {
                // Handled by interceptor
                return;
            } else {
                toast.error(
                    error.response?.data?.message ||
                    "Failed to load leave information. Please try again later."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: LeaveRequest["status"]) => {
        const badges = {
            pending: {
                color: "bg-yellow-100 text-yellow-800",
                icon: <Clock size={14} />,
                label: "Pending",
            },
            approved: {
                color: "bg-green-100 text-green-800",
                icon: <CheckCircle size={14} />,
                label: "Approved",
            },
            rejected: {
                color: "bg-red-100 text-red-800",
                icon: <XCircle size={14} />,
                label: "Rejected",
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

    const getLeaveTypeLabel = (type: LeaveRequest["type"]) => {
        const labels = {
            casual: "Casual Leave",
            sick: "Sick Leave",
            annual: "Annual Leave",
            emergency: "Emergency Leave",
        };
        return labels[type];
    };

    const calculateDays = () => {
        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            const diff = end.getTime() - start.getTime();
            const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
            return days > 0 ? days : 0;
        }
        return 0;
    };

    const handleSubmitRequest = async () => {
        if (!formData.startDate || !formData.endDate || !formData.reason.trim()) {
            toast.error("Please fill all required fields");
            return;
        }

        const days = calculateDays();
        if (days <= 0) {
            toast.error("End date must be after start date");
            return;
        }

        if (!user?.id) {
            toast.error("User not authenticated");
            return;
        }

        try {
            // API Integration: Create leave request
            const response = await apiClient.createLeaveRequest({
                employeeId: user.id,
                leaveType: formData.type,
                startDate: formData.startDate,
                endDate: formData.endDate,
                reason: formData.reason,
            });

            if (response.success) {
                toast.success("Leave request submitted successfully");
                setShowRequestModal(false);
                setFormData({ type: "casual", startDate: "", endDate: "", reason: "" });
                fetchLeaveData();
            } else {
                toast.error(response.message || "Failed to submit leave request");
            }
        } catch (error: any) {
            console.error("Error submitting leave request:", error);
            toast.error(
                error.response?.data?.message ||
                "Failed to submit leave request. Please try again."
            );
        }
    };

    const stats = {
        totalUsed: leaveBalances.reduce((sum, b) => sum + b.used, 0),
        totalRemaining: leaveBalances.reduce((sum, b) => sum + b.remaining, 0),
        pending: leaveRequests.filter((r) => r.status === "pending").length,
        approved: leaveRequests.filter((r) => r.status === "approved").length,
    };

    const sidebarItems = [
        {
            label: "Dashboard",
            href: "/dashboard/teacher",
            icon: <Users size={20} />,
        },
        {
            label: "Students",
            href: "/dashboard/teacher/students",
            icon: <Users size={20} />,
        },
        {
            label: "Attendance",
            href: "/dashboard/teacher/attendance",
            icon: <Calendar size={20} />,
        },
        {
            label: "Leave Management",
            href: "/dashboard/teacher/leave",
            icon: <Calendar size={20} />,
        },
        {
            label: "Messages",
            href: "/dashboard/teacher/messages",
            icon: <MessageCircle size={20} />,
        },
    ];

    if (loading) {
        return (
            <ProtectedRoute>
                <DashboardLayout title="Leave Management" sidebarItems={sidebarItems}>
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-500">Loading leave information...</p>
                        </div>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <DashboardLayout title="Leave Management" sidebarItems={sidebarItems}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold flex items-center gap-2">
                                    <Calendar size={28} />
                                    Leave Management
                                </h1>
                                <p className="text-emerald-100 mt-1">
                                    Request leave, track status & view balance
                                </p>
                            </div>
                            <button
                                onClick={() => setShowRequestModal(true)}
                                className="px-4 py-2 bg-white text-emerald-600 rounded-lg font-medium hover:bg-emerald-50 transition flex items-center gap-2"
                            >
                                <Plus size={20} />
                                New Request
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Calendar className="text-blue-600" size={24} />
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">Total Used</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalUsed} days</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <TrendingUp className="text-green-600" size={24} />
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">Remaining</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalRemaining} days</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-3 bg-yellow-100 rounded-lg">
                                    <Clock className="text-yellow-600" size={24} />
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">Pending</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <CheckCircle className="text-purple-600" size={24} />
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">Approved</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                        </div>
                    </div>

                    {/* Leave Balance */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Leave Balance</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {leaveBalances.map((balance) => (
                                <div key={balance.type} className="border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-900 mb-3">{balance.type}</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Total:</span>
                                            <span className="font-medium">{balance.total}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Used:</span>
                                            <span className="font-medium text-red-600">{balance.used}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Remaining:</span>
                                            <span className="font-medium text-green-600">{balance.remaining}</span>
                                        </div>
                                    </div>
                                    <div className="mt-3 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-600 h-2 rounded-full transition-all"
                                            style={{
                                                width: `${(balance.remaining / balance.total) * 100}%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Leave History */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">Leave History</h2>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {leaveRequests.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500">No leave requests found</p>
                                </div>
                            ) : (
                                leaveRequests.map((request) => (
                                    <div key={request.id} className="p-6 hover:bg-gray-50 transition">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold text-gray-900">
                                                        {getLeaveTypeLabel(request.type)}
                                                    </h3>
                                                    {getStatusBadge(request.status)}
                                                </div>
                                                <p className="text-sm text-gray-600 mb-3">{request.reason}</p>

                                                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar size={14} />
                                                        <span>
                                                            {new Date(request.startDate).toLocaleDateString()} -{" "}
                                                            {new Date(request.endDate).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock size={14} />
                                                        <span>{request.days} day{request.days > 1 ? "s" : ""}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <FileText size={14} />
                                                        <span>
                                                            Applied: {new Date(request.appliedDate).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>

                                                {request.status === "approved" && request.approvedBy && (
                                                    <p className="mt-2 text-sm text-green-600">
                                                        Approved by {request.approvedBy}
                                                    </p>
                                                )}

                                                {request.status === "rejected" && request.rejectionReason && (
                                                    <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                                                        <p className="text-sm text-red-800">
                                                            <strong>Rejection Reason:</strong> {request.rejectionReason}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* New Request Modal */}
                {showRequestModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                New Leave Request
                            </h3>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Leave Type
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) =>
                                            setFormData({ ...formData, type: e.target.value as any })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="casual">Casual Leave</option>
                                        <option value="sick">Sick Leave</option>
                                        <option value="annual">Annual Leave</option>
                                        <option value="emergency">Emergency Leave</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) =>
                                                setFormData({ ...formData, startDate: e.target.value })
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) =>
                                                setFormData({ ...formData, endDate: e.target.value })
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>

                                {formData.startDate && formData.endDate && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <p className="text-sm text-blue-800">
                                            <strong>Duration:</strong> {calculateDays()} day
                                            {calculateDays() > 1 ? "s" : ""}
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Reason
                                    </label>
                                    <textarea
                                        value={formData.reason}
                                        onChange={(e) =>
                                            setFormData({ ...formData, reason: e.target.value })
                                        }
                                        placeholder="Enter reason for leave..."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleSubmitRequest}
                                    className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition"
                                >
                                    Submit Request
                                </button>
                                <button
                                    onClick={() => {
                                        setShowRequestModal(false);
                                        setFormData({
                                            type: "casual",
                                            startDate: "",
                                            endDate: "",
                                            reason: "",
                                        });
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
