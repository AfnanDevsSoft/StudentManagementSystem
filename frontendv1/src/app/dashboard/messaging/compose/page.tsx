"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
    User,
    Users,
} from "lucide-react";
import toast from "react-hot-toast";
import { getRoleName } from "@/types";

interface Recipient {
    id: string;
    name: string;
    email: string;
    role: string;
}

export default function ComposeMessagePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuthStore();

    const [recipients, setRecipients] = useState<Recipient[]>([]);
    const [selectedRecipient, setSelectedRecipient] = useState("");
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [sending, setSending] = useState(false);
    const [recipientSearch, setRecipientSearch] = useState("");

    useEffect(() => {
        // Pre-fill reply data if coming from reply button
        const replyTo = searchParams.get("reply");
        const replySubject = searchParams.get("subject");

        if (replyTo) {
            setSelectedRecipient(replyTo);
        }
        if (replySubject) {
            setSubject(replySubject);
        }

        fetchRecipients();
    }, [searchParams]);

    const fetchRecipients = async () => {
        try {
            // Fetch teachers and admins as potential recipients
            const [teachersRes, usersRes] = await Promise.all([
                apiClient.getTeachers().catch(() => ({ data: [] })),
                apiClient.getUsers().catch(() => ({ data: [] })),
            ]);

            const teachersList: Recipient[] = ((teachersRes.data as any[]) || []).map((t: any) => ({
                id: t.id,
                name: `${t.first_name} ${t.last_name}`,
                email: t.email || "N/A",
                role: "Teacher",
            }));

            const usersList: Recipient[] = ((usersRes.data as any[]) || []).map((u: any) => ({
                id: u.id,
                name: `${u.first_name} ${u.last_name}`,
                email: u.email,
                role: u.role?.name || "User",
            }));

            // Combine and remove duplicates
            const allRecipients = [...teachersList, ...usersList];
            const unique = allRecipients.filter((r, i, arr) =>
                arr.findIndex(x => x.id === r.id) === i
            );

            setRecipients(unique);
        } catch (error) {
            console.error("Error fetching recipients:", error);
            // Mock data
            setRecipients([
                { id: "1", name: "Admin User", email: "admin@school.com", role: "Admin" },
                { id: "2", name: "John Smith", email: "john@school.com", role: "Teacher" },
                { id: "3", name: "Jane Doe", email: "jane@school.com", role: "Teacher" },
            ]);
        }
    };

    const handleSend = async () => {
        if (!selectedRecipient) {
            toast.error("Please select a recipient");
            return;
        }
        if (!subject.trim()) {
            toast.error("Please enter a subject");
            return;
        }
        if (!body.trim()) {
            toast.error("Please enter a message");
            return;
        }

        setSending(true);
        try {
            await apiClient.sendMessage(user?.id || "", selectedRecipient, subject, body);
            toast.success("Message sent successfully!");
            router.push("/dashboard/messaging/sent");
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message. Please try again.");
        } finally {
            setSending(false);
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

    const filteredRecipients = recipients.filter(
        (r) =>
            r.name.toLowerCase().includes(recipientSearch.toLowerCase()) ||
            r.email.toLowerCase().includes(recipientSearch.toLowerCase()) ||
            r.role.toLowerCase().includes(recipientSearch.toLowerCase())
    );

    return (
        <ProtectedRoute>
            <DashboardLayout title="Compose Message" sidebarItems={sidebarItems}>
                <div className="space-y-6">
                    {/* Header */}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Compose New Message</h1>
                        <p className="text-gray-600">Send a message to teachers, administrators, or other users</p>
                    </div>

                    {/* Compose Form */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-6 space-y-6">
                            {/* Recipient */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    To
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedRecipient}
                                        onChange={(e) => setSelectedRecipient(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                                    >
                                        <option value="">Select recipient...</option>
                                        {filteredRecipients.map((recipient) => (
                                            <option key={recipient.id} value={recipient.id}>
                                                {recipient.name} ({recipient.role}) - {recipient.email}
                                            </option>
                                        ))}
                                    </select>
                                    <Users className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" size={20} />
                                </div>
                            </div>

                            {/* Subject */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Enter message subject..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Body */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Message
                                </label>
                                <textarea
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    placeholder="Type your message here..."
                                    rows={10}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="px-6 py-4 bg-gray-50 border-t flex justify-between">
                            <button
                                onClick={() => router.back()}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
                            >
                                Cancel
                            </button>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => {
                                        setSubject("");
                                        setBody("");
                                        setSelectedRecipient("");
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                                >
                                    Clear
                                </button>
                                <button
                                    onClick={handleSend}
                                    disabled={sending}
                                    className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    {sending ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span>Sending...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            <span>Send Message</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Tips */}
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h3 className="font-semibold text-blue-900 mb-2">Tips for effective communication:</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Be clear and concise in your subject line</li>
                            <li>• Include all relevant details in your message</li>
                            <li>• Be professional and respectful</li>
                            <li>• Check for typos before sending</li>
                        </ul>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
