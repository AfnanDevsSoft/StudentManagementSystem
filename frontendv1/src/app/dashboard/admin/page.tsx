"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/lib/apiClient";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  Settings,
  GraduationCap,
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    courses: 0,
    attendance: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!user?.branch_id) return;
        // Fetch branch-specific stats
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, [user]);

  const sidebarItems = [
    {
      label: "Dashboard",
      href: "/dashboard/admin",
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: "Academic Management",
      href: "#",
      icon: <GraduationCap size={20} />,
      children: [
        {
          label: "Students",
          href: "/dashboard/admin/students",
          icon: <GraduationCap size={18} />,
        },
        {
          label: "Teachers",
          href: "/dashboard/admin/teachers",
          icon: <Users size={18} />,
        },
        {
          label: "Courses",
          href: "/dashboard/admin/courses",
          icon: <BookOpen size={18} />,
        },
      ],
    },
    {
      label: "Attendance",
      href: "/dashboard/admin/attendance",
      icon: <Users size={20} />,
    },
    {
      label: "Grades",
      href: "/dashboard/admin/grades",
      icon: <BarChart3 size={20} />,
    },
    {
      label: "Analytics",
      href: "/dashboard/admin/analytics",
      icon: <BarChart3 size={20} />,
    },
    {
      label: "Reports",
      href: "/dashboard/admin/reports",
      icon: <BarChart3 size={20} />,
    },
    {
      label: "Settings",
      href: "/dashboard/admin/settings",
      icon: <Settings size={20} />,
    },
  ];

  const StatCard = ({
    title,
    value,
    icon: Icon,
  }: {
    title: string;
    value: number;
    icon: React.ReactNode;
  }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded-lg text-blue-600">{Icon}</div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <DashboardLayout title="Admin Dashboard" sidebarItems={sidebarItems}>
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Students"
              value={stats.students}
              icon={<GraduationCap size={24} />}
            />
            <StatCard
              title="Total Teachers"
              value={stats.teachers}
              icon={<Users size={24} />}
            />
            <StatCard
              title="Total Courses"
              value={stats.courses}
              icon={<BookOpen size={24} />}
            />
            <StatCard
              title="Avg Attendance"
              value={stats.attendance}
              icon={<BarChart3 size={24} />}
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <a
                href="/dashboard/admin/students"
                className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition"
              >
                <p className="font-semibold text-blue-900">Manage Students</p>
              </a>
              <a
                href="/dashboard/admin/teachers"
                className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition"
              >
                <p className="font-semibold text-green-900">Manage Teachers</p>
              </a>
              <a
                href="/dashboard/admin/grades"
                className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition"
              >
                <p className="font-semibold text-purple-900">Manage Grades</p>
              </a>
            </div>
          </div>

          {/* Recent Items */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Students */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Recent Students
              </h3>
              <div className="space-y-2">
                <p className="text-gray-500 text-center py-8">
                  No recent students
                </p>
              </div>
            </div>

            {/* Recent Teachers */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Recent Teachers
              </h3>
              <div className="space-y-2">
                <p className="text-gray-500 text-center py-8">
                  No recent teachers
                </p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
