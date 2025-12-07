"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Modal from "@/components/Modal";
import TeacherForm, { TeacherFormData } from "@/components/TeacherForm";
import DeleteConfirmation from "@/components/DeleteConfirmation";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/lib/apiClient";
import { adminSidebarItems } from "@/config/sidebarConfig";
import { LayoutDashboard, Plus, Edit2, Trash2, Search, Copy, Check, Key } from "lucide-react";
import { Teacher } from "@/types";
import toast from "react-hot-toast";

// Credentials type for displaying after user creation
interface GeneratedCredentials {
  email: string;
  password: string;
  teacherName: string;
  employeeCode: string;
}

export default function TeachersList() {
  const { user } = useAuthStore();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Credentials modal state
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<GeneratedCredentials | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    fetchTeachers();
  }, [user]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
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

  // Generate a password from teacher data
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

  const handleCreateTeacher = async (formData: TeacherFormData) => {
    setIsLoading(true);
    try {
      // Step 1: Generate password
      const generatedPassword = generatePassword(formData.first_name, formData.phone);

      // Step 2: Create user account first
      const userData = {
        email: formData.email,
        username: formData.email,
        password: generatedPassword,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role_id: 3, // Teacher role (typically 3)
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
        console.warn("Could not create user account:", userError.response?.data?.message || userError.message);
      }

      // Step 3: Create teacher (with or without user_id)
      const teacherData = {
        ...formData,
        branch_id: user?.branch_id,
        user_id: userId,
      };

      const response = await apiClient.createTeacher(teacherData);

      if (response.success) {
        toast.success("Teacher created successfully!");
        setShowAddModal(false);

        // Show credentials modal if user was created
        if (userId) {
          setGeneratedCredentials({
            email: formData.email,
            password: generatedPassword,
            teacherName: `${formData.first_name} ${formData.last_name}`,
            employeeCode: formData.employee_code || "N/A",
          });
          setShowCredentialsModal(true);
        }

        await fetchTeachers();
      } else {
        toast.error(response.message || "Failed to create teacher");
      }
    } catch (error: any) {
      console.error("Error creating teacher:", error);
      toast.error(error.response?.data?.message || "Failed to create teacher");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTeacher = async (formData: TeacherFormData) => {
    if (!selectedTeacher) return;
    setIsLoading(true);
    try {
      const response = await apiClient.updateTeacher(selectedTeacher.id, formData);

      if (response.success) {
        toast.success("Teacher updated successfully");
        setShowEditModal(false);
        setSelectedTeacher(null);
        await fetchTeachers();
      } else {
        toast.error(response.message || "Failed to update teacher");
      }
    } catch (error: any) {
      console.error("Error updating teacher:", error);
      toast.error(error.response?.data?.message || "Failed to update teacher");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTeacher = async () => {
    if (!selectedTeacher) return;
    setIsLoading(true);
    try {
      const response = await apiClient.deleteTeacher(selectedTeacher.id);

      if (response.success) {
        toast.success("Teacher deleted successfully");
        setShowDeleteModal(false);
        setSelectedTeacher(null);
        await fetchTeachers();
      } else {
        toast.error(response.message || "Failed to delete teacher");
      }
    } catch (error: any) {
      console.error("Error deleting teacher:", error);
      toast.error(error.response?.data?.message || "Failed to delete teacher");
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowEditModal(true);
  };

  const openDeleteModal = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowDeleteModal(true);
  };

  const convertToFormData = (teacher: Teacher): TeacherFormData => {
    return {
      id: teacher.id,
      branch_id: user?.branch_id || "",
      employee_code: teacher.employee_code,
      first_name: teacher.first_name,
      last_name: teacher.last_name,
      email: teacher.email,
      phone: teacher.phone,
      date_of_birth: teacher.date_of_birth,
      gender: teacher.gender,
      nationality: teacher.nationality,
      hire_date: teacher.hire_date,
      employment_type: teacher.employment_type,
      department: teacher.department,
      designation: teacher.designation,
      qualification_level: teacher.qualification_level,
      years_of_experience: teacher.years_of_experience,
    };
  };

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.employee_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <DashboardLayout title="Teachers Management" sidebarItems={adminSidebarItems}>
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
              onClick={() => setShowAddModal(true)}
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
                            onClick={() => openEditModal(teacher)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(teacher)}
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

        {/* Add Teacher Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add New Teacher"
          size="lg"
        >
          <TeacherForm
            onSubmit={handleCreateTeacher}
            onCancel={() => setShowAddModal(false)}
            isLoading={isLoading}
          />
        </Modal>

        {/* Edit Teacher Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTeacher(null);
          }}
          title="Edit Teacher"
          size="lg"
        >
          {selectedTeacher && (
            <TeacherForm
              initialData={convertToFormData(selectedTeacher)}
              onSubmit={handleUpdateTeacher}
              onCancel={() => {
                setShowEditModal(false);
                setSelectedTeacher(null);
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
            setSelectedTeacher(null);
          }}
          onConfirm={handleDeleteTeacher}
          title="Delete Teacher"
          message="Are you sure you want to delete this teacher? This action cannot be undone."
          itemName={
            selectedTeacher
              ? `${selectedTeacher.first_name} ${selectedTeacher.last_name}`
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
          title="👨‍🏫 Teacher Account Created"
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
                  A login account has been created for this teacher.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                  <Key size={18} />
                  <span>Login Credentials</span>
                </h4>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Teacher Name</p>
                    <p className="font-medium text-gray-900">{generatedCredentials.teacherName}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Employee Code</p>
                    <p className="font-mono text-gray-900">{generatedCredentials.employeeCode}</p>
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
                  ⚠️ <strong>Important:</strong> Please save or share these credentials with the teacher.
                  The password cannot be recovered later. The teacher should change their password after first login.
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
