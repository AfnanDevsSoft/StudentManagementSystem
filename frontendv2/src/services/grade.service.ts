import { api, endpoints } from '../lib/api';

export interface Grade {
    id: string;
    student_id: string;
    course_id: string;
    grade: string;
    marks_obtained: number;
    total_marks: number;
    remarks?: string;
    exam_date: string;
    grading_period?: string;
    student?: {
        first_name: string;
        last_name: string;
        student_code: string;
    };
    course?: {
        course_name: string;
        course_code: string;
    };
}

export interface CreateGradeDto {
    student_id: string;
    course_id: string;
    grade: string;
    marks_obtained: number;
    total_marks: number;
    remarks?: string;
    exam_date: string;
    grading_period?: string;
}

export const gradeService = {
    async getAll() {
        const response = await api.get(endpoints.grades.list);
        return response.data;
    },

    async getById(id: string) {
        const response = await api.get(`/grades/${id}`);
        return response.data;
    },

    async create(data: CreateGradeDto) {
        const response = await api.post(endpoints.grades.create, data);
        return response.data;
    },

    async update(id: string, data: Partial<CreateGradeDto>) {
        const response = await api.put(`/grades/${id}`, data);
        return response.data;
    },

    async delete(id: string) {
        const response = await api.delete(`/grades/${id}`);
        return response.data;
    },
};
