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
    PenSquare,
    Search,
    Check,
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

export default function MessagingSentPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

    useEffect(() => {
        if (user?.id) {
            fetchSentMessages();
        }
    }, [user]);

    const fetchSentMessages = async () => {
        try {
            setLoading(true);
            const response = await apiClient.getSentMessages(user!.id);
            setMessages(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching sent messages:", error);
            // Mock data
            setMessages([
                {
                    id: "1",
                    sender_id: user!.id,
                    sender_name: `${user?.first_name} ${user?.last_name}`,
                    recipient_id: "teacher1",
                    recipient_name: "John Smith",
                    subject: "Question about Assignment",
                    body: "Hello Professor, I had a question about the assignment deadline...",
                    is_read: true,
                    created_at: new Date().toISOString(),
                },
            ]);
        } finally {
            setLoading(false);
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
            msg.recipient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            msg.body.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        if (diff < 86400000) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diff < 604800000) {
            return date.toLocaleDateString([], { weekday: 'short' });
        }
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    return (
        <ProtectedRoute>
            <DashboardLayout title="Sent Messages" sidebarItems={sidebarItems}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Sent Messages</h1>
                            <p className="text-gray-600">{messages.length} messages sent</p>
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
                                placeholder="Search sent messages..."
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
                                <Send size={48} className="mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-500">No sent messages</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {filteredMessages.map((message) => (
                                    <div
                                        key={message.id}
                                        onClick={() => setSelectedMessage(message)}
                                        className="p-4 hover:bg-gray-50 cursor-pointer transition"
                                    >
                                        <div className="flex items-start space-x-4">
                                            <div className="flex-shrink-0">
                                                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                                    <Send size={18} />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm text-gray-700">
                                                        To: {message.recipient_name || "Unknown"}
                                                    </p>
                                                    <div className="flex items-center space-x-2">
                                                        {message.is_read && (
                                                            <Check size={14} className="text-green-600" />
                                                        )}
                                                        <span className="text-xs text-gray-500">
                                                            {formatDate(message.created_at)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-900 font-medium">
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
                                            <p className="text-gray-600 mt-1">To: {selectedMessage.recipient_name}</p>
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
                                <div className="p-4 border-t bg-gray-50 flex justify-end">
                                    <button
                                        onClick={() => setSelectedMessage(null)}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
                                    >
                                        Close
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
