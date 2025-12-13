import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { TeacherProfileError } from '../../components/teacher/TeacherProfileError';
import { teacherService } from '../../services/teacher.service';
import { gradeService } from '../../services/grade.service';
import { courseService } from '../../services/course.service';
import { Save, FileSpreadsheet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const TeacherGradesPage: React.FC = () => {
    const { user } = useAuth();
    const teacherId = user?.teacherId;
    const queryClient = useQueryClient();

    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [gradingPeriod, setGradingPeriod] = useState<string>('Midterm');
    const [maxMarks, setMaxMarks] = useState<number>(100);
    const [gradesState, setGradesState] = useState<Record<string, { marks: number, remarks: string, grade: string }>>({});

    // Fetch Teacher's Courses
    const { data: coursesData, isLoading: loadingCourses } = useQuery({
        queryKey: ['teacher-courses', teacherId],
        queryFn: () => teacherService.getCourses(teacherId!),
        enabled: !!teacherId,
    });

    const courses = Array.isArray(coursesData?.data) ? coursesData.data : (Array.isArray(coursesData) ? coursesData : []);

    // Set default course
    useEffect(() => {
        if (courses.length > 0 && !selectedCourseId) {
            setSelectedCourseId(courses[0].id);
        }
    }, [courses, selectedCourseId]);

    // Fetch Students for selected course
    const { data: studentsData, isLoading: loadingStudents } = useQuery({
        queryKey: ['course-students', selectedCourseId],
        queryFn: () => courseService.getStudents(selectedCourseId),
        enabled: !!selectedCourseId,
    });

    const students = Array.isArray(studentsData?.data) ? studentsData.data : (Array.isArray(studentsData) ? studentsData : []);

    // Fetch Existing Grades
    const { data: existingGradesData, isLoading: loadingGrades } = useQuery({
        queryKey: ['course-grades', selectedCourseId],
        queryFn: () => gradeService.getByCourse(selectedCourseId),
        enabled: !!selectedCourseId,
    });

    // Populate grades state
    useEffect(() => {
        if (students.length > 0) {
            const newState: Record<string, { marks: number, remarks: string, grade: string }> = {};

            const existingRecords = Array.isArray(existingGradesData?.data)
                ? existingGradesData.data
                : (Array.isArray(existingGradesData) ? existingGradesData : []);

            // Filter for current assessment type if possible, or just look for matches
            // Ideally backend returns grades filtered by type, or we filter here
            const relevantGrades = existingRecords.filter((g: any) =>
                g.assessment_type === gradingPeriod || g.type === gradingPeriod || g.grading_period === gradingPeriod
            );

            students.forEach((student: any) => {
                const record = relevantGrades.find((r: any) => r.student_id === student.id);
                newState[student.id] = {
                    marks: record ? (record.marks_obtained || record.score || 0) : 0,
                    remarks: record ? (record.remarks || '') : '',
                    grade: record ? (record.grade || calculateGrade(record.marks_obtained || record.score || 0, maxMarks)) : 'F'
                };
            });
            setGradesState(newState);
        }
    }, [students, existingGradesData, gradingPeriod, maxMarks]);

    const calculateGrade = (marks: number, total: number) => {
        const percentage = (marks / total) * 100;
        if (percentage >= 90) return 'A';
        if (percentage >= 85) return 'B+';
        if (percentage >= 80) return 'B';
        if (percentage >= 75) return 'C+';
        if (percentage >= 70) return 'C';
        if (percentage >= 60) return 'D';
        return 'F';
    };

    const handleMarksChange = (studentId: string, marksStr: string) => {
        const marks = parseFloat(marksStr) || 0;
        const boundedMarks = Math.min(Math.max(marks, 0), maxMarks);
        const grade = calculateGrade(boundedMarks, maxMarks);

        setGradesState(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                marks: boundedMarks,
                grade
            }
        }));
    };

    const handleRemarksChange = (studentId: string, remarks: string) => {
        setGradesState(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                remarks
            }
        }));
    };

    const saveMutation = useMutation({
        mutationFn: (data: any) => gradeService.bulkCreate(data),
        onSuccess: () => {
            toast.success('Grades published successfully');
            queryClient.invalidateQueries({ queryKey: ['course-grades', selectedCourseId] });
        },
        onError: (error) => {
            toast.error('Failed to publish grades');
            console.error(error);
        }
    });

    const handleSave = () => {
        if (!selectedCourseId) return;

        const grades = Object.entries(gradesState).map(([studentId, data]) => ({
            studentId,
            marksObtained: data.marks,
            remarks: data.remarks
        }));

        saveMutation.mutate({
            courseId: selectedCourseId,
            assessmentType: gradingPeriod,
            totalMarks: maxMarks,
            gradedBy: teacherId,
            grades
        });
    };

    if (!teacherId) {
        return <TeacherProfileError />;
    }


    // Calculate Statistics
    const stats = React.useMemo(() => {
        const scores = Object.values(gradesState).map(s => s.marks);
        if (scores.length === 0) return { average: 0, highest: 0, lowest: 0, passRate: 0 };

        const sum = scores.reduce((a, b) => a + b, 0);
        const average = (sum / scores.length).toFixed(1);
        const highest = Math.max(...scores);
        const lowest = Math.min(...scores);
        // Assuming 40% is passing
        const passing = scores.filter(s => s >= (maxMarks * 0.4)).length;
        const passRate = Math.round((passing / scores.length) * 100);

        return { average, highest, lowest, passRate };
    }, [gradesState, maxMarks]);

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Grades Management</h1>
                        <p className="text-muted-foreground mt-1">
                            Enter and publish student grades
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <FileSpreadsheet className="w-4 h-4 mr-2" />
                            Import CSV
                        </Button>
                        <Button onClick={handleSave} disabled={saveMutation.isPending}>
                            {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Publish Grades
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="w-full md:w-64 space-y-2">
                                <label className="text-sm font-medium">Select Class</label>
                                <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.map((cls: any) => (
                                            <SelectItem key={cls.id} value={cls.id}>
                                                {cls.course_name || cls.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-full md:w-48 space-y-2">
                                <label className="text-sm font-medium">Assessment Type</label>
                                <Select value={gradingPeriod} onValueChange={setGradingPeriod}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Midterm">Midterm Exam</SelectItem>
                                        <SelectItem value="Final">Final Exam</SelectItem>
                                        <SelectItem value="Quiz">Quiz</SelectItem>
                                        <SelectItem value="Assignment">Assignment</SelectItem>
                                        <SelectItem value="Project">Project</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-full md:w-32 space-y-2">
                                <label className="text-sm font-medium">Max Marks</label>
                                <Input
                                    type="number"
                                    value={maxMarks}
                                    onChange={(e) => setMaxMarks(Number(e.target.value))}
                                    min={1}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4 flex flex-col justify-center items-center text-center">
                            <p className="text-sm font-medium text-muted-foreground">Class Average</p>
                            <h3 className="text-2xl font-bold mt-1">{stats.average}%</h3>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex flex-col justify-center items-center text-center">
                            <p className="text-sm font-medium text-muted-foreground">Highest Score</p>
                            <h3 className="text-2xl font-bold mt-1 text-green-600">{stats.highest}</h3>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex flex-col justify-center items-center text-center">
                            <p className="text-sm font-medium text-muted-foreground">Lowest Score</p>
                            <h3 className="text-2xl font-bold mt-1 text-red-500">{stats.lowest}</h3>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex flex-col justify-center items-center text-center">
                            <p className="text-sm font-medium text-muted-foreground">Pass Rate</p>
                            <h3 className="text-2xl font-bold mt-1">{stats.passRate}%</h3>
                        </CardContent>
                    </Card>
                </div>

                {/* Grading Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Student Grades</span>
                            <Badge variant="secondary" className="font-normal">
                                {students.length} Students
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loadingCourses || loadingStudents || loadingGrades ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : students.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-4 font-medium w-1/3">Student</th>
                                            <th className="text-left p-4 font-medium">Score (0-{maxMarks})</th>
                                            <th className="text-left p-4 font-medium">Grade</th>
                                            <th className="text-left p-4 font-medium">Comments</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map((student: any) => (
                                            <tr key={student.id} className="border-b last:border-0 hover:bg-muted/50">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                                            {student.first_name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{student.first_name} {student.last_name}</p>
                                                            <p className="text-xs text-muted-foreground">ID: {student.student_code}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <Input
                                                        type="number"
                                                        value={gradesState[student.id]?.marks || 0}
                                                        onChange={(e) => handleMarksChange(student.id, e.target.value)}
                                                        className="w-24"
                                                        min={0}
                                                        max={maxMarks}
                                                    />
                                                </td>
                                                <td className="p-4">
                                                    <Badge variant="outline" className="text-lg w-12 justify-center">
                                                        {gradesState[student.id]?.grade || 'F'}
                                                    </Badge>
                                                </td>
                                                <td className="p-4">
                                                    <Input
                                                        placeholder="Add comment..."
                                                        className="w-full"
                                                        value={gradesState[student.id]?.remarks || ''}
                                                        onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                {selectedCourseId ? 'No students found in this class' : 'Please select a class'}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
};
