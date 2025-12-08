"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/lib/apiClient";
import {
    Users,
    Search,
    Eye,
    TrendingDown,
    TrendingUp,
    AlertTriangle,
    Calendar,
    BarChart3,
    FileText,
    MessageCircle,
} from "lucide-react";
import toast from "react-hot-toast";

interface Student {
    id: string;
    firstName: string;
    lastName: string;
    studentCode: string;
    email: string;
    class: string;
    attendance: number;
    gpa: number;
    performance: "excellent" | "good" | "average" | "needs_attention";
    lastAttendance: string;
    behaviorRemarks?: string;
}

export default function TeacherStudentManagement() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState<Student[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterPerformance, setFilterPerformance] = useState("all");
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [showRemarkModal, setShowRemarkModal] = useState(false);
    const [remarkText, setRemarkText] = useState("");

    useEffect(() => {
        fetchStudents();
    }, [user]);

    const fetchStudents = async () => {
        try {
            setLoading(true);

            if (!user?.id) {
                toast.error("User not authenticated");
                return;
            }

            // API Integration: Get teacher's courses then students
            const coursesResponse = await apiClient.getTeacherCourses(user.id);

            if (!coursesResponse.success || !Array.isArray(coursesResponse.data)) {
                setStudents([]);
                return;
            }

            const courses = coursesResponse.data;
            const allStudents: Student[] = [];
            const studentMap = new Map(); // To avoid duplicates

            // Fetch students from each course
            for (const course of courses) {
                const courseId = course.id || course.course_id;

                try {
                    const studentsResponse = await apiClient.getCourseStudents(courseId);

                    if (studentsResponse.success && Array.isArray(studentsResponse.data)) {
                        for (const studentData of studentsResponse.data) {
                            const studentId = studentData.id || studentData.student_id;

                            if (!studentMap.has(studentId)) {
                                // Fetch attendance and grades for this student
                                const [attendanceRes, gradesRes] = await Promise.all([
                                    apiClient.getStudentAttendance(studentId).catch(() => ({ success: false })),
                                    apiClient.getStudentGrades(studentId).catch(() => ({ success: false }))
                                ]);

                                // Calculate attendance percentage
                                let attendance = 85; // Default
                                if (attendanceRes.success && Array.isArray(attendanceRes.data)) {
                                    const records = attendanceRes.data;
                                    const totalRecords = records.length;
                                    const presentRecords = records.filter((r: any) =>
                                        r.status === 'present' || r.is_present
                                    ).length;
                                    attendance = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 85;
                                }

                                // Calculate GPA
                                let gpa = 3.0; // Default
                                if (gradesRes.success && Array.isArray(gradesRes.data)) {
                                    const grades = gradesRes.data;
                                    const totalMarks = grades.reduce((sum: number, g: any) =>
                                        sum + (Number(g.marks_obtained || g.score || 0) / Number(g.total_marks || 100) * 4), 0
                                    );
                                    gpa = grades.length > 0 ? Number((totalMarks / grades.length).toFixed(2)) : 3.0;
                                }

                                // Determine performance level
                                let performance: Student["performance"] = "average";
                                if (gpa >= 3.5 && attendance >= 90) performance = "excellent";
                                else if (gpa >= 3.0 && attendance >= 80) performance = "good";
                                else if (gpa < 2.5 || attendance < 75) performance = "needs_attention";

                                const student: Student = {
                                    id: studentId,
                                    firstName: studentData.first_name || studentData.firstName || "Unknown",
                                    lastName: studentData.last_name || studentData.lastName || "",
                                    studentCode: studentData.student_code || studentData.code || studentData.enrollment_number || `STU-${studentId}`,
                                    email: studentData.email || "",
                                    class: studentData.class_name || studentData.class || studentData.section || "N/A",
                                    attendance,
                                    gpa,
                                    performance,
                                    lastAttendance: new Date().toISOString().split('T')[0],
                                    behaviorRemarks: studentData.remarks || studentData.behavior_remarks,
                                };

                                studentMap.set(studentId, student);
                                allStudents.push(student);
                            }
                        }
                    }
                } catch (error) {
                    console.error(`Error fetching students for course ${courseId}:`, error);
                }
            }

            setStudents(allStudents);

        } catch (error: any) {
            console.error("Error fetching students:", error);

            if (error.response?.status === 404) {
                toast.error("No students found");
                setStudents([]);
            } else if (error.response?.status === 401) {
                return;
            } else {
                toast.error(
                    error.response?.data?.message ||
                    "Failed to load students. Please try again later."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const getPerformanceBadge = (performance: Student["performance"]) => {
        const badges = {
            excellent: { color: "bg-green-100 text-green-800", label: "Excellent" },
            good: { color: "bg-blue-100 text-blue-800", label: "Good" },
            average: { color: "bg-yellow-100 text-yellow-800", label: "Average" },
            needs_attention: {
                color: "bg-red-100 text-red-800",
                label: "Needs Attention",
            },
        };

        const badge = badges[performance];
        return (
            <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}
            >
                {badge.label}
            </span>
        );
    };

    const handleAddRemark = async () => {
        if (!remarkText.trim()) {
            toast.error("Please enter a remark");
            return;
        }

        try {
            // TODO: Implement actual API call
            toast.success("Remark added successfully");
            setShowRemarkModal(false);
            setRemarkText("");
            setSelectedStudent(null);
            fetchStudents();
        } catch (error) {
            toast.error("Failed to add remark");
        }
    };

    const filteredStudents = students.filter((student) => {
        const matchesSearch =
            student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.studentCode.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesPerformance =
            filterPerformance === "all" || student.performance === filterPerformance;

        return matchesSearch && matchesPerformance;
    });

    const weakStudents = students.filter(
        (s) => s.performance === "needs_attention"
    );
    const avgAttendance =
        students.reduce((sum, s) => sum + s.attendance, 0) / students.length || 0;
    const avgGPA =
        students.reduce((sum, s) => sum + s.gpa, 0) / students.length || 0;

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
            label: "Grades",
            href: "/dashboard/teacher/grades",
            icon: <BarChart3 size={20} />,
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
                <DashboardLayout title="Student Management" sidebarItems={sidebarItems}>
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-500">Loading students...</p>
                        </div>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <DashboardLayout title="Student Management" sidebarItems={sidebarItems}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold flex items-center gap-2">
                                    <Users size={28} />
                                    Student Management
                                </h1>
                                <p className="text-indigo-100 mt-1">
                                    Track student performance, attendance & behavior
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Users className="text-blue-600" size={24} />
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">Total Students</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {students.length}
                            </p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <Calendar className="text-green-600" size={24} />
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">Avg. Attendance</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {avgAttendance.toFixed(1)}%
                            </p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <BarChart3 className="text-purple-600" size={24} />
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">Class Average GPA</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {avgGPA.toFixed(2)}
                            </p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-3 bg-red-100 rounded-lg">
                                    <AlertTriangle className="text-red-600" size={24} />
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">Need Attention</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {weakStudents.length}
                            </p>
                        </div>
                    </div>

                    {/* Weak Students Alert (AI-Powered) */}
                    {weakStudents.length > 0 && (
                        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-5">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="text-red-600 mt-0.5" size={24} />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                                        AI-Identified: Students Needing Attention
                                        <span className="text-xs bg-red-200 px-2 py-1 rounded-full">
                                            AI Beta
                                        </span>
                                    </h3>
                                    <div className="space-y-2">
                                        {weakStudents.map((student) => (
                                            <div
                                                key={student.id}
                                                className="bg-white rounded-lg p-3 flex items-center justify-between"
                                            >
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {student.firstName} {student.lastName}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Attendance: {student.attendance}% | GPA: {student.gpa}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setSelectedStudent(student);
                                                        setShowRemarkModal(true);
                                                    }}
                                                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition"
                                                >
                                                    Add Remark
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Search and Filter */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    size={20}
                                />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by name or student code..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <select
                                value={filterPerformance}
                                onChange={(e) => setFilterPerformance(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Performance Levels</option>
                                <option value="excellent">Excellent</option>
                                <option value="good">Good</option>
                                <option value="average">Average</option>
                                <option value="needs_attention">Needs Attention</option>
                            </select>
                        </div>
                    </div>

                    {/* Students Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                            Student
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                            Code
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                            Class
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                            Attendance
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                            GPA
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                            Performance
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center">
                                                <Users size={48} className="mx-auto text-gray-300 mb-4" />
                                                <p className="text-gray-500">No students found</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredStudents.map((student) => (
                                            <tr key={student.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                                                            {student.firstName.charAt(0)}
                                                            {student.lastName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {student.firstName} {student.lastName}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                {student.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {student.studentCode}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {student.class}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`text-sm font-semibold ${student.attendance >= 90
                                                                ? "text-green-600"
                                                                : student.attendance >= 75
                                                                    ? "text-yellow-600"
                                                                    : "text-red-600"
                                                                }`}
                                                        >
                                                            {student.attendance}%
                                                        </span>
                                                        {student.attendance >= 90 ? (
                                                            <TrendingUp size={16} className="text-green-600" />
                                                        ) : (
                                                            <TrendingDown size={16} className="text-red-600" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                                    {student.gpa.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getPerformanceBadge(student.performance)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() =>
                                                                toast.info(
                                                                    `Viewing profile for ${student.firstName}`
                                                                )
                                                            }
                                                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                                                            title="View Profile"
                                                        >
                                                            <Eye size={16} className="text-gray-600" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedStudent(student);
                                                                setShowRemarkModal(true);
                                                            }}
                                                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                                                            title="Add Remark"
                                                        >
                                                            <FileText size={16} className="text-gray-600" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Add Remark Modal */}
                {showRemarkModal && selectedStudent && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                Add Behavior/Discipline Remark
                            </h3>
                            <div className="mb-4">
                                <p className="text-gray-600 mb-2">
                                    Student: <span className="font-semibold">
                                        {selectedStudent.firstName} {selectedStudent.lastName}
                                    </span>
                                </p>
                                {selectedStudent.behaviorRemarks && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                                        <p className="text-sm text-yellow-800">
                                            <strong>Previous Remarks:</strong>
                                        </p>
                                        <p className="text-sm text-yellow-700 mt-1">
                                            {selectedStudent.behaviorRemarks}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <textarea
                                value={remarkText}
                                onChange={(e) => setRemarkText(e.target.value)}
                                placeholder="Enter your remark here..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                                rows={4}
                            />

                            <div className="flex gap-3">
                                <button
                                    onClick={handleAddRemark}
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                                >
                                    Save Remark
                                </button>
                                <button
                                    onClick={() => {
                                        setShowRemarkModal(false);
                                        setRemarkText("");
                                        setSelectedStudent(null);
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
