"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/lib/apiClient";
import { adminSidebarItems } from "@/config/sidebarConfig";
import {
    FileText,
    Download,
    Calendar,
    Users,
    GraduationCap,
    DollarSign,
    BarChart3,
    PieChart,
    TrendingUp,
    Filter,
    Printer,
} from "lucide-react";
import toast from "react-hot-toast";

interface ReportConfig {
    id: string;
    title: string;
    description: string;
    icon: any;
    color: string;
    category: "academic" | "financial" | "administrative";
}

export default function ReportsPage() {
    const { user } = useAuthStore();
    const [selectedReport, setSelectedReport] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState({ start: "", end: "" });
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState<any>(null);

    const reports: ReportConfig[] = [
        {
            id: "student-enrollment",
            title: "Student Enrollment Report",
            description: "Overview of student enrollment statistics by grade and status",
            icon: GraduationCap,
            color: "bg-blue-500",
            category: "academic",
        },
        {
            id: "attendance-summary",
            title: "Attendance Summary Report",
            description: "Daily, weekly, and monthly attendance statistics",
            icon: Calendar,
            color: "bg-green-500",
            category: "academic",
        },
        {
            id: "grade-distribution",
            title: "Grade Distribution Report",
            description: "Academic performance analysis across courses",
            icon: BarChart3,
            color: "bg-purple-500",
            category: "academic",
        },
        {
            id: "teacher-performance",
            title: "Teacher Performance Report",
            description: "Teacher workload and performance metrics",
            icon: Users,
            color: "bg-orange-500",
            category: "administrative",
        },
        {
            id: "fee-collection",
            title: "Fee Collection Report",
            description: "Revenue, pending dues, and payment history",
            icon: DollarSign,
            color: "bg-yellow-500",
            category: "financial",
        },
        {
            id: "course-analytics",
            title: "Course Analytics Report",
            description: "Course enrollment and completion rates",
            icon: PieChart,
            color: "bg-indigo-500",
            category: "academic",
        },
    ];

    const generateReport = async (reportId: string) => {
        setLoading(true);
        setSelectedReport(reportId);

        try {
            // Fetch relevant data based on report type
            let data: any = {};

            switch (reportId) {
                case "student-enrollment":
                    const studentsRes = await apiClient.getStudents(user?.branch_id);
                    const students = Array.isArray(studentsRes.data) ? studentsRes.data : [];
                    data = {
                        total: students.length,
                        active: students.filter((s: any) => s.is_active).length,
                        inactive: students.filter((s: any) => !s.is_active).length,
                        byStatus: {
                            enrolled: students.filter((s: any) => s.admission_status === 'enrolled').length,
                            pending: students.filter((s: any) => s.admission_status === 'pending').length,
                            approved: students.filter((s: any) => s.admission_status === 'approved').length,
                        },
                        recentEnrollments: students.slice(0, 10),
                    };
                    break;

                case "teacher-performance":
                    const teachersRes = await apiClient.getTeachers(user?.branch_id);
                    const teachers = Array.isArray(teachersRes.data) ? teachersRes.data : [];
                    data = {
                        total: teachers.length,
                        active: teachers.filter((t: any) => t.is_active !== false).length,
                        byDepartment: teachers.reduce((acc: any, t: any) => {
                            const dept = t.department || 'Unassigned';
                            acc[dept] = (acc[dept] || 0) + 1;
                            return acc;
                        }, {}),
                        teachersList: teachers.slice(0, 10),
                    };
                    break;

                case "course-analytics":
                    const coursesRes = await apiClient.getCourses(user?.branch_id);
                    const courses = Array.isArray(coursesRes.data) ? coursesRes.data : [];
                    data = {
                        total: courses.length,
                        courses: courses.slice(0, 10),
                    };
                    break;

                default:
                    data = { message: "Report data will be available soon" };
            }

            setReportData(data);
            toast.success("Report generated successfully");
        } catch (error) {
            console.error("Error generating report:", error);
            toast.error("Failed to generate report");
            setReportData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = (format: "pdf" | "excel") => {
        toast.success(`Exporting as ${format.toUpperCase()}... (Feature coming soon)`);
    };

    const handlePrint = () => {
        window.print();
    };

    const ReportCard = ({ report }: { report: ReportConfig }) => {
        const Icon = report.icon;
        return (
            <div
                onClick={() => generateReport(report.id)}
                className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md cursor-pointer transition-all duration-200 ${selectedReport === report.id ? 'ring-2 ring-blue-500' : ''
                    }`}
            >
                <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl ${report.color} text-white`}>
                        <Icon size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{report.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                        <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${report.category === 'academic' ? 'bg-blue-100 text-blue-700' :
                                report.category === 'financial' ? 'bg-green-100 text-green-700' :
                                    'bg-purple-100 text-purple-700'
                            }`}>
                            {report.category.charAt(0).toUpperCase() + report.category.slice(1)}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <ProtectedRoute>
            <DashboardLayout title="Reports" sidebarItems={adminSidebarItems}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Reports Center</h1>
                            <p className="text-gray-600">Generate and export comprehensive reports</p>
                        </div>
                        {reportData && (
                            <div className="flex space-x-3">
                                <button
                                    onClick={handlePrint}
                                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                >
                                    <Printer size={18} />
                                    <span>Print</span>
                                </button>
                                <button
                                    onClick={() => handleExport("excel")}
                                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                >
                                    <Download size={18} />
                                    <span>Excel</span>
                                </button>
                                <button
                                    onClick={() => handleExport("pdf")}
                                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    <FileText size={18} />
                                    <span>PDF</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Date Range Filter */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <div className="flex items-center space-x-4">
                            <Filter size={20} className="text-gray-400" />
                            <div className="flex items-center space-x-2">
                                <label className="text-sm text-gray-600">From:</label>
                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <label className="text-sm text-gray-600">To:</label>
                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Report Categories */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reports.map((report) => (
                            <ReportCard key={report.id} report={report} />
                        ))}
                    </div>

                    {/* Report Results */}
                    {loading ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
                            <div className="flex flex-col items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                <p className="mt-4 text-gray-500">Generating report...</p>
                            </div>
                        </div>
                    ) : reportData && selectedReport ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 print:shadow-none">
                            <div className="border-b pb-4 mb-6">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {reports.find(r => r.id === selectedReport)?.title}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Generated on {new Date().toLocaleString()}
                                </p>
                            </div>

                            {selectedReport === "student-enrollment" && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                                            <p className="text-3xl font-bold text-blue-700">{reportData.total}</p>
                                            <p className="text-sm text-blue-600">Total Students</p>
                                        </div>
                                        <div className="bg-green-50 rounded-lg p-4 text-center">
                                            <p className="text-3xl font-bold text-green-700">{reportData.active}</p>
                                            <p className="text-sm text-green-600">Active</p>
                                        </div>
                                        <div className="bg-yellow-50 rounded-lg p-4 text-center">
                                            <p className="text-3xl font-bold text-yellow-700">{reportData.inactive}</p>
                                            <p className="text-sm text-yellow-600">Inactive</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-3">By Admission Status</h3>
                                        <div className="grid grid-cols-3 gap-4">
                                            {Object.entries(reportData.byStatus || {}).map(([status, count]) => (
                                                <div key={status} className="bg-gray-50 rounded-lg p-3">
                                                    <p className="text-lg font-semibold text-gray-900">{count as number}</p>
                                                    <p className="text-sm text-gray-600 capitalize">{status}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {reportData.recentEnrollments?.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-3">Recent Enrollments</h3>
                                            <table className="w-full">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Code</th>
                                                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Name</th>
                                                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y">
                                                    {reportData.recentEnrollments.map((student: any) => (
                                                        <tr key={student.id}>
                                                            <td className="px-4 py-2 text-sm font-mono">{student.student_code}</td>
                                                            <td className="px-4 py-2 text-sm">{student.first_name} {student.last_name}</td>
                                                            <td className="px-4 py-2 text-sm">
                                                                <span className={`px-2 py-1 rounded-full text-xs ${student.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                                                    }`}>
                                                                    {student.is_active ? 'Active' : 'Inactive'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {selectedReport === "teacher-performance" && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-green-50 rounded-lg p-4 text-center">
                                            <p className="text-3xl font-bold text-green-700">{reportData.total}</p>
                                            <p className="text-sm text-green-600">Total Teachers</p>
                                        </div>
                                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                                            <p className="text-3xl font-bold text-blue-700">{reportData.active}</p>
                                            <p className="text-sm text-blue-600">Active</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-3">By Department</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {Object.entries(reportData.byDepartment || {}).map(([dept, count]) => (
                                                <div key={dept} className="bg-gray-50 rounded-lg p-3">
                                                    <p className="text-lg font-semibold text-gray-900">{count as number}</p>
                                                    <p className="text-sm text-gray-600">{dept}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedReport === "course-analytics" && (
                                <div className="space-y-6">
                                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                                        <p className="text-3xl font-bold text-purple-700">{reportData.total}</p>
                                        <p className="text-sm text-purple-600">Total Courses</p>
                                    </div>

                                    {reportData.courses?.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-3">Courses List</h3>
                                            <table className="w-full">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Code</th>
                                                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Name</th>
                                                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Teacher</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y">
                                                    {reportData.courses.map((course: any) => (
                                                        <tr key={course.id}>
                                                            <td className="px-4 py-2 text-sm font-mono">{course.course_code}</td>
                                                            <td className="px-4 py-2 text-sm">{course.course_name}</td>
                                                            <td className="px-4 py-2 text-sm">{course.teacher_name || 'TBA'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {!["student-enrollment", "teacher-performance", "course-analytics"].includes(selectedReport) && (
                                <div className="text-center py-8 text-gray-500">
                                    <TrendingUp size={48} className="mx-auto mb-4 text-gray-400" />
                                    <p>Report visualization coming soon</p>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
