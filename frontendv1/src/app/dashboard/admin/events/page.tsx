"use client";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import apiClient from "@/lib/apiClient";
import { CalendarDays, Plus, ChevronLeft, ChevronRight } from "lucide-react";

interface Event {
    id: string;
    title: string;
    description?: string;
    event_type: string;
    start_date: string;
    end_date: string;
    location?: string;
    is_holiday: boolean;
}

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showAddModal, setShowAddModal] = useState(false);
    const [branchId, setBranchId] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (user) {
            const userData = JSON.parse(user);
            setBranchId(userData.branch_id);
            if (userData.branch_id) {
                fetchEvents(userData.branch_id);
            }
        }
    }, [currentDate]);

    const fetchEvents = async (branchId: string) => {
        try {
            const response = await apiClient.getMonthlyCalendar(
                branchId,
                currentDate.getFullYear(),
                currentDate.getMonth() + 1
            );
            if (response.data.success) {
                setEvents(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    };

    const handleCreateEvent = async (data: Partial<Event>) => {
        setLoading(true);
        try {
            const response = await apiClient.createEvent({
                ...data,
                branch_id: branchId,
                created_by: JSON.parse(localStorage.getItem("user") || "{}").id,
            });
            if (response.data.success) {
                toast.success("Event created successfully!");
                fetchEvents(branchId);
                setShowAddModal(false);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create event");
        } finally {
            setLoading(false);
        }
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Events Calendar</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Manage school events, holidays, and important dates
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Add Event
                    </button>
                </div>
            </div>

            {/* Calendar Navigation */}
            <div className="bg-white border-b px-6 py-4">
                <div className="flex items-center justify-between">
                    <button
                        onClick={prevMonth}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <h2 className="text-xl font-semibold">{monthName}</h2>
                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Events List */}
            <div className="p-6">
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6">
                        <h3 className="font-semibold mb-4">Events this month</h3>
                        <div className="space-y-3">
                            {events.length > 0 ? (
                                events.map((event) => (
                                    <div
                                        key={event.id}
                                        className={`p-4 rounded-lg border-l-4 ${event.is_holiday
                                                ? "border-red-500 bg-red-50"
                                                : event.event_type === "exam"
                                                    ? "border-orange-500 bg-orange-50"
                                                    : "border-blue-500 bg-blue-50"
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-semibold">{event.title}</h4>
                                                {event.description && (
                                                    <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                                                )}
                                                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                                    <span>📅 {new Date(event.start_date).toLocaleDateString()}</span>
                                                    {event.location && <span>📍 {event.location}</span>}
                                                </div>
                                            </div>
                                            <span
                                                className={`px-2 py-1 rounded text-xs ${event.is_holiday
                                                        ? "bg-red-100 text-red-700"
                                                        : event.event_type === "exam"
                                                            ? "bg-orange-100 text-orange-700"
                                                            : "bg-blue-100 text-blue-700"
                                                    }`}
                                            >
                                                {event.is_holiday ? "Holiday" : event.event_type}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-8">No events scheduled for this month</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Event Modal */}
            {showAddModal && (
                <AddEventModal
                    onClose={() => setShowAddModal(false)}
                    onSubmit={handleCreateEvent}
                    loading={loading}
                />
            )}
        </div>
    );
}

function AddEventModal({
    onClose,
    onSubmit,
    loading,
}: {
    onClose: () => void;
    onSubmit: (data: Partial<Event>) => void;
    loading: boolean;
}) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        event_type: "meeting",
        start_date: "",
        end_date: "",
        location: "",
        is_holiday: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Add New Event</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Event Title *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Start Date *</label>
                                <input
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">End Date *</label>
                                <input
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Event Type *</label>
                            <select
                                value={formData.event_type}
                                onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                            >
                                <option value="meeting">Meeting</option>
                                <option value="exam">Exam</option>
                                <option value="sports">Sports</option>
                                <option value="cultural">Cultural</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.is_holiday}
                                    onChange={(e) => setFormData({ ...formData, is_holiday: e.target.checked })}
                                    className="rounded"
                                />
                                <span className="text-sm font-medium">Mark as Holiday</span>
                            </label>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? "Creating..." : "Create Event"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
