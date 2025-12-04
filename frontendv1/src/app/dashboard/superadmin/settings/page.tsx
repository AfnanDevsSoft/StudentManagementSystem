"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  LayoutDashboard,
  Settings,
  Bell,
  Lock,
  Users,
  Database,
  Save,
  AlertCircle,
} from "lucide-react";

export default function SettingsPage() {
  const [schoolName, setSchoolName] = useState("Al-Noor Academy");
  const [email, setEmail] = useState("admin@alnoor.edu");
  const [phone, setPhone] = useState("+92-300-1234567");
  const [address, setAddress] = useState("123 Education Street, City");
  const [savedMessage, setSavedMessage] = useState(false);

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    studentRegistration: true,
    gradesPosted: true,
    attendanceAlert: true,
    systemUpdate: false,
  });

  const [security, setSecurity] = useState({
    twoFactorAuth: true,
    sessionTimeout: "30",
    passwordExpiry: "90",
  });

  const sidebarItems = [
    {
      label: "Dashboard",
      href: "/dashboard/superadmin",
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: "Settings",
      href: "/dashboard/superadmin/settings",
      icon: <Settings size={20} />,
    },
  ];

  const handleSaveSchoolInfo = () => {
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSecurityChange = (
    key: keyof typeof security,
    value: string | boolean
  ) => {
    setSecurity((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Settings" sidebarItems={sidebarItems}>
        <div className="space-y-6">
          {/* School Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              School Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Name
                </label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSaveSchoolInfo}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Save size={18} />
                <span>Save Changes</span>
              </button>
            </div>
            {savedMessage && (
              <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg flex items-center space-x-2">
                <AlertCircle size={18} />
                <span>Changes saved successfully!</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Notifications */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Bell size={20} className="text-blue-600" />
                <span>Notifications</span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700">
                    Email Notifications
                  </label>
                  <input
                    type="checkbox"
                    checked={notifications.emailNotifications}
                    onChange={() =>
                      handleNotificationChange("emailNotifications")
                    }
                    className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700">
                    Student Registration
                  </label>
                  <input
                    type="checkbox"
                    checked={notifications.studentRegistration}
                    onChange={() =>
                      handleNotificationChange("studentRegistration")
                    }
                    className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700">Grades Posted</label>
                  <input
                    type="checkbox"
                    checked={notifications.gradesPosted}
                    onChange={() => handleNotificationChange("gradesPosted")}
                    className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700">
                    Attendance Alert
                  </label>
                  <input
                    type="checkbox"
                    checked={notifications.attendanceAlert}
                    onChange={() =>
                      handleNotificationChange("attendanceAlert")
                    }
                    className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700">
                    System Updates
                  </label>
                  <input
                    type="checkbox"
                    checked={notifications.systemUpdate}
                    onChange={() => handleNotificationChange("systemUpdate")}
                    className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Lock size={20} className="text-green-600" />
                <span>Security</span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700">
                    Two-Factor Authentication
                  </label>
                  <input
                    type="checkbox"
                    checked={security.twoFactorAuth}
                    onChange={(e) =>
                      handleSecurityChange("twoFactorAuth", e.target.checked)
                    }
                    className="w-5 h-5 text-green-600 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <select
                    value={security.sessionTimeout}
                    onChange={(e) =>
                      handleSecurityChange("sessionTimeout", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Expiry (days)
                  </label>
                  <select
                    value={security.passwordExpiry}
                    onChange={(e) =>
                      handleSecurityChange("passwordExpiry", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="30">30 days</option>
                    <option value="60">60 days</option>
                    <option value="90">90 days</option>
                    <option value="180">180 days</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* System Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Database size={20} className="text-purple-600" />
                <span>System Information</span>
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">System Version</span>
                  <span className="font-semibold text-gray-900">v2.0.1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Database Size</span>
                  <span className="font-semibold text-gray-900">2.4 GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Backup</span>
                  <span className="font-semibold text-gray-900">
                    Today 03:30 AM
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Users</span>
                  <span className="font-semibold text-gray-900">127</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Users size={20} className="text-orange-600" />
                <span>User Statistics</span>
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Users</span>
                  <span className="font-semibold text-gray-900">1,245</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Students</span>
                  <span className="font-semibold text-gray-900">1,100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Teachers</span>
                  <span className="font-semibold text-gray-900">85</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Admins</span>
                  <span className="font-semibold text-gray-900">12</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
