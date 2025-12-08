"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/stores/authStore";
import {
    GraduationCap,
    BookOpen,
    Calendar,
    Users,
    Plus,
    Edit,
    Trash2,
    Settings,
    BarChart3,
} from "lucide-react";
import toast from "react-hot-toast";

interface Class {
    id: string;
    name: string;
    section: string;
    students: number;
    capacity: number;
    classTeacher: string;
    subjects: string[];
}

interface Subject {
    id: string;
    name: string;
    code: string;
    teacher: string;
    classes: string[];
}

interface AcademicYear {
    id: string;
    year: string;
    startDate: string;
    endDate: string;
    status: "active" | "upcoming" | "completed";
}

export default function AcademicManagement() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"classes" | "subjects" | "academic">("classes");
    const [classes, setClasses] = useState<Class[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
    const [showClassModal, setShowClassModal] = useState(false);
    const [showSubjectModal, setShowSubjectModal] = useState(false);

    const [classForm, setClassForm] = useState({
        name: "",
        section: "",
        capacity: "",
        classTeacher: "",
    });

    const [subjectForm, setSubjectForm] = useState({
        name: "",
        code: "",
        teacher: "",
    });

    useEffect(() => {
        fetchAcademicData();
    }, []);

    const fetchAcademicData = async () => {
        try {
            setLoading(true);

            // API Integration: Fetch courses (classes), subjects, academic years
            const [coursesRes, academicYearsRes] = await Promise.all([
                apiClient.getCourses().catch(() => ({ success: false, data: [] })),
                apiClient.getAcademicYears().catch(() => ({ success: false, data: [] }))
            ]);

            // Process courses as classes
            if (coursesRes.success && Array.isArray(coursesRes.data)) {
                const classesData: Class[] = coursesRes.data.map((course: any) => ({
                    id: course.id || course.course_id,
                    name: course.course_name || course.name || "Unnamed",
                    section: course.section || course.class_section || "A",
                    students: Number(course.enrolled_students || course.student_count || 0),
                    capacity: Number(course.capacity || course.max_students || 40),
                    classTeacher: course.teacher_name || course.instructor || "TBA",
                    subjects: course.subjects || [],
                }));
                setClasses(classesData);

                // Extract unique subjects from courses
                const subjectsMap = new Map();
                coursesRes.data.forEach((course: any) => {
                    const subjectId = course.id;
                    if (!subjectsMap.has(subjectId)) {
                        subjectsMap.set(subjectId, {
                            id: subjectId,
                            name: course.course_name || course.name,
                            code: course.course_code || course.code || `SUBJ-${subjectId}`,
                            teacher: course.teacher_name || "TBA",
                            classes: [course.section || "A"],
                        });
                    }
                });
                setSubjects(Array.from(subjectsMap.values()));
            }

            // Process academic years
            if (academicYearsRes.success && Array.isArray(academicYearsRes.data)) {
                const yearsData: AcademicYear[] = academicYearsRes.data.map((year: any) => {
                    const startDate = new Date(year.start_date || year.startDate);
                    const endDate = new Date(year.end_date || year.endDate);
                    const now = new Date();

                    let status: AcademicYear["status"] = "upcoming";
                    if (now >= startDate && now <= endDate) status = "active";
                    else if (now > endDate) status = "completed";

                    return {
                        id: year.id,
                        year: year.year || year.name || `${startDate.getFullYear()}-${endDate.getFullYear()}`,
                        startDate: year.start_date || year.startDate,
                        endDate: year.end_date || year.endDate,
                        status: year.status || status,
                    };
                });
                setAcademicYears(yearsData);
            }

        } catch (error: any) {
            console.error("Error fetching academic data:", error);
            toast.error(
                error.response?.data?.message ||
                "Failed to load academic data. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClass = async () => {
        if (!classForm.name || !classForm.section || !classForm.capacity) {
            toast.error("Please fill all required fields");
            return;
        }

        try {
            // API Integration: Create course
            const response = await apiClient.createCourse({
                course_name: classForm.name,
                course_code: `${classForm.name.replace(/\s+/g, '')}-${classForm.section}`,
                section: classForm.section,
                capacity: Number(classForm.capacity),
                teacher_name: classForm.classTeacher || undefined,
            });

            if (response.success) {
                toast.success("Class created successfully");
                setShowClassModal(false);
                setClassForm({ name: "", section: "", capacity: "", classTeacher: "" });
                fetchAcademicData();
            } else {
                toast.error(response.message || "Failed to create class");
            }
        } catch (error: any) {
            console.error("Error creating class:", error);
            toast.error(
                error.response?.data?.message ||
                "Failed to create class. Please try again."
            );
        }
    };

    const handleCreateSubject = async () => {
        if (!subjectForm.name || !subjectForm.code) {
            toast.error("Please fill all required fields");
            return;
        }

        try {
            // TODO: Implement actual API call
            toast.success("Subject created successfully");
            setShowSubjectModal(false);
            setSubjectForm({ name: "", code: "", teacher: "" });
            fetchAcademicData();
        } catch (error) {
            toast.error("Failed to create subject");
        }
    };

    const getStatusBadge = (status: AcademicYear["status"]) => {
        const badges = {
            active: { color: "bg-green-100 text-green-800", label: "Active" },
            upcoming: { color: "bg-blue-100 text-blue-800", label: "Upcoming" },
            completed: { color: "bg-gray-100 text-gray-800", label: "Completed" },
        };

        const badge = badges[status];
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                {badge.label}
            </span>
        );
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

    if (loading) {
        return (
            <ProtectedRoute>
                <DashboardLayout title="Academic Management" sidebarItems={sidebarItems}>
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-500">Loading academic data...</p>
                        </div>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <DashboardLayout title="Academic Management" sidebarItems={sidebarItems}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold flex items-center gap-2">
                                    <GraduationCap size={28} />
                                    Academic Management
                                </h1>
                                <p className="text-indigo-100 mt-1">
                                    Manage classes, subjects, and academic year settings
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <GraduationCap className="text-blue-600" size={24} />
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">Total Classes</p>
                            <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <BookOpen className="text-purple-600" size={24} />
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">Active Subjects</p>
                            <p className="text-2xl font-bold text-gray-900">{subjects.length}</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <Users className="text-green-600" size={24} />
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">Total Students</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {classes.reduce((sum, c) => sum + c.students, 0)}
                            </p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-3 bg-orange-100 rounded-lg">
                                    <Calendar className="text-orange-600" size={24} />
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">Current Year</p>
                            <p className="text-lg font-bold text-gray-900">
                                {academicYears.find((y) => y.status === "active")?.year || "N/A"}
                            </p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="flex border-b border-gray-200">
                            <button
                                onClick={() => setActiveTab("classes")}
                                className={`flex-1 px-6 py-4 font-medium transition ${activeTab === "classes"
                                    ? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600"
                                    : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                Classes & Sections
                            </button>
                            <button
                                onClick={() => setActiveTab("subjects")}
                                className={`flex-1 px-6 py-4 font-medium transition ${activeTab === "subjects"
                                    ? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600"
                                    : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                Subject Allocation
                            </button>
                            <button
                                onClick={() => setActiveTab("academic")}
                                className={`flex-1 px-6 py-4 font-medium transition ${activeTab === "academic"
                                    ? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600"
                                    : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                Academic Year
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Classes Tab */}
                            {activeTab === "classes" && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold">All Classes</h3>
                                        <button
                                            onClick={() => setShowClassModal(true)}
                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition flex items-center gap-2"
                                        >
                                            <Plus size={20} />
                                            Add Class
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {classes.map((cls) => (
                                            <div key={cls.id} className="border border-gray-200 rounded-lg p-5">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <h4 className="text-lg font-bold text-gray-900">
                                                            {cls.name} - Section {cls.section}
                                                        </h4>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            Teacher: {cls.classTeacher}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="space-y-2 mb-4">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">Students:</span>
                                                        <span className="font-medium">
                                                            {cls.students}/{cls.capacity}
                                                        </span>
                                                    </div>
                                                    <div className="bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-indigo-600 h-2 rounded-full transition-all"
                                                            style={{ width: `${(cls.students / cls.capacity) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                <div className="mb-4">
                                                    <p className="text-xs text-gray-600 mb-2">Subjects:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {cls.subjects.map((subject, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded"
                                                            >
                                                                {subject}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1">
                                                        <Edit size={14} />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => toast.info("Delete functionality coming soon")}
                                                        className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Subjects Tab */}
                            {activeTab === "subjects" && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold">Subject Allocation</h3>
                                        <button
                                            onClick={() => setShowSubjectModal(true)}
                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition flex items-center gap-2"
                                        >
                                            <Plus size={20} />
                                            Add Subject
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {subjects.map((subject) => (
                                            <div
                                                key={subject.id}
                                                className="border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 transition"
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h4 className="font-semibold text-gray-900">{subject.name}</h4>
                                                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                                            {subject.code}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-4 text-sm text-gray-600">
                                                        <span>Teacher: {subject.teacher}</span>
                                                        <span>•</span>
                                                        <span>Classes: {subject.classes.join(", ")}</span>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition flex items-center gap-1">
                                                        <Edit size={14} />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => toast.info("Delete functionality coming soon")}
                                                        className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Academic Year Tab */}
                            {activeTab === "academic" && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold">Academic Years</h3>
                                        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition flex items-center gap-2">
                                            <Plus size={20} />
                                            New Academic Year
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {academicYears.map((year) => (
                                            <div
                                                key={year.id}
                                                className="border border-gray-200 rounded-lg p-5"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h4 className="text-lg font-bold text-gray-900">{year.year}</h4>
                                                            {getStatusBadge(year.status)}
                                                        </div>
                                                        <div className="flex gap-6 text-sm text-gray-600">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar size={14} />
                                                                <span>
                                                                    Start: {new Date(year.startDate).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Calendar size={14} />
                                                                <span>
                                                                    End: {new Date(year.endDate).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {year.status === "active" && (
                                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                                                        <p className="text-sm text-green-800">
                                                            This is the active academic year. All operations are linked to this year.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Add Class Modal */}
                {showClassModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Class</h3>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Class Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={classForm.name}
                                        onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                                        placeholder="e.g., Grade 10"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Section *
                                    </label>
                                    <input
                                        type="text"
                                        value={classForm.section}
                                        onChange={(e) => setClassForm({ ...classForm, section: e.target.value })}
                                        placeholder="e.g., A"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Capacity *
                                    </label>
                                    <input
                                        type="number"
                                        value={classForm.capacity}
                                        onChange={(e) => setClassForm({ ...classForm, capacity: e.target.value })}
                                        placeholder="e.g., 40"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Class Teacher
                                    </label>
                                    <input
                                        type="text"
                                        value={classForm.classTeacher}
                                        onChange={(e) =>
                                            setClassForm({ ...classForm, classTeacher: e.target.value })
                                        }
                                        placeholder="Select or type teacher name"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleCreateClass}
                                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition"
                                >
                                    Create Class
                                </button>
                                <button
                                    onClick={() => {
                                        setShowClassModal(false);
                                        setClassForm({ name: "", section: "", capacity: "", classTeacher: "" });
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Subject Modal */}
                {showSubjectModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Subject</h3>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={subjectForm.name}
                                        onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                                        placeholder="e.g., Mathematics"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject Code *
                                    </label>
                                    <input
                                        type="text"
                                        value={subjectForm.code}
                                        onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                                        placeholder="e.g., MATH-101"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Assigned Teacher
                                    </label>
                                    <input
                                        type="text"
                                        value={subjectForm.teacher}
                                        onChange={(e) =>
                                            setSubjectForm({ ...subjectForm, teacher: e.target.value })
                                        }
                                        placeholder="Select or type teacher name"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleCreateSubject}
                                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition"
                                >
                                    Add Subject
                                </button>
                                <button
                                    onClick={() => {
                                        setShowSubjectModal(false);
                                        setSubjectForm({ name: "", code: "", teacher: "" });
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        </ProtectedRoute>
    );
}
