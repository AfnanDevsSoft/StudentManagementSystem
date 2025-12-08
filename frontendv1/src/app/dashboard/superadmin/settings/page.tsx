"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/stores/authStore";
import {
    Settings,
    Upload,
    Save,
    Shield,
    Database,
    Bell,
    Palette,
    Calendar,
    Download,
    BarChart3,
    Users,
    GraduationCap,
} from "lucide-react";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/apiClient";
import { useEffect } from "react";

export default function SystemSettings() {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<"general" | "academic" | "security" | "backup">("general");
    const [logo, setLogo] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({
        schoolName: "ABC International School",
        tagline: "Excellence in Education",
        email: "info@abcschool.edu",
        phone: "+92-300-1234567",
        address: "123 Education Street, Karachi, Pakistan",
        academicYear: "2024-2025",
        currency: "PKR",
        timezone: "Asia/Karachi",
        language: "English",
        twoFactorAuth: false,
        emailNotifications: true,
        smsNotifications: false,
        autoBackup: true,
        backupFrequency: "daily",
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            // API Integration: Fetch system settings
            const response: any = await apiClient.getSystemSettings();

            if (response.success && response.data) {
                setSettings({
                    schoolName: response.data.school_name || response.data.schoolName || settings.schoolName,
                    tagline: response.data.tagline || settings.tagline,
                    email: response.data.email || response.data.contact_email || settings.email,
                    phone: response.data.phone || response.data.contact_phone || settings.phone,
                    address: response.data.address || settings.address,
                    academicYear: response.data.academic_year || response.data.academicYear || settings.academicYear,
                    currency: response.data.currency || settings.currency,
                    timezone: response.data.timezone || settings.timezone,
                    language: response.data.language || settings.language,
                    twoFactorAuth: response.data.two_factor_auth || response.data.twoFactorAuth || false,
                    emailNotifications: response.data.email_notifications || response.data.emailNotifications !== false,
                    smsNotifications: response.data.sms_notifications || response.data.smsNotifications || false,
                    autoBackup: response.data.auto_backup || response.data.autoBackup !== false,
                    backupFrequency: response.data.backup_frequency || response.data.backupFrequency || "daily",
                });
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
            // Use defaults - no error toast for initial load
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("schoolName", settings.schoolName);
            formData.append("tagline", settings.tagline);
            formData.append("email", settings.email);
            formData.append("phone", settings.phone);
            formData.append("address", settings.address);
            formData.append("academicYear", settings.academicYear);
            formData.append("currency", settings.currency);
            formData.append("timezone", settings.timezone);
            formData.append("language", settings.language);
            formData.append("twoFactorAuth", String(settings.twoFactorAuth));
            formData.append("emailNotifications", String(settings.emailNotifications));
            formData.append("smsNotifications", String(settings.smsNotifications));
            formData.append("autoBackup", String(settings.autoBackup));
            formData.append("backupFrequency", settings.backupFrequency);

            if (logo) {
                formData.append("logo", logo);
            }

            // API Integration: Update system settings
            const response: any = await apiClient.updateSystemSettings(formData);

            if (response.success) {
                toast.success("Settings updated successfully!");
                fetchSettings(); // Re-fetch settings to ensure UI is up-to-date
            } else {
                toast.error(response.message || "Failed to update settings.");
            }
        } catch (error) {
            console.error("Error saving settings:", error);
            toast.error("An error occurred while saving settings.");
        } finally {
            setLoading(false);
        }
    };

    const handleBackup = async () => {
        try {
            // TODO: Implement actual backup
            toast.success("Backup initiated successfully");
        } catch (error) {
            toast.error("Backup failed");
        }
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogo(file);
            toast.success(`Logo selected: ${file.name}`);
        }
    };

    const sidebarItems = [
        {
            label: "Dashboard",
            href: "/dashboard/superadmin",
            icon: <BarChart3 size={20} />,
        },
        {
            label: "Academic Management",
            href: "/dashboard/superadmin/academic",
            icon: <GraduationCap size={20} />,
        },
        {
            label: "Users",
            href: "/dashboard/superadmin/users",
            icon: <Users size={20} />,
        },
        {
            label: "Settings",
            href: "/dashboard/superadmin/settings",
            icon: <Settings size={20} />,
        },
    ];

    return (
        <ProtectedRoute>
            <DashboardLayout title="System Settings" sidebarItems={sidebarItems}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold flex items-center gap-2">
                                    <Settings size={28} />
                                    System Settings
                                </h1>
                                <p className="text-gray-300 mt-1">
                                    Configure branding, academic year, security & backups
                                </p>
                            </div>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-white text-gray-800 rounded-lg font-medium hover:bg-gray-100 transition flex items-center gap-2"
                            >
                                <Save size={20} />
                                Save All Changes
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="flex border-b border-gray-200">
                            <button
                                onClick={() => setActiveTab("general")}
                                className={`flex-1 px-6 py-4 font-medium transition flex items-center justify-center gap-2 ${activeTab === "general"
                                    ? "bg-gray-50 text-gray-900 border-b-2 border-gray-800"
                                    : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                <Palette size={20} />
                                General & Branding
                            </button>
                            <button
                                onClick={() => setActiveTab("academic")}
                                className={`flex-1 px-6 py-4 font-medium transition flex items-center justify-center gap-2 ${activeTab === "academic"
                                    ? "bg-gray-50 text-gray-900 border-b-2 border-gray-800"
                                    : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                <Calendar size={20} />
                                Academic Settings
                            </button>
                            <button
                                onClick={() => setActiveTab("security")}
                                className={`flex-1 px-6 py-4 font-medium transition flex items-center justify-center gap-2 ${activeTab === "security"
                                    ? "bg-gray-50 text-gray-900 border-b-2 border-gray-800"
                                    : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                <Shield size={20} />
                                Security
                            </button>
                            <button
                                onClick={() => setActiveTab("backup")}
                                className={`flex-1 px-6 py-4 font-medium transition flex items-center justify-center gap-2 ${activeTab === "backup"
                                    ? "bg-gray-50 text-gray-900 border-b-2 border-gray-800"
                                    : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                <Database size={20} />
                                Backup
                            </button>
                        </div>

                        <div className="p-6">
                            {/* General & Branding Tab */}
                            {activeTab === "general" && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">School Branding</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    School Logo
                                                </label>
                                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                                    <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                                                    <label className="cursor-pointer">
                                                        <span className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                                            Click to upload logo
                                                        </span>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleLogoUpload}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                    {logo && (
                                                        <p className="text-xs text-green-600 mt-2">Selected: {logo.name}</p>
                                                    )}
                                                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        School Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={settings.schoolName}
                                                        onChange={(e) =>
                                                            setSettings({ ...settings, schoolName: e.target.value })
                                                        }
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Tagline
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={settings.tagline}
                                                        onChange={(e) =>
                                                            setSettings({ ...settings, tagline: e.target.value })
                                                        }
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 pt-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    value={settings.email}
                                                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Phone
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={settings.phone}
                                                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Address
                                                </label>
                                                <textarea
                                                    value={settings.address}
                                                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                                    rows={2}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Academic Settings Tab */}
                            {activeTab === "academic" && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Year Settings</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Current Academic Year
                                                </label>
                                                <input
                                                    type="text"
                                                    value={settings.academicYear}
                                                    onChange={(e) =>
                                                        setSettings({ ...settings, academicYear: e.target.value })
                                                    }
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Format: YYYY-YYYY</p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Currency
                                                </label>
                                                <select
                                                    value={settings.currency}
                                                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                                                >
                                                    <option value="PKR">PKR - Pakistani Rupee</option>
                                                    <option value="USD">USD - US Dollar</option>
                                                    <option value="EUR">EUR - Euro</option>
                                                    <option value="GBP">GBP - British Pound</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Timezone
                                                </label>
                                                <select
                                                    value={settings.timezone}
                                                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                                                >
                                                    <option value="Asia/Karachi">Asia/Karachi (PKT)</option>
                                                    <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                                                    <option value="Europe/London">Europe/London (GMT)</option>
                                                    <option value="America/New_York">America/New_York (EST)</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Language
                                                </label>
                                                <select
                                                    value={settings.language}
                                                    onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                                                >
                                                    <option value="English">English</option>
                                                    <option value="Urdu">Urdu</option>
                                                    <option value="Arabic">Arabic</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Security Tab */}
                            {activeTab === "security" && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Controls</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                                                    <p className="text-sm text-gray-600">
                                                        Require 2FA for admin and teacher accounts
                                                    </p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={settings.twoFactorAuth}
                                                        onChange={(e) =>
                                                            setSettings({ ...settings, twoFactorAuth: e.target.checked })
                                                        }
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>

                                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-gray-900">Email Notifications</p>
                                                    <p className="text-sm text-gray-600">
                                                        Send security alerts via email
                                                    </p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={settings.emailNotifications}
                                                        onChange={(e) =>
                                                            setSettings({ ...settings, emailNotifications: e.target.checked })
                                                        }
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>

                                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-gray-900">SMS Notifications</p>
                                                    <p className="text-sm text-gray-600">
                                                        Send critical alerts via SMS
                                                    </p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={settings.smsNotifications}
                                                        onChange={(e) =>
                                                            setSettings({ ...settings, smsNotifications: e.target.checked })
                                                        }
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <div className="flex gap-3">
                                            <Bell className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                                            <div>
                                                <p className="text-sm font-medium text-yellow-900">Security Best Practices</p>
                                                <ul className="text-sm text-yellow-800 mt-2 space-y-1 list-disc list-inside">
                                                    <li>Enable two-factor authentication for all admin accounts</li>
                                                    <li>Regularly review user access and permissions</li>
                                                    <li>Use strong passwords with minimum 12 characters</li>
                                                    <li>Monitor security logs for suspicious activity</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Backup Tab */}
                            {activeTab === "backup" && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Backups</h3>

                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                            <div className="flex items-start gap-3">
                                                <Database className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                                                <div>
                                                    <p className="text-sm font-medium text-blue-900 mb-1">
                                                        Last Backup: December 8, 2025 at 02:00 AM
                                                    </p>
                                                    <p className="text-sm text-blue-800">
                                                        Status: Successful | Size: 245 MB
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 mb-6">
                                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-gray-900">Automatic Backups</p>
                                                    <p className="text-sm text-gray-600">
                                                        Schedule automatic database backups
                                                    </p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={settings.autoBackup}
                                                        onChange={(e) =>
                                                            setSettings({ ...settings, autoBackup: e.target.checked })
                                                        }
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>

                                            {settings.autoBackup && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Backup Frequency
                                                    </label>
                                                    <select
                                                        value={settings.backupFrequency}
                                                        onChange={(e) =>
                                                            setSettings({ ...settings, backupFrequency: e.target.value })
                                                        }
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                                                    >
                                                        <option value="hourly">Every Hour</option>
                                                        <option value="daily">Daily (2:00 AM)</option>
                                                        <option value="weekly">Weekly (Sunday 2:00 AM)</option>
                                                        <option value="monthly">Monthly (1st of month 2:00 AM)</option>
                                                    </select>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleBackup}
                                                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                                            >
                                                <Database size={20} />
                                                Backup Now
                                            </button>
                                            <button
                                                onClick={() => toast.info("Downloading latest backup...")}
                                                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition flex items-center justify-center gap-2"
                                            >
                                                <Download size={20} />
                                                Download Latest
                                            </button>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 pt-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Backup History</h3>
                                        <div className="space-y-2">
                                            {[
                                                { date: "2025-12-08 02:00 AM", size: "245 MB", status: "Success" },
                                                { date: "2025-12-07 02:00 AM", size: "243 MB", status: "Success" },
                                                { date: "2025-12-06 02:00 AM", size: "241 MB", status: "Success" },
                                            ].map((backup, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Database className="text-gray-600" size={20} />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{backup.date}</p>
                                                            <p className="text-xs text-gray-600">Size: {backup.size}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                            {backup.status}
                                                        </span>
                                                        <button className="text-blue-600 hover:text-blue-700">
                                                            <Download size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
