"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import CourseContentTab from "@/components/CourseContentTab";
import { apiClient } from "@/lib/apiClient";
import { adminSidebarItems } from "@/config/sidebarConfig";
import {
    ArrowLeft,
    BookOpen,
    Users,
    Calendar,
    FileText,
} from "lucide-react";
import toast from "react-hot-toast";

type TabType = "overview" | "students" | "content" | "announcements";

export default function CourseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as string;

    const [course, setCourse] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>("overview");

    useEffect(() => {
        if (courseId) {
            fetchCourseData();
        }
    }, [courseId]);

    const fetchCourseData = async () => {
        try {
            setLoading(true);

            // Fetch course details - using proper API method
            const courseRes = await apiClient.getCourseById(courseId);
            setCourse(courseRes.data);

            // Try to fetch enrollments, but don't fail if not available
            try {
                const enrollmentsRes = await apiClient.get(`/courses/${courseId}/enrollments`);
                setStudents(Array.isArray(enrollmentsRes.data) ? enrollmentsRes.data : []);
            } catch (err) {
                console.log("Enrollments endpoint not available yet");
                setStudents([]);
            }
        } catch (error: any) {
            console.error("Error fetching course data:", error);
            toast.error(error.response?.data?.message || "Failed to load course details");
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: "overview", label: "Overview", icon: BookOpen },
        { id: "students", label: "Enrolled Students", icon: Users },
        { id: "content", label: "Course Content", icon: FileText },
        { id: "announcements", label: "Announcements", icon: Calendar },
    ];

    if (loading) {
        return (
            <ProtectedRoute>
                <DashboardLayout title="Course Details" sidebarItems={adminSidebarItems}>
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    if (!course) {
        return (
            <ProtectedRoute>
                <DashboardLayout title="Course Details" sidebarItems={adminSidebarItems}>
                    <div className="text-center p-8">
                        <p className="text-gray-500">Course not found</p>
                        <button
                            onClick={() => router.push("/dashboard/admin/courses")}
                            className="mt-4 text-blue-600 hover:underline"
                        >
                            Go back to courses list
                        </button>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <DashboardLayout title="Course Details" sidebarItems={adminSidebarItems}>
                <div className="space-y-6">
                    {/* Back Button */}
                    <button
                        onClick={() => router.push("/dashboard/admin/courses")}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition"
                    >
                        <ArrowLeft size={20} />
                        <span>Back to Courses</span>
                    </button>

                    {/* Course Header */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="bg-gradient-to-r from-green-600 to-teal-700 h-32"></div>
                        <div className="px-6 pb-6">
                            <div className="flex items-end space-x-6 -mt-16">
                                <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center">
                                    <BookOpen size={48} className="text-gray-600" />
                                </div>
                                <div className="pb-2 flex-1">
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        {course.course_name}
                                    </h1>
                                    <p className="text-gray-600 font-mono">{course.course_code}</p>
                                    <p className="text-gray-500 mt-1">{course.description || "No description"}</p>
                                </div>
                                <div className="pb-2">
                                    <span className="px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                                        Active
                                    </span>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Enrolled Students</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {course.enrolled_students || students.length}/{course.max_students || "∞"}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Instructor</p>
                                    <p className="text-lg font-bold text-gray-900">{course.teacher_name || "TBA"}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Grade Level</p>
                                    <p className="text-2xl font-bold text-gray-900">{course.grade_level || "N/A"}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Room</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {course.room_number || "TBA"}
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
                                                ? "border-green-600 text-green-600"
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
                                                Course Information
                                            </h3>
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-sm text-gray-500">Course Code</p>
                                                    <p className="font-medium font-mono">{course.course_code}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Course Name</p>
                                                    <p className="font-medium">{course.course_name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Description</p>
                                                    <p className="font-medium">{course.description || "No description provided"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Grade Level</p>
                                                    <p className="font-medium">{course.grade_level || "N/A"}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                                Schedule & Location
                                            </h3>
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-sm text-gray-500">Room Number</p>
                                                    <p className="font-medium">{course.room_number || "To be assigned"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Building</p>
                                                    <p className="font-medium">{course.building || "Main Building"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Instructor</p>
                                                    <p className="font-medium">{course.teacher_name || "To be assigned"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Max Students</p>
                                                    <p className="font-medium">{course.max_students || "Unlimited"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Students Tab */}
                            {activeTab === "students" && (
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Enrolled Students ({students.length})
                                        </h3>
                                    </div>
                                    {students.length === 0 ? (
                                        <div className="text-center py-12">
                                            <Users size={48} className="mx-auto text-gray-400 mb-4" />
                                            <p className="text-gray-500">No students enrolled yet</p>
                                            <p className="text-sm text-gray-400 mt-2">Students will appear here once they enroll in this course</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                                            Student Code
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                                            Name
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                                            Email
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                                            Status
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y">
                                                    {students.map((enrollment) => {
                                                        const student = enrollment.student || enrollment;
                                                        return (
                                                            <tr key={enrollment.id || student.id} className="hover:bg-gray-50">
                                                                <td className="px-4 py-3 text-sm font-mono text-gray-900">
                                                                    {student.student_code}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                                    {student.first_name} {student.last_name}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                                    {student.personal_email || "N/A"}
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                                                        {enrollment.status || "Active"}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <button
                                                                        onClick={() => router.push(`/dashboard/admin/students/${student.id}`)}
                                                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                                    >
                                                                        View Profile
                                                                    </button>
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

                            {/* Content Tab */}
                            {activeTab === "content" && (
                                <CourseContentTab courseId={courseId} />
                            )}

                            {/* Announcements Tab */}
                            {activeTab === "announcements" && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Course Announcements
                                    </h3>
                                    <div className="text-center py-12">
                                        <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                                        <p className="text-gray-500">Announcements feature coming soon</p>
                                        <p className="text-sm text-gray-400 mt-2">Post important updates and announcements for students</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
