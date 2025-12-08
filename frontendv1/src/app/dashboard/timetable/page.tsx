"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/lib/apiClient";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import PermissionGuard from "@/components/PermissionGuard";
import { superadminSidebarItems } from "@/config/sidebarConfig";
import {
    Calendar,
    Clock,
    Plus,
    Edit2,
    Trash2,
    User,
    MapPin,
    Save,
    X,
} from "lucide-react";
import toast from "react-hot-toast";

interface TimeSlot {
    id: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
    subject: string;
    teacher_id?: string;
    teacher_name?: string;
    room?: string;
    color?: string;
}

interface Timetable {
    id: string;
    name: string;
    branch_id: string;
    academic_year: string;
    semester?: string;
    slots: TimeSlot[];
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIME_SLOTS = [
    "08:00-09:00",
    "09:00-10:00",
    "10:00-11:00",
    "11:00-12:00",
    "12:00-13:00", // Lunch
    "13:00-14:00",
    "14:00-15:00",
    "15:00-16:00",
];

const SUBJECT_COLORS: Record<string, string> = {
    Mathematics: "bg-blue-100 text-blue-800 border-blue-300",
    Science: "bg-green-100 text-green-800 border-green-300",
    English: "bg-purple-100 text-purple-800 border-purple-300",
    History: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Geography: "bg-orange-100 text-orange-800 border-orange-300",
    Physics: "bg-indigo-100 text-indigo-800 border-indigo-300",
    Chemistry: "bg-pink-100 text-pink-800 border-pink-300",
    Biology: "bg-emerald-100 text-emerald-800 border-emerald-300",
    default: "bg-gray-100 text-gray-800 border-gray-300",
};

export default function TimetablePage() {
    const { user } = useAuthStore();
    const [timetables, setTimetables] = useState<Timetable[]>([]);
    const [selectedTimetable, setSelectedTimetable] = useState<Timetable | null>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
    const [selectedDay, setSelectedDay] = useState<string>("");
    const [selectedTime, setSelectedTime] = useState<string>("");

    const [formData, setFormData] = useState({
        subject: "",
        teacher_id: "",
        teacher_name: "",
        room: "",
    });

    useEffect(() => {
        fetchTimetables();
    }, [user]);

    const fetchTimetables = async () => {
        try {
            setLoading(true);
            const branchId = user?.branch_id || user?.branchId;
            if (!branchId) return;

            const response = await apiClient.getTimetables({ branch_id: branchId });
            setTimetables(response.data || []);

            if (response.data && response.data.length > 0) {
                setSelectedTimetable(response.data[0]);
                await fetchTimetableSlots(response.data[0].id);
            }
        } catch (error) {
            console.error("Error fetching timetables:", error);
            toast.error("Failed to load timetables");
        } finally {
            setLoading(false);
        }
    };

    const fetchTimetableSlots = async (timetableId: string) => {
        try {
            const response = await apiClient.getTimetableSlots(timetableId);
            if (selectedTimetable) {
                setSelectedTimetable({
                    ...selectedTimetable,
                    slots: response.data || [],
                });
            }
        } catch (error) {
            console.error("Error fetching slots:", error);
        }
    };

    const handleAddSlot = (day: string, time: string) => {
        setEditingSlot(null);
        setSelectedDay(day);
        setSelectedTime(time);
        setFormData({
            subject: "",
            teacher_id: "",
            teacher_name: "",
            room: "",
        });
        setShowModal(true);
    };

    const handleEditSlot = (slot: TimeSlot) => {
        setEditingSlot(slot);
        setSelectedDay(slot.day_of_week);
        setSelectedTime(`${slot.start_time}-${slot.end_time}`);
        setFormData({
            subject: slot.subject,
            teacher_id: slot.teacher_id || "",
            teacher_name: slot.teacher_name || "",
            room: slot.room || "",
        });
        setShowModal(true);
    };

    const handleSaveSlot = async () => {
        if (!selectedTimetable || !formData.subject.trim()) {
            toast.error("Subject is required");
            return;
        }

        const [start_time, end_time] = selectedTime.split("-");

        try {
            if (editingSlot) {
                await apiClient.updateTimetableSlot(
                    selectedTimetable.id,
                    editingSlot.id,
                    {
                        subject: formData.subject,
                        teacher_id: formData.teacher_id,
                        teacher_name: formData.teacher_name,
                        room: formData.room,
                    }
                );
                toast.success("Slot updated successfully");
            } else {
                await apiClient.createTimetableSlot(selectedTimetable.id, {
                    day_of_week: selectedDay,
                    start_time,
                    end_time,
                    subject: formData.subject,
                    teacher_id: formData.teacher_id,
                    teacher_name: formData.teacher_name,
                    room: formData.room,
                });
                toast.success("Slot added successfully");
            }

            setShowModal(false);
            fetchTimetableSlots(selectedTimetable.id);
        } catch (error: any) {
            console.error("Error saving slot:", error);
            const message = error.response?.data?.message || "Failed to save slot";
            toast.error(message);
        }
    };

    const handleDeleteSlot = async (slotId: string) => {
        if (!selectedTimetable || !window.confirm("Delete this slot?")) return;

        try {
            await apiClient.deleteTimetableSlot(selectedTimetable.id, slotId);
            toast.success("Slot deleted");
            fetchTimetableSlots(selectedTimetable.id);
        } catch (error) {
            toast.error("Failed to delete slot");
        }
    };

    const getSlotForCell = (day: string, time: string): TimeSlot | undefined => {
        const [start_time] = time.split("-");
        return selectedTimetable?.slots.find(
            (slot) =>
                slot.day_of_week === day &&
                slot.start_time === start_time
        );
    };

    const getSubjectColor = (subject: string): string => {
        return SUBJECT_COLORS[subject] || SUBJECT_COLORS.default;
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <DashboardLayout title="Timetable" sidebarItems={superadminSidebarItems}>
                    <div className="flex items-center justify-center h-64">
                        <div className="text-gray-500">Loading timetable...</div>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <DashboardLayout title="Timetable Management" sidebarItems={superadminSidebarItems}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                Weekly Timetable
                            </h2>
                            {selectedTimetable && (
                                <p className="text-sm text-gray-600 mt-1">
                                    {selectedTimetable.name} • {selectedTimetable.academic_year}
                                </p>
                            )}
                        </div>
                        <PermissionGuard permission="manage_timetable">
                            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                <Plus size={20} />
                                <span>New Timetable</span>
                            </button>
                        </PermissionGuard>
                    </div>

                    {/* Timetable Grid */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700 w-24">
                                            Time
                                        </th>
                                        {DAYS.map((day) => (
                                            <th
                                                key={day}
                                                className="border border-gray-200 px-4 py-3 text-center font-semibold text-gray-700"
                                            >
                                                {day}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {TIME_SLOTS.map((time) => (
                                        <tr key={time} className="hover:bg-gray-50">
                                            <td className="border border-gray-200 px-4 py-3 font-medium text-gray-700 text-sm">
                                                {time}
                                            </td>
                                            {DAYS.map((day) => {
                                                const slot = getSlotForCell(day, time);
                                                const isLunch = time === "12:00-13:00";

                                                return (
                                                    <td
                                                        key={`${day}-${time}`}
                                                        className={`border border-gray-200 p-2 ${isLunch ? "bg-gray-100" : ""
                                                            }`}
                                                    >
                                                        {isLunch ? (
                                                            <div className="text-center text-gray-500 text-sm py-6">
                                                                Lunch Break
                                                            </div>
                                                        ) : slot ? (
                                                            <div
                                                                className={`${getSubjectColor(
                                                                    slot.subject
                                                                )} border-2 rounded-lg p-3 relative group cursor-pointer`}
                                                                onClick={() => handleEditSlot(slot)}
                                                            >
                                                                <div className="font-semibold text-sm mb-1">
                                                                    {slot.subject}
                                                                </div>
                                                                {slot.teacher_name && (
                                                                    <div className="flex items-center text-xs mb-1">
                                                                        <User size={12} className="mr-1" />
                                                                        {slot.teacher_name}
                                                                    </div>
                                                                )}
                                                                {slot.room && (
                                                                    <div className="flex items-center text-xs">
                                                                        <MapPin size={12} className="mr-1" />
                                                                        {slot.room}
                                                                    </div>
                                                                )}
                                                                <PermissionGuard permission="manage_timetable">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDeleteSlot(slot.id);
                                                                        }}
                                                                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-500 text-white p-1 rounded hover:bg-red-600 transition"
                                                                    >
                                                                        <Trash2 size={12} />
                                                                    </button>
                                                                </PermissionGuard>
                                                            </div>
                                                        ) : (
                                                            <PermissionGuard permission="manage_timetable">
                                                                <button
                                                                    onClick={() => handleAddSlot(day, time)}
                                                                    className="w-full h-20 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition flex items-center justify-center text-gray-400 hover:text-blue-600"
                                                                >
                                                                    <Plus size={20} />
                                                                </button>
                                                            </PermissionGuard>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="bg-white rounded-lg shadow p-4">
                        <h3 className="font-semibold text-gray-800 mb-3">Subject Colors</h3>
                        <div className="flex flex-wrap gap-3">
                            {Object.entries(SUBJECT_COLORS).map(([subject, color]) => {
                                if (subject === "default") return null;
                                return (
                                    <div
                                        key={subject}
                                        className={`${color} px-3 py-1 rounded-full text-sm font-medium`}
                                    >
                                        {subject}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Add/Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                {editingSlot ? "Edit Slot" : "Add Slot"}
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Day & Time
                                    </label>
                                    <div className="text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                                        {selectedDay} • {selectedTime}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.subject}
                                        onChange={(e) =>
                                            setFormData({ ...formData, subject: e.target.value })
                                        }
                                        placeholder="e.g., Mathematics"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Teacher Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.teacher_name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, teacher_name: e.target.value })
                                        }
                                        placeholder="e.g., Mr. Smith"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Room
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.room}
                                        onChange={(e) =>
                                            setFormData({ ...formData, room: e.target.value })
                                        }
                                        placeholder="e.g., Room 101"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    >
                                        <X className="inline mr-2" size={16} />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveSlot}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        <Save className="inline mr-2" size={16} />
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        </ProtectedRoute>
    );
}
