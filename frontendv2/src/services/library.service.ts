import { api, endpoints } from '../lib/api';

export interface Book {
    id: string;
    title: string;
    author: string;
    isbn: string;
    publisher?: string;
    publication_year?: number;
    category: string;
    copies_available: number;
    total_copies: number;
    shelf_location?: string;
}

export interface IssuedBook {
    id: string;
    book_id: string;
    student_id: string;
    issue_date: string;
    due_date: string;
    return_date?: string;
    status: 'Issued' | 'Returned' | 'Overdue';
    fine_amount: number;
    book?: Book;
    student?: {
        first_name: string;
        last_name: string;
        student_code: string;
    };
}

export interface CreateBookDto {
    title: string;
    author: string;
    isbn: string;
    category: string;
    total_copies: number;
    branch_id?: string;
    [key: string]: any;
}

export interface IssueBookDto {
    bookId: string;
    borrowerId: string;
    borrowerType: 'student' | 'teacher';
    issuedBy: string;
    dueDate?: string;
}

// Loan operations object - used by both 'loans' and 'issued' aliases
const loanOperations = {
    async getAll() {
        // Get all active/recent loans
        const response = await api.get('/library/loans');
        return response.data;
    },
    async getOverdue() {
        const response = await api.get(endpoints.library.loansOverdue);
        return response.data;
    },
    async getByBorrower(borrowerId: string) {
        const response = await api.get(endpoints.library.loansByBorrower(borrowerId));
        return response.data;
    },
    async issue(data: IssueBookDto) {
        const response = await api.post(endpoints.library.issue, data);
        return response.data;
    },
    async return(loanId: string, data?: { return_date?: string; fine_amount?: number }) {
        const response = await api.put(endpoints.library.return(loanId), data || {});
        return response.data;
    },
    async renew(loanId: string) {
        const response = await api.put(endpoints.library.renew(loanId), {});
        return response.data;
    },
    async update(loanId: string, data: any) {
        const response = await api.put(`/library/loans/${loanId}`, data);
        return response.data;
    },
};

export const libraryService = {
    books: {
        async getAll(branchId?: string) {
            const params = branchId ? { branch_id: branchId } : {};
            const response = await api.get(endpoints.library.books, { params });
            return response.data;
        },
        async getById(id: string) {
            const response = await api.get(endpoints.library.bookById(id));
            return response.data;
        },
        async create(data: CreateBookDto) {
            const response = await api.post(endpoints.library.books, data);
            return response.data;
        },
        async update(id: string, data: Partial<CreateBookDto>) {
            const response = await api.put(endpoints.library.bookById(id), data);
            return response.data;
        },
        async delete(id: string) {
            const response = await api.delete(endpoints.library.bookById(id));
            return response.data;
        },
    },

    // Primary alias
    loans: loanOperations,

    // Backwards-compatible alias for pages using 'issued'
    issued: loanOperations,

    fines: {
        async getAll() {
            const response = await api.get(endpoints.library.fines);
            return response.data;
        },
        async waive(fineId: string, waivedBy: string, reason?: string) {
            const response = await api.put(endpoints.library.waiveFine(fineId), { waivedBy, reason });
            return response.data;
        },
    },
};
