"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import PermissionGuard from "@/components/PermissionGuard";
import Modal from "@/components/Modal";
import CourseForm, { CourseFormData } from "@/components/CourseForm";
import DeleteConfirmation from "@/components/DeleteConfirmation";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/lib/apiClient";
import { adminSidebarItems } from "@/config/sidebarConfig";
import { LayoutDashboard, Plus, Edit2, Trash2, Search } from "lucide-react";
import { Course } from "@/types";
import toast from "react-hot-toast";

export default function CoursesList() {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAcademicYear, setCurrentAcademicYear] = useState<string>("default");

  useEffect(() => {
    fetchCourses();
    fetchTeachers();
    fetchCurrentAcademicYear();
  }, [user]);

  const fetchCurrentAcademicYear = async () => {
    try {
      if (!user?.branch_id) return;
      const response = await apiClient.getCurrentAcademicYear(user.branch_id);
      if (response.success && response.data) {
        setCurrentAcademicYear((response.data as { id: string }).id);
      }
    } catch (error) {
      console.error("Error fetching academic year:", error);
      // Keep using "default" if fetch fails
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getCourses(currentAcademicYear);
      setCourses(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      if (!user?.branch_id) return;
      const response = await apiClient.getTeachers(user.branch_id);
      setTeachers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  const handleCreateCourse = async (formData: CourseFormData) => {
    setIsLoading(true);
    try {
      const response = await apiClient.createCourse({
        ...formData,
        branch_id: user?.branch_id,
        academic_year_id: currentAcademicYear,
      });

      if (response.success) {
        toast.success("Course created successfully");
        setShowAddModal(false);
        await fetchCourses();
      } else {
        toast.error(response.message || "Failed to create course");
      }
    } catch (error: any) {
      console.error("Error creating course:", error);
      toast.error(error.response?.data?.message || "Failed to create course");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCourse = async (formData: CourseFormData) => {
    if (!selectedCourse) return;
    setIsLoading(true);
    try {
      const response = await apiClient.updateCourse(selectedCourse.id, formData);

      if (response.success) {
        toast.success("Course updated successfully");
        setShowEditModal(false);
        setSelectedCourse(null);
        await fetchCourses();
      } else {
        toast.error(response.message || "Failed to update course");
      }
    } catch (error: any) {
      console.error("Error updating course:", error);
      toast.error(error.response?.data?.message || "Failed to update course");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;
    setIsLoading(true);
    try {
      const response = await apiClient.deleteCourse(selectedCourse.id);

      if (response.success) {
        toast.success("Course deleted successfully");
        setShowDeleteModal(false);
        setSelectedCourse(null);
        await fetchCourses();
      } else {
        toast.error(response.message || "Failed to delete course");
      }
    } catch (error: any) {
      console.error("Error deleting course:", error);
      toast.error(error.response?.data?.message || "Failed to delete course");
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (course: Course) => {
    setSelectedCourse(course);
    setShowEditModal(true);
  };

  const openDeleteModal = (course: Course) => {
    setSelectedCourse(course);
    setShowDeleteModal(true);
  };

  const convertToFormData = (course: Course): CourseFormData => {
    return {
      id: course.id,
      branch_id: user?.branch_id || "",
      course_code: course.course_code,
      course_name: course.course_name,
      description: course.description || "",
      academic_year_id: course.academic_year_id || currentAcademicYear,
      grade_level_id: course.grade_level_id,
      teacher_id: course.teacher_id,
      max_students: course.max_students,
      room_number: course.room_number,
      schedule: course.schedule,
      credits: course.credits,
    };
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
      label: "Teachers",
      href: "/dashboard/admin/teachers",
      icon: <LayoutDashboard size={20} />,
    },
  ];

  const filteredCourses = courses.filter(
    (course) =>
      course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.teacher_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <DashboardLayout title="Courses Management" sidebarItems={adminSidebarItems}>
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
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <PermissionGuard permission="manage_courses">
              <button
                onClick={() => setShowAddModal(true)}
                className="ml-4 flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus size={20} />
                <span>Add Course</span>
              </button>
            </PermissionGuard>
          </div>

          {/* Courses Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No courses found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Course Code
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Course Name
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Teacher
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Grade Level
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Students
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredCourses.map((course) => (
                      <tr
                        key={course.id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                          {course.course_code}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {course.course_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {course.teacher_name || "Not Assigned"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {course.grade_level_id || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {course.enrolled_students || 0}/{course.max_students || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-right space-x-2 flex justify-end">
                          <button
                            onClick={() => openEditModal(course)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(course)}
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

        {/* Add Course Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add New Course"
          size="lg"
        >
          <CourseForm
            onSubmit={handleCreateCourse}
            onCancel={() => setShowAddModal(false)}
            isLoading={isLoading}
            teachers={teachers}
          />
        </Modal>

        {/* Edit Course Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCourse(null);
          }}
          title="Edit Course"
          size="lg"
        >
          {selectedCourse && (
            <CourseForm
              initialData={convertToFormData(selectedCourse)}
              onSubmit={handleUpdateCourse}
              onCancel={() => {
                setShowEditModal(false);
                setSelectedCourse(null);
              }}
              isLoading={isLoading}
              teachers={teachers}
            />
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmation
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedCourse(null);
          }}
          onConfirm={handleDeleteCourse}
          title="Delete Course"
          message="Are you sure you want to delete this course? This action cannot be undone."
          itemName={
            selectedCourse
              ? `${selectedCourse.course_code} - ${selectedCourse.course_name}`
              : ""
          }
          isLoading={isLoading}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
