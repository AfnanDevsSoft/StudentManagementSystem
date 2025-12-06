"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/lib/apiClient";
import { superadminSidebarItems } from "@/config/sidebarConfig";
import {
  GraduationCap,
  Search,
  Plus,
  Edit2,
  Trash2,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/Modal";
import StudentForm, { StudentFormData } from "@/components/StudentForm";
import DeleteConfirmation from "@/components/DeleteConfirmation";
import { Student } from "@/types";

export default function StudentsSuperAdminPage() {
  const { user } = useAuthStore();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGrade, setFilterGrade] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, [user]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getStudents();
      setStudents(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  // Convert StudentData to StudentFormData
  const convertToFormData = (student: any): StudentFormData => {
    return {
      id: student.id,
      rollNumber: student.roll_number || student.student_code,
      firstName: student.first_name,
      lastName: student.last_name,
      email: student.email,
      phone: student.phone,
      dateOfBirth: student.date_of_birth || "2008-01-01",
      class: student.grade,
      section: student.section || "A",
      status: student.status || "active",
      fatherName: student.father_name || "N/A",
      address: student.address || "N/A",
      enrollmentDate: student.enrollment_date || new Date().toISOString().split('T')[0],
    };
  };

  // Convert StudentFormData to StudentData
  const convertFromFormData = (
    formData: StudentFormData,
    id?: string
  ): any => {
    return {
      id: id || Date.now().toString(),
      student_code: formData.rollNumber,
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      grade: formData.class,
      status: formData.status,
      enrollment_date: formData.enrollmentDate,
    };
  };

  const handleAddStudent = async (formData: StudentFormData) => {
    setIsLoading(true);
    try {
      const newStudent = convertFromFormData(formData);
      await apiClient.createStudent(newStudent);
      toast.success("Student added successfully");
      setShowAddModal(false);
      fetchStudents();
    } catch (error) {
      console.error("Error adding student:", error);
      toast.error("Failed to add student");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditStudent = async (formData: StudentFormData) => {
    if (!selectedStudent) return;
    setIsLoading(true);
    try {
      const updatedStudent = convertFromFormData(formData, selectedStudent.id);
      await apiClient.updateStudent(selectedStudent.id, updatedStudent);
      toast.success("Student updated successfully");
      setShowEditModal(false);
      setSelectedStudent(null);
      fetchStudents();
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error("Failed to update student");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;
    setIsLoading(true);
    try {
      await apiClient.deleteStudent(selectedStudent.id);
      toast.success("Student deleted successfully");
      setShowDeleteModal(false);
      setSelectedStudent(null);
      fetchStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error("Failed to delete student");
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (student: any) => {
    setSelectedStudent(student);
    setShowEditModal(true);
  };

  const openDeleteModal = (student: any) => {
    setSelectedStudent(student);
    setShowDeleteModal(true);
  };

  const filteredStudents = students.filter((student: any) => {
    const matchesSearch =
      (student.first_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (student.last_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (student.student_code?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (student.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const matchesGrade =
      filterGrade === "all" || student.grade === filterGrade;
    const matchesStatus =
      filterStatus === "all" || student.status === filterStatus;

    return matchesSearch && matchesGrade && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-yellow-100 text-yellow-800";
      case "graduated":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return "text-green-600";
    if (grade >= 80) return "text-blue-600";
    if (grade >= 70) return "text-yellow-600";
    return "text-red-600";
  };


  const stats = [
    {
      label: "Total Students",
      value: students.length,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Active",
      value: students.filter((s: any) => s.is_active === true).length,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Enrolled",
      value: students.filter((s: any) => s.admission_status === "enrolled").length,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "Inactive",
      value: students.filter((s: any) => s.is_active === false).length,
      color: "bg-yellow-100 text-yellow-600",
    },
  ];

  return (
    <ProtectedRoute>
      <DashboardLayout title="Students Management" sidebarItems={superadminSidebarItems}>
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

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-3 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search by name, code, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Grades</option>
                <option value="9">Grade 9</option>
                <option value="10">Grade 10</option>
                <option value="11">Grade 11</option>
                <option value="12">Grade 12</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
              </select>
            </div>

            <div className="mt-4 flex justify-end space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                <FileText size={18} />
                <span>Export</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus size={18} />
                <span>Add Student</span>
              </button>
            </div>
          </div>

          {/* Students Table */}
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
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Admission Status
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
                  {filteredStudents.map((student: any) => (
                    <tr
                      key={student.id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 text-sm font-mono text-gray-900">
                        {student.student_code || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {student.first_name} {student.last_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {student.personal_email || student.user?.email || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {student.personal_phone || student.user?.phone || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${student.admission_status === 'enrolled' ? 'bg-blue-100 text-blue-800' :
                          student.admission_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            student.admission_status === 'approved' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                          }`}>
                          {student.admission_status ? student.admission_status.charAt(0).toUpperCase() + student.admission_status.slice(1) : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            student.is_active ? 'active' : 'inactive'
                          )}`}
                        >
                          {student.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right space-x-2 flex justify-end">
                        <button
                          onClick={() => openEditModal(student)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(student)}
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

            {filteredStudents.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No students found matching your criteria
              </div>
            )}
          </div>
        </div>

        {/* Add Student Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add New Student"
          size="lg"
        >
          <StudentForm
            onSubmit={handleAddStudent}
            onCancel={() => setShowAddModal(false)}
            isLoading={isLoading}
          />
        </Modal>

        {/* Edit Student Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedStudent(null);
          }}
          title="Edit Student"
          size="lg"
        >
          {selectedStudent && (
            <StudentForm
              initialData={convertToFormData(selectedStudent)}
              onSubmit={handleEditStudent}
              onCancel={() => {
                setShowEditModal(false);
                setSelectedStudent(null);
              }}
              isLoading={isLoading}
            />
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmation
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedStudent(null);
          }}
          onConfirm={handleDeleteStudent}
          title="Delete Student"
          message="Are you sure you want to delete this student? This will remove all associated records including grades and attendance."
          itemName={
            selectedStudent
              ? `${selectedStudent.first_name} ${selectedStudent.last_name}`
              : ""
          }
          isLoading={isLoading}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
