
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useAuth } from '../../contexts/AuthContext';
import { teacherService } from '../../services/teacher.service';
import { attendanceService } from '../../services/attendance.service';
import { courseService } from '../../services/course.service';
import {
    Search,
    Save,
    Loader2,
} from 'lucide-react';
import { TeacherProfileError } from '../../components/teacher/TeacherProfileError';
import { toast } from 'sonner';

export const TeacherAttendancePage: React.FC = () => {
    const { user } = useAuth();
    const teacherId = user?.teacherId;
    const queryClient = useQueryClient();

    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [attendanceState, setAttendanceState] = useState<Record<string, 'present' | 'absent' | 'late' | 'excused'>>({});
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch Teacher's Courses
    const { data: coursesData, isLoading: loadingCourses } = useQuery({
        queryKey: ['teacher-courses', teacherId],
        queryFn: () => teacherService.getCourses(teacherId!),
        enabled: !!teacherId,
    });

    const courses = Array.isArray(coursesData?.data) ? coursesData.data : (Array.isArray(coursesData) ? coursesData : []);

    // Set default course
    React.useEffect(() => {
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

    // Fetch Existing Attendance
    const { data: existingAttendanceData, isLoading: loadingAttendance } = useQuery({
        queryKey: ['course-attendance', selectedCourseId, selectedDate],
        queryFn: () => attendanceService.getByCourse(selectedCourseId, { date: selectedDate }),
        enabled: !!selectedCourseId && !!selectedDate,
    });

    // Initialize attendance state from existing data or default to present
    React.useEffect(() => {
        if (students.length > 0) {
            const newState: Record<string, 'present' | 'absent' | 'late' | 'excused'> = {};

            const existingRecords = Array.isArray(existingAttendanceData?.data)
                ? existingAttendanceData.data
                : (Array.isArray(existingAttendanceData) ? existingAttendanceData : []);

            students.forEach((student: any) => {
                const record = existingRecords.find((r: any) => r.student_id === student.id);
                newState[student.id] = record
                    ? (record.status.toLowerCase() as any)
                    : 'present';
            });
            setAttendanceState(newState);
        }
    }, [students, existingAttendanceData]);

    const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
        setAttendanceState(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const markAll = (status: 'present' | 'absent') => {
        const newState: Record<string, 'present' | 'absent' | 'late' | 'excused'> = {};
        students.forEach((student: any) => {
            // Only update visible students if searching
            if (student.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.last_name.toLowerCase().includes(searchQuery.toLowerCase())) {
                newState[student.id] = status;
            } else {
                newState[student.id] = attendanceState[student.id];
            }
        });
        setAttendanceState(prev => ({ ...prev, ...newState }));
    };

    const saveMutation = useMutation({
        mutationFn: (data: any) => attendanceService.bulkMark(data),
        onSuccess: () => {
            toast.success('Attendance saved successfully');
            queryClient.invalidateQueries({ queryKey: ['course-attendance', selectedCourseId, selectedDate] });
        },
        onError: (error) => {
            toast.error('Failed to save attendance');
            console.error(error);
        }
    });

    const handleSave = () => {
        if (!selectedCourseId) return;

        const records = Object.entries(attendanceState).map(([studentId, status]) => ({
            studentId,
            status,
            remarks: ''
        }));

        saveMutation.mutate({
            courseId: selectedCourseId,
            date: selectedDate,
            records
        });
    };

    const filteredStudents = students.filter((student: any) =>
        `${student.first_name} ${student.last_name} `.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.student_code?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = React.useMemo(() => {
        const total = filteredStudents.length;
        if (total === 0) return {
            total: 0,
            present: 0, presentRate: 0,
            absent: 0, absentRate: 0,
            late: 0, lateRate: 0,
            excused: 0
        };

        const present = filteredStudents.filter((s: any) => attendanceState[s.id] === 'present').length;
        const absent = filteredStudents.filter((s: any) => attendanceState[s.id] === 'absent').length;
        const late = filteredStudents.filter((s: any) => attendanceState[s.id] === 'late').length;
        const excused = filteredStudents.filter((s: any) => attendanceState[s.id] === 'excused').length;

        return {
            total,
            present,
            presentRate: Math.round((present / total) * 100),
            absent,
            absentRate: Math.round((absent / total) * 100),
            late,
            lateRate: Math.round((late / total) * 100),
            excused
        };
    }, [filteredStudents, attendanceState]);

    if (!teacherId) {
        return <TeacherProfileError />;
    }

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Class Attendance</h1>
                        <p className="text-muted-foreground mt-1">
                            Mark and manage daily attendance for your classes
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => markAll('present')}>Mark All Present</Button>
                        <Button onClick={handleSave} disabled={saveMutation.isPending}>
                            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Attendance
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="w-full md:w-64">
                                <label className="text-sm font-medium mb-2 block">Select Class</label>
                                <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.map((course: any) => (
                                            <SelectItem key={course.id} value={course.id}>
                                                {course.course_name || course.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-full md:w-48">
                                <label className="text-sm font-medium mb-2 block">Date</label>
                                <Input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    min={new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0]} // Optional min date
                                    max={new Date().toISOString().split('T')[0]} // Prevent future attendance? Maybe not needed.
                                />
                            </div>
                            <div className="w-full md:flex-1">
                                <label className="text-sm font-medium mb-2 block">Search Student</label>
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name or roll no..."
                                        className="pl-8"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4 flex flex-col justify-center items-center text-center">
                            <p className="text-sm font-medium text-muted-foreground">Present</p>
                            <h3 className="text-2xl font-bold mt-1 text-green-600">{stats.present} <span className="text-sm font-normal text-muted-foreground">({stats.presentRate}%)</span></h3>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex flex-col justify-center items-center text-center">
                            <p className="text-sm font-medium text-muted-foreground">Absent</p>
                            <h3 className="text-2xl font-bold mt-1 text-red-500">{stats.absent} <span className="text-sm font-normal text-muted-foreground">({stats.absentRate}%)</span></h3>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex flex-col justify-center items-center text-center">
                            <p className="text-sm font-medium text-muted-foreground">Late</p>
                            <h3 className="text-2xl font-bold mt-1 text-yellow-600">{stats.late} <span className="text-sm font-normal text-muted-foreground">({stats.lateRate}%)</span></h3>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex flex-col justify-center items-center text-center">
                            <p className="text-sm font-medium text-muted-foreground">Excused</p>
                            <h3 className="text-2xl font-bold mt-1 text-blue-500">{stats.excused}</h3>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent>
                        {loadingCourses || loadingStudents || loadingAttendance ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : filteredStudents.length > 0 ? (
                            <div className="rounded-md border">
                                <table className="w-full">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="p-4 text-left font-medium">Student Name</th>
                                            <th className="p-4 text-left font-medium hidden md:table-cell">Roll No</th>
                                            <th className="p-4 text-center font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStudents.map((student: any) => (
                                            <tr key={student.id} className="border-t hover:bg-muted/50">
                                                <td className="p-4">
                                                    <div className="font-medium">{student.first_name} {student.last_name}</div>
                                                </td>
                                                <td className="p-4 text-muted-foreground hidden md:table-cell">
                                                    {student.student_code}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex justify-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant={attendanceState[student.id] === 'present' ? 'default' : 'outline'}
                                                            className={attendanceState[student.id] === 'present' ? 'bg-green-600 hover:bg-green-700' : ''}
                                                            onClick={() => handleStatusChange(student.id, 'present')}
                                                        >
                                                            P
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant={attendanceState[student.id] === 'absent' ? 'default' : 'outline'}
                                                            className={attendanceState[student.id] === 'absent' ? 'bg-red-600 hover:bg-red-700' : ''}
                                                            onClick={() => handleStatusChange(student.id, 'absent')}
                                                        >
                                                            A
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant={attendanceState[student.id] === 'late' ? 'default' : 'outline'}
                                                            className={attendanceState[student.id] === 'late' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                                                            onClick={() => handleStatusChange(student.id, 'late')}
                                                        >
                                                            L
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant={attendanceState[student.id] === 'excused' ? 'default' : 'outline'}
                                                            className={attendanceState[student.id] === 'excused' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                                                            onClick={() => handleStatusChange(student.id, 'excused')}
                                                        >
                                                            E
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                {selectedCourseId ? 'No students found for this class' : 'Please select a class'}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </MainLayout >
    );
};
