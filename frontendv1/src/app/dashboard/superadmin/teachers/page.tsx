"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/lib/apiClient";
import { superadminSidebarItems } from "@/config/sidebarConfig";
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { Teacher } from "@/types";

export default function TeachersPage() {
  const { user } = useAuthStore();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("all");

  useEffect(() => {
    fetchTeachers();
  }, [user]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getTeachers();
      setTeachers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast.error("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = teachers.filter((teacher: any) => {
    const matchesSearch =
      (teacher.first_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (teacher.last_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (teacher.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const matchesDept =
      filterDept === "all" || (teacher.specialization === filterDept);

    return matchesSearch && matchesDept;
  });

  const departments = [...new Set(teachers.map((t: any) => t.specialization).filter(Boolean))];

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };


  const stats = [
    {
      label: "Total Teachers",
      value: teachers.length,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Active",
      value: teachers.filter((t) => t.status === "active").length,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Departments",
      value: departments.length,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "Avg Experience",
      value:
        (
          teachers.reduce((sum, t) => sum + t.yearsOfExperience, 0) /
          teachers.length
        ).toFixed(1) + " yrs",
      color: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <ProtectedRoute>
      <DashboardLayout title="Teachers Management" sidebarItems={superadminSidebarItems}>
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">{stat.label}</p>
                <p className={`text-3xl font-bold mt-2 ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-3 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search teachers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 flex justify-end">
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                <Plus size={18} />
                <span>Add Teacher</span>
              </button>
            </div>
          </div>

          {/* Teachers Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Designation
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Experience
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Qualifications
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Courses
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredTeachers.map((teacher: any) => (
                    <tr
                      key={teacher.id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 text-sm font-mono text-gray-900">
                        {teacher.employee_code || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {teacher.first_name} {teacher.last_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {teacher.specialization || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {teacher.designation || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {teacher.years_of_experience || 0} years
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {teacher.qualifications || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                          0
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            "active"
                          )}`}
                        >
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right space-x-2 flex justify-end">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                          <Edit2 size={16} />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredTeachers.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No teachers found
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
