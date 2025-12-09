"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/lib/apiClient";
import { Bell, Plus, X, Calendar, User } from "lucide-react";
import toast from "react-hot-toast";

interface Announcement {
    id: string;
    title: string;
    content: string;
    author: string;
    role: string;
    created_at: string;
    priority: "high" | "medium" | "low";
    target_audience?: string;
}

export default function AnnouncementsPage() {
    const { user } = useAuthStore();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        priority: "medium" as "high" | "medium" | "low",
        target_audience: "all",
    });

    const isAdmin = user?.role === "superadmin" || user?.role === "admin";
    const isTeacher = user?.role === "teacher";

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const response = await apiClient.getAnnouncements();

            if (response.success && Array.isArray(response.data)) {
                setAnnouncements(response.data);
            } else {
                // Mock announcements if API not available
                const mockAnnouncements: Announcement[] = [
                    {
                        id: "1",
                        title: "Mid-term Exams Schedule Released",
                        content: "Mid-term examinations will begin from March 1st, 2025. Please check your timetable for details.",
                        author: "Admin Office",
                        role: "admin",
                        created_at: new Date().toISOString(),
                        priority: "high",
                        target_audience: "all",
                    },
                    {
                        id: "2",
                        title: "Sports Day - Save the Date",
                        content: "Annual Sports Day will be held on March 15th, 2025. Stay tuned for more details!",
                        author: "Activities Committee",
                        role: "admin",
                        created_at: new Date(Date.now() - 86400000).toISOString(),
                        priority: "medium",
                        target_audience: "students",
                    },
                ];
                setAnnouncements(mockAnnouncements);
            }
        } catch (error) {
            console.error("Error fetching announcements:", error);
            toast.error("Failed to load announcements");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAnnouncement = async () => {
        if (!formData.title || !formData.content) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            const response = await apiClient.createAnnouncement({
                title: formData.title,
                content: formData.content,
                priority: formData.priority,
                target_audience: formData.target_audience,
                author_id: user?.id,
            });

            if (response.success) {
                toast.success("Announcement created successfully!");
                setShowCreateModal(false);
                setFormData({
                    title: "",
                    content: "",
                    priority: "medium",
                    target_audience: "all",
                });
                fetchAnnouncements();
            } else {
                toast.error(response.message || "Failed to create announcement");
            }
        } catch (error: any) {
            console.error("Error creating announcement:", error);

            // If API not available, add mock announcement
            if (error.response?.status === 404) {
                const newAnnouncement: Announcement = {
                    id: Date.now().toString(),
                    ...formData,
                    author: user?.name || user?.username || "Unknown",
                    role: user?.role || "admin",
                    created_at: new Date().toISOString(),
                };
                setAnnouncements([newAnnouncement, ...announcements]);
                toast.success("Announcement created (mock mode)");
                setShowCreateModal(false);
                setFormData({
                    title: "",
                    content: "",
                    priority: "medium",
                    target_audience: "all",
                });
            } else {
                toast.error(error.response?.data?.message || "Failed to create announcement");
            }
        }
    };

    const sidebarItems = [
        {
            label: "Dashboard",
            href: `/dashboard/${user?.role}`,
            icon: null,
        },
        {
            label: "Announcements",
            href: "/dashboard/announcements",
            icon: <Bell size={20} />,
        },
    ];

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high":
                return "bg-red-100 text-red-800 border-red-300";
            case "medium":
                return "bg-yellow-100 text-yellow-800 border-yellow-300";
            case "low":
                return "bg-blue-100 text-blue-800 border-blue-300";
            default:
                return "bg-gray-100 text-gray-800 border-gray-300";
        }
    };

    return (
        <ProtectedRoute>
            <DashboardLayout title="Announcements" sidebarItems={sidebarItems}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
                            <p className="text-gray-600 mt-1">
                                Stay updated with the latest news and updates
                            </p>
                        </div>
                        {(isAdmin || isTeacher) && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                <Plus size={20} />
                                <span>New Announcement</span>
                            </button>
                        )}
                    </div>

                    {/* Announcements List */}
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                        </div>
                    ) : announcements.length === 0 ? (
                        <div className="bg-white rounded-lg shadow p-12 text-center">
                            <Bell size={48} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600">No announcements yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {announcements.map((announcement) => (
                                <div
                                    key={announcement.id}
                                    className="bg-white rounded-lg shadow hover:shadow-md transition p-6"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <h2 className="text-xl font-semibold text-gray-900">
                                                    {announcement.title}
                                                </h2>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(announcement.priority)}`}
                                                >
                                                    {announcement.priority.toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                                                {announcement.content}
                                            </p>
                                            <div className="flex items-center space-x-6 text-sm text-gray-500">
                                                <div className="flex items-center space-x-2">
                                                    <User size={16} />
                                                    <span>{announcement.author}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Calendar size={16} />
                                                    <span>
                                                        {new Date(announcement.created_at).toLocaleDateString("en-US", {
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric",
                                                        })}
                                                    </span>
                                                </div>
                                                {announcement.target_audience && (
                                                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                                                        {announcement.target_audience}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Create Announcement Modal */}
                    {showCreateModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Create New Announcement
                                    </h2>
                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="text-gray-500 hover:text-gray-700 transition"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Title *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) =>
                                                setFormData({ ...formData, title: e.target.value })
                                            }
                                            placeholder="Enter announcement title"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Content *
                                        </label>
                                        <textarea
                                            value={formData.content}
                                            onChange={(e) =>
                                                setFormData({ ...formData, content: e.target.value })
                                            }
                                            placeholder="Enter announcement details"
                                            rows={6}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Priority
                                            </label>
                                            <select
                                                value={formData.priority}
                                                onChange={(e: any) =>
                                                    setFormData({ ...formData, priority: e.target.value })
                                                }
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Target Audience
                                            </label>
                                            <select
                                                value={formData.target_audience}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        target_audience: e.target.value,
                                                    })
                                                }
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="all">All</option>
                                                <option value="students">Students Only</option>
                                                <option value="teachers">Teachers Only</option>
                                                <option value="parents">Parents Only</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-3 mt-6">
                                        <button
                                            onClick={() => setShowCreateModal(false)}
                                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleCreateAnnouncement}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                        >
                                            Create Announcement
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
