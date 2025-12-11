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
    studentId: string;
    feeId: string;
    amountPaid: number;
    paymentMethod: string;
    recordedBy: string;
    transactionId?: string;
}

// Backwards-compatible payment DTO
export interface LegacyPaymentDto {
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
    // Backwards-compatible 'fees' alias for feeStructures
    fees: {
        async getAll() {
            const response = await api.get(endpoints.finance.structures);
            return response.data;
        },
        async create(data: CreateFeeDto) {
            const response = await api.post(endpoints.finance.structures, data);
            return response.data;
        },
        async update(id: string, data: Partial<CreateFeeDto>) {
            const response = await api.put(`/fees/structures/${id}`, data);
            return response.data;
        },
        async delete(id: string) {
            const response = await api.delete(`/fees/structures/${id}`);
            return response.data;
        },
    },

    // Fee Structures (same as fees)
    feeStructures: {
        async getAll() {
            const response = await api.get(endpoints.finance.structures);
            return response.data;
        },
        async create(data: CreateFeeDto) {
            const response = await api.post(endpoints.finance.structures, data);
            return response.data;
        },
    },

    // Fee Records/Payment History
    feeRecords: {
        async getAll(params?: { studentId?: string }) {
            const response = await api.get(endpoints.finance.records, { params });
            return response.data;
        },
    },

    // Payments with full CRUD for backwards compatibility
    payments: {
        async getAll() {
            const response = await api.get(endpoints.finance.records);
            return response.data;
        },
        async process(data: CreatePaymentDto) {
            const response = await api.post(endpoints.finance.payment, data);
            return response.data;
        },
        async create(data: LegacyPaymentDto | CreatePaymentDto | any) {
            const response = await api.post(endpoints.finance.payment, data);
            return response.data;
        },
        async update(id: string, data: any) {
            const response = await api.put(`/fees/payment/${id}`, data);
            return response.data;
        },
        async delete(id: string) {
            const response = await api.delete(`/fees/payment/${id}`);
            return response.data;
        },
    },

    // Scholarships (placeholder - backend may not have this)
    scholarships: {
        async getAll() {
            // Return empty array if no scholarships endpoint exists
            try {
                const response = await api.get('/scholarships');
                return response.data;
            } catch {
                return { data: [] };
            }
        },
        async create(data: CreateScholarshipDto) {
            const response = await api.post('/scholarships', data);
            return response.data;
        },
        async update(id: string, data: Partial<CreateScholarshipDto>) {
            const response = await api.put(`/scholarships/${id}`, data);
            return response.data;
        },
        async delete(id: string) {
            const response = await api.delete(`/scholarships/${id}`);
            return response.data;
        },
    },

    // Student-specific fees
    studentFees: {
        async getOutstanding(studentId: string) {
            const response = await api.get(endpoints.finance.studentOutstanding(studentId));
            return response.data;
        },
        async getPaymentHistory(studentId: string) {
            const response = await api.get(endpoints.finance.studentPaymentHistory(studentId));
            return response.data;
        },
    },
};

