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
    studentId: string;
    courseId: string;
    assessmentType: 'exam' | 'quiz' | 'assignment' | 'project' | 'midterm' | 'final';
    marksObtained: number;
    totalMarks: number;
    gradedBy: string;
    remarks?: string;
}

// Backwards-compatible legacy DTO
export interface LegacyGradeDto {
    student_id: string;
    course_id: string;
    grade: string;
    marks_obtained: number;
    total_marks: number;
    exam_date: string;
    remarks?: string;
    grading_period?: string;
}

export interface BulkGradeDto {
    courseId: string;
    assessmentType: string;
    totalMarks: number;
    gradedBy: string;
    grades: Array<{
        studentId: string;
        marksObtained: number;
        remarks?: string;
    }>;
}

export const gradeService = {
    // Backwards-compatible getAll - fetches grades with pagination
    async getAll(params?: { page?: number; limit?: number }) {
        const response = await api.get('/grades', { params });
        return response.data;
    },

    // Get grades for a specific student
    async getByStudent(studentId: string, params?: { courseId?: string }) {
        const response = await api.get(endpoints.students.grades(studentId), { params });
        return response.data;
    },

    // Get grades for a course
    async getByCourse(courseId: string) {
        const response = await api.get(`/courses/${courseId}/grades`);
        return response.data;
    },

    // Create single grade entry - supports both new and legacy DTO formats
    async create(data: CreateGradeDto | LegacyGradeDto | any) {
        // Handle legacy format
        const courseId = data.courseId || data.course_id;
        if (courseId) {
            const response = await api.post(`/courses/${courseId}/grades`, data);
            return response.data;
        }
        // Fallback to generic grades endpoint
        const response = await api.post('/grades', data);
        return response.data;
    },

    // Bulk create grades for a course
    async bulkCreate(data: BulkGradeDto) {
        const response = await api.post(`/courses/${data.courseId}/grades/bulk`, data);
        return response.data;
    },

    // Update a grade
    async update(gradeId: string, data: Partial<CreateGradeDto | LegacyGradeDto>) {
        const response = await api.put(`/grades/${gradeId}`, data);
        return response.data;
    },

    // Delete a grade
    async delete(gradeId: string) {
        const response = await api.delete(`/grades/${gradeId}`);
        return response.data;
    },
};
