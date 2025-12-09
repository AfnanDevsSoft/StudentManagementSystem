"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/lib/apiClient";
import {
    LayoutDashboard,
    Upload,
    FileText,
    Video,
    Book,
    Plus,
    X,
    Download,
    Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ContentManagementPage() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState<any[]>([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedType, setSelectedType] = useState<"note" | "video" | "document" | "assignment" | "quiz">("note");
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [contentData, setContentData] = useState({
        title: "",
        description: "",
        url: "",
    });
    const [existingContent, setExistingContent] = useState<any[]>([]);

    useEffect(() => {
        fetchTeacherCourses();
    }, [user]);

    useEffect(() => {
        if (selectedCourse) {
            fetchCourseContent();
        }
    }, [selectedCourse]);

    const fetchTeacherCourses = async () => {
        if (!user?.id) return;
        try {
            setLoading(true);
            const response = await apiClient.getTeacherCourses(user.id);
            if (response.success && Array.isArray(response.data)) {
                setCourses(response.data);
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
            toast.error("Failed to load courses");
        } finally {
            setLoading(false);
        }
    };

    const fetchCourseContent = async () => {
        try {
            const response = await apiClient.getCourseContent(selectedCourse);
            if (response.success && Array.isArray(response.data)) {
                setExistingContent(response.data);
            }
        } catch (error) {
            console.error("Error fetching content:", error);
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setUploadFile(file);
        }
    };

    const handleUploadContent = async () => {
        if (!selectedCourse) {
            toast.error("Please select a course");
            return;
        }

        if (!contentData.title) {
            toast.error("Please enter a title");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("title", contentData.title);
            formData.append("description", contentData.description);
            formData.append("content_type", selectedType);

            if (uploadFile) {
                formData.append("file", uploadFile);
            } else if (contentData.url) {
                formData.append("url", contentData.url);
            } else {
                toast.error("Please select a file or enter a URL");
                return;
            }

            const response = await apiClient.uploadCourseContent(selectedCourse, formData);

            if (response.success) {
                toast.success("Content uploaded successfully!");
                // Reset form
                setContentData({ title: "", description: "", url: "" });
                setUploadFile(null);
                // Refresh content list
                fetchCourseContent();
            } else {
                toast.error(response.message || "Failed to upload content");
            }
        } catch (error: any) {
            console.error("Error uploading content:", error);
            toast.error(error.response?.data?.message || "Failed to upload content");
        }
    };

    const handleDeleteContent = async (contentId: string) => {
        if (!confirm("Are you sure you want to delete this content?")) return;

        try {
            const response = await apiClient.deleteCourseContent(contentId);
            if (response.success) {
                toast.success("Content deleted successfully");
                fetchCourseContent();
            } else {
                toast.error("Failed to delete content");
            }
        } catch (error) {
            console.error("Error deleting content:", error);
            toast.error("Failed to delete content");
        }
    };

    const sidebarItems = [
        {
            label: "Dashboard",
            href: "/dashboard/teacher",
            icon: <LayoutDashboard size={20} />,
        },
        {
            label: "Content Management",
            href: "/dashboard/teacher/content",
            icon: <FileText size={20} />,
        },
        {
            label: "Attendance",
            href: "/dashboard/teacher/attendance",
            icon: <LayoutDashboard size={20} />,
        },
    ];

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "video":
                return <Video size={20} className="text-red-600" />;
            case "document":
            case "note":
                return <FileText size={20} className="text-blue-600" />;
            case "assignment":
                return <Upload size={20} className="text-green-600" />;
            default:
                return <Book size={20} className="text-purple-600" />;
        }
    };

    return (
        <ProtectedRoute>
            <DashboardLayout title="Content Management" sidebarItems={sidebarItems}>
                <div className="space-y-6">
                    {/* Upload Content Section */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">
                                Upload New Content
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Course *
                                </label>
                                <select
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Choose a course...</option>
                                    {courses.map((course) => (
                                        <option key={course.id} value={course.id}>
                                            {course.course_name} ({course.course_code})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Content Type *
                                </label>
                                <select
                                    value={selectedType}
                                    onChange={(e: any) => setSelectedType(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="note">Note / Document</option>
                                    <option value="video">Video Lecture</option>
                                    <option value="document">Study Material</option>
                                    <option value="assignment">Assignment</option>
                                    <option value="quiz">Quiz / Test</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={contentData.title}
                                    onChange={(e) =>
                                        setContentData({ ...contentData, title: e.target.value })
                                    }
                                    placeholder="Enter content title"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={contentData.description}
                                    onChange={(e) =>
                                        setContentData({
                                            ...contentData,
                                            description: e.target.value,
                                        })
                                    }
                                    placeholder="Enter description or instructions"
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload File
                                </label>
                                <input
                                    type="file"
                                    onChange={handleFileSelect}
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mp3,.jpg,.png"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {uploadFile && (
                                    <p className="text-sm text-gray-600 mt-2">
                                        Selected: {uploadFile.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Or Enter URL (for videos/links)
                                </label>
                                <input
                                    type="url"
                                    value={contentData.url}
                                    onChange={(e) =>
                                        setContentData({ ...contentData, url: e.target.value })
                                    }
                                    placeholder="https://example.com/video"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleUploadContent}
                            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition w-full md:w-auto justify-center"
                        >
                            <Upload size={20} />
                            <span>Upload Content</span>
                        </button>
                    </div>

                    {/* Existing Content */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">
                            Uploaded Content
                        </h2>

                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : existingContent.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No content uploaded yet. Select a course and upload your first content!
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {existingContent.map((content) => (
                                    <div
                                        key={content.id}
                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center space-x-3">
                                                {getTypeIcon(content.content_type || content.type)}
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 text-sm">
                                                        {content.title}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {content.content_type || content.type}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteContent(content.id)}
                                                className="text-red-600 hover:text-red-700 transition"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        {content.description && (
                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                {content.description}
                                            </p>
                                        )}
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>
                                                {new Date(content.uploaded_at || content.createdAt).toLocaleDateString()}
                                            </span>
                                            {content.file_url && (
                                                <a
                                                    href={content.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                                                >
                                                    <Download size={14} />
                                                    <span>View</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
