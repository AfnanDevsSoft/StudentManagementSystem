"use client";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import apiClient from "@/lib/apiClient";
import { adminSidebarItems } from "@/config/sidebarConfig";
import { Clock, Plus, Building2, CalendarClock, X } from "lucide-react";

interface TimeSlot {
    id: string;
    slot_name: string;
    start_time: string;
    end_time: string;
    slot_type: string;
    sort_order: number;
}

interface Room {
    id: string;
    room_number: string;
    room_name?: string;
    capacity: number;
    room_type: string;
    building?: string;
}

export default function TimetablePage() {
    const [activeTab, setActiveTab] = useState<"slots" | "rooms" | "schedule">("slots");
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(false);
    const [showSlotModal, setShowSlotModal] = useState(false);
    const [showRoomModal, setShowRoomModal] = useState(false);
    const [branchId, setBranchId] = useState<string>("");

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (user) {
            const userData = JSON.parse(user);
            setBranchId(userData.branch_id);
            if (userData.branch_id) {
                fetchTimeSlots(userData.branch_id);
                fetchRooms(userData.branch_id);
            }
        }
    }, []);

    const fetchTimeSlots = async (branchId: string) => {
        try {
            const response = await apiClient.getTimeSlots(branchId);
            if (response.data.success) {
                setTimeSlots(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching time slots:", error);
        }
    };

    const fetchRooms = async (branchId: string) => {
        try {
            const response = await apiClient.getRooms(branchId);
            if (response.data.success) {
                setRooms(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching rooms:", error);
        }
    };

    const handleCreateTimeSlot = async (data: Partial<TimeSlot>) => {
        setLoading(true);
        try {
            const response = await apiClient.createTimeSlot({
                ...data,
                branch_id: branchId,
            });
            if (response.data.success) {
                toast.success("Time slot created successfully!");
                fetchTimeSlots(branchId);
                setShowSlotModal(false);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create time slot");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRoom = async (data: Partial<Room>) => {
        setLoading(true);
        try {
            const response = await apiClient.createRoom({
                ...data,
                branch_id: branchId,
            });
            if (response.data.success) {
                toast.success("Room created successfully!");
                fetchRooms(branchId);
                setShowRoomModal(false);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create room");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Timetable Management</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Manage class schedules, time slots, and room allocations
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b px-6">
                <div className="flex space-x-8">
                    <button
                        onClick={() => setActiveTab("slots")}
                        className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === "slots"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        <Clock className="inline mr-2" size={18} />
                        Time Slots
                    </button>
                    <button
                        onClick={() => setActiveTab("rooms")}
                        className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === "rooms"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        <Building2 className="inline mr-2" size={18} />
                        Rooms
                    </button>
                    <button
                        onClick={() => setActiveTab("schedule")}
                        className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === "schedule"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        <CalendarClock className="inline mr-2" size={18} />
                        Weekly Schedule
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {activeTab === "slots" && (
                    <TimeSlotsTab
                        timeSlots={timeSlots}
                        onCreateSlot={() => setShowSlotModal(true)}
                        onDeleteSlot={async (id) => {
                            await apiClient.deleteTimeSlot(id);
                            fetchTimeSlots(branchId);
                            toast.success("Time slot deleted");
                        }}
                    />
                )}
                {activeTab === "rooms" && (
                    <RoomsTab
                        rooms={rooms}
                        onCreateRoom={() => setShowRoomModal(true)}
                        onDeleteRoom={async (id) => {
                            await apiClient.deleteRoom(id);
                            fetchRooms(branchId);
                            toast.success("Room deleted");
                        }}
                    />
                )}
                {activeTab === "schedule" && (
                    <ScheduleTab timeSlots={timeSlots} rooms={rooms} />
                )}
            </div>

            {/* Modals */}
            {showSlotModal && (
                <TimeSlotModal
                    onClose={() => setShowSlotModal(false)}
                    onSubmit={handleCreateTimeSlot}
                    loading={loading}
                />
            )}
            {showRoomModal && (
                <RoomModal
                    onClose={() => setShowRoomModal(false)}
                    onSubmit={handleCreateRoom}
                    loading={loading}
                />
            )}
        </div>
    );
}

// Time Slots Tab Component
function TimeSlotsTab({
    timeSlots,
    onCreateSlot,
    onDeleteSlot,
}: {
    timeSlots: TimeSlot[];
    onCreateSlot: () => void;
    onDeleteSlot: (id: string) => void;
}) {
    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold">Time Slots</h2>
                <button
                    onClick={onCreateSlot}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    <Plus size={18} />
                    Add Time Slot
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Slot Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Start Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                End Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {timeSlots.map((slot) => (
                            <tr key={slot.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium">{slot.slot_name}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{slot.start_time}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{slot.end_time}</td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs ${slot.slot_type === "class"
                                                ? "bg-blue-100 text-blue-800"
                                                : slot.slot_type === "break"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-orange-100 text-orange-800"
                                            }`}
                                    >
                                        {slot.slot_type}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => onDeleteSlot(slot.id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Rooms Tab Component
function RoomsTab({
    rooms,
    onCreateRoom,
    onDeleteRoom,
}: {
    rooms: Room[];
    onCreateRoom: () => void;
    onDeleteRoom: (id: string) => void;
}) {
    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold">Rooms & Classrooms</h2>
                <button
                    onClick={onCreateRoom}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    <Plus size={18} />
                    Add Room
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {rooms.map((room) => (
                    <div key={room.id} className="border rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-semibold text-lg">{room.room_number}</h3>
                                {room.room_name && (
                                    <p className="text-sm text-gray-600">{room.room_name}</p>
                                )}
                            </div>
                            <button
                                onClick={() => onDeleteRoom(room.id)}
                                className="text-red-600 hover:text-red-800"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="space-y-1 text-sm">
                            <p>
                                <span className="text-gray-500">Capacity:</span> {room.capacity} students
                            </p>
                            <p>
                                <span className="text-gray-500">Type:</span>{" "}
                                <span className="capitalize">{room.room_type}</span>
                            </p>
                            {room.building && (
                                <p>
                                    <span className="text-gray-500">Building:</span> {room.building}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Schedule Tab Component (Placeholder for now)
function ScheduleTab({
    timeSlots,
    rooms,
}: {
    timeSlots: TimeSlot[];
    rooms: Room[];
}) {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Weekly Schedule</h2>
            <p className="text-gray-600">
                Schedule management coming soon. This will show a weekly grid view of all scheduled
                classes with drag-and-drop functionality.
            </p>
            <div className="mt-4 text-sm text-gray-500">
                <p>• {timeSlots.length} time slots configured</p>
                <p>• {rooms.length} rooms available</p>
            </div>
        </div>
    );
}

// Time Slot Modal
function TimeSlotModal({
    onClose,
    onSubmit,
    loading,
}: {
    onClose: () => void;
    onSubmit: (data: Partial<TimeSlot>) => void;
    loading: boolean;
}) {
    const [formData, setFormData] = useState({
        slot_name: "",
        start_time: "",
        end_time: "",
        slot_type: "class",
        sort_order: 1,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Add Time Slot</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Slot Name *</label>
                            <input
                                type="text"
                                value={formData.slot_name}
                                onChange={(e) => setFormData({ ...formData, slot_name: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                                placeholder="e.g., Period 1"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Start Time *</label>
                                <input
                                    type="time"
                                    value={formData.start_time}
                                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">End Time *</label>
                                <input
                                    type="time"
                                    value={formData.end_time}
                                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Type *</label>
                            <select
                                value={formData.slot_type}
                                onChange={(e) => setFormData({ ...formData, slot_type: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                            >
                                <option value="class">Class</option>
                                <option value="break">Break</option>
                                <option value="lunch">Lunch</option>
                            </select>
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
                            {loading ? "Creating..." : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Room Modal
function RoomModal({
    onClose,
    onSubmit,
    loading,
}: {
    onClose: () => void;
    onSubmit: (data: Partial<Room>) => void;
    loading: boolean;
}) {
    const [formData, setFormData] = useState({
        room_number: "",
        room_name: "",
        capacity: 40,
        room_type: "classroom",
        building: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Add Room</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Room Number *</label>
                            <input
                                type="text"
                                value={formData.room_number}
                                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                                placeholder="e.g., 101"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Room Name</label>
                            <input
                                type="text"
                                value={formData.room_name}
                                onChange={(e) => setFormData({ ...formData, room_name: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                                placeholder="e.g., Science Lab"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Capacity *</label>
                                <input
                                    type="number"
                                    value={formData.capacity}
                                    onChange={(e) =>
                                        setFormData({ ...formData, capacity: parseInt(e.target.value) })
                                    }
                                    className="w-full px-3 py-2 border rounded-lg"
                                    min="1"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Type *</label>
                                <select
                                    value={formData.room_type}
                                    onChange={(e) => setFormData({ ...formData, room_type: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value="classroom">Classroom</option>
                                    <option value="lab">Lab</option>
                                    <option value="auditorium">Auditorium</option>
                                    <option value="library">Library</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Building</label>
                            <input
                                type="text"
                                value={formData.building}
                                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                                placeholder="e.g., Main Building"
                            />
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
                            {loading ? "Creating..." : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
