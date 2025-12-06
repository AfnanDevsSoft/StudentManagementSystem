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
    BookOpen,
    Calendar,
    DollarSign,
    Mail,
    Phone,
    MapPin,
    Briefcase,
} from "lucide-react";
import toast from "react-hot-toast";

type TabType = "overview" | "courses" | "attendance" | "performance";

export default function TeacherDetailPage() {
    const params = useParams();
    const router = useRouter();
    const teacherId = params.id as string;

    const [teacher, setTeacher] = useState<any>(null);
    const [courses, setCourses] = useState<any[]>([]);
    const [attendance, setAttendance] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>("overview");

    useEffect(() => {
        if (teacherId) {
            fetchTeacherData();
        }
    }, [teacherId]);

    const fetchTeacherData = async () => {
        try {
            setLoading(true);

            const [teacherRes, coursesRes, attendanceRes] = await Promise.all([
                apiClient.getTeacherById(teacherId),
                apiClient.get(`/teachers/${teacherId}/courses`).catch(() => ({ data: [] })),
                apiClient.get(`/teachers/${teacherId}/attendance`).catch(() => ({ data: [] })),
            ]);

            setTeacher(teacherRes.data);
            setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);
            setAttendance(Array.isArray(attendanceRes.data) ? attendanceRes.data : []);
        } catch (error) {
            console.error("Error fetching teacher data:", error);
            toast.error("Failed to load teacher details");
        } finally {
            setLoading(false);
        }
    };

    const calculateAttendanceRate = () => {
        if (attendance.length === 0) return 0;
        const presentCount = attendance.filter((a) => a.status === "present" || a.status === "P").length;
        return ((presentCount / attendance.length) * 100).toFixed(1);
    };

    const sidebarItems = [
        {
            label: "Dashboard",
            href: "/dashboard/admin",
            icon: <LayoutDashboard size={20} />,
        },
        {
            label: "Teachers",
            href: "/dashboard/admin/teachers",
            icon: <User size={20} />,
        },
    ];

    const tabs = [
        { id: "overview", label: "Overview", icon: User },
        { id: "courses", label: "Courses", icon: BookOpen },
        { id: "attendance", label: "Attendance", icon: Calendar },
        { id: "performance", label: "Performance", icon: Briefcase },
    ];

    if (loading) {
        return (
            <ProtectedRoute>
                <DashboardLayout title="Teacher Details" sidebarItems={sidebarItems}>
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    if (!teacher) {
        return (
            <ProtectedRoute>
                <DashboardLayout title="Teacher Details" sidebarItems={sidebarItems}>
                    <div className="text-center p-8">
                        <p className="text-gray-500">Teacher not found</p>
                        <button
                            onClick={() => router.push("/dashboard/admin/teachers")}
                            className="mt-4 text-blue-600 hover:underline"
                        >
                            Go back to teachers list
                        </button>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <DashboardLayout title="Teacher Details" sidebarItems={sidebarItems}>
                <div className="space-y-6">
                    {/* Back Button */}
                    <button
                        onClick={() => router.push("/dashboard/admin/teachers")}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition"
                    >
                        <ArrowLeft size={20} />
                        <span>Back to Teachers</span>
                    </button>

                    {/* Profile Header */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-800 h-32"></div>
                        <div className="px-6 pb-6">
                            <div className="flex items-end space-x-6 -mt-16">
                                <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center text-4xl font-bold text-gray-600">
                                    {teacher.first_name?.charAt(0)}{teacher.last_name?.charAt(0)}
                                </div>
                                <div className="pb-2 flex-1">
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        {teacher.first_name} {teacher.last_name}
                                    </h1>
                                    <p className="text-gray-600">{teacher.designation || "Teacher"}</p>
                                    <p className="text-gray-500 font-mono text-sm">{teacher.employee_code}</p>
                                </div>
                                <div className="pb-2">
                                    <span
                                        className={`px-4 py-2 rounded-full text-sm font-semibold ${teacher.employment_status === "active" || teacher.is_active
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                            }`}
                                    >
                                        {teacher.employment_status === "active" || teacher.is_active ? "Active" : "Inactive"}
                                    </span>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Department</p>
                                    <p className="text-2xl font-bold text-gray-900">{teacher.department || "N/A"}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Experience</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {teacher.years_of_experience || 0} years
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Courses</p>
                                    <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Attendance</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {calculateAttendanceRate()}%
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
                                                    ? "border-indigo-600 text-indigo-600"
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
                                                    <span>{teacher.email}</span>
                                                </div>
                                                <div className="flex items-center space-x-3 text-gray-700">
                                                    <Phone size={18} className="text-gray-400" />
                                                    <span>{teacher.phone}</span>
                                                </div>
                                                <div className="flex items-start space-x-3 text-gray-700">
                                                    <MapPin size={18} className="text-gray-400 mt-1" />
                                                    <span>{teacher.personal_address || "N/A"}</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 pt-2">
                                                    <div>
                                                        <p className="text-sm text-gray-500">Date of Birth</p>
                                                        <p className="font-medium">{teacher.date_of_birth || "N/A"}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Gender</p>
                                                        <p className="font-medium capitalize">{teacher.gender || "N/A"}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Nationality</p>
                                                        <p className="font-medium">{teacher.nationality || "N/A"}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">CNIC</p>
                                                        <p className="font-medium font-mono">{teacher.cnic || "N/A"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                                Employment Information
                                            </h3>
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-sm text-gray-500">Employee Code</p>
                                                    <p className="font-medium font-mono">{teacher.employee_code}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Hire Date</p>
                                                    <p className="font-medium">{teacher.hire_date || "N/A"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Department</p>
                                                    <p className="font-medium">{teacher.department || "N/A"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Designation</p>
                                                    <p className="font-medium">{teacher.designation || "N/A"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Qualification</p>
                                                    <p className="font-medium">{teacher.qualification_level || "N/A"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Employment Type</p>
                                                    <p className="font-medium capitalize">
                                                        {teacher.employment_type || "Full-time"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Courses Tab */}
                            {activeTab === "courses" && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Assigned Courses
                                    </h3>
                                    {courses.length === 0 ? (
                                        <p className="text-gray-500 text-center py-8">No courses assigned</p>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {courses.map((course) => (
                                                <div
                                                    key={course.id}
                                                    className="border rounded-lg p-4 hover:shadow-md transition"
                                                >
                                                    <h4 className="font-semibold text-gray-900">{course.course_name}</h4>
                                                    <p className="text-sm text-gray-600 font-mono">{course.course_code}</p>
                                                    <div className="mt-2 text-sm text-gray-600">
                                                        <p>Students: {course.enrolled_students || 0}/{course.max_students || "N/A"}</p>
                                                        <p>Room: {course.room_number || "TBA"}</p>
                                                    </div>
                                                </div>
                                            ))}
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
                                    <p className="text-gray-500 text-center py-8">
                                        Attendance tracking coming soon
                                    </p>
                                </div>
                            )}

                            {/* Performance Tab */}
                            {activeTab === "performance" && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Performance Metrics
                                    </h3>
                                    <p className="text-gray-500 text-center py-8">
                                        Performance metrics coming soon
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
