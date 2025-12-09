import { api, endpoints } from '../lib/api';

// Interfaces
export interface Fee {
    id: string;
    name: string;
    amount: number;
    due_date: string;
    description?: string;
    academic_year_id?: string;
}

export interface FeePayment {
    id: string;
    student_id: string;
    fee_id: string;
    amount_paid: number;
    payment_date: string;
    payment_method: 'Cash' | 'Credit Card' | 'Bank Transfer' | 'Online';
    transaction_id?: string;
    status: 'Pending' | 'Completed' | 'Failed';
    student?: {
        first_name: string;
        last_name: string;
        student_code: string;
    };
    fee?: {
        name: string;
        amount: number;
    };
}

export interface Scholarship {
    id: string;
    name: string;
    description?: string;
    amount: number;
    student_id: string;
    start_date: string;
    end_date: string;
    conditions?: string;
    student?: {
        first_name: string;
        last_name: string;
    };
}

// DTOs
export interface CreateFeeDto {
    name: string;
    amount: number;
    due_date: string;
    description?: string;
    academic_year_id?: string;
}

export interface CreatePaymentDto {
    student_id: string;
    fee_id: string;
    amount_paid: number;
    payment_date: string;
    payment_method: string;
    transaction_id?: string;
    status: string;
}

export interface CreateScholarshipDto {
    name: string;
    amount: number;
    student_id: string;
    start_date: string;
    end_date: string;
    conditions?: string;
}

export const financeService = {
    fees: {
        async getAll() {
            const response = await api.get(endpoints.finance.fees);
            return response.data;
        },
        async create(data: CreateFeeDto) {
            const response = await api.post(endpoints.finance.fees, data);
            return response.data;
        },
        async update(id: string, data: Partial<CreateFeeDto>) {
            const response = await api.put(`${endpoints.finance.fees}/${id}`, data);
            return response.data;
        },
        async delete(id: string) {
            const response = await api.delete(`${endpoints.finance.fees}/${id}`);
            return response.data;
        },
    },

    payments: {
        async getAll() {
            const response = await api.get(endpoints.finance.payments);
            return response.data;
        },
        async create(data: CreatePaymentDto) {
            const response = await api.post(endpoints.finance.payments, data);
            return response.data;
        },
        async update(id: string, data: Partial<CreatePaymentDto>) {
            const response = await api.put(`${endpoints.finance.payments}/${id}`, data);
            return response.data;
        },
        async delete(id: string) {
            const response = await api.delete(`${endpoints.finance.payments}/${id}`);
            return response.data;
        },
    },

    scholarships: {
        async getAll() {
            const response = await api.get(endpoints.finance.scholarships);
            return response.data;
        },
        async create(data: CreateScholarshipDto) {
            const response = await api.post(endpoints.finance.scholarships, data);
            return response.data;
        },
        async update(id: string, data: Partial<CreateScholarshipDto>) {
            const response = await api.put(`${endpoints.finance.scholarships}/${id}`, data);
            return response.data;
        },
        async delete(id: string) {
            const response = await api.delete(`${endpoints.finance.scholarships}/${id}`);
            return response.data;
        },
    },
};
