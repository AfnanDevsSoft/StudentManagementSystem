"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/lib/apiClient";
import { LayoutDashboard, Plus, Save, X } from "lucide-react";
import { Grade, Course } from "@/types";
import toast from "react-hot-toast";

export default function GradesPage() {
  const { user } = useAuthStore();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [formData, setFormData] = useState({
    student_id: "",
    assessment_type: "exam",
    assessment_name: "",
    score: "",
    max_score: "100",
    weight: "1",
    remarks: "",
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch teacher's courses
      const courseResponse = await apiClient.getCourses("default");
      setCourses(Array.isArray(courseResponse.data) ? courseResponse.data : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const sidebarItems = [
    {
      label: "Dashboard",
      href: "/dashboard/teacher",
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: "My Courses",
      href: "/dashboard/teacher/courses",
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: "Attendance",
      href: "/dashboard/teacher/attendance",
      icon: <LayoutDashboard size={20} />,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.student_id ||
      !selectedCourse ||
      !formData.assessment_name ||
      !formData.score
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const response = await apiClient.createGrade({
        student_id: formData.student_id,
        course_id: selectedCourse,
        assessment_type: formData.assessment_type,
        assessment_name: formData.assessment_name,
        score: parseFloat(formData.score),
        max_score: parseFloat(formData.max_score),
        weight: parseFloat(formData.weight),
        remarks: formData.remarks,
        grade_date: new Date().toISOString(),
      });

      if (response.success) {
        toast.success("Grade saved successfully");
        setShowModal(false);
        setFormData({
          student_id: "",
          assessment_type: "exam",
          assessment_name: "",
          score: "",
          max_score: "100",
          weight: "1",
          remarks: "",
        });
        // Optionally refresh grades list if you have a fetchGrades function
        // await fetchGrades();
      } else {
        toast.error(response.message || "Failed to save grade");
      }
    } catch (error: any) {
      console.error("Error saving grade:", error);
      toast.error(error.response?.data?.message || "Failed to save grade");
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Grade Entry" sidebarItems={sidebarItems}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600">Manage and enter student grades</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={20} />
              <span>Add Grade</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm">My Courses</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {courses.length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm">Total Grades Entered</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {grades.length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm">Assessment Types</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">3</p>
            </div>
          </div>

          {/* Grades Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : grades.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No grades entered yet. Start by adding a grade.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Assessment
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Max Score
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Percentage
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {grades.map((grade) => (
                      <tr
                        key={grade.id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {grade.assessment_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                          {grade.assessment_type}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          {grade.score}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {grade.max_score}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                            {((grade.score / grade.max_score) * 100).toFixed(1)}
                            %
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(grade.grade_date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Add Grade Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Add Grade
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Course *
                    </label>
                    <select
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a course</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.course_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student ID *
                    </label>
                    <input
                      type="text"
                      value={formData.student_id}
                      onChange={(e) =>
                        setFormData({ ...formData, student_id: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter student ID"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assessment Type *
                    </label>
                    <select
                      value={formData.assessment_type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          assessment_type: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="exam">Exam</option>
                      <option value="quiz">Quiz</option>
                      <option value="assignment">Assignment</option>
                      <option value="project">Project</option>
                      <option value="participation">Participation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assessment Name *
                    </label>
                    <input
                      type="text"
                      value={formData.assessment_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          assessment_name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Midterm Exam"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Score *
                      </label>
                      <input
                        type="number"
                        value={formData.score}
                        onChange={(e) =>
                          setFormData({ ...formData, score: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Score
                      </label>
                      <input
                        type="number"
                        value={formData.max_score}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            max_score: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Remarks
                    </label>
                    <textarea
                      value={formData.remarks}
                      onChange={(e) =>
                        setFormData({ ...formData, remarks: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Additional remarks"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <Save size={18} />
                      <span>Save Grade</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
