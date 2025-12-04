"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/stores/authStore";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  FileText,
  MessageCircle,
  BarChart3,
} from "lucide-react";

export default function TeacherDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    courses: 0,
    students: 0,
    assignments: 0,
    messages: 0,
  });

  const sidebarItems = [
    {
      label: "Dashboard",
      href: "/dashboard/teacher",
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: "My Courses",
      href: "/dashboard/teacher/courses",
      icon: <BookOpen size={20} />,
    },
    {
      label: "Students",
      href: "/dashboard/teacher/students",
      icon: <Users size={20} />,
    },
    {
      label: "Attendance",
      href: "/dashboard/teacher/attendance",
      icon: <Users size={20} />,
    },
    {
      label: "Grades",
      href: "/dashboard/teacher/grades",
      icon: <BarChart3 size={20} />,
    },
    {
      label: "Assignments",
      href: "/dashboard/teacher/assignments",
      icon: <FileText size={20} />,
    },
    {
      label: "Messages",
      href: "/dashboard/teacher/messages",
      icon: <MessageCircle size={20} />,
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
        <div className="bg-green-100 p-4 rounded-lg text-green-600">{Icon}</div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <DashboardLayout title="Teacher Dashboard" sidebarItems={sidebarItems}>
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="My Courses"
              value={stats.courses}
              icon={<BookOpen size={24} />}
            />
            <StatCard
              title="Total Students"
              value={stats.students}
              icon={<Users size={24} />}
            />
            <StatCard
              title="Assignments"
              value={stats.assignments}
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <a
                href="/dashboard/teacher/courses"
                className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition"
              >
                <p className="font-semibold text-blue-900">View Courses</p>
              </a>
              <a
                href="/dashboard/teacher/grades"
                className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition"
              >
                <p className="font-semibold text-purple-900">Enter Grades</p>
              </a>
              <a
                href="/dashboard/teacher/attendance"
                className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition"
              >
                <p className="font-semibold text-green-900">Mark Attendance</p>
              </a>
              <a
                href="/dashboard/teacher/messages"
                className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-center transition"
              >
                <p className="font-semibold text-orange-900">Messages</p>
              </a>
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Today's Schedule
            </h2>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-600">No classes scheduled for today</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
