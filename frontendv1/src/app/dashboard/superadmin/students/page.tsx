"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  LayoutDashboard,
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

interface StudentData {
  id: string;
  studentCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gradeLevel: string;
  status: "active" | "inactive" | "graduated";
  enrollmentDate: string;
  averageGrade: number;
}

const SAMPLE_STUDENTS: StudentData[] = [
  {
    id: "1",
    studentCode: "STU001",
    firstName: "Ali",
    lastName: "Ahmed",
    email: "ali.ahmed@school.edu",
    phone: "+92-300-1234567",
    gradeLevel: "10",
    status: "active",
    enrollmentDate: "2023-08-15",
    averageGrade: 85.5,
  },
  {
    id: "2",
    studentCode: "STU002",
    firstName: "Fatima",
    lastName: "Khan",
    email: "fatima.khan@school.edu",
    phone: "+92-300-2345678",
    gradeLevel: "9",
    status: "active",
    enrollmentDate: "2023-09-10",
    averageGrade: 92.0,
  },
  {
    id: "3",
    studentCode: "STU003",
    firstName: "Hassan",
    lastName: "Hassan",
    email: "hassan.hassan@school.edu",
    phone: "+92-300-3456789",
    gradeLevel: "11",
    status: "graduated",
    enrollmentDate: "2022-08-20",
    averageGrade: 88.5,
  },
];

export default function StudentsSuperAdminPage() {
  const [students, setStudents] = useState<StudentData[]>(SAMPLE_STUDENTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGrade, setFilterGrade] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  // Convert StudentData to StudentFormData
  const convertToFormData = (student: StudentData): StudentFormData => {
    return {
      id: student.id,
      rollNumber: student.studentCode,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone,
      dateOfBirth: "2008-01-01", // Placeholder - would come from DB
      class: student.gradeLevel,
      section: "A", // Placeholder - would come from DB
      status: student.status,
      fatherName: "N/A", // Placeholder - would come from DB
      address: "N/A", // Placeholder - would come from DB
      enrollmentDate: student.enrollmentDate,
    };
  };

  // Convert StudentFormData to StudentData
  const convertFromFormData = (
    formData: StudentFormData,
    id?: string
  ): StudentData => {
    return {
      id: id || Date.now().toString(),
      studentCode: formData.rollNumber,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      gradeLevel: formData.class,
      status: formData.status,
      enrollmentDate: formData.enrollmentDate,
      averageGrade: 85.0, // Default value - would come from grade calculations
    };
  };

  const handleAddStudent = (formData: StudentFormData) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const newStudent = convertFromFormData(formData);
      setStudents([...students, newStudent]);
      setShowAddModal(false);
      setIsLoading(false);
      toast.success("Student added successfully!");
    }, 500);
  };

  const handleEditStudent = (formData: StudentFormData) => {
    if (!selectedStudent) return;
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const updatedStudent = convertFromFormData(formData, selectedStudent.id);
      setStudents(
        students.map((s) => (s.id === selectedStudent.id ? updatedStudent : s))
      );
      setShowEditModal(false);
      setSelectedStudent(null);
      setIsLoading(false);
      toast.success("Student updated successfully!");
    }, 500);
  };

  const handleDeleteStudent = () => {
    if (!selectedStudent) return;
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setStudents(students.filter((s) => s.id !== selectedStudent.id));
      setShowDeleteModal(false);
      setSelectedStudent(null);
      setIsLoading(false);
      toast.success("Student deleted successfully!");
    }, 500);
  };

  const openEditModal = (student: StudentData) => {
    setSelectedStudent(student);
    setShowEditModal(true);
  };

  const openDeleteModal = (student: StudentData) => {
    setSelectedStudent(student);
    setShowDeleteModal(true);
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGrade =
      filterGrade === "all" || student.gradeLevel === filterGrade;
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

  const sidebarItems = [
    {
      label: "Dashboard",
      href: "/dashboard/superadmin",
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: "Students",
      href: "/dashboard/superadmin/students",
      icon: <GraduationCap size={20} />,
    },
  ];

  const stats = [
    {
      label: "Total Students",
      value: students.length,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Active",
      value: students.filter((s) => s.status === "active").length,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Graduated",
      value: students.filter((s) => s.status === "graduated").length,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "Inactive",
      value: students.filter((s) => s.status === "inactive").length,
      color: "bg-yellow-100 text-yellow-600",
    },
  ];

  return (
    <ProtectedRoute>
      <DashboardLayout title="Students Management" sidebarItems={sidebarItems}>
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
                      Grade
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Avg Grade
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
                  {filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 text-sm font-mono text-gray-900">
                        {student.studentCode}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {student.firstName} {student.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {student.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {student.phone}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        Grade {student.gradeLevel}
                      </td>
                      <td
                        className={`px-6 py-4 text-sm font-semibold ${getGradeColor(
                          student.averageGrade
                        )}`}
                      >
                        {student.averageGrade.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            student.status
                          )}`}
                        >
                          {student.status.charAt(0).toUpperCase() +
                            student.status.slice(1)}
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
              ? `${selectedStudent.firstName} ${selectedStudent.lastName}`
              : ""
          }
          isLoading={isLoading}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
