"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/lib/apiClient";
import {
    Calendar,
    Clock,
    MapPin,
    User,
    BookOpen,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

interface TimetableSlot {
    id: string;
    day: string;
    startTime: string;
    endTime: string;
    subject: string;
    teacher: string;
    room: string;
    courseCode?: string;
}

export default function StudentTimetable() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
    const [currentWeek, setCurrentWeek] = useState(new Date());

    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const timeSlots = [
        "08:00",
        "09:00",
        "10:00",
        "11:00",
        "12:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
    ];

    useEffect(() => {
        fetchTimetable();
    }, [user]);

    const fetchTimetable = async () => {
        try {
            setLoading(true);

            if (!user?.id) {
                toast.error("User not authenticated");
                return;
            }

            // API Integration: Fetch timetable from backend
            const response = await apiClient.getStudentTimetable(user.id);

            if (!response.success || !response.data) {
                toast.error(response.message || "Failed to load timetable");
                return;
            }

            // Transform backend data to frontend format
            const timetableData: TimetableSlot[] = (response.data as any[]).map((entry: any) => ({
                id: entry.id || entry.entry_id || String(Math.random()),
                day: entry.day_of_week || entry.day,
                startTime: entry.start_time || entry.startTime,
                endTime: entry.end_time || entry.endTime,
                subject: entry.subject_name || entry.subject || entry.course_name,
                teacher: entry.teacher_name || entry.teacher,
                room: entry.room_name || entry.room || entry.location,
                courseCode: entry.course_code || entry.courseCode,
            }));

            setTimetable(timetableData);
        } catch (error: any) {
            console.error("Error fetching timetable:", error);

            // Handle specific error cases
            if (error.response?.status === 404) {
                toast.error("No timetable found. Please contact administration.");
                setTimetable([]);
            } else if (error.response?.status === 401) {
                // Will be handled by interceptor
                return;
            } else {
                toast.error(
                    error.response?.data?.message ||
                    "Failed to load timetable. Please try again later."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const getWeekDates = () => {
        const startOfWeek = new Date(currentWeek);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);

        return daysOfWeek.map((_, index) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + index);
            return date;
        });
    };

    const navigateWeek = (direction: "prev" | "next") => {
        const newWeek = new Date(currentWeek);
        newWeek.setDate(newWeek.getDate() + (direction === "next" ? 7 : -7));
        setCurrentWeek(newWeek);
    };

    const getClassForSlot = (day: string, time: string) => {
        return timetable.find(
            (slot) => slot.day === day && slot.startTime === time
        );
    };

    const getCurrentDay = () => {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return days[new Date().getDay()];
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
            icon: <BookOpen size={20} />,
        },
        {
            label: "Fees",
            href: "/dashboard/student/fees",
            icon: <BookOpen size={20} />,
        },
    ];

    if (loading) {
        return (
            <ProtectedRoute>
                <DashboardLayout title="My Timetable" sidebarItems={sidebarItems}>
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-500">Loading timetable...</p>
                        </div>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    const weekDates = getWeekDates();
    const currentDay = getCurrentDay();

    return (
        <ProtectedRoute>
            <DashboardLayout title="My Timetable" sidebarItems={sidebarItems}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold flex items-center gap-2">
                                    <Calendar size={28} />
                                    My Class Schedule
                                </h1>
                                <p className="text-purple-100 mt-1">
                                    View your weekly class timetable
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => navigateWeek("prev")}
                                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <div className="text-center px-4">
                                    <p className="text-sm text-purple-100">Current Week</p>
                                    <p className="font-semibold">
                                        {weekDates[0].toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        })}{" "}
                                        -{" "}
                                        {weekDates[4].toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </p>
                                </div>
                                <button
                                    onClick={() => navigateWeek("next")}
                                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Today's Classes Quick View */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Clock className="text-blue-600" size={20} />
                            Today's Classes ({currentDay})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {timetable
                                .filter((slot) => slot.day === currentDay)
                                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                                .map((slot) => (
                                    <div
                                        key={slot.id}
                                        className="border-l-4 border-blue-600 bg-blue-50 rounded-lg p-4"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <p className="font-semibold text-blue-900">
                                                {slot.subject}
                                            </p>
                                            <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                                                {slot.courseCode}
                                            </span>
                                        </div>
                                        <div className="space-y-1 text-sm text-gray-600">
                                            <p className="flex items-center gap-2">
                                                <Clock size={14} />
                                                {slot.startTime} - {slot.endTime}
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <User size={14} />
                                                {slot.teacher}
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <MapPin size={14} />
                                                {slot.room}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            {timetable.filter((slot) => slot.day === currentDay).length ===
                                0 && (
                                    <div className="col-span-3 text-center py-8 text-gray-500">
                                        No classes scheduled for today
                                    </div>
                                )}
                        </div>
                    </div>

                    {/* Weekly Timetable Grid */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">
                                Weekly Schedule
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">
                                            Time
                                        </th>
                                        {daysOfWeek.map((day, index) => (
                                            <th
                                                key={day}
                                                className={`px-4 py-3 text-center text-sm font-semibold border-r border-gray-200 ${day === currentDay
                                                    ? "bg-blue-100 text-blue-900"
                                                    : "text-gray-700"
                                                    }`}
                                            >
                                                <div>{day}</div>
                                                <div className="text-xs font-normal text-gray-500 mt-1">
                                                    {weekDates[index].toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                    })}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {timeSlots.map((time, timeIndex) => (
                                        <tr key={time} className="border-t border-gray-200">
                                            <td className="px-4 py-3 text-sm font-medium text-gray-700 border-r border-gray-200 bg-gray-50">
                                                {time}
                                            </td>
                                            {daysOfWeek.map((day) => {
                                                const classSlot = getClassForSlot(day, time);
                                                return (
                                                    <td
                                                        key={`${day}-${time}`}
                                                        className={`px-2 py-2 text-xs border-r border-gray-200 ${day === currentDay ? "bg-blue-50/30" : ""
                                                            }`}
                                                    >
                                                        {classSlot ? (
                                                            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-lg p-3 shadow-sm hover:shadow-md transition">
                                                                <p className="font-semibold mb-1">
                                                                    {classSlot.subject}
                                                                </p>
                                                                <p className="text-xs opacity-90 flex items-center gap-1">
                                                                    <User size={10} />
                                                                    {classSlot.teacher}
                                                                </p>
                                                                <p className="text-xs opacity-90 flex items-center gap-1 mt-1">
                                                                    <MapPin size={10} />
                                                                    {classSlot.room}
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <div className="h-20"></div>
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
                    <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded"></div>
                            <span className="text-gray-700">Scheduled Class</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                            <span className="text-gray-700">Today</span>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
