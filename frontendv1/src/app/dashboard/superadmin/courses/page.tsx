"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/lib/apiClient";
import { superadminSidebarItems } from "@/config/sidebarConfig";
import {
  BookOpen,
  Search,
  Plus,
  Edit2,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { Course } from "@/types";

export default function CoursesPage() {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGrade, setFilterGrade] = useState("all");

  useEffect(() => {
    fetchCourses();
  }, [user]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getCourses();
      setCourses(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.teacher_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGrade =
      filterGrade === "all" || course.grade_level === filterGrade;

    return matchesSearch && matchesGrade;
  });

  const grades = [...new Set(courses.map((c) => c.grade_level))].sort();


  const stats = [
    {
      label: "Total Courses",
      value: courses.length,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Total Students",
      value: courses.reduce((sum, c) => sum + c.enrolled_students, 0),
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Avg Class Size",
      value:
        courses.length > 0
          ? Math.round(
            courses.reduce((sum, c) => sum + c.enrolled_students, 0) /
            courses.length
          )
          : 0,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "Grades",
      value: grades.length,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <ProtectedRoute>
      <DashboardLayout title="Courses Management" sidebarItems={superadminSidebarItems}>
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">{stat.label}</p>
                <p className={`text - 3xl font - bold mt - 2 ${stat.color} `}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Filters */}
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
                    placeholder="Search courses..."
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
                {grades.map((grade) => (
                  <option key={grade} value={grade}>
                    Grade {grade}
                  </option>
                ))}
              </select>
              <div></div>
            </div>

            <div className="mt-4 flex justify-end">
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                <Plus size={18} />
                <span>Add Course</span>
              </button>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs font-mono text-gray-500">
                        {course.course_code}
                      </p>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {course.course_name}
                      </h3>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">
                    {course.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div>
                      <p className="text-gray-500">Grade</p>
                      <p className="font-semibold text-gray-900">
                        {course.grade_level}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Enrolled</p>
                      <p className="font-semibold text-gray-900">
                        {course.enrolled_students}/{course.max_students}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Teacher</p>
                      <p className="font-semibold text-gray-900">
                        {course.teacher_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Room</p>
                      <p className="font-semibold text-gray-900">
                        {course.room_number || "TBA"}
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-4 border-t">
                    <button className="flex-1 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition flex items-center justify-center space-x-1">
                      <Edit2 size={16} />
                      <span className="text-sm">Edit</span>
                    </button>
                    <button className="flex-1 p-2 text-red-600 hover:bg-red-50 rounded-lg transition flex items-center justify-center space-x-1">
                      <Trash2 size={16} />
                      <span className="text-sm">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No courses found
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
