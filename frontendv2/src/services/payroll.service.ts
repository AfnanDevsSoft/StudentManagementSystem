import { api, endpoints } from '../lib/api';

export interface Payroll {
    id: string;
    teacher_id: string;
    salary_amount: number;
    bonus: number;
    deductions: number;
    net_salary: number; // Calculated field
    payment_date: string;
    payment_method: 'Bank Transfer' | 'Check' | 'Cash';
    status: 'Paid' | 'Pending' | 'Processing';
    remarks?: string;
    teacher?: {
        first_name: string;
        last_name: string;
        email: string;
    };
}

export interface ProcessPayrollDto {
    teacherId: string;
    branchId: string;
    month: number;
    year: number;
    baseSalary: number;
    daysWorked?: number;
    leaveDays?: number;
    deductions?: number;
    bonuses?: number;
}

// Backwards-compatible DTO for old pages
export interface CreatePayrollDto {
    teacher_id: string;
    salary_amount: number;
    bonus: number;
    deductions: number;
    payment_date: string;
    payment_method: 'Bank Transfer' | 'Check' | 'Cash';
    status: 'Paid' | 'Pending' | 'Processing';
    remarks?: string;
}

export const payrollService = {
    async getAll() {
        const response = await api.get(endpoints.payroll.list);
        return response.data;
    },

    async getById(id: string) {
        const response = await api.get(endpoints.payroll.get(id));
        return response.data;
    },

    async getByTeacher(teacherId: string) {
        const response = await api.get(endpoints.payroll.teacherPayroll(teacherId));
        return response.data;
    },

    async process(data: ProcessPayrollDto) {
        const response = await api.post(endpoints.payroll.process, data);
        return response.data;
    },

    // Alias for backwards compatibility - 'create' maps to 'process'
    async create(data: CreatePayrollDto | any) {
        const response = await api.post(endpoints.payroll.process, data);
        return response.data;
    },

    async update(id: string, data: Partial<ProcessPayrollDto | CreatePayrollDto>) {
        const response = await api.put(endpoints.payroll.update(id), data);
        return response.data;
    },

    async approve(id: string) {
        const response = await api.post(endpoints.payroll.approve(id));
        return response.data;
    },

    // Alias for backwards compatibility - 'verify' maps to 'approve'
    async verify(id: string) {
        const response = await api.post(endpoints.payroll.approve(id));
        return response.data;
    },

    async delete(id: string) {
        const response = await api.delete(`/payroll/${id}`);
        return response.data;
    },
};
