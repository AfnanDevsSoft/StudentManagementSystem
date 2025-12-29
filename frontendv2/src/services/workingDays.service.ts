import { api, endpoints } from '../lib/api';

export interface WorkingDaysConfig {
    id: string;
    branch_id: string;
    academic_year_id?: string;
    grade_level_id?: string;
    total_days: number;
    start_date: string;
    end_date: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    branch?: {
        id: string;
        name: string;
        code: string;
    };
    academic_year?: {
        id: string;
        year: string;
    };
    grade_level?: {
        id: string;
        name: string;
        code: string;
    };
}

export interface CreateWorkingDaysConfigDto {
    branch_id?: string;
    academic_year_id?: string;
    grade_level_id?: string;
    total_days: number;
    start_date: string;
    end_date: string;
    is_active?: boolean;
}

export interface AttendanceSummary {
    id: string;
    entity_type: 'student' | 'teacher';
    entity_id: string;
    branch_id: string;
    academic_year_id?: string;
    total_working_days: number;
    days_present: number;
    days_absent: number;
    days_late: number;
    days_excused: number;
    attendance_percentage: number;
    meets_minimum: boolean;
    last_calculated: string;
    created_at: string;
    updated_at: string;
}

export const workingDaysService = {
    /**
     * Get active working days configuration
     */
    async getConfig(params?: {
        branchId?: string;
        academicYearId?: string;
        gradeLevelId?: string;
    }) {
        const response = await api.get('/working-days', { params });
        return response.data;
    },

    /**
     * Get all working days configurations
     */
    async getAllConfigs(params?: {
        branchId?: string;
        page?: number;
        limit?: number;
    }) {
        const response = await api.get('/working-days/all', { params });
        return response.data;
    },

    /**
     * Create or update working days configuration
     */
    async createConfig(data: CreateWorkingDaysConfigDto) {
        const response = await api.post('/working-days', data);
        return response.data;
    },

    /**
     * Update working days configuration
     */
    async updateConfig(id: string, data: Partial<CreateWorkingDaysConfigDto>) {
        const response = await api.put(`/working-days/${id}`, data);
        return response.data;
    },

    /**
     * Delete working days configuration
     */
    async deleteConfig(id: string) {
        const response = await api.delete(`/working-days/${id}`);
        return response.data;
    },

    /**
     * Calculate working days between two dates
     */
    async calculateWorkingDays(data: {
        start_date: string;
        end_date: string;
        branch_id?: string;
    }) {
        const response = await api.post('/working-days/calculate', data);
        return response.data;
    },

    /**
     * Get student attendance summary
     */
    async getStudentSummary(
        studentId: string,
        params?: {
            academicYearId?: string;
            branchId?: string;
        }
    ): Promise<{ success: boolean; data?: AttendanceSummary; message?: string }> {
        const response = await api.get(`/attendance/summary/student/${studentId}`, { params });
        return response.data;
    },

    /**
     * Get teacher attendance summary
     */
    async getTeacherSummary(
        teacherId: string,
        params?: {
            academicYearId?: string;
            branchId?: string;
        }
    ): Promise<{ success: boolean; data?: AttendanceSummary; message?: string }> {
        const response = await api.get(`/attendance/summary/teacher/${teacherId}`, { params });
        return response.data;
    },

    /**
     * Recalculate attendance summary
     */
    async recalculateSummary(data: {
        entityType: 'student' | 'teacher';
        entityId: string;
        academicYearId?: string;
        branchId?: string;
    }) {
        const response = await api.post('/attendance/summary/recalculate', data);
        return response.data;
    },
};

export default workingDaysService;
