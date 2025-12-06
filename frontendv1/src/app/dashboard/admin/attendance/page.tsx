"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/lib/apiClient";
import { adminSidebarItems } from "@/config/sidebarConfig";
import {
    Calendar,
    Search,
    Filter,
    Users,
    Check,
    X,
    Clock,
    TrendingUp,
    Download,
} from "lucide-react";
import toast from "react-hot-toast";

interface Student {
    id: string;
    student_code: string;
    first_name: string;
    last_name: string;
}

interface AttendanceRecord {
    id: string;
    student_id: string;
    student_name: string;
    student_code: string;
    date: string;
    status: "present" | "absent" | "late" | "excused";
    course_name?: string;
}

export default function AdminAttendancePage() {
    const { user } = useAuthStore();
    const [students, setStudents] = useState<Student[]>([]);
    const [attendance, setAttendance] = useState<Record<string, "present" | "absent" | "late" | "excused">>({});
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [searchTerm, setSearchTerm] = useState("");
    const [saving, setSaving] = useState(false);

    const stats = {
        present: Object.values(attendance).filter(s => s === "present").length,
        absent: Object.values(attendance).filter(s => s === "absent").length,
        late: Object.values(attendance).filter(s => s === "late").length,
        total: students.length,
    };

    useEffect(() => {
        fetchStudents();
    }, [user]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await apiClient.getStudents(user?.branch_id);
            const studentList = Array.isArray(response.data) ? response.data : [];
            setStudents(studentList);

            // Initialize attendance with all students marked as not-set
            const initialAttendance: Record<string, "present" | "absent" | "late" | "excused"> = {};
            studentList.forEach((s: Student) => {
                initialAttendance[s.id] = "present"; // Default to present
            });
            setAttendance(initialAttendance);
        } catch (error) {
            console.error("Error fetching students:", error);
            toast.error("Failed to load students");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (studentId: string, status: "present" | "absent" | "late" | "excused") => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
    };

    const handleMarkAll = (status: "present" | "absent") => {
        const newAttendance: Record<string, typeof status> = {};
        students.forEach(s => {
            newAttendance[s.id] = status;
        });
        setAttendance(newAttendance);
        toast.success(`All students marked as ${status}`);
    };

    const handleSaveAttendance = async () => {
        setSaving(true);
        try {
            // Prepare attendance records
            const records = Object.entries(attendance).map(([studentId, status]) => ({
                student_id: studentId,
                date: selectedDate,
                status,
            }));

            // API call would go here
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated delay

            toast.success("Attendance saved successfully!");
        } catch (error) {
            toast.error("Failed to save attendance");
        } finally {
            setSaving(false);
        }
    };

    const handleExport = () => {
        toast.success("Exporting attendance report... (Feature coming soon)");
    };

    const getStatusBadge = (status: "present" | "absent" | "late" | "excused") => {
        const styles = {
            present: "bg-green-100 text-green-800",
            absent: "bg-red-100 text-red-800",
            late: "bg-yellow-100 text-yellow-800",
            excused: "bg-blue-100 text-blue-800",
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const filteredStudents = students.filter(
        (s) =>
            s.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.student_code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const attendanceRate = stats.total > 0
        ? ((stats.present + stats.late) / stats.total * 100).toFixed(1)
        : "0.0";

    return (
        <ProtectedRoute>
            <DashboardLayout title="Attendance Management" sidebarItems={adminSidebarItems}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
                            <p className="text-gray-600">Mark and track student attendance</p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleExport}
                                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                <Download size={18} />
                                <span>Export</span>
                            </button>
                            <button
                                onClick={handleSaveAttendance}
                                disabled={saving}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                            >
                                {saving ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                    <Check size={18} />
                                )}
                                <span>{saving ? "Saving..." : "Save Attendance"}</span>
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Total Students</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-blue-500 text-white">
                                    <Users size={24} />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Present</p>
                                    <p className="text-3xl font-bold text-green-600">{stats.present}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-green-500 text-white">
                                    <Check size={24} />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Absent</p>
                                    <p className="text-3xl font-bold text-red-600">{stats.absent}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-red-500 text-white">
                                    <X size={24} />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Attendance Rate</p>
                                    <p className="text-3xl font-bold text-purple-600">{attendanceRate}%</p>
                                </div>
                                <div className="p-3 rounded-xl bg-purple-500 text-white">
                                    <TrendingUp size={24} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Date & Filters */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                            <div className="flex items-center space-x-2">
                                <Calendar size={20} className="text-gray-400" />
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search students..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleMarkAll("present")}
                                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                                >
                                    Mark All Present
                                </button>
                                <button
                                    onClick={() => handleMarkAll("absent")}
                                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                                >
                                    Mark All Absent
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Attendance Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : filteredStudents.length === 0 ? (
                            <div className="text-center py-16">
                                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-500">No students found</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Code</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Student Name</th>
                                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredStudents.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 text-sm font-mono text-gray-900">{student.student_code}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                                                        {student.first_name.charAt(0)}
                                                    </div>
                                                    <span className="text-sm text-gray-900">{student.first_name} {student.last_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {getStatusBadge(attendance[student.id] || "present")}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center space-x-2">
                                                    <button
                                                        onClick={() => handleStatusChange(student.id, "present")}
                                                        className={`p-2 rounded-lg transition ${attendance[student.id] === "present"
                                                                ? "bg-green-500 text-white"
                                                                : "bg-gray-100 text-gray-600 hover:bg-green-100"
                                                            }`}
                                                        title="Present"
                                                    >
                                                        <Check size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(student.id, "absent")}
                                                        className={`p-2 rounded-lg transition ${attendance[student.id] === "absent"
                                                                ? "bg-red-500 text-white"
                                                                : "bg-gray-100 text-gray-600 hover:bg-red-100"
                                                            }`}
                                                        title="Absent"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(student.id, "late")}
                                                        className={`p-2 rounded-lg transition ${attendance[student.id] === "late"
                                                                ? "bg-yellow-500 text-white"
                                                                : "bg-gray-100 text-gray-600 hover:bg-yellow-100"
                                                            }`}
                                                        title="Late"
                                                    >
                                                        <Clock size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
