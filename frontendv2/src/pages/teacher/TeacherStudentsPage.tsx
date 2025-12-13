import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '../../components/layout/MainLayout';
import { TeacherProfileError } from '../../components/teacher/TeacherProfileError';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Search, Mail, Phone, MoreHorizontal, Loader2, User, Plus, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { teacherService } from '../../services/teacher.service';
import { courseService } from '../../services/course.service';
import { studentService } from '../../services/student.service';
import { useToast } from '../../hooks/use-toast';

export const TeacherStudentsPage: React.FC = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const teacherId = user?.teacherId;

    const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch Teacher's Courses
    const { data: coursesData, isLoading: loadingCourses } = useQuery({
        queryKey: ['teacher-courses', teacherId],
        queryFn: () => teacherService.getCourses(teacherId!),
        enabled: !!teacherId,
    });

    const courses = Array.isArray(coursesData?.data) ? coursesData.data : (Array.isArray(coursesData) ? coursesData : []);

    // Set default course to 'all' or first course
    // Actually better to defaulting to first course to avoid complex "all" logic if we need separate API calls
    // But "All" is nice. Let's start with empty/all implies we fetch students for ALL courses? 
    // If we have many courses, that's many API calls. 
    // Let's stick to selecting a SPECIFIC course for now to be safe and performant.

    useEffect(() => {
        if (courses.length > 0 && selectedCourseId === 'all') {
            setSelectedCourseId(courses[0].id);
        }
    }, [courses]);

    // Fetch Students for selected course
    const { data: studentsData, isLoading: loadingStudents } = useQuery({
        queryKey: ['course-students', selectedCourseId],
        queryFn: () => courseService.getStudents(selectedCourseId),
        enabled: !!selectedCourseId && selectedCourseId !== 'all',
    });

    const students = Array.isArray(studentsData?.data) ? studentsData.data : (Array.isArray(studentsData) ? studentsData : []);

    const filteredStudents = students.filter((student: any) =>
        (student.first_name + ' ' + student.last_name).toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Enrollment Dialog State
    const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
    const [enrollSearchQuery, setEnrollSearchQuery] = useState('');
    const [isEnrolling, setIsEnrolling] = useState(false);
    const queryClient = useQueryClient();

    // Fetch students for enrollment (search results)
    const { data: searchResultsData, isLoading: isSearchingData } = useQuery({
        queryKey: ['students-search', enrollSearchQuery],
        queryFn: () => studentService.getAll({
            search: enrollSearchQuery,
            limit: 5,
            branch_id: user?.branch?.id  // Limit scope to branch
        }),
        enabled: enrollSearchQuery.length > 2 && isEnrollDialogOpen,
    });

    const searchResults = Array.isArray(searchResultsData?.data) ? searchResultsData.data : [];

    const handleEnrollStudent = async (studentId: string) => {
        if (!selectedCourseId || selectedCourseId === 'all') return;

        try {
            setIsEnrolling(true);
            await courseService.enrollStudent(selectedCourseId, studentId);
            toast({ title: 'Success', description: 'Student enrolled successfully' });
            queryClient.invalidateQueries({ queryKey: ['course-students', selectedCourseId] });
            // Don't close dialog immediately, maybe they want to add more
        } catch (error: any) {
            toast({ title: 'Error', description: error.response?.data?.message || 'Failed to enroll student', variant: 'destructive' });
        } finally {
            setIsEnrolling(false);
        }
    };

    if (!teacherId) {
        return <TeacherProfileError />;
    }

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">My Students</h1>
                        <p className="text-muted-foreground mt-1">
                            View and manage students in your classes
                        </p>
                    </div>
                    {selectedCourseId && selectedCourseId !== 'all' && (
                        <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" /> Enroll Student
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Enroll Student</DialogTitle>
                                    <DialogDescription>
                                        Search for a student to add to this class.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search by name or code..."
                                            className="pl-8"
                                            value={enrollSearchQuery}
                                            onChange={(e) => setEnrollSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                        {isSearchingData && (
                                            <div className="flex justify-center py-4">
                                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                            </div>
                                        )}
                                        {!isSearchingData && enrollSearchQuery.length > 2 && searchResults.length === 0 && (
                                            <p className="text-center text-sm text-muted-foreground py-4">No students found.</p>
                                        )}
                                        {searchResults.map((student: any) => {
                                            const isAlreadyEnrolled = students.some((s: any) => s.id === student.id);
                                            return (
                                                <div key={student.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary shrink-0">
                                                            {student.first_name?.charAt(0)}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium truncate">{student.first_name} {student.last_name}</p>
                                                            <p className="text-xs text-muted-foreground truncate">{student.student_code}</p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant={isAlreadyEnrolled ? "ghost" : "secondary"}
                                                        disabled={isAlreadyEnrolled || isEnrolling}
                                                        onClick={() => handleEnrollStudent(student.id)}
                                                    >
                                                        {isAlreadyEnrolled ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Plus className="w-4 h-4" />}
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="w-full md:w-64">
                        <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Class" />
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
                    <div className="relative flex-1 w-full md:max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search in class..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {loadingCourses || loadingStudents ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : filteredStudents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStudents.map((student: any) => (
                            <Card key={student.id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary shrink-0">
                                        {student.first_name?.charAt(0) || <User className="w-6 h-6" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="text-base truncate" title={`${student.first_name} ${student.last_name}`}>
                                            {student.first_name} {student.last_name}
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground truncate">{student.student_code}</p>
                                    </div>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Mail className="h-4 w-4 shrink-0" />
                                            <span className="truncate" title={student.email}>{student.email || 'No email'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Phone className="h-4 w-4 shrink-0" />
                                            <span>{student.phone || 'No phone'}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        {selectedCourseId && selectedCourseId !== 'all'
                            ? 'No students found in this class.'
                            : 'Please select a class to view students.'}
                    </div>
                )}
            </div>
        </MainLayout>
    );
};
