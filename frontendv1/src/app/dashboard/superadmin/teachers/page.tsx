"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  LayoutDashboard,
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
} from "lucide-react";

interface TeacherData {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  qualifications: string;
  yearsOfExperience: number;
  status: "active" | "inactive";
  coursesAssigned: number;
}

const SAMPLE_TEACHERS: TeacherData[] = [
  {
    id: "1",
    employeeCode: "TEA001",
    firstName: "Muhammad",
    lastName: "Ali",
    email: "m.ali@school.edu",
    phone: "+92-300-1111111",
    department: "Mathematics",
    designation: "Senior Teacher",
    qualifications: "M.Sc Mathematics",
    yearsOfExperience: 8,
    status: "active",
    coursesAssigned: 4,
  },
  {
    id: "2",
    employeeCode: "TEA002",
    firstName: "Ayesha",
    lastName: "Khan",
    email: "ayesha.khan@school.edu",
    phone: "+92-300-2222222",
    department: "English",
    designation: "Teacher",
    qualifications: "M.A English",
    yearsOfExperience: 5,
    status: "active",
    coursesAssigned: 3,
  },
];

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<TeacherData[]>(SAMPLE_TEACHERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("all");

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.employeeCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept =
      filterDept === "all" || teacher.department === filterDept;

    return matchesSearch && matchesDept;
  });

  const departments = [...new Set(teachers.map((t) => t.department))];

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const sidebarItems = [
    {
      label: "Dashboard",
      href: "/dashboard/superadmin",
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: "Teachers",
      href: "/dashboard/superadmin/teachers",
      icon: <Users size={20} />,
    },
  ];

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
      <DashboardLayout title="Teachers Management" sidebarItems={sidebarItems}>
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
                  {filteredTeachers.map((teacher) => (
                    <tr
                      key={teacher.id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 text-sm font-mono text-gray-900">
                        {teacher.employeeCode}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {teacher.firstName} {teacher.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {teacher.department}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {teacher.designation}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {teacher.yearsOfExperience} years
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {teacher.qualifications}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                          {teacher.coursesAssigned}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            teacher.status
                          )}`}
                        >
                          {teacher.status.charAt(0).toUpperCase() +
                            teacher.status.slice(1)}
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
