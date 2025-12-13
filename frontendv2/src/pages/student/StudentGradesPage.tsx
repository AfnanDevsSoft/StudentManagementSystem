import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuth } from '../../contexts/AuthContext';
import { StudentProfileError } from '../../components/student/StudentProfileError';
import { studentService } from '../../services/student.service';
import {
    Award,
    TrendingUp,
    BookOpen,
    BarChart3,
    Loader2,
    AlertCircle,
} from 'lucide-react';

export const StudentGradesPage: React.FC = () => {
    const { user } = useAuth();
    const studentId = user?.studentId;

    // Fetch student grades
    const { data: gradesData, isLoading, error } = useQuery({
        queryKey: ['student-grades', studentId],
        queryFn: () => studentService.getGrades(studentId!),
        enabled: !!studentId,
    });

    const grades = gradesData?.data || gradesData || [];

    // Calculate GPA and stats
    const gradePoints: Record<string, number> = {
        'A+': 4.0, 'A': 4.0, 'A-': 3.7,
        'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7,
        'D+': 1.3, 'D': 1.0, 'D-': 0.7,
        'F': 0
    };

    const validGrades = Array.isArray(grades) ? grades.filter((g: any) => g.grade || g.score) : [];

    const totalGradePoints = validGrades.reduce((sum: number, g: any) => {
        const letterGrade = g.grade?.toUpperCase() || '';
        const points = gradePoints[letterGrade] || 0;
        return sum + points;
    }, 0);

    const currentGPA = validGrades.length > 0 ? (totalGradePoints / validGrades.length).toFixed(2) : '0.00';

    const totalCredits = validGrades.reduce((sum: number, g: any) => sum + (g.credits || g.course?.credits || 3), 0);

    const averageScore = validGrades.length > 0
        ? Math.round(validGrades.reduce((sum: number, g: any) => sum + (g.score || g.marks || 0), 0) / validGrades.length)
        : 0;

    const getGradeColor = (grade: string) => {
        if (!grade) return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
        const upper = grade.toUpperCase();
        if (upper.startsWith('A')) return 'text-green-600 bg-green-100 dark:bg-green-900/30';
        if (upper.startsWith('B')) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
        if (upper.startsWith('C')) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
        if (upper.startsWith('D')) return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
    };

    if (!studentId) {
        return <StudentProfileError />;
    }

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">My Grades</h1>
                    <p className="text-muted-foreground mt-1">
                        View your academic performance and grade history
                    </p>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <span className="ml-2 text-muted-foreground">Loading grades...</span>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center py-12">
                        <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
                        <h2 className="text-xl font-semibold">Failed to load grades</h2>
                        <p className="text-muted-foreground mt-2">
                            {(error as Error).message || 'An error occurred while fetching your grades.'}
                        </p>
                    </div>
                )}

                {/* Content */}
                {!isLoading && !error && (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Current GPA</p>
                                            <h3 className="text-3xl font-bold mt-1">{currentGPA}</h3>
                                            <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                                                <TrendingUp className="w-3 h-3" />
                                                Academic Standing
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-primary/10">
                                            <Award className="w-6 h-6 text-primary" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Average Score</p>
                                            <h3 className="text-3xl font-bold mt-1">{averageScore}%</h3>
                                        </div>
                                        <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
                                            <BarChart3 className="w-6 h-6 text-green-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Total Credits</p>
                                            <h3 className="text-3xl font-bold mt-1">{totalCredits}</h3>
                                        </div>
                                        <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                                            <BookOpen className="w-6 h-6 text-blue-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Graded Items</p>
                                            <h3 className="text-3xl font-bold mt-1">{validGrades.length}</h3>
                                        </div>
                                        <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                                            <BookOpen className="w-6 h-6 text-purple-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Grades Table */}
                        {validGrades.length > 0 ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Grade Details</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Course</th>
                                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Assessment</th>
                                                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Score</th>
                                                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Grade</th>
                                                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {validGrades.map((grade: any, index: number) => (
                                                    <tr key={grade.id || index} className="border-b hover:bg-muted/50 transition-colors">
                                                        <td className="py-3 px-4 font-medium">
                                                            {grade.course?.name || grade.course_name || 'Course'}
                                                        </td>
                                                        <td className="py-3 px-4 text-muted-foreground">
                                                            {grade.assessment_type || grade.type || 'Assessment'}
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-primary rounded-full"
                                                                        style={{ width: `${grade.score || grade.marks || 0}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-sm">
                                                                    {grade.score || grade.marks || 0}/{grade.max_score || grade.total_marks || 100}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex justify-center">
                                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(grade.grade)}`}>
                                                                    {grade.grade || 'N/A'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4 text-center text-muted-foreground text-sm">
                                                            {grade.graded_at || grade.created_at
                                                                ? new Date(grade.graded_at || grade.created_at).toLocaleDateString()
                                                                : '-'
                                                            }
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="text-center py-12">
                                <Award className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                                <h2 className="text-xl font-semibold">No Grades Yet</h2>
                                <p className="text-muted-foreground mt-2">
                                    Your grades will appear here once your instructors have graded your work.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </MainLayout>
    );
};
