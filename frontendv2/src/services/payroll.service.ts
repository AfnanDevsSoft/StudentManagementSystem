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

    async create(data: CreatePayrollDto) {
        const response = await api.post(endpoints.payroll.create, data);
        return response.data;
    },

    async update(id: string, data: Partial<CreatePayrollDto>) {
        const response = await api.put(endpoints.payroll.update(id), data);
        return response.data;
    },

    async verify(id: string) {
        // Assuming verify/approve endpoint exists or using update to set status
        // Api.ts has 'approve'
        const response = await api.post(endpoints.payroll.approve(id));
        return response.data;
    },

    async delete(id: string) {
        // Fallback since delete wasn't explicitly listed in api.ts snippet I recall, 
        // but it's standard. If api.ts endpoints object doesn't have it, I use raw string.
        // Checking api.ts content: lines 167-173: list, create, get, update, approve. No delete.
        const response = await api.delete(`/payroll/${id}`);
        return response.data;
    },
};
