"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import PermissionGuard from "@/components/PermissionGuard";
import Modal from "@/components/Modal";
import DeleteConfirmation from "@/components/DeleteConfirmation";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/lib/apiClient";
import { adminSidebarItems } from "@/config/sidebarConfig";
import {
    Plus,
    Edit2,
    Trash2,
    Search,
    DollarSign,
    CreditCard,
    TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";

interface Fee {
    id: string;
    fee_name: string;
    amount: number;
    fee_type: string;
    grade_level?: string;
    due_date: string;
    is_mandatory: boolean;
    description?: string;
    created_at: string;
}

interface FeePayment {
    id: string;
    student_id: string;
    fee_id: string;
    amount_paid: number;
    payment_date: string;
    payment_method: string;
    transaction_id?: string;
    status: string;
}

export default function FeeManagement() {
    const { user } = useAuthStore();
    const [fees, setFees] = useState<Fee[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState({
        totalFees: 0,
        collectedAmount: 0,
        pendingAmount: 0,
        totalStudents: 0,
    });

    const [feeFormData, setFeeFormData] = useState({
        fee_name: "",
        amount: "",
        fee_type: "tuition",
        due_date: "",
        is_mandatory: true,
        description: "",
    });

    const [paymentFormData, setPaymentformData] = useState({
        student_id: "",
        fee_id: "",
        amount_paid: "",
        payment_method: "cash",
        transaction_id: "",
    });

    useEffect(() => {
        fetchFees();
        fetchStats();
    }, [user]);

    const fetchFees = async () => {
        try {
            setLoading(true);
            const response = await apiClient.getFees(user?.branch_id);
            if (response.success) {
                setFees(Array.isArray(response.data) ? response.data : []);
            }
        } catch (error) {
            console.error("Error fetching fees:", error);
            toast.error("Failed to load fees");
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        // Placeholder - would need actual stats API
        setStats({
            totalFees: fees.length,
            collectedAmount: 150000,
            pendingAmount: 45000,
            totalStudents: 20,
        });
    };

    const handleAddFee = async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.createFee({
                ...feeFormData,
                amount: parseFloat(feeFormData.amount),
                branch_id: user?.branch_id,
            });

            if (response.success) {
                toast.success("Fee created successfully");
                setShowAddModal(false);
                resetFeeForm();
                await fetchFees();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create fee");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditFee = async () => {
        if (!selectedFee) return;
        setIsLoading(true);
        try {
            const response = await apiClient.updateFee(selectedFee.id, {
                ...feeFormData,
                amount: parseFloat(feeFormData.amount),
            });

            if (response.success) {
                toast.success("Fee updated successfully");
                setShowEditModal(false);
                setSelectedFee(null);
                resetFeeForm();
                await fetchFees();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update fee");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteFee = async () => {
        if (!selectedFee) return;
        setIsLoading(true);
        try {
            const response = await apiClient.deleteFee(selectedFee.id);
            if (response.success) {
                toast.success("Fee deleted successfully");
                setShowDeleteModal(false);
                setSelectedFee(null);
                await fetchFees();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to delete fee");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRecordPayment = async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.recordFeePayment({
                ...paymentFormData,
                amount_paid: parseFloat(paymentFormData.amount_paid),
                payment_date: new Date().toISOString(),
            });

            if (response.success) {
                toast.success("Payment recorded successfully");
                setShowPaymentModal(false);
                resetPaymentForm();
                await fetchStats();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to record payment");
        } finally {
            setIsLoading(false);
        }
    };

    const openEditModal = (fee: Fee) => {
        setSelectedFee(fee);
        setFeeFormData({
            fee_name: fee.fee_name,
            amount: fee.amount.toString(),
            fee_type: fee.fee_type,
            due_date: fee.due_date.split("T")[0],
            is_mandatory: fee.is_mandatory,
            description: fee.description || "",
        });
        setShowEditModal(true);
    };

    const openDeleteModal = (fee: Fee) => {
        setSelectedFee(fee);
        setShowDeleteModal(true);
    };

    const resetFeeForm = () => {
        setFeeFormData({
            fee_name: "",
            amount: "",
            fee_type: "tuition",
            due_date: "",
            is_mandatory: true,
            description: "",
        });
    };

    const resetPaymentForm = () => {
        setPaymentformData({
            student_id: "",
            fee_id: "",
            amount_paid: "",
            payment_method: "cash",
            transaction_id: "",
        });
    };

    const filteredFees = fees.filter(
        (fee) =>
            fee.fee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fee.fee_type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <ProtectedRoute>
            <DashboardLayout title="Fee Management" sidebarItems={adminSidebarItems}>
                <div className="space-y-6">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm">Total Fees</p>
                                    <p className="text-3xl font-bold text-blue-600 mt-2">
                                        {stats.totalFees}
                                    </p>
                                </div>
                                <DollarSign className="text-blue-500" size={32} />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm">Collected</p>
                                    <p className="text-3xl font-bold text-green-600 mt-2">
                                        PKR {stats.collectedAmount.toLocaleString()}
                                    </p>
                                </div>
                                <TrendingUp className="text-green-500" size={32} />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm">Pending</p>
                                    <p className="text-3xl font-bold text-orange-600 mt-2">
                                        PKR {stats.pendingAmount.toLocaleString()}
                                    </p>
                                </div>
                                <CreditCard className="text-orange-500" size={32} />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm">Collection Rate</p>
                                    <p className="text-3xl font-bold text-purple-600 mt-2">
                                        {(
                                            (stats.collectedAmount /
                                                (stats.collectedAmount + stats.pendingAmount)) *
                                            100
                                        ).toFixed(1)}
                                        %
                                    </p>
                                </div>
                                <TrendingUp className="text-purple-500" size={32} />
                            </div>
                        </div>
                    </div>

                    {/* Search and Actions */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <div className="flex-1 w-full">
                                <div className="relative">
                                    <Search
                                        className="absolute left-3 top-3 text-gray-400"
                                        size={20}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Search fees..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <PermissionGuard permission="record_payments">
                                    <button
                                        onClick={() => setShowPaymentModal(true)}
                                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
                                    >
                                        <CreditCard size={20} />
                                        Record Payment
                                    </button>
                                </PermissionGuard>
                                <PermissionGuard permission="manage_fees">
                                    <button
                                        onClick={() => setShowAddModal(true)}
                                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                                    >
                                        <Plus size={20} />
                                        Add Fee
                                    </button>
                                </PermissionGuard>
                            </div>
                        </div>
                    </div>

                    {/* Fees Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-gray-500 mt-2">Loading fees...</p>
                            </div>
                        ) : filteredFees.length === 0 ? (
                            <div className="p-8 text-center">
                                <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                <p className="text-gray-500">No fees found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                                Fee Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                                Type
                                            </th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                                Amount
                                            </th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                                Due Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {filteredFees.map((fee) => (
                                            <tr key={fee.id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                    {fee.fee_name}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                                                    {fee.fee_type}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                                    PKR {fee.amount.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {new Date(fee.due_date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${fee.is_mandatory
                                                            ? "bg-red-100 text-red-800"
                                                            : "bg-blue-100 text-blue-800"
                                                            }`}
                                                    >
                                                        {fee.is_mandatory ? "Mandatory" : "Optional"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-right space-x-2 flex justify-end">
                                                    <PermissionGuard permission="manage_fees">
                                                        <button
                                                            onClick={() => openEditModal(fee)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => openDeleteModal(fee)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </PermissionGuard>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Add Fee Modal */}
                <Modal
                    isOpen={showAddModal}
                    onClose={() => {
                        setShowAddModal(false);
                        resetFeeForm();
                    }}
                    title="Add New Fee"
                    size="lg"
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fee Name *
                                </label>
                                <input
                                    type="text"
                                    value={feeFormData.fee_name}
                                    onChange={(e) =>
                                        setFeeFormData({ ...feeFormData, fee_name: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Tuition Fee"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Amount (PKR) *
                                </label>
                                <input
                                    type="number"
                                    value={feeFormData.amount}
                                    onChange={(e) =>
                                        setFeeFormData({ ...feeFormData, amount: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="5000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fee Type *
                                </label>
                                <select
                                    value={feeFormData.fee_type}
                                    onChange={(e) =>
                                        setFeeFormData({ ...feeFormData, fee_type: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="tuition">Tuition</option>
                                    <option value="admission">Admission</option>
                                    <option value="exam">Exam</option>
                                    <option value="library">Library</option>
                                    <option value="transport">Transport</option>
                                    <option value="sports">Sports</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Due Date *
                                </label>
                                <input
                                    type="date"
                                    value={feeFormData.due_date}
                                    onChange={(e) =>
                                        setFeeFormData({ ...feeFormData, due_date: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={feeFormData.is_mandatory}
                                        onChange={(e) =>
                                            setFeeFormData({
                                                ...feeFormData,
                                                is_mandatory: e.target.checked,
                                            })
                                        }
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">Mandatory Fee</span>
                                </label>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={feeFormData.description}
                                    onChange={(e) =>
                                        setFeeFormData({ ...feeFormData, description: e.target.value })
                                    }
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Fee description..."
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 pt-4 border-t">
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    resetFeeForm();
                                }}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddFee}
                                disabled={isLoading}
                                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isLoading ? "Creating..." : "Create Fee"}
                            </button>
                        </div>
                    </div>
                </Modal>

                {/* Edit Fee Modal - Similar to Add */}
                <Modal
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedFee(null);
                        resetFeeForm();
                    }}
                    title="Edit Fee"
                    size="lg"
                >
                    {/* Same form fields as Add Modal */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Reuse the same form structure */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fee Name *
                                </label>
                                <input
                                    type="text"
                                    value={feeFormData.fee_name}
                                    onChange={(e) =>
                                        setFeeFormData({ ...feeFormData, fee_name: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Amount (PKR) *
                                </label>
                                <input
                                    type="number"
                                    value={feeFormData.amount}
                                    onChange={(e) =>
                                        setFeeFormData({ ...feeFormData, amount: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fee Type *
                                </label>
                                <select
                                    value={feeFormData.fee_type}
                                    onChange={(e) =>
                                        setFeeFormData({ ...feeFormData, fee_type: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="tuition">Tuition</option>
                                    <option value="admission">Admission</option>
                                    <option value="exam">Exam</option>
                                    <option value="library">Library</option>
                                    <option value="transport">Transport</option>
                                    <option value="sports">Sports</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Due Date *
                                </label>
                                <input
                                    type="date"
                                    value={feeFormData.due_date}
                                    onChange={(e) =>
                                        setFeeFormData({ ...feeFormData, due_date: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={feeFormData.is_mandatory}
                                        onChange={(e) =>
                                            setFeeFormData({
                                                ...feeFormData,
                                                is_mandatory: e.target.checked,
                                            })
                                        }
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">Mandatory Fee</span>
                                </label>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 pt-4 border-t">
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setSelectedFee(null);
                                    resetFeeForm();
                                }}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditFee}
                                disabled={isLoading}
                                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isLoading ? "Updating..." : "Update Fee"}
                            </button>
                        </div>
                    </div>
                </Modal>

                {/* Delete Confirmation Modal */}
                <DeleteConfirmation
                    isOpen={showDeleteModal}
                    onClose={() => {
                        setShowDeleteModal(false);
                        setSelectedFee(null);
                    }}
                    onConfirm={handleDeleteFee}
                    title="Delete Fee"
                    message="Are you sure you want to delete this fee? This action cannot be undone."
                    itemName={selectedFee ? selectedFee.fee_name : ""}
                    isLoading={isLoading}
                />

                {/* Record Payment Modal */}
                <Modal
                    isOpen={showPaymentModal}
                    onClose={() => {
                        setShowPaymentModal(false);
                        resetPaymentForm();
                    }}
                    title="Record Fee Payment"
                    size="md"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Student ID *
                            </label>
                            <input
                                type="text"
                                value={paymentFormData.student_id}
                                onChange={(e) =>
                                    setPaymentformData({
                                        ...paymentFormData,
                                        student_id: e.target.value,
                                    })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter student ID"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fee *
                            </label>
                            <select
                                value={paymentFormData.fee_id}
                                onChange={(e) =>
                                    setPaymentformData({ ...paymentFormData, fee_id: e.target.value })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Fee</option>
                                {fees.map((fee) => (
                                    <option key={fee.id} value={fee.id}>
                                        {fee.fee_name} - PKR {fee.amount}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Amount Paid (PKR) *
                            </label>
                            <input
                                type="number"
                                value={paymentFormData.amount_paid}
                                onChange={(e) =>
                                    setPaymentformData({
                                        ...paymentFormData,
                                        amount_paid: e.target.value,
                                    })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="5000"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Payment Method *
                            </label>
                            <select
                                value={paymentFormData.payment_method}
                                onChange={(e) =>
                                    setPaymentformData({
                                        ...paymentFormData,
                                        payment_method: e.target.value,
                                    })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="cash">Cash</option>
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="online">Online Payment</option>
                                <option value="cheque">Cheque</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Transaction ID
                            </label>
                            <input
                                type="text"
                                value={paymentFormData.transaction_id}
                                onChange={(e) =>
                                    setPaymentformData({
                                        ...paymentFormData,
                                        transaction_id: e.target.value,
                                    })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Optional transaction reference"
                            />
                        </div>
                        <div className="flex justify-end space-x-3 pt-4 border-t">
                            <button
                                onClick={() => {
                                    setShowPaymentModal(false);
                                    resetPaymentForm();
                                }}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRecordPayment}
                                disabled={isLoading}
                                className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                {isLoading ? "Recording..." : "Record Payment"}
                            </button>
                        </div>
                    </div>
                </Modal>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
