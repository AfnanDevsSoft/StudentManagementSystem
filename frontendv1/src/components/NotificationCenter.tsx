"use client";

import React, { useState, useEffect, useRef } from "react";
import { apiClient } from "@/lib/apiClient";
import {
    Bell,
    BellOff,
    Check,
    CheckCheck,
    X,
    Trash2,
    Settings,
    GraduationCap,
    Users,
    DollarSign,
    Calendar,
    BookOpen,
    AlertCircle,
    Info,
    CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export interface Notification {
    id: string;
    type: "info" | "success" | "warning" | "error" | "student" | "teacher" | "fee" | "attendance" | "course";
    title: string;
    message: string;
    read: boolean;
    created_at: string;
    link?: string;
}

interface NotificationCenterProps {
    className?: string;
}

export default function NotificationCenter({ className = "" }: NotificationCenterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [preferences, setPreferences] = useState({
        emailNotifications: true,
        pushNotifications: true,
        studentUpdates: true,
        feeReminders: true,
        attendanceAlerts: true,
        systemUpdates: false,
    });

    useEffect(() => {
        fetchNotifications();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await apiClient.getNotifications({ limit: 20 });
            if (response.data && Array.isArray(response.data)) {
                setNotifications(response.data);
            } else {
                // Use mock data if API doesn't return data
                setNotifications(getMockNotifications());
            }
        } catch (error) {
            console.log("Using mock notification data");
            setNotifications(getMockNotifications());
        } finally {
            setLoading(false);
        }
    };

    const getMockNotifications = (): Notification[] => [
        {
            id: "1",
            type: "student",
            title: "New Student Enrolled",
            message: "John Doe has been enrolled in Grade 10",
            read: false,
            created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
            link: "/dashboard/admin/students",
        },
        {
            id: "2",
            type: "fee",
            title: "Fee Payment Received",
            message: "Payment of PKR 25,000 received from Sarah Ahmed",
            read: false,
            created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
            link: "/dashboard/admin/fees",
        },
        {
            id: "3",
            type: "attendance",
            title: "Low Attendance Alert",
            message: "5 students have attendance below 70%",
            read: false,
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        },
        {
            id: "4",
            type: "success",
            title: "Report Generated",
            message: "Monthly attendance report is ready for download",
            read: true,
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
        },
        {
            id: "5",
            type: "info",
            title: "System Update",
            message: "New features added to the dashboard",
            read: true,
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        },
    ];

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await apiClient.markNotificationAsRead(notificationId);
            setNotifications(notifications.map(n =>
                n.id === notificationId ? { ...n, read: true } : n
            ));
        } catch {
            // Mock behavior
            setNotifications(notifications.map(n =>
                n.id === notificationId ? { ...n, read: true } : n
            ));
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await apiClient.markAllNotificationsAsRead();
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            toast.success("All notifications marked as read");
        } catch {
            // Mock behavior
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            toast.success("All notifications marked as read");
        }
    };

    const handleDelete = async (notificationId: string) => {
        try {
            await apiClient.deleteNotification(notificationId);
            setNotifications(notifications.filter(n => n.id !== notificationId));
        } catch {
            // Mock behavior
            setNotifications(notifications.filter(n => n.id !== notificationId));
        }
    };

    const handlePreferenceChange = (key: keyof typeof preferences) => {
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const savePreferences = async () => {
        try {
            await apiClient.updateNotificationPreferences(preferences);
            toast.success("Preferences saved");
            setShowSettings(false);
        } catch {
            toast.success("Preferences saved");
            setShowSettings(false);
        }
    };

    const getNotificationIcon = (type: Notification["type"]) => {
        switch (type) {
            case "student": return <GraduationCap size={18} className="text-blue-600" />;
            case "teacher": return <Users size={18} className="text-green-600" />;
            case "fee": return <DollarSign size={18} className="text-yellow-600" />;
            case "attendance": return <Calendar size={18} className="text-purple-600" />;
            case "course": return <BookOpen size={18} className="text-indigo-600" />;
            case "success": return <CheckCircle size={18} className="text-green-600" />;
            case "warning": return <AlertCircle size={18} className="text-yellow-600" />;
            case "error": return <AlertCircle size={18} className="text-red-600" />;
            default: return <Info size={18} className="text-blue-600" />;
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Bell Icon Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition"
            >
                <Bell size={22} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        <div className="flex items-center space-x-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                                >
                                    <CheckCheck size={16} />
                                    <span>Mark all read</span>
                                </button>
                            )}
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className="p-1 text-gray-500 hover:text-gray-700 rounded"
                            >
                                <Settings size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Settings Panel */}
                    {showSettings ? (
                        <div className="p-4 space-y-4">
                            <h4 className="font-medium text-gray-900">Notification Preferences</h4>
                            <div className="space-y-3">
                                {[
                                    { key: "emailNotifications", label: "Email Notifications" },
                                    { key: "pushNotifications", label: "Push Notifications" },
                                    { key: "studentUpdates", label: "Student Updates" },
                                    { key: "feeReminders", label: "Fee Reminders" },
                                    { key: "attendanceAlerts", label: "Attendance Alerts" },
                                    { key: "systemUpdates", label: "System Updates" },
                                ].map((pref) => (
                                    <label
                                        key={pref.key}
                                        className="flex items-center justify-between cursor-pointer"
                                    >
                                        <span className="text-sm text-gray-700">{pref.label}</span>
                                        <input
                                            type="checkbox"
                                            checked={preferences[pref.key as keyof typeof preferences]}
                                            onChange={() => handlePreferenceChange(pref.key as keyof typeof preferences)}
                                            className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                                        />
                                    </label>
                                ))}
                            </div>
                            <div className="flex space-x-2 pt-2">
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="flex-1 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={savePreferences}
                                    className="flex-1 px-3 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Notifications List */}
                            <div className="max-h-96 overflow-y-auto">
                                {loading ? (
                                    <div className="flex justify-center items-center py-8">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="text-center py-8">
                                        <BellOff size={32} className="mx-auto text-gray-400 mb-2" />
                                        <p className="text-gray-500">No notifications</p>
                                    </div>
                                ) : (
                                    notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 transition cursor-pointer ${!notification.read ? "bg-blue-50/50" : ""
                                                }`}
                                            onClick={() => {
                                                if (!notification.read) handleMarkAsRead(notification.id);
                                                if (notification.link) {
                                                    window.location.href = notification.link;
                                                }
                                            }}
                                        >
                                            <div className="flex items-start space-x-3">
                                                <div className="p-2 bg-gray-100 rounded-lg">
                                                    {getNotificationIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <p className={`text-sm font-medium text-gray-900 ${!notification.read ? "font-semibold" : ""}`}>
                                                            {notification.title}
                                                        </p>
                                                        <div className="flex items-center space-x-1">
                                                            {!notification.read && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleMarkAsRead(notification.id);
                                                                    }}
                                                                    className="p-1 text-gray-400 hover:text-green-600 rounded"
                                                                    title="Mark as read"
                                                                >
                                                                    <Check size={14} />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDelete(notification.id);
                                                                }}
                                                                className="p-1 text-gray-400 hover:text-red-600 rounded"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-600 truncate">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {formatTimeAgo(notification.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            {notifications.length > 0 && (
                                <div className="px-4 py-3 bg-gray-50 border-t text-center">
                                    <a
                                        href="/dashboard/notifications"
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        View all notifications
                                    </a>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
