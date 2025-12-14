import { api } from '../lib/api';

export interface Assignment {
    id: string;
    title: string;
    description?: string;
    course_id: string;
    teacher_id: string;
    due_date: string;
    status: 'active' | 'closed' | 'draft';
    max_score?: number;
    created_at: string;
}

export interface CreateAssignmentDto {
    title: string;
    description?: string;
    course_id: string;
    due_date: string;
    status: 'active' | 'closed' | 'draft';
    max_score?: number;
}

export const assignmentService = {
    async getByCourse(courseId: string) {
        // Backend might not have this exact endpoint, checking api.ts it doesn't show assignment endpoints explicitly?
        // Let's assume there is a generic assignment endpoint or I should check api.ts again.
        // I will use a placeholder endpoint for now and I might need to update api.ts
        const response = await api.get(`/assignments/course/${courseId}`);
        return response.data;
    },

    async getStudentAssignments(courseId: string) {
        const response = await api.get(`/assignments/student-course/${courseId}`);
        return response.data;
    },

    async create(data: CreateAssignmentDto) {
        const response = await api.post('/assignments', data);
        return response.data;
    },

    async update(id: string, data: Partial<CreateAssignmentDto>) {
        const response = await api.put(`/assignments/${id}`, data);
        return response.data;
    },

    async delete(id: string) {
        const response = await api.delete(`/assignments/${id}`);
        return response.data;
    },

    async getSubmissions(assignmentId: string) {
        const response = await api.get(`/assignments/${assignmentId}/submissions`);
        return response.data;
    },

    async submitAssignment(id: string, data: { content_url: string }) {
        const response = await api.post(`/assignments/${id}/submit`, data);
        return response.data;
    }
};
