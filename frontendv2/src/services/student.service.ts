import { api, endpoints } from '../lib/api';

export interface Student {
    id: string;
    student_code: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    date_of_birth: string;
    gender: string;
    blood_group?: string;
    nationality?: string;
    admission_date: string;
    admission_status: string;
    current_grade_level_id?: string;
    is_active: boolean;
    branch_id: string;
    user_id?: string;
}

export interface CreateStudentDto {
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    date_of_birth: string;
    gender: string;
    blood_group?: string;
    nationality?: string;
    admission_date: string;
    current_grade_level_id?: string;
}

export const studentService = {
    async getAll() {
        const response = await api.get(endpoints.students.list);
        return response.data;
    },

    async getById(id: string) {
        const response = await api.get(endpoints.students.get(id));
        return response.data;
    },

    async create(data: CreateStudentDto) {
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
                    branch_id = branches[0].id; // Use first available branch
                }
            } catch (e) {
                console.error('Error fetching branches:', e);
            }
        }

        if (!branch_id) {
            throw new Error('Branch ID is missing. Please ensure you are logged in or a branch is created.');
        }

        // Transform frontend data to backend format
        const backendData = {
            first_name: data.first_name,
            last_name: data.last_name,
            personal_email: data.email || null,
            personal_phone: data.phone || null,
            date_of_birth: data.date_of_birth,
            gender: data.gender,
            blood_group: data.blood_group || null,
            nationality: data.nationality || null,
            admission_date: data.admission_date,
            current_grade_level_id: data.current_grade_level_id || null,
            // Auto-generate student code (backend will validate uniqueness)
            student_code: `STU${Date.now().toString().slice(-8)}`,
            branch_id: branch_id,
        };

        const response = await api.post(endpoints.students.create, backendData);
        return response.data;
    },

    async update(id: string, data: Partial<CreateStudentDto>) {
        // Transform frontend data to backend format
        const backendData: any = {};

        if (data.first_name) backendData.first_name = data.first_name;
        if (data.last_name) backendData.last_name = data.last_name;
        if (data.email !== undefined) backendData.personal_email = data.email || null;
        if (data.phone !== undefined) backendData.personal_phone = data.phone || null;
        if (data.date_of_birth) backendData.date_of_birth = data.date_of_birth;
        if (data.gender) backendData.gender = data.gender;
        if (data.blood_group !== undefined) backendData.blood_group = data.blood_group || null;
        if (data.nationality !== undefined) backendData.nationality = data.nationality || null;
        if (data.admission_date) backendData.admission_date = data.admission_date;
        if (data.current_grade_level_id !== undefined) backendData.current_grade_level_id = data.current_grade_level_id || null;

        const response = await api.put(endpoints.students.update(id), backendData);
        return response.data;
    },

    async delete(id: string) {
        const response = await api.delete(endpoints.students.delete(id));
        return response.data;
    },
};
