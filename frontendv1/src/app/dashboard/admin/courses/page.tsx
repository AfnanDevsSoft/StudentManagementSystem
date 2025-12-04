"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/lib/apiClient";
import { LayoutDashboard, Plus, Edit2, Trash2, Search } from "lucide-react";
import { Course } from "@/types";
import toast from "react-hot-toast";

export default function CoursesList() {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, [user]);

  const fetchCourses = async () => {
    try {
      // Using default academic year - adjust based on your app logic
      const response = await apiClient.getCourses("default");
      setCourses(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load courses");
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
      label: "Teachers",
      href: "/dashboard/admin/teachers",
      icon: <LayoutDashboard size={20} />,
    },
  ];

  const filteredCourses = courses.filter(
    (course) =>
      course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.teacher_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (courseId: string) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        toast.success("Course deleted successfully");
        await fetchCourses();
      } catch (error) {
        toast.error("Failed to delete course");
      }
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Courses Management" sidebarItems={sidebarItems}>
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
            <button
              onClick={() => setShowModal(true)}
              className="ml-4 flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={20} />
              <span>Add Course</span>
            </button>
          </div>

          {/* Courses Grid */}
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No courses found
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {course.course_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {course.course_code}
                    </p>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <p>
                      <strong>Teacher:</strong> {course.teacher_name}
                    </p>
                    <p>
                      <strong>Grade Level:</strong> {course.grade_level}
                    </p>
                    <div className="flex justify-between">
                      <span>
                        <strong>Enrolled:</strong> {course.enrolled_students}
                      </span>
                      <span>
                        <strong>Max:</strong> {course.max_students}
                      </span>
                    </div>
                    {course.room_number && (
                      <p>
                        <strong>Room:</strong> {course.room_number}
                      </p>
                    )}
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${
                          (course.enrolled_students / course.max_students) * 100
                        }%`,
                      }}
                    ></div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
