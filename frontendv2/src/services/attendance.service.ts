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

export interface CreateAttendanceDto {
    student_id: string;
    date: string;
    status: 'Present' | 'Absent' | 'Late' | 'Excused';
    remarks?: string;
}

export const attendanceService = {
    async getAll() {
        const response = await api.get(endpoints.attendance.list);
        return response.data;
    },

    async getById(id: string) {
        const response = await api.get(`/attendance/${id}`);
        return response.data;
    },

    async create(data: CreateAttendanceDto) {
        const response = await api.post(endpoints.attendance.mark, data);
        return response.data;
    },

    async update(id: string, data: Partial<CreateAttendanceDto>) {
        const response = await api.put(`/attendance/${id}`, data);
        return response.data;
    },

    async delete(id: string) {
        const response = await api.delete(`/attendance/${id}`);
        return response.data;
    },
};
