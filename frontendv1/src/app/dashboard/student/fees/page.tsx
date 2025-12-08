"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/lib/apiClient";
import {
    DollarSign,
    Calendar,
    Download,
    CreditCard,
    CheckCircle,
    AlertCircle,
    XCircle,
    FileText,
    Bell,
} from "lucide-react";
import toast from "react-hot-toast";

interface FeeInvoice {
    id: string;
    invoiceNumber: string;
    month: string;
    dueDate: string;
    totalAmount: number;
    paidAmount: number;
    status: "paid" | "pending" | "overdue" | "partial";
    paymentDate?: string;
    paymentMethod?: string;
}

interface PaymentHistory {
    id: string;
    date: string;
    amount: number;
    method: string;
    invoiceNumber: string;
    receiptNumber: string;
}

export default function StudentFees() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState<FeeInvoice[]>([]);
    const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
    const [selectedInvoice, setSelectedInvoice] = useState<FeeInvoice | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    useEffect(() => {
        fetchFeeData();
    }, [user]);

    const fetchFeeData = async () => {
        try {
            setLoading(true);

            if (!user?.id) {
                toast.error("User not authenticated");
                return;
            }

            // API Integration: Fetch fees and payment history in parallel
            const [feesResponse, paymentsResponse] = await Promise.all([
                apiClient.getStudentFees(user.id),
                apiClient.getFeePayments(user.id)
            ]);

            // Process fee invoices
            if (feesResponse.success && Array.isArray(feesResponse.data)) {
                const feeData: FeeInvoice[] = feesResponse.data.map((fee: any) => {
                    const totalAmount = Number(fee.total_amount || fee.amount || 0);
                    const paidAmount = Number(fee.paid_amount || 0);
                    const isPaid = paidAmount >= totalAmount;
                    const isPartial = paidAmount > 0 && paidAmount < totalAmount;
                    const isOverdue = !isPaid && new Date(fee.due_date) < new Date();

                    let status: FeeInvoice["status"] = "pending";
                    if (isPaid) status = "paid";
                    else if (isPartial) status = "partial";
                    else if (isOverdue) status = "overdue";

                    return {
                        id: fee.id || fee.fee_id,
                        invoiceNumber: fee.invoice_number || fee.invoice_id || `INV-${fee.id}`,
                        month: fee.month || fee.fee_period || fee.description,
                        dueDate: fee.due_date,
                        totalAmount,
                        paidAmount,
                        status,
                        paymentDate: fee.payment_date,
                        paymentMethod: fee.payment_method,
                    };
                });
                setInvoices(feeData);
            }

            // Process payment history
            if (paymentsResponse.success && Array.isArray(paymentsResponse.data)) {
                const historyData: PaymentHistory[] = paymentsResponse.data.map((payment: any) => ({
                    id: payment.id || payment.payment_id,
                    date: payment.payment_date || payment.date,
                    amount: Number(payment.amount || 0),
                    method: payment.payment_method || payment.method || "Unknown",
                    invoiceNumber: payment.invoice_number || payment.fee_invoice_number,
                    receiptNumber: payment.receipt_number || payment.transaction_id || `REC-${payment.id}`,
                }));
                setPaymentHistory(historyData);
            }

        } catch (error: any) {
            console.error("Error fetching fee data:", error);

            if (error.response?.status === 404) {
                toast.error("No fee records found");
                setInvoices([]);
                setPaymentHistory([]);
            } else if (error.response?.status === 401) {
                // Handled by interceptor
                return;
            } else {
                toast.error(
                    error.response?.data?.message ||
                    "Failed to load fee information. Please try again later."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: FeeInvoice["status"]) => {
        const badges = {
            paid: {
                color: "bg-green-100 text-green-800",
                icon: <CheckCircle size={14} />,
                label: "Paid",
            },
            pending: {
                color: "bg-yellow-100 text-yellow-800",
                icon: <AlertCircle size={14} />,
                label: "Pending",
            },
            overdue: {
                color: "bg-red-100 text-red-800",
                icon: <XCircle size={14} />,
                label: "Overdue",
            },
            partial: {
                color: "bg-orange-100 text-orange-800",
                icon: <AlertCircle size={14} />,
                label: "Partial",
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

    const getDaysUntilDue = (dueDate: string) => {
        const due = new Date(dueDate);
        const now = new Date();
        const diff = due.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days;
    };

    const handlePayNow = (invoice: FeeInvoice) => {
        setSelectedInvoice(invoice);
        setShowPaymentModal(true);
    };

    const handlePayment = () => {
        // TODO: Implement actual payment gateway integration
        toast.success("Redirecting to payment gateway...");
        setShowPaymentModal(false);
    };

    const downloadInvoice = (invoice: FeeInvoice) => {
        // TODO: Implement PDF download
        toast.success(`Downloading invoice ${invoice.invoiceNumber}`);
    };

    const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const totalPending = invoices.reduce(
        (sum, inv) => sum + (inv.totalAmount - inv.paidAmount),
        0
    );
    const overdueCount = invoices.filter((inv) => inv.status === "overdue").length;

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
            icon: <DollarSign size={20} />,
        },
    ];

    if (loading) {
        return (
            <ProtectedRoute>
                <DashboardLayout title="Fee Management" sidebarItems={sidebarItems}>
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-500">Loading fee information...</p>
                        </div>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <DashboardLayout title="Fee Management" sidebarItems={sidebarItems}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold flex items-center gap-2">
                                    <DollarSign size={28} />
                                    Fee Management
                                </h1>
                                <p className="text-green-100 mt-1">
                                    View invoices, payment history, and make payments
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <CheckCircle className="text-green-600" size={24} />
                                </div>
                                <span className="text-xs text-gray-500">This Year</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">Total Paid</p>
                            <p className="text-2xl font-bold text-gray-900">
                                PKR {totalPaid.toLocaleString()}
                            </p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-3 bg-yellow-100 rounded-lg">
                                    <AlertCircle className="text-yellow-600" size={24} />
                                </div>
                                <span className="text-xs text-gray-500">Outstanding</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">Total Pending</p>
                            <p className="text-2xl font-bold text-gray-900">
                                PKR {totalPending.toLocaleString()}
                            </p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-3 bg-red-100 rounded-lg">
                                    <XCircle className="text-red-600" size={24} />
                                </div>
                                <span className="text-xs text-gray-500">Action Required</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">Overdue Invoices</p>
                            <p className="text-2xl font-bold text-gray-900">{overdueCount}</p>
                        </div>
                    </div>

                    {/* Due Reminders */}
                    {invoices.some((inv) => inv.status === "overdue" || inv.status === "pending") && (
                        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <Bell className="text-red-600 mt-0.5" size={20} />
                                <div className="flex-1">
                                    <p className="font-semibold text-red-900 mb-1">Payment Reminders</p>
                                    <div className="space-y-1 text-sm text-red-800">
                                        {invoices
                                            .filter((inv) => inv.status === "overdue")
                                            .map((inv) => (
                                                <p key={inv.id}>
                                                    • Invoice {inv.invoiceNumber} is overdue (Due:{" "}
                                                    {new Date(inv.dueDate).toLocaleDateString()})
                                                </p>
                                            ))}
                                        {invoices
                                            .filter((inv) => inv.status === "pending")
                                            .map((inv) => {
                                                const days = getDaysUntilDue(inv.dueDate);
                                                if (days <= 5) {
                                                    return (
                                                        <p key={inv.id}>
                                                            • Invoice {inv.invoiceNumber} due in {days} days
                                                        </p>
                                                    );
                                                }
                                                return null;
                                            })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Invoices */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">Fee Invoices</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                            Invoice #
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                            Month
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                            Due Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                            Paid
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {invoices.map((invoice) => (
                                        <tr key={invoice.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {invoice.invoiceNumber}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {invoice.month}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(invoice.dueDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                                PKR {invoice.totalAmount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                PKR {invoice.paidAmount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">{getStatusBadge(invoice.status)}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => downloadInvoice(invoice)}
                                                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                                                        title="Download Invoice"
                                                    >
                                                        <Download size={16} className="text-gray-600" />
                                                    </button>
                                                    {(invoice.status === "pending" ||
                                                        invoice.status === "overdue" ||
                                                        invoice.status === "partial") && (
                                                            <button
                                                                onClick={() => handlePayNow(invoice)}
                                                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-medium transition flex items-center gap-1"
                                                            >
                                                                <CreditCard size={12} />
                                                                Pay Now
                                                            </button>
                                                        )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Payment History */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">Payment History</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                            Invoice #
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                            Receipt #
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                            Method
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {paymentHistory.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(payment.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {payment.invoiceNumber}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {payment.receiptNumber}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-green-600">
                                                PKR {payment.amount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {payment.method}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => toast.success("Downloading receipt...")}
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                                                    title="Download Receipt"
                                                >
                                                    <Download size={16} className="text-gray-600" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Payment Modal */}
                {showPaymentModal && selectedInvoice && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                Make Payment
                            </h3>
                            <div className="space-y-4 mb-6">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm text-gray-600">Invoice:</span>
                                        <span className="text-sm font-medium">
                                            {selectedInvoice.invoiceNumber}
                                        </span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm text-gray-600">Month:</span>
                                        <span className="text-sm font-medium">
                                            {selectedInvoice.month}
                                        </span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm text-gray-600">Total Amount:</span>
                                        <span className="text-sm font-medium">
                                            PKR {selectedInvoice.totalAmount.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Amount Due:</span>
                                        <span className="text-lg font-bold text-blue-600">
                                            PKR{" "}
                                            {(
                                                selectedInvoice.totalAmount - selectedInvoice.paidAmount
                                            ).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-sm text-blue-800">
                                        <strong>Note:</strong> You will be redirected to our secure
                                        payment gateway to complete the transaction.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handlePayment}
                                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                                >
                                    <CreditCard size={16} />
                                    Proceed to Payment
                                </button>
                                <button
                                    onClick={() => setShowPaymentModal(false)}
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
