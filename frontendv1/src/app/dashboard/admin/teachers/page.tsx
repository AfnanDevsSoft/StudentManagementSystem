"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/lib/apiClient";
import { LayoutDashboard, Plus, Edit2, Trash2, Search } from "lucide-react";
import { Teacher } from "@/types";
import toast from "react-hot-toast";

export default function TeachersList() {
  const { user } = useAuthStore();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  useEffect(() => {
    fetchTeachers();
  }, [user]);

  const fetchTeachers = async () => {
    try {
      if (!user?.branch_id) return;
      const response = await apiClient.getTeachers(user.branch_id);
      setTeachers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast.error("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  const sidebarItems = [
    {
      label: "Dashboard",
      href: "/dashboard/admin",
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: "Students",
      href: "/dashboard/admin/students",
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: "Courses",
      href: "/dashboard/admin/courses",
      icon: <LayoutDashboard size={20} />,
    },
  ];

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.employee_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setShowModal(true);
  };

  const handleDelete = async (teacherId: string) => {
    if (window.confirm("Are you sure you want to delete this teacher?")) {
      try {
        // TODO: Implement delete endpoint
        toast.success("Teacher deleted successfully");
        await fetchTeachers();
      } catch (error) {
        toast.error("Failed to delete teacher");
      }
    }
  };

  const handleAddTeacher = () => {
    setEditingTeacher(null);
    setShowModal(true);
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Teachers Management" sidebarItems={sidebarItems}>
        <div className="space-y-6">
          {/* Header with Add Button */}
          <div className="flex justify-between items-center">
            <div className="flex-1">
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
            <button
              onClick={handleAddTeacher}
              className="ml-4 flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={20} />
              <span>Add Teacher</span>
            </button>
          </div>

          {/* Teachers Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : filteredTeachers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No teachers found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Employee Code
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Designation
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
                        <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                          {teacher.employee_code}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {teacher.first_name} {teacher.last_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {teacher.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {teacher.department}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {teacher.designation}
                        </td>
                        <td className="px-6 py-4 text-sm text-right space-x-2 flex justify-end">
                          <button
                            onClick={() => handleEdit(teacher)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(teacher.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
