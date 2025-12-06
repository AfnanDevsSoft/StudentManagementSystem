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
      label: "Assignments",
      href: "/dashboard/student/assignments",
      icon: <FileText size={20} />,
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <a
                href="/dashboard/student/courses"
                className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition"
              >
                <p className="font-semibold text-blue-900">View Courses</p>
              </a>
              <a
                href="/dashboard/student/grades"
                className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition"
              >
                <p className="font-semibold text-purple-900">View Grades</p>
              </a>
              <a
                href="/dashboard/student/messages"
                className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition"
              >
                <p className="font-semibold text-green-900">Messages</p>
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
