"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/lib/apiClient";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { superadminSidebarItems } from "@/config/sidebarConfig";
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";

interface ChartDataPoint {
  label: string;
  value: number;
}

interface GradePerformance {
  grade: string;
  average: number;
}

interface SubjectPerformance {
  subject: string;
  pass: number;
  fail: number;
}

interface TopPerformer {
  name: string;
  grade: string;
  average: number;
}

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">(
    "month"
  );
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [user, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getAnalyticsDashboard(
        user?.branch_id || "default"
      );
      setAnalyticsData(response.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics");
      // Use default empty data on error
      setAnalyticsData({});
    } finally {
      setLoading(false);
    }
  };


  // Enrollment Trend - Use API data with fallback
  const enrollmentTrend: ChartDataPoint[] =
    analyticsData?.enrollmentTrend || [
      { label: "Jan", value: 0 },
      { label: "Feb", value: 0 },
      { label: "Mar", value: 0 },
      { label: "Apr", value: 0 },
      { label: "May", value: 0 },
      { label: "Jun", value: 0 },
    ];

  // Performance by Grade - Use API data with fallback
  const performanceByGrade: GradePerformance[] = analyticsData?.performanceByGrade || [
    { grade: "9", average: 0 },
    { grade: "10", average: 0 },
    { grade: "11", average: 0 },
    { grade: "12", average: 0 },
  ];

  // Subject Performance - Use API data with fallback
  const subjectPerformance: SubjectPerformance[] = analyticsData?.subjectPerformance || [
    { subject: "Mathematics", pass: 0, fail: 0 },
    { subject: "English", pass: 0, fail: 0 },
    { subject: "Science", pass: 0, fail: 0 },
    { subject: "Social Studies", pass: 0, fail: 0 },
  ];

  // Top Performers - Use API data with fallback
  const topPerformers: TopPerformer[] = analyticsData?.topPerformers || [
    { name: "N/A", grade: "-", average: 0 },
    { name: "N/A", grade: "-", average: 0 },
    { name: "N/A", grade: "-", average: 0 },
    { name: "N/A", grade: "-", average: 0 },
  ];

  // Stats - Use API data with fallback
  const stats = [
    {
      label: "Total Enrollment",
      value: analyticsData?.totalEnrollment || "0",
      change: analyticsData?.enrollmentChange || "0%",
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Avg Performance",
      value: analyticsData?.avgPerformance || "0%",
      change: analyticsData?.performanceChange || "0%",
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Pass Rate",
      value: analyticsData?.passRate || "0%",
      change: analyticsData?.passRateChange || "0%",
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "Attendance Rate",
      value: analyticsData?.attendanceRate || "0%",
      change: analyticsData?.attendanceChange || "0%",
      color: "bg-orange-100 text-orange-600",
    },
  ];

  const getMaxValue = (data: ChartDataPoint[]) => {
    return Math.max(...data.map((d) => d.value));
  };

  const maxEnrollment = getMaxValue(enrollmentTrend);

  return (
    <ProtectedRoute>
      <DashboardLayout title="Analytics & Reports" sidebarItems={superadminSidebarItems}>
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">{stat.label}</p>
                <p className={`text-3xl font-bold mt-2 ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-green-600 text-xs mt-2">
                  {stat.change} from last month
                </p>
              </div>
            ))}
          </div>

          {/* Time Range Selector */}
          <div className="flex space-x-2">
            {(["week", "month", "year"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition ${timeRange === range
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400"
                  }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enrollment Trend */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <LineChart size={20} className="text-blue-600" />
                <span>Enrollment Trend</span>
              </h3>
              <div className="space-y-4">
                {enrollmentTrend.map((point) => (
                  <div key={point.label} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{point.label}</span>
                      <span className="font-semibold text-gray-900">
                        {point.value}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition"
                        style={{
                          width: `${(point.value / maxEnrollment) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance by Grade */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <BarChart3 size={20} className="text-green-600" />
                <span>Performance by Grade</span>
              </h3>
              <div className="space-y-4">
                {performanceByGrade.map((item) => (
                  <div key={item.grade} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Grade {item.grade}</span>
                      <span className="font-semibold text-gray-900">
                        {item.average}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition"
                        style={{ width: `${item.average}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subject Performance */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <PieChart size={20} className="text-purple-600" />
                <span>Subject Performance</span>
              </h3>
              <div className="space-y-3">
                {subjectPerformance.map((item) => (
                  <div key={item.subject} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.subject}</span>
                      <span className="text-xs text-gray-500">
                        {item.pass}% pass
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 flex overflow-hidden">
                      <div
                        className="bg-green-500"
                        style={{ width: `${item.pass}%` }}
                      ></div>
                      <div
                        className="bg-red-500"
                        style={{ width: `${item.fail}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex space-x-4 mt-4 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Pass</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-gray-600">Fail</span>
                </div>
              </div>
            </div>

            {/* Top Performers */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <TrendingUp size={20} className="text-orange-600" />
                <span>Top Performers</span>
              </h3>
              <div className="space-y-3">
                {topPerformers.map((performer, index) => (
                  <div
                    key={performer.name}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {performer.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          Grade {performer.grade}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {performer.average}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
