import { api, endpoints } from '../lib/api';

export interface LeaveRequest {
    id: string;
    type: 'sick' | 'casual' | 'annual' | 'unpaid';
    start_date: string;
    end_date: string;
    reason: string;
    days: number;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    teacher_id?: string;
    student_id?: string;
    rejection_reason?: string;
}

export interface CreateLeaveRequestDto {
    leaveType: string;
    startDate: string;
    endDate: string;
    reason: string;
    teacherId?: string;
    studentId?: string;
}

export const leaveService = {
    async getTeacherLeaves(teacherId: string) {
        // api.ts has endpoints.leaves.teacherLeaves
        const response = await api.get(endpoints.leaves.teacherLeaves(teacherId));
        return response.data;
    },

    async requestLeave(data: CreateLeaveRequestDto) {
        const response = await api.post(endpoints.leaves.request, data);
        return response.data;
    },

    async getPending() {
        const response = await api.get(endpoints.leaves.pending);
        return response.data;
    },

    async approve(id: string) {
        const response = await api.post(endpoints.leaves.approve(id));
        return response.data;
    },

    async reject(id: string, reason: string) {
        const response = await api.post(endpoints.leaves.reject(id), { reason });
        return response.data;
    },
};
