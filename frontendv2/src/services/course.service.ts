import { api, endpoints } from '../lib/api';

export interface Course {
    id: string;
    course_code: string;
    course_name: string;
    subject_id: string;
    grade_level_id: string;
    teacher_id: string;
    academic_year_id: string;
    max_students?: number;
    room_number?: string;
    building?: string;
    branch_id: string;
    teacher?: {
        first_name: string;
        last_name: string;
    };
}

export interface CreateCourseDto {
    course_code: string;
    course_name: string;
    subject_id: string;
    grade_level_id: string;
    teacher_id: string;
    academic_year_id: string;
    max_students?: number;
    room_number?: string;
    building?: string;
}

export const courseService = {
    async getAll() {
        const response = await api.get(endpoints.courses.list);
        return response.data;
    },

    async getById(id: string) {
        const response = await api.get(endpoints.courses.get(id));
        return response.data;
    },

    async create(data: CreateCourseDto) {
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

        const backendData = {
            ...data,
            branch_id: branch_id,
        };

        const response = await api.post(endpoints.courses.create, backendData);
        return response.data;
    },

    async update(id: string, data: Partial<CreateCourseDto>) {
        const response = await api.put(endpoints.courses.update(id), data);
        return response.data;
    },

    async delete(id: string) {
        const response = await api.delete(endpoints.courses.delete(id));
        return response.data;
    },
};
