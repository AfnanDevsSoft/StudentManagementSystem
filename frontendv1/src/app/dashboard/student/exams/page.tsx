"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/lib/apiClient";
import {
    BookOpen,
    Calendar,
    ClipboardCheck,
    Download,
    Eye,
    FileText,
    Clock,
    Award,
    TrendingUp,
    TrendingDown,
} from "lucide-react";
import toast from "react-hot-toast";

interface Exam {
    id: string;
    title: string;
    subject: string;
    date: string;
    time: string;
    duration: string;
    totalMarks: number;
    room: string;
    status: "upcoming" | "completed" | "ongoing";
    obtainedMarks?: number;
    grade?: string;
}

interface PastPaper {
    id: string;
    title: string;
    subject: string;
    year: string;
    term: string;
    fileSize: string;
}

interface QuizAssessment {
    id: string;
    title: string;
    subject: string;
    questions: number;
    duration: number;
    status: "available" | "completed" | "locked";
    score?: number;
    maxScore?: number;
    completedDate?: string;
}

export default function StudentExams() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"exams" | "quizzes" | "pastpapers">("exams");
    const [exams, setExams] = useState<Exam[]>([]);
    const [quizzes, setQuizzes] = useState<QuizAssessment[]>([]);
    const [pastPapers, setPastPapers] = useState<PastPaper[]>([]);

    useEffect(() => {
        fetchExamData();
    }, [user]);

    const fetchExamData = async () => {
        try {
            setLoading(true);

            if (!user?.id) {
                toast.error("User not authenticated");
                return;
            }

            // API Integration: Fetch student enrollment then get exam-related content
            const enrollmentResponse = await apiClient.getStudentEnrollment(user.id);

            if (!enrollmentResponse.success || !Array.isArray(enrollmentResponse.data)) {
                setExams([]);
                setQuizzes([]);
                setPastPapers([]);
                return;
            }

            const courses = enrollmentResponse.data;
            const allExams: Exam[] = [];
            const allQuizzes: QuizAssessment[] = [];
            const allPastPapers: PastPaper[] = [];

            // Also fetch grades for completed exams
            const gradesResponse = await apiClient.getStudentGrades(user.id);
            const gradesMap = new Map();
            if (gradesResponse.success && Array.isArray(gradesResponse.data)) {
                gradesResponse.data.forEach((grade: any) => {
                    gradesMap.set(grade.exam_id || grade.assessment_id, grade);
                });
            }

            // Fetch content from each course
            for (const courseData of courses) {
                const courseId = courseData.course_id || courseData.id;
                const courseName = courseData.course_name || courseData.name;

                try {
                    // Fetch exam-related content
                    const contentResponse = await apiClient.getCourseContent(courseId, {
                        type: ['exam', 'quiz', 'past_paper']
                    });

                    if (contentResponse.success && Array.isArray(contentResponse.data)) {
                        contentResponse.data.forEach((item: any) => {
                            const contentType = (item.type || item.content_type || '').toLowerCase();

                            // Exams
                            if (contentType.includes('exam') && !contentType.includes('past')) {
                                const examDate = new Date(item.exam_date || item.date || item.due_date);
                                const now = new Date();
                                const grade = gradesMap.get(item.id);

                                let status: Exam["status"] = "upcoming";
                                if (examDate < now) status = "completed";
                                else if (examDate.toDateString() === now.toDateString()) status = "ongoing";

                                allExams.push({
                                    id: item.id || item.content_id,
                                    title: item.title || item.name,
                                    subject: courseName,
                                    date: item.exam_date || item.date || item.due_date,
                                    time: item.exam_time || item.time || "TBD",
                                    duration: item.duration || "3 hours",
                                    totalMarks: Number(item.total_marks || item.marks || 100),
                                    room: item.room || item.location || "TBD",
                                    status,
                                    obtainedMarks: grade ? Number(grade.marks_obtained || grade.score) : undefined,
                                    grade: grade?.grade || grade?.letter_grade,
                                });
                            }

                            // Quizzes
                            else if (contentType.includes('quiz') || contentType.includes('assessment')) {
                                const grade = gradesMap.get(item.id);
                                const isCompleted = !!grade || !!item.completed_at;
                                const isLocked = item.is_locked || item.locked || false;

                                let status: QuizAssessment["status"] = "available";
                                if (isCompleted) status = "completed";
                                else if (isLocked) status = "locked";

                                allQuizzes.push({
                                    id: item.id || item.content_id,
                                    title: item.title || item.name,
                                    subject: courseName,
                                    questions: Number(item.questions_count || item.questions || 20),
                                    duration: Number(item.duration || 30),
                                    status,
                                    score: grade ? Number(grade.marks_obtained || grade.score) : undefined,
                                    maxScore: grade ? Number(grade.total_marks || item.total_marks || item.max_score) : Number(item.total_marks || 100),
                                    completedDate: grade?.graded_at || item.completed_at,
                                });
                            }

                            // Past Papers
                            else if (contentType.includes('past') || contentType.includes('paper')) {
                                allPastPapers.push({
                                    id: item.id || item.content_id,
                                    title: item.title || item.name,
                                    subject: courseName,
                                    year: item.year || item.academic_year || new Date().getFullYear().toString(),
                                    term: item.term || item.semester || "General",
                                    fileSize: item.file_size || item.size || "Unknown",
                                });
                            }
                        });
                    }
                } catch (error) {
                    console.error(`Error fetching exam data for course ${courseId}:`, error);
                }
            }

            // Sort exams by date (upcoming first)
            allExams.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            setExams(allExams);
            setQuizzes(allQuizzes);
            setPastPapers(allPastPapers);

        } catch (error: any) {
            console.error("Error fetching exam data:", error);

            if (error.response?.status === 404) {
                toast.error("No exam information found");
                setExams([]);
                setQuizzes([]);
                setPastPapers([]);
            } else if (error.response?.status === 401) {
                return;
            } else {
                toast.error(
                    error.response?.data?.message ||
                    "Failed to load exam information. Please try again later."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const getExamStatusBadge = (status: Exam["status"]) => {
        const badges = {
            upcoming: { color: "bg-blue-100 text-blue-800", label: "Upcoming" },
            completed: { color: "bg-green-100 text-green-800", label: "Completed" },
            ongoing: { color: "bg-yellow-100 text-yellow-800", label: "Ongoing" },
        };

        const badge = badges[status];
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                {badge.label}
            </span>
        );
    };

    const getQuizStatusBadge = (status: QuizAssessment["status"]) => {
        const badges = {
            available: { color: "bg-green-100 text-green-800", label: "Available" },
            completed: { color: "bg-blue-100 text-blue-800", label: "Completed" },
            locked: { color: "bg-gray-100 text-gray-800", label: "Locked" },
        };

        const badge = badges[status];
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                {badge.label}
            </span>
        );
    };

    const getDaysUntil = (dateString: string) => {
        const examDate = new Date(dateString);
        const now = new Date();
        const diff = examDate.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days;
    };

    const upcomingExams = exams.filter((e) => e.status === "upcoming");
    const completedExams = exams.filter((e) => e.status === "completed");
    const avgScore = completedExams.length > 0
        ? completedExams.reduce((sum, e) => sum + (e.obtainedMarks || 0) / e.totalMarks * 100, 0) / completedExams.length
        : 0;

    const sidebarItems = [
        {
            label: "Dashboard",
            href: "/dashboard/student",
            icon: <BookOpen size={20} />,
        },
        {
            label: "My Timetable",
            href: "/dashboard/student/timetable",
            icon: <Calendar size={20} />,
        },
        {
            label: "Assignments",
            href: "/dashboard/student/assignments",
            icon: <FileText size={20} />,
        },
        {
            label: "Exams",
            href: "/dashboard/student/exams",
            icon: <ClipboardCheck size={20} />,
        },
        {
            label: "Learning Materials",
            href: "/dashboard/student/learning-materials",
            icon: <BookOpen size={20} />,
        },
    ];

    if (loading) {
        return (
            <ProtectedRoute>
                <DashboardLayout title="Exams & Assessments" sidebarItems={sidebarItems}>
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-500">Loading exam information...</p>
                        </div>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <DashboardLayout title="Exams & Assessments" sidebarItems={sidebarItems}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold flex items-center gap-2">
                                    <ClipboardCheck size={28} />
                                    Exams & Assessments
                                </h1>
                                <p className="text-blue-100 mt-1">
                                    View exam schedule, take quizzes & access past papers
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Calendar className="text-blue-600" size={24} />
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">Upcoming Exams</p>
                            <p className="text-2xl font-bold text-gray-900">{upcomingExams.length}</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <Award className="text-green-600" size={24} />
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">Average Score</p>
                            <p className="text-2xl font-bold text-gray-900">{avgScore.toFixed(1)}%</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <ClipboardCheck className="text-purple-600" size={24} />
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">Quizzes Available</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {quizzes.filter((q) => q.status === "available").length}
                            </p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-3 bg-orange-100 rounded-lg">
                                    <FileText className="text-orange-600" size={24} />
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">Past Papers</p>
                            <p className="text-2xl font-bold text-gray-900">{pastPapers.length}</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="flex border-b border-gray-200">
                            <button
                                onClick={() => setActiveTab("exams")}
                                className={`flex-1 px-6 py-4 font-medium transition ${activeTab === "exams"
                                    ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
                                    : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                Exam Schedule
                            </button>
                            <button
                                onClick={() => setActiveTab("quizzes")}
                                className={`flex-1 px-6 py-4 font-medium transition ${activeTab === "quizzes"
                                    ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
                                    : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                Online Quizzes
                            </button>
                            <button
                                onClick={() => setActiveTab("pastpapers")}
                                className={`flex-1 px-6 py-4 font-medium transition ${activeTab === "pastpapers"
                                    ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
                                    : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                Past Papers
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Exam Schedule Tab */}
                            {activeTab === "exams" && (
                                <div className="space-y-4">
                                    {exams.map((exam) => {
                                        const daysUntil = getDaysUntil(exam.date);
                                        const isUrgent = daysUntil <= 3 && exam.status === "upcoming";

                                        return (
                                            <div
                                                key={exam.id}
                                                className={`border ${isUrgent ? "border-red-300 bg-red-50/30" : "border-gray-200"
                                                    } rounded-lg p-6`}
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h3 className="text-lg font-bold text-gray-900">{exam.title}</h3>
                                                            {getExamStatusBadge(exam.status)}
                                                        </div>
                                                        <p className="text-sm text-gray-600 mb-3">{exam.subject}</p>

                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                            <div className="flex items-center gap-2 text-gray-600">
                                                                <Calendar size={16} />
                                                                <span>{new Date(exam.date).toLocaleDateString()}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-gray-600">
                                                                <Clock size={16} />
                                                                <span>{exam.time}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-gray-600">
                                                                <ClipboardCheck size={16} />
                                                                <span>{exam.duration}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-gray-600">
                                                                <Award size={16} />
                                                                <span>{exam.totalMarks} marks</span>
                                                            </div>
                                                        </div>

                                                        {exam.status === "upcoming" && (
                                                            <p className="mt-3 text-sm font-medium text-blue-600">
                                                                Room: {exam.room} | {daysUntil} days remaining
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {exam.status === "completed" && exam.obtainedMarks !== undefined && (
                                                    <div className="bg-green-50 rounded-lg p-4 mt-4">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="text-sm text-green-800 font-medium mb-1">Results</p>
                                                                <div className="flex items-center gap-4">
                                                                    <p className="text-2xl font-bold text-green-700">
                                                                        {exam.obtainedMarks}/{exam.totalMarks}
                                                                    </p>
                                                                    <span className="text-lg font-bold text-green-600">{exam.grade}</span>
                                                                    <span className="text-sm text-green-700">
                                                                        ({((exam.obtainedMarks / exam.totalMarks) * 100).toFixed(1)}%)
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            {exam.obtainedMarks / exam.totalMarks >= 0.75 ? (
                                                                <TrendingUp className="text-green-600" size={32} />
                                                            ) : (
                                                                <TrendingDown className="text-orange-600" size={32} />
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Quizzes Tab */}
                            {activeTab === "quizzes" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {quizzes.map((quiz) => (
                                        <div key={quiz.id} className="border border-gray-200 rounded-lg p-6">
                                            <div className="flex items-start justify-between mb-3">
                                                <h3 className="font-bold text-gray-900">{quiz.title}</h3>
                                                {getQuizStatusBadge(quiz.status)}
                                            </div>

                                            <p className="text-sm text-gray-600 mb-4">{quiz.subject}</p>

                                            <div className="space-y-2 text-sm text-gray-600 mb-4">
                                                <div className="flex items-center justify-between">
                                                    <span>Questions:</span>
                                                    <span className="font-medium">{quiz.questions}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span>Duration:</span>
                                                    <span className="font-medium">{quiz.duration} minutes</span>
                                                </div>
                                            </div>

                                            {quiz.status === "completed" && quiz.score !== undefined && (
                                                <div className="bg-blue-50 rounded-lg p-3 mb-4">
                                                    <p className="text-sm text-blue-800 font-medium mb-1">Score</p>
                                                    <p className="text-xl font-bold text-blue-700">
                                                        {quiz.score}/{quiz.maxScore}
                                                        <span className="text-sm ml-2">
                                                            ({((quiz.score / quiz.maxScore!) * 100).toFixed(0)}%)
                                                        </span>
                                                    </p>
                                                    <p className="text-xs text-blue-600 mt-1">
                                                        Completed on {new Date(quiz.completedDate!).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            )}

                                            <button
                                                onClick={() =>
                                                    quiz.status === "available"
                                                        ? toast.info("Starting quiz...")
                                                        : toast.info("Quiz not available")
                                                }
                                                disabled={quiz.status !== "available"}
                                                className={`w-full px-4 py-2 rounded-lg font-medium transition ${quiz.status === "available"
                                                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                    }`}
                                            >
                                                {quiz.status === "available"
                                                    ? "Start Quiz"
                                                    : quiz.status === "completed"
                                                        ? "Review Answers"
                                                        : "Locked"}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Past Papers Tab */}
                            {activeTab === "pastpapers" && (
                                <div className="space-y-3">
                                    {pastPapers.map((paper) => (
                                        <div
                                            key={paper.id}
                                            className="border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 transition"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-orange-100 rounded-lg">
                                                    <FileText className="text-orange-600" size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{paper.title}</h4>
                                                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                                        <span>{paper.subject}</span>
                                                        <span>•</span>
                                                        <span>{paper.year} - {paper.term}</span>
                                                        <span>•</span>
                                                        <span>{paper.fileSize}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => toast.success(`Downloading ${paper.title}...`)}
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                                                    title="Download"
                                                >
                                                    <Download size={20} className="text-gray-600" />
                                                </button>
                                                <button
                                                    onClick={() => toast.info("Preview feature coming soon")}
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                                                    title="Preview"
                                                >
                                                    <Eye size={20} className="text-gray-600" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
