import { api, endpoints } from '../lib/api';

export interface CourseMaterial {
    id: string;
    title: string;
    description?: string;
    file_url?: string;
    link_url?: string;
    type: 'document' | 'video' | 'link' | 'other';
    course_id: string;
    teacher_id: string;
    created_at: string;
    updated_at: string;
}

export interface CreateCourseContentDto {
    title: string;
    description?: string;
    type: 'document' | 'video' | 'link' | 'other';
    file_url?: string;
    link_url?: string;
    course_id: string;
}

export const courseContentService = {
    async getByCourse(courseId: string) {
        const response = await api.get(endpoints.courseContent.list(courseId));
        return response.data;
    },

    async create(courseId: string, data: CreateCourseContentDto) {
        const response = await api.post(endpoints.courseContent.create(courseId), data);
        return response.data;
    },

    async update(id: string, data: Partial<CreateCourseContentDto>) {
        const response = await api.put(endpoints.courseContent.update(id), data);
        return response.data;
    },

    async delete(id: string) {
        const response = await api.delete(endpoints.courseContent.delete(id));
        return response.data;
    },

    async getById(id: string) {
        const response = await api.get(endpoints.courseContent.get(id));
        return response.data;
    }
};
