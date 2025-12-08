"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/lib/apiClient";
import {
    BookOpen,
    FileText,
    Video,
    Download,
    Eye,
    Calendar,
    Filter,
    Search,
    PlayCircle,
    File,
} from "lucide-react";
import toast from "react-hot-toast";

interface LearningMaterial {
    id: string;
    title: string;
    description: string;
    type: "note" | "video" | "document" | "book";
    subject: string;
    uploadedBy: string;
    uploadDate: string;
    fileSize?: string;
    duration?: string;
    fileUrl?: string;
    thumbnailUrl?: string;
}

export default function StudentLearningMaterials() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [materials, setMaterials] = useState<LearningMaterial[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [filterSubject, setFilterSubject] = useState("all");
    const [selectedVideo, setSelectedVideo] = useState<LearningMaterial | null>(null);

    useEffect(() => {
        fetchMaterials();
    }, [user]);

    const fetchMaterials = async () => {
        try {
            setLoading(true);

            if (!user?.id) {
                toast.error("User not authenticated");
                return;
            }

            // API Integration: Fetch materials from all enrolled courses
            const enrollmentResponse = await apiClient.getStudentEnrollment(user.id);

            if (!enrollmentResponse.success || !Array.isArray(enrollmentResponse.data)) {
                setMaterials([]);
                return;
            }

            const courses = enrollmentResponse.data;
            const allMaterials: LearningMaterial[] = [];

            // Fetch course content for each enrolled course
            for (const courseData of courses) {
                const courseId = courseData.course_id || courseData.id;

                try {
                    // Fetch different types of materials
                    const contentResponse = await apiClient.getCourseContent(courseId, {
                        type: ['note', 'video', 'document', 'book']
                    });

                    if (contentResponse.success && Array.isArray(contentResponse.data)) {
                        const courseMaterials = contentResponse.data.map((item: any) => {
                            // Determine type from backend
                            let materialType: LearningMaterial["type"] = "document";
                            const typeValue = (item.type || item.content_type || "").toLowerCase();
                            if (typeValue.includes('note')) materialType = "note";
                            else if (typeValue.includes('video')) materialType = "video";
                            else if (typeValue.includes('book')) materialType = "book";
                            else if (typeValue.includes('document') || typeValue.includes('pdf')) materialType = "document";

                            return {
                                id: item.id || item.content_id,
                                title: item.title || item.name,
                                description: item.description || item.content || "",
                                type: materialType,
                                subject: courseData.course_name || courseData.name || "General",
                                uploadedBy: item.uploaded_by_name || item.created_by_name || item.teacher_name || "Teacher",
                                uploadDate: item.created_at || item.upload_date || new Date().toISOString(),
                                fileSize: item.file_size || item.size,
                                duration: item.duration || item.video_duration,
                                fileUrl: item.file_url || item.url || item.download_url,
                                thumbnailUrl: item.thumbnail_url || item.thumbnail,
                            };
                        });
                        allMaterials.push(...courseMaterials);
                    }
                } catch (error) {
                    console.error(`Error fetching materials for course ${courseId}:`, error);
                    // Continue with other courses
                }
            }

            // Sort by upload date (newest first)
            allMaterials.sort((a, b) =>
                new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
            );

            setMaterials(allMaterials);

        } catch (error: any) {
            console.error("Error fetching materials:", error);

            if (error.response?.status === 404) {
                toast.error("No learning materials found");
                setMaterials([]);
            } else if (error.response?.status === 401) {
                return;
            } else {
                toast.error(
                    error.response?.data?.message ||
                    "Failed to load learning materials. Please try again later."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const getTypeIcon = (type: LearningMaterial["type"]) => {
        switch (type) {
            case "note":
                return <FileText className="text-blue-600" size={20} />;
            case "video":
                return <Video className="text-red-600" size={20} />;
            case "document":
                return <File className="text-green-600" size={20} />;
            case "book":
                return <BookOpen className="text-purple-600" size={20} />;
        }
    };

    const getTypeBadge = (type: LearningMaterial["type"]) => {
        const badges = {
            note: { color: "bg-blue-100 text-blue-800", label: "Notes" },
            video: { color: "bg-red-100 text-red-800", label: "Video" },
            document: { color: "bg-green-100 text-green-800", label: "Document" },
            book: { color: "bg-purple-100 text-purple-800", label: "Book" },
        };

        const badge = badges[type];
        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                {badge.label}
            </span>
        );
    };

    const handleDownload = async (material: LearningMaterial) => {
        try {
            if (!material.id) {
                toast.error("Invalid material");
                return;
            }

            // API Integration: Download course content
            toast.loading(`Preparing download for ${material.title}...`);

            const response: any = await apiClient.downloadCourseContent(material.id);
            const blob = response instanceof Blob ? response : new Blob([response]);

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = material.title || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.dismiss();
            toast.success(`Downloaded: ${material.title}`);
        } catch (error: any) {
            toast.dismiss();
            console.error("Error downloading material:", error);
            toast.error(
                error.response?.data?.message ||
                "Failed to download. Please try again."
            );
        }
    };

    const handlePlayVideo = (material: LearningMaterial) => {
        setSelectedVideo(material);
    };

    const filteredMaterials = materials.filter((material) => {
        const matchesSearch =
            material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            material.description.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = filterType === "all" || material.type === filterType;
        const matchesSubject = filterSubject === "all" || material.subject === filterSubject;

        return matchesSearch && matchesType && matchesSubject;
    });

    const subjects = Array.from(new Set(materials.map((m) => m.subject)));
    const stats = {
        total: materials.length,
        notes: materials.filter((m) => m.type === "note").length,
        videos: materials.filter((m) => m.type === "video").length,
        documents: materials.filter((m) => m.type === "document").length,
    };

    const sidebarItems = [
        {
            label: "Dashboard",
            href: "/dashboard/student",
            icon: <BookOpen size={20} />,
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
            label: "Learning Materials",
            href: "/dashboard/student/learning-materials",
            icon: <BookOpen size={20} />,
        },
        {
            label: "Fees",
            href: "/dashboard/student/fees",
            icon: <FileText size={20} />,
        },
    ];

    if (loading) {
        return (
            <ProtectedRoute>
                <DashboardLayout title="Learning Materials" sidebarItems={sidebarItems}>
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-500">Loading materials...</p>
                        </div>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <DashboardLayout title="Learning Materials" sidebarItems={sidebarItems}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold flex items-center gap-2">
                                    <BookOpen size={28} />
                                    Learning Materials
                                </h1>
                                <p className="text-purple-100 mt-1">
                                    Access class notes, videos, documents & study materials
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Materials</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                                <BookOpen className="text-gray-400" size={32} />
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Notes</p>
                                    <p className="text-2xl font-bold text-blue-600">{stats.notes}</p>
                                </div>
                                <FileText className="text-blue-400" size={32} />
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Videos</p>
                                    <p className="text-2xl font-bold text-red-600">{stats.videos}</p>
                                </div>
                                <Video className="text-red-400" size={32} />
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Documents</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.documents}</p>
                                </div>
                                <File className="text-green-400" size={32} />
                            </div>
                        </div>
                    </div>

                    {/* Search and Filters */}
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
                                    placeholder="Search materials..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="all">All Types</option>
                                <option value="note">Notes</option>
                                <option value="video">Videos</option>
                                <option value="document">Documents</option>
                                <option value="book">Books</option>
                            </select>
                            <select
                                value={filterSubject}
                                onChange={(e) => setFilterSubject(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="all">All Subjects</option>
                                {subjects.map((subject) => (
                                    <option key={subject} value={subject}>
                                        {subject}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Materials Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMaterials.length === 0 ? (
                            <div className="col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                                <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500">No materials found</p>
                            </div>
                        ) : (
                            filteredMaterials.map((material) => (
                                <div
                                    key={material.id}
                                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition"
                                >
                                    {material.type === "video" ? (
                                        <div className="relative h-48 bg-gray-900 flex items-center justify-center cursor-pointer"
                                            onClick={() => handlePlayVideo(material)}
                                        >
                                            <PlayCircle className="text-white opacity-80 hover:opacity-100 transition" size={64} />
                                            <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                                                {material.duration}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-48 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                                            {getTypeIcon(material.type)}
                                            <div className="ml-2 text-4xl font-bold text-gray-300">
                                                {material.type === "book" ? "📚" : "📄"}
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-semibold text-gray-900 line-clamp-1">
                                                {material.title}
                                            </h3>
                                            {getTypeBadge(material.type)}
                                        </div>

                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                            {material.description}
                                        </p>

                                        <div className="space-y-2 text-xs text-gray-500 mb-4">
                                            <div className="flex items-center justify-between">
                                                <span>Subject: <span className="font-medium text-gray-700">{material.subject}</span></span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span>By: {material.uploadedBy}</span>
                                                {material.fileSize && <span>{material.fileSize}</span>}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar size={12} />
                                                {new Date(material.uploadDate).toLocaleDateString()}
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            {material.type === "video" ? (
                                                <button
                                                    onClick={() => handlePlayVideo(material)}
                                                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                                                >
                                                    <PlayCircle size={16} />
                                                    Watch
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleDownload(material)}
                                                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                                                >
                                                    <Download size={16} />
                                                    Download
                                                </button>
                                            )}
                                            <button
                                                onClick={() => toast.success("Preview feature coming soon")}
                                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Video Player Modal */}
                {selectedVideo && (
                    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden">
                            <div className="bg-gray-900 aspect-video flex items-center justify-center">
                                <div className="text-center text-white p-8">
                                    <PlayCircle size={64} className="mx-auto mb-4 opacity-50" />
                                    <p className="text-lg mb-2">Video Player</p>
                                    <p className="text-sm text-gray-400">
                                        Video streaming feature requires integration with CDN/Video platform
                                    </p>
                                    <p className="text-sm text-gray-500 mt-4">
                                        Playing: {selectedVideo.title}
                                    </p>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {selectedVideo.title}
                                </h3>
                                <p className="text-gray-600 mb-4">{selectedVideo.description}</p>
                                <div className="flex items-center justify-between text-sm text-gray-500">
                                    <span>Duration: {selectedVideo.duration}</span>
                                    <span>Uploaded by: {selectedVideo.uploadedBy}</span>
                                </div>
                                <button
                                    onClick={() => setSelectedVideo(null)}
                                    className="mt-4 w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        </ProtectedRoute>
    );
}
