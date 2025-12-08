"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/lib/apiClient";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  MessageCircle,
  Calendar,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    courses: 0,
    gpa: 0,
    attendance: 0,
    messages: 0,
  });

  useEffect(() => {
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Fetch courses count
      const coursesRes = await apiClient.getCourses();
      const coursesCount = Array.isArray(coursesRes.data)
        ? coursesRes.data.length
        : 0;

      // Fetch GPA if available
      let gpa = 0;
      if (user?.id) {
        try {
          const gradesRes = await apiClient.getStudentGrades(user.id);
          gpa = (gradesRes.data as { gpa?: number })?.gpa || 0;
        } catch (e) {
          console.error("Error fetching grades:", e);
        }
      }

      setStats({
        courses: coursesCount,
        gpa: gpa,
        attendance: 0,
        messages: 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const sidebarItems = [
    {
      label: "Dashboard",
      href: "/dashboard/student",
      icon: <LayoutDashboard size={20} />,
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
      label: "My Courses",
      href: "/dashboard/student/courses",
      icon: <BookOpen size={20} />,
    },
    {
      label: "My Grades",
      href: "/dashboard/student/grades",
      icon: <BarChart3 size={20} />,
    },
    {
      label: "Attendance",
      href: "/dashboard/student/attendance",
      icon: <Calendar size={20} />,
    },
    {
      label: "Fees",
      href: "/dashboard/student/fees",
      icon: <BarChart3 size={20} />,
    },
    {
      label: "Messages",
      href: "/dashboard/student/messages",
      icon: <MessageCircle size={20} />,
    },
  ];

  const StatCard = ({
    title,
    value,
    unit = "",
    icon: Icon,
  }: {
    title: string;
    value: number | string;
    unit?: string;
    icon: React.ReactNode;
  }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {value}
            {unit}
          </p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg text-purple-600">
          {Icon}
        </div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <DashboardLayout title="Student Dashboard" sidebarItems={sidebarItems}>
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Enrolled Courses"
              value={stats.courses}
              icon={<BookOpen size={24} />}
            />
            <StatCard
              title="Current GPA"
              value={stats.gpa}
              unit="%"
              icon={<BarChart3 size={24} />}
            />
            <StatCard
              title="Attendance"
              value={stats.attendance}
              unit="%"
              icon={<Calendar size={24} />}
            />
            <StatCard
              title="New Messages"
              value={stats.messages}
              icon={<MessageCircle size={24} />}
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <a
                href="/dashboard/student/timetable"
                className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition"
              >
                <Calendar className="mx-auto mb-2 text-purple-600" size={24} />
                <p className="font-semibold text-purple-900">My Timetable</p>
              </a>
              <a
                href="/dashboard/student/assignments"
                className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition"
              >
                <FileText className="mx-auto mb-2 text-blue-600" size={24} />
                <p className="font-semibold text-blue-900">Assignments</p>
              </a>
              <a
                href="/dashboard/student/fees"
                className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition"
              >
                <BookOpen className="mx-auto mb-2 text-green-600" size={24} />
                <p className="font-semibold text-green-900">Pay Fees</p>
              </a>
              <a
                href="/dashboard/student/courses"
                className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-center transition"
              >
                <BookOpen className="mx-auto mb-2 text-orange-600" size={24} />
                <p className="font-semibold text-orange-900">View Courses</p>
              </a>
            </div>
          </div>

          {/* Upcoming Assignments & Deadlines */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Upcoming Assignments & Deadlines
            </h2>
            <div className="space-y-3">
              <div className="p-4 border-l-4 border-blue-600 bg-blue-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-blue-900">
                      Calculus Problem Set 3
                    </p>
                    <p className="text-sm text-blue-700 mt-1">Mathematics</p>
                  </div>
                  <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                    Due in 7 days
                  </span>
                </div>
              </div>
              <div className="p-4 border-l-4 border-yellow-600 bg-yellow-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-yellow-900">
                      Physics Lab Report
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">Physics</p>
                  </div>
                  <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
                    Due in 2 days
                  </span>
                </div>
              </div>
              <a
                href="/dashboard/student/assignments"
                className="block text-center text-blue-600 hover:text-blue-700 text-sm font-medium mt-3"
              >
                View all assignments →
              </a>
            </div>
          </div>

          {/* Fee Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Fee Status & Notifications
            </h2>
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Calendar className="text-green-600 mt-0.5" size={20} />
                  <div className="flex-1">
                    <p className="font-semibold text-green-900">
                      January 2025 - Paid
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      PKR 15,000 paid on Jan 5, 2025
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Calendar className="text-yellow-600 mt-0.5" size={20} />
                  <div className="flex-1">
                    <p className="font-semibold text-yellow-900">
                      February 2025 - Pending
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      PKR 15,000 due by Feb 10, 2025
                    </p>
                  </div>
                </div>
              </div>
              <a
                href="/dashboard/student/fees"
                className="block w-full text-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
              >
                Pay Now
              </a>
            </div>
          </div>

          {/* Courses */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">My Courses</h2>
            <div className="space-y-3">
              <div className="p-4 border-l-4 border-blue-600 bg-blue-50 rounded-lg">
                <p className="font-semibold text-blue-900">
                  No courses enrolled
                </p>
              </div>
            </div>
          </div>

          {/* Recent Announcements */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Recent Announcements
            </h2>
            <div className="space-y-3">
              <p className="text-gray-600 text-center py-8">
                No announcements yet
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
