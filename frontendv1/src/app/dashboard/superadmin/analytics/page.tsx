"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  LayoutDashboard,
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
} from "lucide-react";

interface ChartDataPoint {
  label: string;
  value: number;
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">(
    "month"
  );

  const sidebarItems = [
    {
      label: "Dashboard",
      href: "/dashboard/superadmin",
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: "Analytics",
      href: "/dashboard/superadmin/analytics",
      icon: <BarChart3 size={20} />,
    },
  ];

  // Sample data for charts
  const enrollmentTrend: ChartDataPoint[] = [
    { label: "Jan", value: 245 },
    { label: "Feb", value: 312 },
    { label: "Mar", value: 278 },
    { label: "Apr", value: 389 },
    { label: "May", value: 412 },
    { label: "Jun", value: 456 },
  ];

  const performanceByGrade = [
    { grade: "9", average: 78 },
    { grade: "10", average: 82 },
    { grade: "11", average: 85 },
    { grade: "12", average: 88 },
  ];

  const subjectPerformance = [
    { subject: "Mathematics", pass: 85, fail: 15 },
    { subject: "English", pass: 88, fail: 12 },
    { subject: "Science", pass: 82, fail: 18 },
    { subject: "Social Studies", pass: 90, fail: 10 },
  ];

  const topPerformers = [
    { name: "Ahmed Ali", grade: "12", average: 94 },
    { name: "Fatima Khan", grade: "11", average: 93 },
    { name: "Hassan Shah", grade: "10", average: 91 },
    { name: "Zainab Malik", grade: "9", average: 89 },
  ];

  const stats = [
    {
      label: "Total Enrollment",
      value: "1,245",
      change: "+12%",
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Avg Performance",
      value: "85.2%",
      change: "+2.1%",
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Pass Rate",
      value: "87%",
      change: "+5%",
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "Attendance Rate",
      value: "92%",
      change: "+3%",
      color: "bg-orange-100 text-orange-600",
    },
  ];

  const getMaxValue = (data: ChartDataPoint[]) => {
    return Math.max(...data.map((d) => d.value));
  };

  const maxEnrollment = getMaxValue(enrollmentTrend);

  return (
    <ProtectedRoute>
      <DashboardLayout title="Analytics & Reports" sidebarItems={sidebarItems}>
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
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  timeRange === range
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
