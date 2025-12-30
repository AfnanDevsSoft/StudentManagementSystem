import { api, endpoints } from '../lib/api';

export interface Attendance {
    id: string;
    student_id: string;
    date: string;
    status: 'Present' | 'Absent' | 'Late' | 'Excused';
    remarks?: string;
    student?: {
        first_name: string;
        last_name: string;
        student_code: string;
    };
}

export interface MarkAttendanceDto {
    studentId: string;
    courseId: string;
    date: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    remarks?: string;
}

// Backwards-compatible legacy DTO
export interface LegacyAttendanceDto {
    student_id: string;
    date: string;
    status: 'Present' | 'Absent' | 'Late' | 'Excused';
    remarks?: string;
}

export interface BulkAttendanceDto {
    courseId: string;
    date: string;
    records: Array<{
        studentId: string;
        status: 'present' | 'absent' | 'late' | 'excused';
        remarks?: string;
    }>;
}

export const attendanceService = {
    // Backwards-compatible getAll - fetches all attendance records
    async getAll() {
        const response = await api.get('/attendance');
        return response.data;
    },

    // Backwards-compatible create
    async create(data: LegacyAttendanceDto | MarkAttendanceDto | any) {
        const response = await api.post('/attendance', data);
        return response.data;
    },

    // Backwards-compatible update
    async update(id: string, data: Partial<LegacyAttendanceDto>) {
        const response = await api.put(`/attendance/${id}`, data);
        return response.data;
    },

    // Backwards-compatible delete
    async delete(id: string) {
        const response = await api.delete(`/attendance/${id}`);
        return response.data;
    },

    // Get attendance for a specific student
    async getByStudent(studentId: string, params?: { startDate?: string; endDate?: string }) {
        const response = await api.get(endpoints.students.attendance(studentId), { params });
        return response.data;
    },

    // Get attendance for a course
    async getByCourse(courseId: string, params?: { date?: string }) {
        const response = await api.get(`/courses/${courseId}/attendance`, { params });
        return response.data;
    },

    // Mark single student attendance
    async mark(data: MarkAttendanceDto) {
        const response = await api.post(`/courses/${data.courseId}/attendance`, data);
        return response.data;
    },

    // Bulk mark attendance for a course
    async bulkMark(data: BulkAttendanceDto) {
        const response = await api.post(`/courses/${data.courseId}/attendance/bulk`, data);
        return response.data;
    },

    // Mark attendance for a teacher
    async markTeacherAttendance(data: {
        teacher_id: string;
        date: string;
        status: string;
        remarks?: string;
    }) {
        const response = await api.post('/attendance/teacher', data);
        return response.data;
    },
};
