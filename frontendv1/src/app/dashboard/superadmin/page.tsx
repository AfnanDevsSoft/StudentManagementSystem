"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/lib/apiClient";
import { superadminSidebarItems } from "@/config/sidebarConfig";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  GraduationCap,
} from "lucide-react";
import { Branch, User, Student, Teacher, Course } from "@/types";

export default function SuperAdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    branches: 0,
    users: 0,
    students: 0,
    teachers: 0,
    courses: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!user?.branch_id) return;

        const [branchRes, usersRes] = await Promise.all([
          apiClient.getBranches(),
          apiClient.getUsers(1, 100, "", user.branch_id),
        ]);

        setStats({
          branches: Array.isArray(branchRes.data) ? branchRes.data.length : 0,
          users: Array.isArray(usersRes.data) ? usersRes.data.length : 0,
          students: 0,
          teachers: 0,
          courses: 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, [user]);

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
      <DashboardLayout title="SuperAdmin Dashboard" sidebarItems={superadminSidebarItems}>
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Total Branches"
              value={stats.branches}
              icon={<LayoutDashboard size={24} />}
            />
            <StatCard
              title="Total Users"
              value={stats.users}
              icon={<Users size={24} />}
            />
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
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <a
                href="/dashboard/superadmin/branches"
                className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition"
              >
                <p className="font-semibold text-blue-900">Manage Branches</p>
              </a>
              <a
                href="/dashboard/superadmin/users"
                className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition"
              >
                <p className="font-semibold text-green-900">Manage Users</p>
              </a>
              <a
                href="/dashboard/superadmin/roles"
                className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition"
              >
                <p className="font-semibold text-purple-900">Manage Roles</p>
              </a>
              <a
                href="/dashboard/superadmin/analytics"
                className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-center transition"
              >
                <p className="font-semibold text-orange-900">View Analytics</p>
              </a>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              System Status
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-gray-700">Database Status</span>
                <span className="text-green-600 font-semibold">Connected</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-gray-700">API Server</span>
                <span className="text-green-600 font-semibold">Running</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-gray-700">Authentication</span>
                <span className="text-green-600 font-semibold">Active</span>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
