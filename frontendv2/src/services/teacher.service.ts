import { api, endpoints } from '../lib/api';

export interface Teacher {
    id: string;
    employee_code: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    hire_date: string;
    employment_type: string;
    department?: string;
    designation?: string;
    qualification?: string;
    years_experience?: number;
    is_active: boolean;
    branch_id: string;
    user_id?: string;
}

export interface CreateTeacherDto {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    hire_date: string;
    employment_type: string;
    department?: string;
    designation?: string;
    qualification?: string;
    years_experience?: number;
}

export const teacherService = {
    async getAll() {
        const response = await api.get(endpoints.teachers.list);
        return response.data;
    },

    async getById(id: string) {
        const response = await api.get(endpoints.teachers.get(id));
        return response.data;
    },

    async create(data: CreateTeacherDto) {
        // Get branch_id from user in localStorage
        let branch_id: string | undefined;
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                branch_id = user?.branch_id || user?.branch?.id;
            }
        } catch (e) {
            console.error('Error parsing user from localStorage:', e);
        }

        // If still no branch_id, try to get from current_branch
        if (!branch_id) {
            try {
                const branchStr = localStorage.getItem('current_branch');
                if (branchStr) {
                    const branch = JSON.parse(branchStr);
                    branch_id = branch?.id;
                }
            } catch (e) {
                console.error('Error parsing current_branch from localStorage:', e);
            }
        }

        // If still no branch_id, fetch from API
        if (!branch_id) {
            try {
                const branchesResponse = await api.get(endpoints.branches.list);
                const branches = branchesResponse.data?.data || branchesResponse.data;
                if (branches && branches.length > 0) {
                    branch_id = branches[0].id;
                }
            } catch (e) {
                console.error('Error fetching branches:', e);
            }
        }

        // Transform frontend data to backend format
        const backendData = {
            ...data,
            // Auto-generate employee code (backend will validate uniqueness)
            employee_code: `EMP${Date.now().toString().slice(-8)}`,
            branch_id: branch_id,
        };

        const response = await api.post(endpoints.teachers.create, backendData);
        return response.data;
    },

    async update(id: string, data: Partial<CreateTeacherDto>) {
        const response = await api.put(endpoints.teachers.update(id), data);
        return response.data;
    },

    async delete(id: string) {
        const response = await api.delete(endpoints.teachers.delete(id));
        return response.data;
    },

    // ========== Teacher Portal Methods ==========

    /**
     * Get courses assigned to a specific teacher
     */
    async getCourses(teacherId: string) {
        const response = await api.get(endpoints.teachers.courses(teacherId));
        return response.data;
    },

    /**
     * Get all students in teacher's courses
     */
    async getStudents(teacherId: string) {
        // First get the teacher's courses, then count unique students
        const coursesResponse = await api.get(endpoints.teachers.courses(teacherId));
        const courses = coursesResponse.data?.data || coursesResponse.data || [];

        // Return courses with student count
        return courses.map((course: any) => ({
            ...course,
            studentCount: course.enrollments?.length || course.students?.length || 0
        }));
    },

    /**
     * Get leave requests for a teacher
     */
    async getLeaveRequests(teacherId: string) {
        const response = await api.get(endpoints.leaves.teacherLeaves(teacherId));
        return response.data;
    },

    /**
     * Get payroll records for a teacher
     */
    async getPayroll(teacherId: string) {
        const response = await api.get(endpoints.payroll.teacherPayroll(teacherId));
        return response.data;
    },
};
