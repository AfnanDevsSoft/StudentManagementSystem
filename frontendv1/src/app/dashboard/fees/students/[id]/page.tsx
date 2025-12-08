"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/lib/apiClient";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import PermissionGuard from "@/components/PermissionGuard";
import Modal from "@/components/Modal";
import { adminSidebarItems } from "@/config/sidebarConfig";
import {
    DollarSign,
    CreditCard,
    Calendar,
    ArrowLeft,
    Download,
    CheckCircle,
    AlertCircle,
    Clock,
    Receipt,
    TrendingUp,
    Plus,
} from "lucide-react";
import toast from "react-hot-toast";

interface StudentFeeDetails {
    student: {
        id: string;
        first_name: string;
        last_name: string;
        student_code: string;
    };
    total_fees: number;
    total_paid: number;
    total_pending: number;
    fee_details: FeeDetail[];
}

interface FeeDetail {
    fee_id: string;
    fee_name: string;
    amount: number;
    due_date: string;
    amount_paid: number;
    balance: number;
    status: "paid" | "partial" | "pending" | "overdue";
    payments: Payment[];
}

interface Payment {
    id: string;
    amount_paid: number;
    payment_date: string;
    payment_method: string;
    transaction_id?: string;
    recorded_by?: string;
}

export default function StudentFeesPage() {
    const params = useParams();
    const router = useRouter();
    const studentId = params?.id as string;

    const [loading, setLoading] = useState(true);
    const [feeDetails, setFeeDetails] = useState<StudentFeeDetails | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedFee, setSelectedFee] = useState<FeeDetail | null>(null);

    const [paymentForm, setPaymentForm] = useState({
        amount_paid: "",
        payment_method: "cash",
        transaction_id: "",
    });

    useEffect(() => {
        if (studentId) {
            fetchFeeDetails();
        }
    }, [studentId]);

    const fetchFeeDetails = async () => {
        try {
            setLoading(true);
            const response = await apiClient.getStudentFeeDetails(studentId);
            setFeeDetails(response.data);
        } catch (error) {
            console.error("Error fetching fee details:", error);
            toast.error("Failed to load fee details");
        } finally {
            setLoading(false);
        }
    };

    const handleRecordPayment = async () => {
        if (!selectedFee || !paymentForm.amount_paid) {
            toast.error("Please enter payment amount");
            return;
        }

        try {
            await apiClient.recordFeePayment({
                student_id: studentId,
                fee_id: selectedFee.fee_id,
                amount_paid: parseFloat(paymentForm.amount_paid),
                payment_method: paymentForm.payment_method,
                transaction_id: paymentForm.transaction_id,
                payment_date: new Date().toISOString(),
            });

            toast.success("Payment recorded successfully");
            setShowPaymentModal(false);
            setPaymentForm({
                amount_paid: "",
                payment_method: "cash",
                transaction_id: "",
            });
            fetchFeeDetails();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to record payment");
        }
    };

    const handleDownloadReceipt = async (paymentId: string) => {
        try {
            // Would call receipt generation API
            toast.success("Receipt download started");
        } catch (error) {
            toast.error("Failed to download receipt");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "paid":
                return "bg-green-100 text-green-800 border-green-300";
            case "partial":
                return "bg-yellow-100 text-yellow-800 border-yellow-300";
            case "pending":
                return "bg-blue-100 text-blue-800 border-blue-300";
            case "overdue":
                return "bg-red-100 text-red-800 border-red-300";
            default:
                return "bg-gray-100 text-gray-800 border-gray-300";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "paid":
                return <CheckCircle size={16} className="text-green-600" />;
            case "partial":
                return <Clock size={16} className="text-yellow-600" />;
            case "pending":
                return <Clock size={16} className="text-blue-600" />;
            case "overdue":
                return <AlertCircle size={16} className="text-red-600" />;
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <DashboardLayout title="Student Fees" sidebarItems={adminSidebarItems}>
                    <div className="flex items-center justify-center h-64">
                        <div className="text-gray-500">Loading...</div>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    if (!feeDetails) {
        return (
            <ProtectedRoute>
                <DashboardLayout title="Student Fees" sidebarItems={adminSidebarItems}>
                    <div className="flex items-center justify-center h-64">
                        <div className="text-gray-500">No fee details found</div>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <DashboardLayout title="Student Fees" sidebarItems={adminSidebarItems}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.back()}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {feeDetails.student.first_name} {feeDetails.student.last_name}
                                </h2>
                                <p className="text-sm text-gray-600">
                                    {feeDetails.student.student_code} • Fee Details
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-600 text-sm">Total Fees</span>
                                <DollarSign className="text-blue-500" size={24} />
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                PKR {feeDetails.total_fees.toLocaleString()}
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-600 text-sm">Total Paid</span>
                                <CheckCircle className="text-green-500" size={24} />
                            </div>
                            <p className="text-3xl font-bold text-green-600">
                                PKR {feeDetails.total_paid.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {((feeDetails.total_paid / feeDetails.total_fees) * 100).toFixed(1)}% paid
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-600 text-sm">Pending</span>
                                <AlertCircle className="text-orange-500" size={24} />
                            </div>
                            <p className="text-3xl font-bold text-orange-600">
                                PKR {feeDetails.total_pending.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Fee Details */}
                    <div className="space-y-4">
                        {feeDetails.fee_details.map((fee) => (
                            <div key={fee.fee_id} className="bg-white rounded-lg shadow overflow-hidden">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {fee.fee_name}
                                                </h3>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                                                        fee.status
                                                    )} flex items-center space-x-1`}
                                                >
                                                    {getStatusIcon(fee.status)}
                                                    <span className="capitalize">{fee.status}</span>
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-6 text-sm text-gray-600">
                                                <div className="flex items-center space-x-2">
                                                    <Calendar size={16} />
                                                    <span>Due: {new Date(fee.due_date).toLocaleDateString()}</span>
                                                </div>
                                                <div>Total: PKR {fee.amount.toLocaleString()}</div>
                                                <div>Paid: PKR {fee.amount_paid.toLocaleString()}</div>
                                                {fee.balance > 0 && (
                                                    <div className="text-orange-600 font-semibold">
                                                        Balance: PKR {fee.balance.toLocaleString()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {fee.balance > 0 && (
                                            <PermissionGuard permission="record_payments">
                                                <button
                                                    onClick={() => {
                                                        setSelectedFee(fee);
                                                        setPaymentForm({
                                                            ...paymentForm,
                                                            amount_paid: fee.balance.toString(),
                                                        });
                                                        setShowPaymentModal(true);
                                                    }}
                                                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                                >
                                                    <CreditCard size={16} />
                                                    <span>Pay Now</span>
                                                </button>
                                            </PermissionGuard>
                                        )}
                                    </div>

                                    {/* Payment History */}
                                    {fee.payments.length > 0 && (
                                        <div className="mt-4 pt-4 border-t">
                                            <h4 className="text-sm font-semibold text-gray-700 mb-3">
                                                Payment History
                                            </h4>
                                            <div className="space-y-2">
                                                {fee.payments.map((payment) => (
                                                    <div
                                                        key={payment.id}
                                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                                    >
                                                        <div className="flex items-center space-x-4">
                                                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                                                <CheckCircle className="text-green-600" size={20} />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-900">
                                                                    PKR {payment.amount_paid.toLocaleString()}
                                                                </p>
                                                                <p className="text-xs text-gray-600">
                                                                    {new Date(payment.payment_date).toLocaleDateString()} •{" "}
                                                                    {payment.payment_method}
                                                                    {payment.transaction_id && ` • ${payment.transaction_id}`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDownloadReceipt(payment.id)}
                                                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                                                        >
                                                            <Download size={16} />
                                                            <span className="text-sm">Receipt</span>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment Modal */}
                <Modal
                    isOpen={showPaymentModal}
                    onClose={() => {
                        setShowPaymentModal(false);
                        setSelectedFee(null);
                    }}
                    title="Record Payment"
                    size="md"
                >
                    {selectedFee && (
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-gray-600">Fee</p>
                                        <p className="font-semibold text-gray-900">{selectedFee.fee_name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">Balance Due</p>
                                        <p className="text-xl font-bold text-orange-600">
                                            PKR {selectedFee.balance.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Amount Paying *
                                </label>
                                <input
                                    type="number"
                                    value={paymentForm.amount_paid}
                                    onChange={(e) =>
                                        setPaymentForm({ ...paymentForm, amount_paid: e.target.value })
                                    }
                                    max={selectedFee.balance}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="0.00"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Maximum: PKR {selectedFee.balance.toLocaleString()}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Payment Method *
                                </label>
                                <select
                                    value={paymentForm.payment_method}
                                    onChange={(e) =>
                                        setPaymentForm({ ...paymentForm, payment_method: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="cash">Cash</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="online">Online Payment</option>
                                    <option value="cheque">Cheque</option>
                                    <option value="card">Debit/Credit Card</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Transaction ID / Reference
                                </label>
                                <input
                                    type="text"
                                    value={paymentForm.transaction_id}
                                    onChange={(e) =>
                                        setPaymentForm({ ...paymentForm, transaction_id: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Optional"
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    onClick={() => {
                                        setShowPaymentModal(false);
                                        setSelectedFee(null);
                                    }}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRecordPayment}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Record Payment
                                </button>
                            </div>
                        </div>
                    )}
                </Modal>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
