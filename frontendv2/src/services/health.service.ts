import { api, endpoints } from '../lib/api';

export interface HealthRecord {
    id: string;
    student_id: string;
    blood_group?: string;
    height?: number;
    weight?: number;
    allergies?: string;
    medical_history?: string;
    emergency_contact?: string;
    emergency_phone?: string;
    last_checkup_date?: string;
    notes?: string;
    student?: {
        first_name: string;
        last_name: string;
        student_code: string;
        date_of_birth: string;
    };
}

export interface CreateHealthRecordDto {
    student_id: string;
    blood_group?: string;
    height?: number;
    weight?: number;
    allergies?: string;
    medical_history?: string;
    emergency_contact?: string;
    emergency_phone?: string;
    last_checkup_date?: string;
    notes?: string;
}

export interface MedicalCheckupDto {
    checkup_date: string;
    height?: number;
    weight?: number;
    blood_pressure?: string;
    temperature?: number;
    findings?: string;
    recommendations?: string;
    conducted_by?: string;
}

export interface VaccinationDto {
    vaccine_name: string;
    administered_date: string;
    administered_by?: string;
    next_due_date?: string;
    batch_number?: string;
    notes?: string;
}

export const healthService = {
    // Backwards-compatible CRUD methods for HealthPage
    async getAll() {
        // Use the medical records list endpoint
        const response = await api.get('/medical/records');
        return response.data;
    },

    async create(data: CreateHealthRecordDto) {
        // Create health record for a student - POST to /medical/student/:studentId
        const response = await api.post(endpoints.health.studentRecord(data.student_id), data);
        return response.data;
    },

    async update(id: string, data: Partial<CreateHealthRecordDto>) {
        // Update health record by ID
        const response = await api.put(`/medical/records/${id}`, data);
        return response.data;
    },

    async delete(id: string) {
        const response = await api.delete(`/medical/records/${id}`);
        return response.data;
    },

    // Get student health record
    async getByStudentId(studentId: string) {
        const response = await api.get(endpoints.health.studentRecord(studentId));
        return response.data;
    },

    // Get health summary (includes checkups, vaccinations, incidents)
    async getSummary(studentId: string) {
        const response = await api.get(endpoints.health.summary(studentId));
        return response.data;
    },

    // Create/update student health record
    async upsert(studentId: string, data: CreateHealthRecordDto) {
        const response = await api.post(endpoints.health.studentRecord(studentId), data);
        return response.data;
    },

    // Checkups
    checkups: {
        async getByStudent(studentId: string) {
            const response = await api.get(endpoints.health.checkups(studentId));
            return response.data;
        },
        async create(studentId: string, data: MedicalCheckupDto) {
            const response = await api.post(endpoints.health.checkups(studentId), data);
            return response.data;
        },
    },

    // Vaccinations
    vaccinations: {
        async getByStudent(studentId: string) {
            const response = await api.get(endpoints.health.vaccinations(studentId));
            return response.data;
        },
        async create(studentId: string, data: VaccinationDto) {
            const response = await api.post(endpoints.health.vaccinations(studentId), data);
            return response.data;
        },
    },

    // Incidents
    incidents: {
        async getByStudent(studentId: string) {
            const response = await api.get(endpoints.health.incidents(studentId));
            return response.data;
        },
        async report(studentId: string, data: any) {
            const response = await api.post(endpoints.health.incidents(studentId), data);
            return response.data;
        },
    },
};
