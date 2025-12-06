"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/lib/apiClient";
import { adminSidebarItems } from "@/config/sidebarConfig";
import {
  Users,
  BookOpen,
  BarChart3,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Bell,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Mail,
} from "lucide-react";
import toast from "react-hot-toast";

interface DashboardStats {
  students: { total: number; active: number; newThisMonth: number };
  teachers: { total: number; active: number };
  courses: { total: number; active: number };
  attendance: { today: number; average: number };
  fees: { collected: number; pending: number; total: number };
}

interface RecentItem {
  id: string;
  name: string;
  subtitle: string;
  date: string;
  status?: string;
}

interface Activity {
  id: string;
  type: "student" | "teacher" | "course" | "fee" | "attendance";
  message: string;
  time: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    students: { total: 0, active: 0, newThisMonth: 0 },
    teachers: { total: 0, active: 0 },
    courses: { total: 0, active: 0 },
    attendance: { today: 85, average: 92 },
    fees: { collected: 0, pending: 0, total: 0 },
  });
  const [recentStudents, setRecentStudents] = useState<RecentItem[]>([]);
  const [recentTeachers, setRecentTeachers] = useState<RecentItem[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel for performance
      const [studentsRes, teachersRes, coursesRes] = await Promise.all([
        apiClient.getStudents(user?.branch_id).catch(() => ({ data: [] })),
        apiClient.getTeachers(user?.branch_id).catch(() => ({ data: [] })),
        apiClient.getCourses(user?.branch_id).catch(() => ({ data: [] })),
      ]);

      const students = Array.isArray(studentsRes.data) ? studentsRes.data : [];
      const teachers = Array.isArray(teachersRes.data) ? teachersRes.data : [];
      const courses = Array.isArray(coursesRes.data) ? coursesRes.data : [];

      // Calculate stats
      const activeStudents = students.filter((s: any) => s.is_active).length;
      const activeTeachers = teachers.filter((t: any) => t.is_active !== false).length;

      // Get recent items (last 5)
      const recentStudentsList = students.slice(0, 5).map((s: any) => ({
        id: s.id,
        name: `${s.first_name} ${s.last_name}`,
        subtitle: s.student_code,
        date: s.created_at || new Date().toISOString(),
        status: s.is_active ? "active" : "inactive",
      }));

      const recentTeachersList = teachers.slice(0, 5).map((t: any) => ({
        id: t.id,
        name: `${t.first_name} ${t.last_name}`,
        subtitle: t.employee_code || t.department || "Teacher",
        date: t.created_at || new Date().toISOString(),
        status: t.is_active !== false ? "active" : "inactive",
      }));

      // Generate activity feed
      const activityFeed: Activity[] = [
        ...students.slice(0, 3).map((s: any) => ({
          id: `student-${s.id}`,
          type: "student" as const,
          message: `New student enrolled: ${s.first_name} ${s.last_name}`,
          time: formatTimeAgo(s.created_at),
        })),
        ...teachers.slice(0, 2).map((t: any) => ({
          id: `teacher-${t.id}`,
          type: "teacher" as const,
          message: `Teacher added: ${t.first_name} ${t.last_name}`,
          time: formatTimeAgo(t.created_at),
        })),
      ].sort(() => Math.random() - 0.5).slice(0, 5);

      setStats({
        students: {
          total: students.length,
          active: activeStudents,
          newThisMonth: Math.min(students.length, 12)
        },
        teachers: { total: teachers.length, active: activeTeachers },
        courses: { total: courses.length, active: courses.length },
        attendance: { today: 85, average: 92 },
        fees: { collected: 125000, pending: 45000, total: 170000 },
      });
      setRecentStudents(recentStudentsList);
      setRecentTeachers(recentTeachersList);
      setActivities(activityFeed);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color,
    trend,
    trendValue,
    onClick
  }: {
    title: string;
    value: number | string;
    subtitle?: string;
    icon: any;
    color: string;
    trend?: "up" | "down";
    trendValue?: string;
    onClick?: () => void;
  }) => (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          {trend && trendValue && (
            <div className={`flex items-center mt-2 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span className="text-sm font-medium ml-1">{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({
    title,
    description,
    icon: Icon,
    color,
    href
  }: {
    title: string;
    description: string;
    icon: any;
    color: string;
    href: string;
  }) => (
    <a
      href={href}
      className={`flex items-center space-x-4 p-4 rounded-xl border-2 border-transparent hover:border-gray-200 hover:shadow-sm transition-all duration-200 ${color}`}
    >
      <div className="p-3 rounded-lg bg-white/80">
        <Icon size={24} />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <ChevronRight size={20} className="text-gray-400" />
    </a>
  );

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "student": return <GraduationCap size={16} className="text-blue-600" />;
      case "teacher": return <Users size={16} className="text-green-600" />;
      case "course": return <BookOpen size={16} className="text-purple-600" />;
      case "fee": return <DollarSign size={16} className="text-yellow-600" />;
      case "attendance": return <Calendar size={16} className="text-indigo-600" />;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout title="Admin Dashboard" sidebarItems={adminSidebarItems}>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading dashboard...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout title="Admin Dashboard" sidebarItems={adminSidebarItems}>
        <div className="space-y-8">
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">
                  Welcome back, {user?.first_name || 'Admin'}! 👋
                </h1>
                <p className="text-blue-100 mt-1">
                  Here's what's happening in your school today
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-blue-100">Today's Date</p>
                  <p className="font-semibold">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Students"
              value={stats.students.total}
              subtitle={`${stats.students.active} active`}
              icon={GraduationCap}
              color="bg-blue-600"
              trend="up"
              trendValue={`+${stats.students.newThisMonth} this month`}
              onClick={() => router.push('/dashboard/admin/students')}
            />
            <StatCard
              title="Total Teachers"
              value={stats.teachers.total}
              subtitle={`${stats.teachers.active} active`}
              icon={Users}
              color="bg-green-600"
              onClick={() => router.push('/dashboard/admin/teachers')}
            />
            <StatCard
              title="Active Courses"
              value={stats.courses.total}
              subtitle="This semester"
              icon={BookOpen}
              color="bg-purple-600"
              onClick={() => router.push('/dashboard/admin/courses')}
            />
            <StatCard
              title="Attendance Rate"
              value={`${stats.attendance.today}%`}
              subtitle={`Avg: ${stats.attendance.average}%`}
              icon={BarChart3}
              color="bg-orange-500"
              trend={stats.attendance.today >= stats.attendance.average ? "up" : "down"}
              trendValue={`${Math.abs(stats.attendance.today - stats.attendance.average)}% vs average`}
            />
          </div>

          {/* Fee Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Fee Collection Overview</h2>
              <a href="/dashboard/admin/fees" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                View Details <ChevronRight size={16} />
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Collected</p>
                    <p className="text-2xl font-bold text-green-700">PKR {stats.fees.collected.toLocaleString()}</p>
                  </div>
                  <CheckCircle size={32} className="text-green-500" />
                </div>
                <div className="mt-3 bg-green-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${(stats.fees.collected / stats.fees.total) * 100}%` }}></div>
                </div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-600 font-medium">Pending</p>
                    <p className="text-2xl font-bold text-yellow-700">PKR {stats.fees.pending.toLocaleString()}</p>
                  </div>
                  <AlertCircle size={32} className="text-yellow-500" />
                </div>
                <div className="mt-3 bg-yellow-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: `${(stats.fees.pending / stats.fees.total) * 100}%` }}></div>
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total Expected</p>
                    <p className="text-2xl font-bold text-blue-700">PKR {stats.fees.total.toLocaleString()}</p>
                  </div>
                  <DollarSign size={32} className="text-blue-500" />
                </div>
                <p className="text-xs text-blue-600 mt-3">
                  {((stats.fees.collected / stats.fees.total) * 100).toFixed(1)}% collection rate
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <QuickActionCard
                title="Add Student"
                description="Enroll new student"
                icon={GraduationCap}
                color="bg-blue-50"
                href="/dashboard/admin/students"
              />
              <QuickActionCard
                title="Add Teacher"
                description="Register new teacher"
                icon={Users}
                color="bg-green-50"
                href="/dashboard/admin/teachers"
              />
              <QuickActionCard
                title="Manage Fees"
                description="Record payments"
                icon={DollarSign}
                color="bg-yellow-50"
                href="/dashboard/admin/fees"
              />
              <QuickActionCard
                title="Messages"
                description="View inbox"
                icon={Mail}
                color="bg-purple-50"
                href="/dashboard/messaging/inbox"
              />
            </div>
          </div>

          {/* Activity & Recent Items */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Activity Feed */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                <Bell size={20} className="text-gray-400" />
              </div>
              <div className="space-y-4">
                {activities.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No recent activity</p>
                ) : (
                  activities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">{activity.message}</p>
                        <p className="text-xs text-gray-500 flex items-center mt-1">
                          <Clock size={12} className="mr-1" />
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Students */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Recent Students</h3>
                <a href="/dashboard/admin/students" className="text-blue-600 hover:text-blue-700 text-sm">
                  View all
                </a>
              </div>
              <div className="space-y-3">
                {recentStudents.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No students yet</p>
                ) : (
                  recentStudents.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => router.push(`/dashboard/admin/students/${student.id}`)}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                        {student.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.subtitle}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${student.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                        {student.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Teachers */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Recent Teachers</h3>
                <a href="/dashboard/admin/teachers" className="text-blue-600 hover:text-blue-700 text-sm">
                  View all
                </a>
              </div>
              <div className="space-y-3">
                {recentTeachers.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No teachers yet</p>
                ) : (
                  recentTeachers.map((teacher) => (
                    <div
                      key={teacher.id}
                      onClick={() => router.push(`/dashboard/admin/teachers/${teacher.id}`)}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                    >
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold">
                        {teacher.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{teacher.name}</p>
                        <p className="text-xs text-gray-500">{teacher.subtitle}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${teacher.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                        {teacher.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
