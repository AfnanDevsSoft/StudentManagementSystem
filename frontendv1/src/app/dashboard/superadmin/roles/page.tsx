"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  LayoutDashboard,
  UserCog,
  Plus,
  Edit2,
  Trash2,
  Save,
} from "lucide-react";
import toast from "react-hot-toast";

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

const AVAILABLE_PERMISSIONS = [
  "manage_students",
  "manage_teachers",
  "manage_courses",
  "manage_branches",
  "manage_users",
  "manage_roles",
  "view_analytics",
  "view_reports",
  "manage_grades",
  "manage_attendance",
  "send_messages",
  "manage_settings",
];

const PERMISSION_LABELS: Record<string, string> = {
  manage_students: "Manage Students",
  manage_teachers: "Manage Teachers",
  manage_courses: "Manage Courses",
  manage_branches: "Manage Branches",
  manage_users: "Manage Users",
  manage_roles: "Manage Roles",
  view_analytics: "View Analytics",
  view_reports: "View Reports",
  manage_grades: "Manage Grades",
  manage_attendance: "Manage Attendance",
  send_messages: "Send Messages",
  manage_settings: "Manage Settings",
};

const DEFAULT_ROLES: Role[] = [
  {
    id: "1",
    name: "SuperAdmin",
    description: "System administrator with full access",
    permissions: AVAILABLE_PERMISSIONS,
    userCount: 1,
  },
  {
    id: "2",
    name: "Admin",
    description: "Branch administrator",
    permissions: [
      "manage_students",
      "manage_teachers",
      "manage_courses",
      "manage_grades",
      "manage_attendance",
      "view_analytics",
      "view_reports",
    ],
    userCount: 5,
  },
  {
    id: "3",
    name: "Teacher",
    description: "Classroom instructor",
    permissions: [
      "manage_grades",
      "manage_attendance",
      "view_analytics",
      "send_messages",
    ],
    userCount: 20,
  },
  {
    id: "4",
    name: "Student",
    description: "Student user",
    permissions: ["view_analytics", "send_messages"],
    userCount: 150,
  },
  {
    id: "5",
    name: "Parent",
    description: "Parent/Guardian",
    permissions: ["view_analytics", "send_messages"],
    userCount: 100,
  },
];

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  });

  const handleAddRole = () => {
    setEditingRole(null);
    setFormData({ name: "", description: "", permissions: [] });
    setShowModal(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: [...role.permissions],
    });
    setShowModal(true);
  };

  const handlePermissionToggle = (permission: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const handleSaveRole = () => {
    if (!formData.name.trim()) {
      toast.error("Role name is required");
      return;
    }

    if (formData.permissions.length === 0) {
      toast.error("At least one permission is required");
      return;
    }

    if (editingRole) {
      setRoles(
        roles.map((role) =>
          role.id === editingRole.id
            ? {
                ...role,
                name: formData.name,
                description: formData.description,
                permissions: formData.permissions,
              }
            : role
        )
      );
      toast.success("Role updated successfully");
    } else {
      const newRole: Role = {
        id: String(roles.length + 1),
        name: formData.name,
        description: formData.description,
        permissions: formData.permissions,
        userCount: 0,
      };
      setRoles([...roles, newRole]);
      toast.success("Role created successfully");
    }
    setShowModal(false);
  };

  const handleDeleteRole = (roleId: string) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      setRoles(roles.filter((role) => role.id !== roleId));
      toast.success("Role deleted successfully");
    }
  };

  const sidebarItems = [
    {
      label: "Dashboard",
      href: "/dashboard/superadmin",
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: "Roles & Permissions",
      href: "/dashboard/superadmin/roles",
      icon: <UserCog size={20} />,
    },
  ];

  return (
    <ProtectedRoute>
      <DashboardLayout title="Roles & Permissions" sidebarItems={sidebarItems}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">All Roles</h2>
            <button
              onClick={handleAddRole}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={20} />
              <span>Add Role</span>
            </button>
          </div>

          {/* Roles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => (
              <div
                key={role.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                {/* Role Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {role.name}
                    </h3>
                    <p className="text-sm text-gray-600">{role.description}</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {role.userCount} users
                  </span>
                </div>

                {/* Permissions List */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Permissions ({role.permissions.length})
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {role.permissions.length === 0 ? (
                      <p className="text-xs text-gray-500">No permissions</p>
                    ) : (
                      role.permissions.map((perm) => (
                        <div
                          key={perm}
                          className="flex items-center space-x-2 text-xs"
                        >
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="text-gray-700">
                            {PERMISSION_LABELS[perm] || perm}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-4 border-t">
                  <button
                    onClick={() => handleEditRole(role)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition text-sm"
                  >
                    <Edit2 size={16} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteRole(role.id)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition text-sm"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Permission Matrix Table */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Permission Matrix
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Permission
                    </th>
                    {roles.map((role) => (
                      <th
                        key={role.id}
                        className="px-4 py-3 text-center font-semibold text-gray-700"
                      >
                        {role.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {AVAILABLE_PERMISSIONS.map((permission) => (
                    <tr key={permission} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900 font-medium">
                        {PERMISSION_LABELS[permission] || permission}
                      </td>
                      {roles.map((role) => (
                        <td
                          key={`${role.id}-${permission}`}
                          className="px-4 py-3 text-center"
                        >
                          {role.permissions.includes(permission) ? (
                            <div className="inline-flex items-center justify-center w-6 h-6 bg-green-100 rounded-full">
                              <span className="text-green-600 font-bold">
                                ✓
                              </span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center justify-center w-6 h-6 bg-red-100 rounded-full">
                              <span className="text-red-600 font-bold">✗</span>
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {editingRole ? "Edit Role" : "Create New Role"}
              </h2>

              {/* Form */}
              <div className="space-y-6">
                {/* Role Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Manager, Supervisor"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Role description"
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Permissions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Permissions *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {AVAILABLE_PERMISSIONS.map((permission) => (
                      <label
                        key={permission}
                        className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission)}
                          onChange={() => handlePermissionToggle(permission)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          {PERMISSION_LABELS[permission] || permission}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex space-x-3 pt-6 border-t">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveRole}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center space-x-2"
                  >
                    <Save size={18} />
                    <span>Save Role</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
