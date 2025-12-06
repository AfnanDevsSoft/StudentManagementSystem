"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/lib/apiClient";
import {
    LayoutDashboard,
    Mail,
    Send,
    Inbox,
    Trash2,
    Star,
    Search,
    PenSquare,
    Check,
    Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import { getRoleName } from "@/types";

interface Message {
    id: string;
    sender_id: string;
    sender_name?: string;
    recipient_id: string;
    recipient_name?: string;
    subject: string;
    body: string;
    is_read: boolean;
    created_at: string;
}

export default function MessagingInboxPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

    useEffect(() => {
        if (user?.id) {
            fetchInbox();
        }
    }, [user]);

    const fetchInbox = async () => {
        try {
            setLoading(true);
            const response = await apiClient.getInbox(user!.id);
            setMessages(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching inbox:", error);
            // Use mock data for now
            setMessages([
                {
                    id: "1",
                    sender_id: "admin",
                    sender_name: "Admin User",
                    recipient_id: user!.id,
                    subject: "Welcome to Student Management System",
                    body: "Hello! Welcome to our platform. If you have any questions, feel free to reach out.",
                    is_read: false,
                    created_at: new Date().toISOString(),
                },
                {
                    id: "2",
                    sender_id: "teacher1",
                    sender_name: "John Smith (Teacher)",
                    recipient_id: user!.id,
                    subject: "Course Update: Mathematics",
                    body: "Dear Student, please note that we will have a quiz next week on Chapter 5.",
                    is_read: true,
                    created_at: new Date(Date.now() - 86400000).toISOString(),
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (messageId: string) => {
        try {
            await apiClient.markMessageAsRead(messageId);
            setMessages(messages.map(m =>
                m.id === messageId ? { ...m, is_read: true } : m
            ));
            toast.success("Message marked as read");
        } catch (error) {
            console.error("Error marking message as read:", error);
        }
    };

    const sidebarItems = [
        {
            label: "Dashboard",
            href: `/dashboard/${user?.role ? getRoleName(user.role).toLowerCase() : 'admin'}`,
            icon: <LayoutDashboard size={20} />,
        },
        {
            label: "Inbox",
            href: "/dashboard/messaging/inbox",
            icon: <Inbox size={20} />,
        },
        {
            label: "Sent",
            href: "/dashboard/messaging/sent",
            icon: <Send size={20} />,
        },
        {
            label: "Compose",
            href: "/dashboard/messaging/compose",
            icon: <PenSquare size={20} />,
        },
    ];

    const filteredMessages = messages.filter(
        (msg) =>
            msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            msg.sender_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            msg.body.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const unreadCount = messages.filter((m) => !m.is_read).length;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        if (diff < 86400000) { // Less than 24 hours
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diff < 604800000) { // Less than 7 days
            return date.toLocaleDateString([], { weekday: 'short' });
        }
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    return (
        <ProtectedRoute>
            <DashboardLayout title="Inbox" sidebarItems={sidebarItems}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
                            <p className="text-gray-600">{unreadCount} unread messages</p>
                        </div>
                        <button
                            onClick={() => router.push("/dashboard/messaging/compose")}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <PenSquare size={18} />
                            <span>Compose</span>
                        </button>
                    </div>

                    {/* Search */}
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search messages..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Messages List */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : filteredMessages.length === 0 ? (
                            <div className="text-center py-16">
                                <Mail size={48} className="mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-500">No messages found</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {filteredMessages.map((message) => (
                                    <div
                                        key={message.id}
                                        onClick={() => setSelectedMessage(message)}
                                        className={`p-4 hover:bg-gray-50 cursor-pointer transition ${!message.is_read ? "bg-blue-50" : ""
                                            }`}
                                    >
                                        <div className="flex items-start space-x-4">
                                            <div className="flex-shrink-0">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${!message.is_read ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                                                    }`}>
                                                    {message.sender_name?.charAt(0) || "?"}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className={`text-sm ${!message.is_read ? "font-bold text-gray-900" : "text-gray-700"}`}>
                                                        {message.sender_name || "Unknown Sender"}
                                                    </p>
                                                    <div className="flex items-center space-x-2">
                                                        {!message.is_read && (
                                                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                                        )}
                                                        <span className="text-xs text-gray-500">
                                                            {formatDate(message.created_at)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className={`text-sm ${!message.is_read ? "font-semibold text-gray-900" : "text-gray-800"}`}>
                                                    {message.subject}
                                                </p>
                                                <p className="text-sm text-gray-500 truncate">
                                                    {message.body}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Message Preview Modal */}
                    {selectedMessage && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
                                <div className="p-6 border-b">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">{selectedMessage.subject}</h2>
                                            <p className="text-gray-600 mt-1">From: {selectedMessage.sender_name}</p>
                                            <p className="text-sm text-gray-500">{new Date(selectedMessage.created_at).toLocaleString()}</p>
                                        </div>
                                        <button
                                            onClick={() => setSelectedMessage(null)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                                <div className="p-6 overflow-y-auto" style={{ maxHeight: '400px' }}>
                                    <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.body}</p>
                                </div>
                                <div className="p-4 border-t bg-gray-50 flex justify-between">
                                    <button
                                        onClick={() => {
                                            if (!selectedMessage.is_read) {
                                                handleMarkAsRead(selectedMessage.id);
                                            }
                                            setSelectedMessage(null);
                                        }}
                                        className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition"
                                    >
                                        <Check size={18} />
                                        <span>Mark as Read</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            router.push(`/dashboard/messaging/compose?reply=${selectedMessage.sender_id}&subject=Re: ${selectedMessage.subject}`);
                                        }}
                                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                    >
                                        <Send size={18} />
                                        <span>Reply</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
