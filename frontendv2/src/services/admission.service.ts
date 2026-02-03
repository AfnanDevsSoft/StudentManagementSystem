import { api, endpoints } from '../lib/api';

export interface AdmissionDocument {
    id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    document_type: 'attachment' | 'offer_letter';
    created_at: string;
}

export interface Admission {
    id: string;
    application_number: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    date_of_birth: string;
    gender: 'Male' | 'Female' | 'Other';
    address?: string;
    city?: string;
    state?: string;
    previous_school?: string;
    previous_institution_type?: string;
    previous_marks?: string;
    previous_percentage?: string;
    previous_grade?: string;
    grade_applying_for: string;
    application_date: string;
    status: 'submitted' | 'approved' | 'rejected' | 'enrolled';
    notes?: string;
    branch_id: string;
    documents?: AdmissionDocument[];
    rejection_reason?: string;
    student_username?: string;
    student_id?: string;
    created_by?: string;
    review_notes?: string;
    reviewed_by?: string;
    review_date?: string;
    branch?: { id: string; name: string; code: string };
}

export interface CreateAdmissionDto {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    date_of_birth: string;
    gender: 'Male' | 'Female' | 'Other';
    address?: string;
    city?: string;
    state?: string;
    previous_school?: string;
    previous_institution_type?: string;
    previous_marks?: string;
    previous_percentage?: string;
    previous_grade?: string;
    grade_applying_for: string;
    application_date: string;
    notes?: string;
    branch_id?: string;
}

export const admissionService = {
    async getAll(params?: { page?: number; limit?: number; search?: string }) {
        const response = await api.get(endpoints.admissions.list, { params });
        return response.data;
    },

    async getById(id: string) {
        const response = await api.get(endpoints.admissions.get(id));
        return response.data;
    },

    async create(data: CreateAdmissionDto, files?: File[]) {
        // Handle branch_id logic
        let branch_id = data.branch_id;
        if (!branch_id) {
            try {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    branch_id = user?.branch_id || user?.branch?.id;
                }
            } catch (e) {
                console.error('Error parsing user from localStorage:', e);
            }
        }

        const formData = new FormData();
        formData.append('branchId', branch_id || '');
        formData.append('applicantEmail', data.email);
        formData.append('applicantPhone', data.phone);
        formData.append('applicantData', JSON.stringify(data));

        if (files && files.length > 0) {
            files.forEach((file) => {
                formData.append('documents', file);
            });
        }

        const response = await api.post(endpoints.admissions.create, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    async update(id: string, data: Partial<CreateAdmissionDto>) {
        const response = await api.put(endpoints.admissions.update(id), data);
        return response.data;
    },

    async delete(id: string) {
        const response = await api.delete(endpoints.admissions.delete(id));
        return response.data;
    },

    async approve(id: string, offerLetterFile: File, reviewNotes?: string) {
        const formData = new FormData();
        formData.append('offerLetter', offerLetterFile);
        if (reviewNotes) {
            formData.append('reviewNotes', reviewNotes);
        }

        const response = await api.post(endpoints.admissions.approve(id), formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    async reject(id: string, reason: string) {
        const response = await api.post(endpoints.admissions.reject(id), { reason });
        return response.data;
    },

    async setCredentials(id: string, username: string, password: string) {
        const response = await api.post(endpoints.admissions.setCredentials(id), {
            username,
            password,
        });
        return response.data;
    },

    async suggestUsername(id: string) {
        const response = await api.get(endpoints.admissions.suggestUsername(id));
        return response.data;
    },

    getDocumentDownloadUrl(docId: string) {
        return `${api.defaults.baseURL}${endpoints.admissions.downloadDocument(docId)}`;
    },
};
