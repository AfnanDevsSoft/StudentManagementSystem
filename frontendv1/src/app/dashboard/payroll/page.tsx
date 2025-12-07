"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/lib/apiClient";
import { adminSidebarItems } from "@/config/sidebarConfig";
import {
    Wallet,
    Search,
    Filter,
    Download,
    Calendar,
    Users,
    DollarSign,
    TrendingUp,
    Clock,
    CheckCircle,
    FileText,
    Printer,
    Calculator,
} from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/Modal";

interface Teacher {
    id: string;
    first_name: string;
    last_name: string;
    employee_code: string;
    department: string;
    base_salary: number;
    deductions: number;
    bonuses: number;
    net_salary: number;
    payment_status: "pending" | "processing" | "paid";
    last_payment_date?: string;
}

interface PayrollSummary {
    totalEmployees: number;
    totalGrossSalary: number;
    totalDeductions: number;
    totalBonuses: number;
    totalNetSalary: number;
    pendingPayments: number;
    paidThisMonth: number;
}

export default function PayrollPage() {
    const { user } = useAuthStore();
    const [employees, setEmployees] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [selectedEmployee, setSelectedEmployee] = useState<Teacher | null>(null);
    const [showPayrollModal, setShowPayrollModal] = useState(false);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [summary, setSummary] = useState<PayrollSummary>({
        totalEmployees: 0,
        totalGrossSalary: 0,
        totalDeductions: 0,
        totalBonuses: 0,
        totalNetSalary: 0,
        pendingPayments: 0,
        paidThisMonth: 0,
    });

    useEffect(() => {
        fetchPayrollData();
    }, [selectedMonth]);

    const fetchPayrollData = async () => {
        setLoading(true);
        try {
            // Fetch teachers data
            const teachersRes = await apiClient.getTeachers(user?.branch_id);
            const teachers = Array.isArray(teachersRes.data) ? teachersRes.data : [];

            // Transform to payroll data with mock salary info
            const payrollData: Teacher[] = teachers.map((t: any, index: number) => ({
                id: t.id,
                first_name: t.first_name,
                last_name: t.last_name,
                employee_code: t.employee_code || `EMP${String(index + 1).padStart(4, '0')}`,
                department: t.department || "General",
                base_salary: 50000 + Math.floor(Math.random() * 50000),
                deductions: 2000 + Math.floor(Math.random() * 3000),
                bonuses: Math.floor(Math.random() * 10000),
                net_salary: 0,
                payment_status: ["pending", "processing", "paid"][Math.floor(Math.random() * 3)] as any,
                last_payment_date: index % 3 === 0 ? new Date().toISOString() : undefined,
            }));

            // Calculate net salary
            payrollData.forEach(emp => {
                emp.net_salary = emp.base_salary - emp.deductions + emp.bonuses;
            });

            // Calculate summary
            const totalGross = payrollData.reduce((acc, emp) => acc + emp.base_salary, 0);
            const totalDeductions = payrollData.reduce((acc, emp) => acc + emp.deductions, 0);
            const totalBonuses = payrollData.reduce((acc, emp) => acc + emp.bonuses, 0);
            const totalNet = payrollData.reduce((acc, emp) => acc + emp.net_salary, 0);
            const pending = payrollData.filter(emp => emp.payment_status === 'pending').length;
            const paid = payrollData.filter(emp => emp.payment_status === 'paid').length;

            setSummary({
                totalEmployees: payrollData.length,
                totalGrossSalary: totalGross,
                totalDeductions: totalDeductions,
                totalBonuses: totalBonuses,
                totalNetSalary: totalNet,
                pendingPayments: pending,
                paidThisMonth: paid,
            });

            setEmployees(payrollData);
        } catch (error) {
            console.error("Error fetching payroll data:", error);
            toast.error("Failed to load payroll data");
        } finally {
            setLoading(false);
        }
    };

    const handleProcessPayment = async (employeeId: string) => {
        setActionLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            setEmployees(emps =>
                emps.map(emp =>
                    emp.id === employeeId
                        ? { ...emp, payment_status: "paid" as const, last_payment_date: new Date().toISOString() }
                        : emp
                )
            );

            toast.success("Payment processed successfully!");
            setShowPayrollModal(false);
            setSelectedEmployee(null);
        } catch (error) {
            toast.error("Failed to process payment");
        } finally {
            setActionLoading(false);
        }
    };

    const handleGeneratePayroll = async () => {
        setActionLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success("Payroll generated for all employees!");
            setShowGenerateModal(false);
            fetchPayrollData();
        } catch (error) {
            toast.error("Failed to generate payroll");
        } finally {
            setActionLoading(false);
        }
    };

    const handleExportPayroll = () => {
        toast.success("Exporting payroll to Excel... (Feature coming soon)");
    };

    const getStatusBadge = (status: Teacher["payment_status"]) => {
        const styles = {
            pending: "bg-yellow-100 text-yellow-800",
            processing: "bg-blue-100 text-blue-800",
            paid: "bg-green-100 text-green-800",
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const formatCurrency = (amount: number) => {
        return `PKR ${amount.toLocaleString()}`;
    };

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch =
            `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.employee_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.department.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || emp.payment_status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <ProtectedRoute>
            <DashboardLayout title="Payroll Management" sidebarItems={adminSidebarItems}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
                            <p className="text-gray-600">Manage employee salaries and payments</p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleExportPayroll}
                                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                <Download size={18} />
                                <span>Export</span>
                            </button>
                            <button
                                onClick={() => setShowGenerateModal(true)}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                <Calculator size={18} />
                                <span>Generate Payroll</span>
                            </button>
                        </div>
                    </div>

                    {/* Month Selector */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <div className="flex items-center space-x-4">
                            <Calendar size={20} className="text-gray-400" />
                            <label className="text-sm text-gray-600">Payroll Period:</label>
                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Total Employees</p>
                                    <p className="text-3xl font-bold text-gray-900">{summary.totalEmployees}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-blue-500 text-white">
                                    <Users size={24} />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Total Net Payroll</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalNetSalary)}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-green-500 text-white">
                                    <DollarSign size={24} />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Pending Payments</p>
                                    <p className="text-3xl font-bold text-yellow-600">{summary.pendingPayments}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-yellow-500 text-white">
                                    <Clock size={24} />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Paid This Month</p>
                                    <p className="text-3xl font-bold text-green-600">{summary.paidThisMonth}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-purple-500 text-white">
                                    <CheckCircle size={24} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-blue-50 rounded-xl p-6">
                            <p className="text-sm text-blue-600 font-medium">Total Gross Salary</p>
                            <p className="text-2xl font-bold text-blue-800">{formatCurrency(summary.totalGrossSalary)}</p>
                        </div>
                        <div className="bg-red-50 rounded-xl p-6">
                            <p className="text-sm text-red-600 font-medium">Total Deductions</p>
                            <p className="text-2xl font-bold text-red-800">-{formatCurrency(summary.totalDeductions)}</p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-6">
                            <p className="text-sm text-green-600 font-medium">Total Bonuses</p>
                            <p className="text-2xl font-bold text-green-800">+{formatCurrency(summary.totalBonuses)}</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by name, employee code, or department..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                                    <option value="processing">Processing</option>
                                    <option value="paid">Paid</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Employee Payroll Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : filteredEmployees.length === 0 ? (
                            <div className="text-center py-16">
                                <Wallet size={48} className="mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-500">No payroll records found</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Employee</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Department</th>
                                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Base Salary</th>
                                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Deductions</th>
                                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Bonuses</th>
                                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Net Salary</th>
                                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredEmployees.map((emp) => (
                                        <tr key={emp.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                                        {emp.first_name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{emp.first_name} {emp.last_name}</p>
                                                        <p className="text-sm text-gray-500">{emp.employee_code}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{emp.department}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900 text-right">{formatCurrency(emp.base_salary)}</td>
                                            <td className="px-6 py-4 text-sm text-red-600 text-right">-{formatCurrency(emp.deductions)}</td>
                                            <td className="px-6 py-4 text-sm text-green-600 text-right">+{formatCurrency(emp.bonuses)}</td>
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">{formatCurrency(emp.net_salary)}</td>
                                            <td className="px-6 py-4 text-center">{getStatusBadge(emp.payment_status)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedEmployee(emp);
                                                            setShowPayrollModal(true);
                                                        }}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                        title="View Details"
                                                    >
                                                        <FileText size={18} />
                                                    </button>
                                                    {emp.payment_status !== 'paid' && (
                                                        <button
                                                            onClick={() => handleProcessPayment(emp.id)}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                                            title="Process Payment"
                                                        >
                                                            <CheckCircle size={18} />
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

                {/* Salary Slip Modal */}
                <Modal
                    isOpen={showPayrollModal}
                    onClose={() => {
                        setShowPayrollModal(false);
                        setSelectedEmployee(null);
                    }}
                    title="Salary Slip"
                    size="lg"
                >
                    {selectedEmployee && (
                        <div className="space-y-6">
                            {/* Employee Info */}
                            <div className="flex items-center space-x-4 pb-4 border-b">
                                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                                    {selectedEmployee.first_name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        {selectedEmployee.first_name} {selectedEmployee.last_name}
                                    </h3>
                                    <p className="text-gray-500">{selectedEmployee.employee_code} • {selectedEmployee.department}</p>
                                </div>
                            </div>

                            {/* Salary Breakdown */}
                            <div className="space-y-3">
                                <div className="flex justify-between py-2">
                                    <span className="text-gray-600">Base Salary</span>
                                    <span className="font-medium">{formatCurrency(selectedEmployee.base_salary)}</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-gray-600">Bonuses</span>
                                    <span className="font-medium text-green-600">+{formatCurrency(selectedEmployee.bonuses)}</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-gray-600">Deductions</span>
                                    <span className="font-medium text-red-600">-{formatCurrency(selectedEmployee.deductions)}</span>
                                </div>
                                <div className="flex justify-between py-2 border-t pt-4">
                                    <span className="font-semibold text-gray-900">Net Salary</span>
                                    <span className="font-bold text-lg text-gray-900">{formatCurrency(selectedEmployee.net_salary)}</span>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="flex justify-between items-center py-4 bg-gray-50 rounded-lg px-4">
                                <span className="text-gray-600">Payment Status</span>
                                {getStatusBadge(selectedEmployee.payment_status)}
                            </div>

                            {/* Actions */}
                            <div className="flex justify-between pt-4 border-t">
                                <button
                                    onClick={() => toast.success("Printing salary slip...")}
                                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                >
                                    <Printer size={18} />
                                    <span>Print</span>
                                </button>
                                {selectedEmployee.payment_status !== 'paid' && (
                                    <button
                                        onClick={() => handleProcessPayment(selectedEmployee.id)}
                                        disabled={actionLoading}
                                        className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                                    >
                                        {actionLoading ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        ) : (
                                            <CheckCircle size={18} />
                                        )}
                                        <span>Process Payment</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </Modal>

                {/* Generate Payroll Modal */}
                <Modal
                    isOpen={showGenerateModal}
                    onClose={() => setShowGenerateModal(false)}
                    title="Generate Payroll"
                >
                    <div className="space-y-4">
                        <p className="text-gray-600">
                            This will generate payroll for all employees for the selected period: <strong>{selectedMonth}</strong>
                        </p>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-sm text-yellow-800">
                                ⚠️ Make sure all attendance records and deductions are up to date before generating payroll.
                            </p>
                        </div>
                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                onClick={() => setShowGenerateModal(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleGeneratePayroll}
                                disabled={actionLoading}
                                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                            >
                                {actionLoading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                    <Calculator size={18} />
                                )}
                                <span>Generate</span>
                            </button>
                        </div>
                    </div>
                </Modal>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
