"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/apiClient";
import {
    LayoutDashboard,
    ArrowLeft,
    User,
    GraduationCap,
    Calendar,
    DollarSign,
    FileText,
    Mail,
    Phone,
    MapPin,
    Edit2,
    Users,
} from "lucide-react";
import toast from "react-hot-toast";

type TabType = "overview" | "grades" | "attendance" | "fees" | "documents";

export default function StudentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const studentId = params.id as string;

    const [student, setStudent] = useState<any>(null);
    const [grades, setGrades] = useState<any[]>([]);
    const [attendance, setAttendance] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>("overview");

    useEffect(() => {
        if (studentId) {
            fetchStudentData();
        }
    }, [studentId]);

    const fetchStudentData = async () => {
        try {
            setLoading(true);

            const [studentRes, gradesRes, attendanceRes] = await Promise.all([
                apiClient.getStudentById(studentId),
                apiClient.getStudentGrades(studentId),
                apiClient.getStudentAttendance(studentId),
            ]);

            setStudent(studentRes.data);
            setGrades(Array.isArray(gradesRes.data) ? gradesRes.data : []);
            setAttendance(Array.isArray(attendanceRes.data) ? attendanceRes.data : []);
        } catch (error) {
            console.error("Error fetching student data:", error);
            toast.error("Failed to load student details");
        } finally {
            setLoading(false);
        }
    };

    const calculateGPA = () => {
        if (grades.length === 0) return 0;
        const totalPoints = grades.reduce((sum, grade) => {
            const percentage = (grade.score / grade.max_score) * 100;
            return sum + percentage;
        }, 0);
        return (totalPoints / grades.length).toFixed(2);
    };

    const calculateAttendanceRate = () => {
        if (attendance.length === 0) return 0;
        const presentCount = attendance.filter((a) => a.status === "present").length;
        return ((presentCount / attendance.length) * 100).toFixed(1);
    };

    const sidebarItems = [
        {
            label: "Dashboard",
            href: "/dashboard/admin",
            icon: <LayoutDashboard size={20} />,
        },
        {
            label: "Students",
            href: "/dashboard/admin/students",
            icon: <GraduationCap size={20} />,
        },
    ];

    const tabs = [
        { id: "overview", label: "Overview", icon: User },
        { id: "grades", label: "Grades", icon: GraduationCap },
        { id: "attendance", label: "Attendance", icon: Calendar },
        { id: "fees", label: "Fees", icon: DollarSign },
        { id: "documents", label: "Documents", icon: FileText },
    ];

    if (loading) {
        return (
            <ProtectedRoute>
                <DashboardLayout title="Student Details" sidebarItems={sidebarItems}>
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    if (!student) {
        return (
            <ProtectedRoute>
                <DashboardLayout title="Student Details" sidebarItems={sidebarItems}>
                    <div className="text-center p-8">
                        <p className="text-gray-500">Student not found</p>
                        <button
                            onClick={() => router.push("/dashboard/admin/students")}
                            className="mt-4 text-blue-600 hover:underline"
                        >
                            Go back to students list
                        </button>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <DashboardLayout title="Student Details" sidebarItems={sidebarItems}>
                <div className="space-y-6">
                    {/* Back Button */}
                    <button
                        onClick={() => router.push("/dashboard/admin/students")}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition"
                    >
                        <ArrowLeft size={20} />
                        <span>Back to Students</span>
                    </button>

                    {/* Profile Header */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-32"></div>
                        <div className="px-6 pb-6">
                            <div className="flex items-end space-x-6 -mt-16">
                                <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center text-4xl font-bold text-gray-600">
                                    {student.first_name?.charAt(0)}{student.last_name?.charAt(0)}
                                </div>
                                <div className="pb-2 flex-1">
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        {student.first_name} {student.last_name}
                                    </h1>
                                    <p className="text-gray-600 font-mono">{student.student_code}</p>
                                </div>
                                <div className="pb-2">
                                    <span
                                        className={`px-4 py-2 rounded-full text-sm font-semibold ${student.is_active
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                            }`}
                                    >
                                        {student.is_active ? "Active" : "Inactive"}
                                    </span>
                                </div>
                                <button
                                    onClick={() => router.push(`/dashboard/admin/students?edit=${studentId}`)}
                                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    <Edit2 size={16} />
                                    <span>Edit</span>
                                </button>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">GPA</p>
                                    <p className="text-2xl font-bold text-gray-900">{calculateGPA()}%</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Attendance</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {calculateAttendanceRate()}%
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Total Courses</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {grades.length > 0 ? new Set(grades.map((g) => g.course_id)).size : 0}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Enrolled Since</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {new Date(student.admission_date).getFullYear()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="border-b">
                            <div className="flex space-x-8 px-6">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as TabType)}
                                            className={`flex items-center space-x-2 py-4 border-b-2 transition ${activeTab === tab.id
                                                ? "border-blue-600 text-blue-600"
                                                : "border-transparent text-gray-600 hover:text-gray-900"
                                                }`}
                                        >
                                            <Icon size={18} />
                                            <span className="font-medium">{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-6">
                            {/* Overview Tab */}
                            {activeTab === "overview" && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                                Personal Information
                                            </h3>
                                            <div className="space-y-3">
                                                <div className="flex items-center space-x-3 text-gray-700">
                                                    <Mail size={18} className="text-gray-400" />
                                                    <span>{student.personal_email}</span>
                                                </div>
                                                <div className="flex items-center space-x-3 text-gray-700">
                                                    <Phone size={18} className="text-gray-400" />
                                                    <span>{student.personal_phone}</span>
                                                </div>
                                                <div className="flex items-start space-x-3 text-gray-700">
                                                    <MapPin size={18} className="text-gray-400 mt-1" />
                                                    <span>{student.permanent_address}</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 pt-2">
                                                    <div>
                                                        <p className="text-sm text-gray-500">Date of Birth</p>
                                                        <p className="font-medium">{student.date_of_birth}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Gender</p>
                                                        <p className="font-medium capitalize">{student.gender}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Nationality</p>
                                                        <p className="font-medium">{student.nationality}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">City</p>
                                                        <p className="font-medium">{student.city}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                                Academic Information
                                            </h3>
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-sm text-gray-500">Student Code</p>
                                                    <p className="font-medium font-mono">{student.student_code}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Admission Date</p>
                                                    <p className="font-medium">{student.admission_date}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Current Grade Level</p>
                                                    <p className="font-medium">{student.current_grade_level_id}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Admission Status</p>
                                                    <p className="font-medium capitalize">
                                                        {student.admission_status || "Enrolled"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                            <Users size={20} className="text-gray-400" />
                                            <span>Parent/Guardian Information</span>
                                        </h3>
                                        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-500">Father&apos;s Name</p>
                                                    <p className="font-medium">{student.father_name || "Not provided"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Father&apos;s Phone</p>
                                                    <p className="font-medium">{student.father_phone || "Not provided"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Mother&apos;s Name</p>
                                                    <p className="font-medium">{student.mother_name || "Not provided"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Mother&apos;s Phone</p>
                                                    <p className="font-medium">{student.mother_phone || "Not provided"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Guardian Name</p>
                                                    <p className="font-medium">{student.guardian_name || "Not provided"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Guardian Relation</p>
                                                    <p className="font-medium capitalize">{student.guardian_relation || "Not specified"}</p>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <p className="text-sm text-gray-500">Emergency Contact</p>
                                                    <div className="flex items-center space-x-2">
                                                        <Phone size={14} className="text-gray-400" />
                                                        <p className="font-medium">{student.emergency_contact_phone || student.father_phone || student.personal_phone || "Not provided"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Grades Tab */}
                            {activeTab === "grades" && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Grade History
                                    </h3>
                                    {grades.length === 0 ? (
                                        <p className="text-gray-500 text-center py-8">No grades recorded</p>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                                            Course
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                                            Assessment
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                                            Score
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                                            Grade
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                                            Date
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y">
                                                    {grades.map((grade) => {
                                                        const percentage = (grade.score / grade.max_score) * 100;
                                                        return (
                                                            <tr key={grade.id} className="hover:bg-gray-50">
                                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                                    {grade.course_name || "N/A"}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                                    {grade.assessment_name}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                                    {grade.score}/{grade.max_score}
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <span
                                                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${percentage >= 90
                                                                            ? "bg-green-100 text-green-800"
                                                                            : percentage >= 80
                                                                                ? "bg-blue-100 text-blue-800"
                                                                                : percentage >= 70
                                                                                    ? "bg-yellow-100 text-yellow-800"
                                                                                    : "bg-red-100 text-red-800"
                                                                            }`}
                                                                    >
                                                                        {percentage.toFixed(1)}%
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                                    {new Date(grade.grade_date).toLocaleDateString()}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Attendance Tab */}
                            {activeTab === "attendance" && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Attendance Records
                                    </h3>
                                    {attendance.length === 0 ? (
                                        <p className="text-gray-500 text-center py-8">
                                            No attendance records
                                        </p>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                                            Date
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                                            Course
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                                            Status
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                                            Remarks
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y">
                                                    {attendance.map((record) => (
                                                        <tr key={record.id} className="hover:bg-gray-50">
                                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                                {new Date(record.attendance_date).toLocaleDateString()}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                                {record.course_name || "N/A"}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span
                                                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${record.status === "present"
                                                                        ? "bg-green-100 text-green-800"
                                                                        : record.status === "absent"
                                                                            ? "bg-red-100 text-red-800"
                                                                            : record.status === "late"
                                                                                ? "bg-yellow-100 text-yellow-800"
                                                                                : "bg-orange-100 text-orange-800"
                                                                        }`}
                                                                >
                                                                    {record.status.charAt(0).toUpperCase() +
                                                                        record.status.slice(1)}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                                {record.remarks || "-"}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Fees Tab */}
                            {activeTab === "fees" && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Fee Information
                                    </h3>
                                    <p className="text-gray-500 text-center py-8">
                                        Fee information coming soon
                                    </p>
                                </div>
                            )}

                            {/* Documents Tab */}
                            {activeTab === "documents" && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Documents
                                    </h3>
                                    <p className="text-gray-500 text-center py-8">
                                        Document management coming soon
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute >
    );
}
