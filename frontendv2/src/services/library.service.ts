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
    [key: string]: any;
}

export interface IssueBookDto {
    book_id: string;
    student_id: string;
    issue_date: string;
    due_date: string;
}

export const libraryService = {
    books: {
        async getAll() {
            const response = await api.get(endpoints.library.books);
            return response.data;
        },
        async create(data: CreateBookDto) {
            const response = await api.post(endpoints.library.books, data);
            return response.data;
        },
        async update(id: string, data: Partial<CreateBookDto>) {
            const response = await api.put(`${endpoints.library.books}/${id}`, data);
            return response.data;
        },
        async delete(id: string) {
            const response = await api.delete(`${endpoints.library.books}/${id}`);
            return response.data;
        },
    },

    issued: {
        async getAll() {
            const response = await api.get(endpoints.library.loans);
            return response.data;
        },
        async issue(data: IssueBookDto) {
            const response = await api.post(endpoints.library.issue, data); // API has issue endpoint
            return response.data;
        },
        async return(id: string, data: { return_date: string; fine_amount?: number }) {
            const response = await api.put(`${endpoints.library.return}/${id}`, data); // API has return endpoint
            return response.data;
        },
        async update(id: string, data: any) {
            const response = await api.put(`${endpoints.library.loans}/${id}`, data);
            return response.data;
        }
    },
};
