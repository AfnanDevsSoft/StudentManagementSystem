"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { LayoutDashboard, BookOpen, Search, Plus, Edit2, Trash2 } from "lucide-react";

interface CourseData {
  id: string;
  courseCode: string;
  courseName: string;
  grade: string;
  teacher: string;
  credits: number;
  duration: string;
  students: number;
  status: "active" | "inactive" | "archived";
  description: string;
}

const SAMPLE_COURSES: CourseData[] = [
  {
    id: "1",
    courseCode: "MATH101",
    courseName: "Algebra Fundamentals",
    grade: "9",
    teacher: "Muhammad Ali",
    credits: 3,
    duration: "45 hours",
    students: 32,
    status: "active",
    description: "Basic algebra concepts and equations",
  },
  {
    id: "2",
    courseCode: "ENG101",
    courseName: "English Literature",
    grade: "9",
    teacher: "Ayesha Khan",
    credits: 3,
    duration: "40 hours",
    students: 28,
    status: "active",
    description: "Classic and modern literature analysis",
  },
  {
    id: "3",
    courseCode: "SCI101",
    courseName: "General Science",
    grade: "9",
    teacher: "Dr. Hassan",
    credits: 4,
    duration: "50 hours",
    students: 35,
    status: "active",
    description: "Physics, Chemistry, and Biology basics",
  },
];

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseData[]>(SAMPLE_COURSES);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGrade, setFilterGrade] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.teacher.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGrade = filterGrade === "all" || course.grade === filterGrade;
    const matchesStatus = filterStatus === "all" || course.status === filterStatus;

    return matchesSearch && matchesGrade && matchesStatus;
  });

  const grades = [...new Set(courses.map((c) => c.grade))].sort();

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-yellow-100 text-yellow-800",
      archived: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const sidebarItems = [
    {
      label: "Dashboard",
      href: "/dashboard/superadmin",
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: "Courses",
      href: "/dashboard/superadmin/courses",
      icon: <BookOpen size={20} />,
    },
  ];

  const stats = [
    {
      label: "Total Courses",
      value: courses.length,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Active",
      value: courses.filter((c) => c.status === "active").length,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Total Students",
      value: courses.reduce((sum, c) => sum + c.students, 0),
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
      <DashboardLayout title="Courses Management" sidebarItems={sidebarItems}>
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">{stat.label}</p>
                <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={20} />
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
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
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
                      <p className="text-xs font-mono text-gray-500">{course.courseCode}</p>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {course.courseName}
                      </h3>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        course.status
                      )}`}
                    >
                      {course.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{course.description}</p>

                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div>
                      <p className="text-gray-500">Grade</p>
                      <p className="font-semibold text-gray-900">{course.grade}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Credits</p>
                      <p className="font-semibold text-gray-900">{course.credits}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Teacher</p>
                      <p className="font-semibold text-gray-900">{course.teacher}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Students</p>
                      <p className="font-semibold text-gray-900">{course.students}</p>
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
