import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { teacherService } from '../../services/teacher.service';
import { attendanceService } from '../../services/attendance.service';
import { Search, Calendar, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../../components/ui/badge';

export const HRTeacherAttendancePage: React.FC = () => {
    const queryClient = useQueryClient();
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch All Teachers
    const { data: teachersData, isLoading: loadingTeachers } = useQuery({
        queryKey: ['teachers'],
        queryFn: () => teacherService.getAll(),
    });

    const teachers = teachersData?.data || [];

    // Check if we need to fetch existing attendance for all teachers on this date
    // Current API limitation: We might need to fetch attendance per teacher or have a bulk fetch.
    // Optimal approach: Fetch all teachers, then for each, we could try to see if we have attendance info.
    // However, existing `getTeacherAttendance` is per teacher. 
    // Optimization: We can treat "marks" as individual actions for now. If we reload the page, we might not see today's status unless we fetch it.
    // A better approach for V2 would be a `getAttendanceByDate` endpoint for a branch.
    // For now, I will optimistically update local state or just rely on "Marking" them.
    // To show current status, we really DO need the data.
    // Let's implement a quick client-side fetch loop or just leave it "action-based" for MVP.
    // Actually, let's just fetch individual attendance for visible teachers if list is small, or assume default.
    // Better yet: Just let the user mark. If it's already marked, the backend handles the update.

    // Filter teachers
    const filteredTeachers = teachers.filter((teacher: any) =>
        `${teacher.first_name} ${teacher.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.employee_code?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const markAttendanceMutation = useMutation({
        mutationFn: (data: { teacherId: string; status: string }) =>
            attendanceService.markTeacherAttendance({
                teacher_id: data.teacherId,
                date: selectedDate,
                status: data.status
            }),
        onSuccess: (data) => {
            const { status, leaves_info } = data.data;
            toast.success(`Marked as ${status}`);

            // Invalidate teachers query to refresh leave counts
            queryClient.invalidateQueries({ queryKey: ['teachers'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to mark attendance');
        }
    });

    const handleMark = (teacherId: string, status: string) => {
        markAttendanceMutation.mutate({ teacherId, status });
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Teacher Attendance</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage daily attendance and leaves for staff
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                        <Input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-40"
                        />
                    </div>
                </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search teachers..."
                                        className="pl-8"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <table className="w-full">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="p-4 text-left font-medium">Employee</th>
                                            <th className="p-4 text-left font-medium">Leaves Remaining</th>
                                            <th className="p-4 text-center font-medium">Mark Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loadingTeachers ? (
                                            <tr>
                                                <td colSpan={3} className="p-8 text-center text-muted-foreground">
                                                    Loading teachers...
                                                </td>
                                            </tr>
                                        ) : filteredTeachers.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="p-8 text-center text-muted-foreground">
                                                    No teachers found.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredTeachers.map((teacher: any) => {
                                                const remaining = (teacher.total_leaves || 24) - (teacher.used_leaves || 0);
                                                return (
                                                    <tr key={teacher.id} className="border-t hover:bg-muted/50">
                                                        <td className="p-4">
                                                            <div className="font-medium">
                                                                {teacher.first_name} {teacher.last_name}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {teacher.employee_code}
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant={remaining < 5 ? "destructive" : "secondary"}>
                                                                    {remaining} Days
                                                                </Badge>
                                                                <span className="text-xs text-muted-foreground">
                                                                    ({teacher.used_leaves || 0} used)
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex justify-center gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="hover:bg-green-100 hover:text-green-700 hover:border-green-600"
                                                                    onClick={() => handleMark(teacher.id, 'Present')}
                                                                >
                                                                    Present
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="hover:bg-red-100 hover:text-red-700 hover:border-red-600"
                                                                    onClick={() => handleMark(teacher.id, 'Absent')}
                                                                >
                                                                    Absent
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="hover:bg-yellow-100 hover:text-yellow-700 hover:border-yellow-600"
                                                                    onClick={() => handleMark(teacher.id, 'Late')}
                                                                >
                                                                    Late
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="hover:bg-blue-100 hover:text-blue-700 hover:border-blue-600"
                                                                    onClick={() => handleMark(teacher.id, 'Leave')}
                                                                >
                                                                    Leave
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
};
