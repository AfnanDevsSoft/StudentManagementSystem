"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/lib/apiClient";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  MessageCircle,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ParentDashboard() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    children: 0,
    avgGpa: 0,
    avgAttendance: 0,
    messages: 0,
  });

  useEffect(() => {
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // For parent, fetch their children (students)
      const studentsRes = await apiClient.getStudents();
      const childrenCount = Array.isArray(studentsRes.data)
        ? studentsRes.data.length
        : 0;

      setStats({
        children: childrenCount,
        avgGpa: 0,
        avgAttendance: 0,
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
      href: "/dashboard/parent",
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: "My Children",
      href: "/dashboard/parent/children",
      icon: <Users size={20} />,
    },
    {
      label: "Academic Performance",
      href: "/dashboard/parent/performance",
      icon: <BarChart3 size={20} />,
    },
    {
      label: "Attendance",
      href: "/dashboard/parent/attendance",
      icon: <FileText size={20} />,
    },
    {
      label: "Messages",
      href: "/dashboard/parent/messages",
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
        <div className="bg-yellow-100 p-4 rounded-lg text-yellow-600">
          {Icon}
        </div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <DashboardLayout
        title="Parent/Guardian Dashboard"
        sidebarItems={sidebarItems}
      >
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Children"
              value={stats.children}
              icon={<Users size={24} />}
            />
            <StatCard
              title="Average GPA"
              value={stats.avgGpa}
              unit="%"
              icon={<BarChart3 size={24} />}
            />
            <StatCard
              title="Average Attendance"
              value={stats.avgAttendance}
              unit="%"
              icon={<FileText size={24} />}
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
                href="/dashboard/parent/children"
                className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition"
              >
                <p className="font-semibold text-blue-900">View Children</p>
              </a>
              <a
                href="/dashboard/parent/performance"
                className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition"
              >
                <p className="font-semibold text-purple-900">
                  Academic Performance
                </p>
              </a>
              <a
                href="/dashboard/parent/messages"
                className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition"
              >
                <p className="font-semibold text-green-900">Messages</p>
              </a>
            </div>
          </div>

          {/* Children Overview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Children Overview
            </h2>
            <div className="space-y-3">
              <div className="p-4 border-l-4 border-yellow-600 bg-yellow-50 rounded-lg">
                <p className="font-semibold text-yellow-900">
                  No children linked to your account
                </p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
