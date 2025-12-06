"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/lib/apiClient";
import { LayoutDashboard, Plus, Save, X, Calendar } from "lucide-react";
import { AttendanceRecord } from "@/types";
import toast from "react-hot-toast";

export default function AttendancePage() {
  const { user } = useAuthStore();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [courseId, setCourseId] = useState("");
  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    fetchCourses();
  }, [user]);

  useEffect(() => {
    if (courseId) {
      fetchCourseStudents(courseId);
    }
  }, [courseId]);

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

  const fetchCourseStudents = async (cId: string) => {
    try {
      // Fetch enrolled students for this course
      const response = await apiClient.getStudents(undefined, {
        courseId: cId,
      });
      const courseStudents = Array.isArray(response.data)
        ? response.data.map((student: any) => ({
          id: student.id,
          name:
            `${student.first_name} ${student.last_name}` ||
            "Unknown Student",
          status: "present",
        }))
        : [];
      setStudents(courseStudents);
    } catch (error) {
      console.error("Error fetching course students:", error);
      toast.error("Failed to load course students");
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
      label: "Grades",
      href: "/dashboard/teacher/grades",
      icon: <LayoutDashboard size={20} />,
    },
  ];

  const handleStatusChange = (
    studentId: string,
    status: "present" | "absent" | "late" | "half-day"
  ) => {
    setStudents(
      students.map((student) =>
        student.id === studentId ? { ...student, status } : student
      )
    );
  };

  const handleSubmit = async () => {
    if (!courseId || !selectedDate) {
      toast.error("Please select a course and date");
      return;
    }

    if (students.length === 0) {
      toast.error("No students to mark attendance for");
      return;
    }

    try {
      // Format attendance data for API
      const attendanceData = students.map((student) => ({
        student_id: student.id,
        course_id: courseId,
        attendance_date: selectedDate,
        status: student.status,
        remarks: "",
      }));

      const response = await apiClient.markAttendance({
        course_id: courseId,
        attendance_date: selectedDate,
        attendance_records: attendanceData,
      });

      if (response.success) {
        toast.success("Attendance marked successfully");
        // Reset students to default "present" status after successful submission
        setStudents(
          students.map((student) => ({ ...student, status: "present" }))
        );
      } else {
        toast.error(response.message || "Failed to mark attendance");
      }
    } catch (error: any) {
      console.error("Error marking attendance:", error);
      toast.error(error.response?.data?.message || "Failed to mark attendance");
    }
  };

  const presentCount = students.filter((s) => s.status === "present").length;
  const absentCount = students.filter((s) => s.status === "absent").length;
  const lateCount = students.filter((s) => s.status === "late").length;
  const halfDayCount = students.filter((s) => s.status === "half-day").length;

  return (
    <ProtectedRoute>
      <DashboardLayout title="Mark Attendance" sidebarItems={sidebarItems}>
        <div className="space-y-6">
          {/* Course Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Select Course
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course
                </label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a course...</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.course_name} ({course.course_code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Plus size={20} />
                  <span>Quick Mark</span>
                </button>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600">
                {courseId
                  ? `Showing ${students.length} students in selected course`
                  : "Select a course to mark attendance"}
              </p>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm">Present</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {presentCount}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {((presentCount / students.length) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm">Absent</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {absentCount}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {((absentCount / students.length) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm">Late</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {lateCount}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {((lateCount / students.length) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm">Half Day</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {halfDayCount}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {((halfDayCount / students.length) * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Attendance - {selectedDate}
                </h3>
                <button
                  onClick={handleSubmit}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <Save size={18} />
                  <span>Save Attendance</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : students.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No students in this class
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Student Name
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {students.map((student) => (
                      <tr
                        key={student.id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {student.name}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${student.status === "present"
                                ? "bg-green-100 text-green-800"
                                : student.status === "absent"
                                  ? "bg-red-100 text-red-800"
                                  : student.status === "late"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-orange-100 text-orange-800"
                              }`}
                          >
                            {student.status.charAt(0).toUpperCase() +
                              student.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm space-x-2 flex">
                          <button
                            onClick={() =>
                              handleStatusChange(student.id, "present")
                            }
                            className={`px-3 py-1 rounded text-xs font-medium transition ${student.status === "present"
                                ? "bg-green-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(student.id, "absent")
                            }
                            className={`px-3 py-1 rounded text-xs font-medium transition ${student.status === "absent"
                                ? "bg-red-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                          >
                            Absent
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(student.id, "late")
                            }
                            className={`px-3 py-1 rounded text-xs font-medium transition ${student.status === "late"
                                ? "bg-yellow-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                          >
                            Late
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(student.id, "half-day")
                            }
                            className={`px-3 py-1 rounded text-xs font-medium transition ${student.status === "half-day"
                                ? "bg-orange-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                          >
                            Half-day
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
