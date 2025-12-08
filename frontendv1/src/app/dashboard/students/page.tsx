"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import PermissionGuard from "@/components/PermissionGuard";
import Modal from "@/components/Modal";
import StudentForm, { StudentFormData } from "@/components/StudentForm";
import DeleteConfirmation from "@/components/DeleteConfirmation";
import Pagination from "@/components/Pagination";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/lib/apiClient";
import { adminSidebarItems } from "@/config/sidebarConfig";
import { LayoutDashboard, Plus, Edit2, Trash2, Search, Copy, Check, Key } from "lucide-react";
import { Student } from "@/types";
import toast from "react-hot-toast";

// Credentials type for displaying after user creation
interface GeneratedCredentials {
  email: string;
  password: string;
  studentName: string;
  studentCode: string;
}

export default function StudentsList() {
  const { user } = useAuthStore();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Credentials modal state
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<GeneratedCredentials | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
  }, [user]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      if (!user?.branch_id) return;
      const response = await apiClient.getStudents(user.branch_id);
      setStudents(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  // Generate a password from student data
  const generatePassword = (firstName: string, phone: string): string => {
    const cleanPhone = phone.replace(/\D/g, "");
    const phoneSuffix = cleanPhone.slice(-4) || "1234";
    const cleanFirstName = firstName.toLowerCase().replace(/[^a-z]/g, "");
    return `${cleanFirstName}@${phoneSuffix}`;
  };

  // Copy to clipboard helper
  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field} copied to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleCreateStudent = async (formData: StudentFormData) => {
    setIsLoading(true);
    try {
      // Step 1: Generate password
      const generatedPassword = generatePassword(formData.firstName, formData.phone);

      // Step 2: Create user account first
      const userData = {
        email: formData.email,
        username: formData.email, // Use email as username
        password: generatedPassword,
        first_name: formData.firstName,
        last_name: formData.lastName,
        role_id: 4, // Student role (typically 4)
        branch_id: user?.branch_id,
        is_active: true,
      };

      let userId = null;
      try {
        const userResponse = await apiClient.createUser(userData);
        if (userResponse.success && userResponse.data) {
          userId = (userResponse.data as any).id;
          console.log("User account created:", userId);
        }
      } catch (userError: any) {
        // If user creation fails (e.g., email already exists), continue without linking
        console.warn("Could not create user account:", userError.response?.data?.message || userError.message);
        // Don't throw - still create the student
      }

      // Step 3: Create student (with or without user_id)
      const studentData = {
        branch_id: user?.branch_id,
        user_id: userId, // Link to created user if available
        student_code: formData.rollNumber,
        first_name: formData.firstName,
        last_name: formData.lastName,
        personal_email: formData.email,
        personal_phone: formData.phone,
        date_of_birth: formData.dateOfBirth,
        gender: "male",
        nationality: "Pakistani",
        permanent_address: formData.address,
        city: "",
        postal_code: "",
        admission_date: formData.enrollmentDate,
        current_grade_level_id: formData.class,
        is_active: formData.status === "active",
      };

      const response = await apiClient.createStudent(studentData);

      if (response.success) {
        toast.success("Student created successfully!");
        setShowAddModal(false);

        // Show credentials modal if user was created
        if (userId) {
          setGeneratedCredentials({
            email: formData.email,
            password: generatedPassword,
            studentName: `${formData.firstName} ${formData.lastName}`,
            studentCode: formData.rollNumber,
          });
          setShowCredentialsModal(true);
        }

        await fetchStudents();
      } else {
        toast.error(response.message || "Failed to create student");
      }
    } catch (error: any) {
      console.error("Error creating student:", error);
      toast.error(error.response?.data?.message || "Failed to create student");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStudent = async (formData: StudentFormData) => {
    if (!selectedStudent) return;
    setIsLoading(true);
    try {
      // Convert camelCase form data to snake_case API format
      const apiData = {
        student_code: formData.rollNumber,
        first_name: formData.firstName,
        last_name: formData.lastName,
        personal_email: formData.email,
        personal_phone: formData.phone,
        date_of_birth: formData.dateOfBirth,
        permanent_address: formData.address,
        admission_date: formData.enrollmentDate,
        current_grade_level_id: formData.class,
        is_active: formData.status === "active",
      };

      const response = await apiClient.updateStudent(selectedStudent.id, apiData);

      if (response.success) {
        toast.success("Student updated successfully");
        setShowEditModal(false);
        setSelectedStudent(null);
        await fetchStudents();
      } else {
        toast.error(response.message || "Failed to update student");
      }
    } catch (error: any) {
      console.error("Error updating student:", error);
      toast.error(error.response?.data?.message || "Failed to update student");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;
    setIsLoading(true);
    try {
      const response = await apiClient.deleteStudent(selectedStudent.id);

      if (response.success) {
        toast.success("Student deleted successfully");
        setShowDeleteModal(false);
        setSelectedStudent(null);
        await fetchStudents();
      } else {
        toast.error(response.message || "Failed to delete student");
      }
    } catch (error: any) {
      console.error("Error deleting student:", error);
      toast.error(error.response?.data?.message || "Failed to delete student");
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (student: Student) => {
    setSelectedStudent(student);
    setShowEditModal(true);
  };

  const openDeleteModal = (student: Student) => {
    setSelectedStudent(student);
    setShowDeleteModal(true);
  };

  const convertToFormData = (student: Student): StudentFormData => {
    return {
      id: student.id,
      rollNumber: student.student_code,
      firstName: student.first_name,
      lastName: student.last_name,
      email: student.personal_email,
      phone: student.personal_phone,
      dateOfBirth: student.date_of_birth,
      class: student.current_grade_level_id || "",
      section: "",  // Not in Student type
      status: student.is_active ? "active" : "inactive",
      fatherName: "",  // Not in Student type  
      address: student.permanent_address,
      enrollmentDate: student.admission_date,
    };
  };


  const filteredStudents = students.filter(
    (student) =>
      student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginated students
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <ProtectedRoute>
      <DashboardLayout title="Students Management" sidebarItems={adminSidebarItems}>
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
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <PermissionGuard permission="manage_students">
              <button
                onClick={() => setShowAddModal(true)}
                className="ml-4 flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus size={20} />
                <span>Add Student</span>
              </button>
            </PermissionGuard>
          </div>

          {/* Students Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No students found
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                          Student Code
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
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {paginatedStudents.map((student) => (
                        <tr
                          key={student.id}
                          className="hover:bg-gray-50 transition"
                        >
                          <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                            {student.student_code}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {student.first_name} {student.last_name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {student.personal_email}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {student.personal_phone}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${student.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                                }`}
                            >
                              {student.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-right space-x-2 flex justify-end">
                            <PermissionGuard permission="manage_students">
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
                            </PermissionGuard>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredStudents.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={(items) => {
                      setItemsPerPage(items);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </>
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
            onSubmit={handleCreateStudent}
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
              onSubmit={handleUpdateStudent}
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
          message="Are you sure you want to delete this student? This action cannot be undone."
          itemName={
            selectedStudent
              ? `${selectedStudent.first_name} ${selectedStudent.last_name}`
              : ""
          }
          isLoading={isLoading}
        />

        {/* Credentials Modal - Shows after successful user creation */}
        <Modal
          isOpen={showCredentialsModal}
          onClose={() => {
            setShowCredentialsModal(false);
            setGeneratedCredentials(null);
          }}
          title="🎓 Student Account Created"
          size="md"
        >
          {generatedCredentials && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-green-800">
                  <Check size={20} />
                  <p className="font-medium">Account created successfully!</p>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  A login account has been created for this student.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                  <Key size={18} />
                  <span>Login Credentials</span>
                </h4>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Student Name</p>
                    <p className="font-medium text-gray-900">{generatedCredentials.studentName}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Student Code</p>
                    <p className="font-mono text-gray-900">{generatedCredentials.studentCode}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email (Username)</p>
                    <div className="flex items-center space-x-2">
                      <p className="font-mono text-gray-900 flex-1 bg-white px-3 py-2 rounded border">
                        {generatedCredentials.email}
                      </p>
                      <button
                        onClick={() => copyToClipboard(generatedCredentials.email, "Email")}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                      >
                        {copiedField === "Email" ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Password</p>
                    <div className="flex items-center space-x-2">
                      <p className="font-mono text-gray-900 flex-1 bg-white px-3 py-2 rounded border">
                        {generatedCredentials.password}
                      </p>
                      <button
                        onClick={() => copyToClipboard(generatedCredentials.password, "Password")}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                      >
                        {copiedField === "Password" ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Important:</strong> Please save or share these credentials with the student.
                  The password cannot be recovered later. The student should change their password after first login.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    copyToClipboard(
                      `Email: ${generatedCredentials.email}\nPassword: ${generatedCredentials.password}`,
                      "Credentials"
                    );
                  }}
                  className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition"
                >
                  Copy All
                </button>
                <button
                  onClick={() => {
                    setShowCredentialsModal(false);
                    setGeneratedCredentials(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
