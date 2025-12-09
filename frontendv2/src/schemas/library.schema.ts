import { z } from 'zod';

export const bookSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    author: z.string().min(1, 'Author is required'),
    isbn: z.string().min(1, 'ISBN is required'),
    publisher: z.string().optional(),
    publication_year: z.number().optional(),
    category: z.string().min(1, 'Category is required'),
    copies_available: z.number().min(0).default(1),
    total_copies: z.number().min(1).default(1),
    shelf_location: z.string().optional(),
});

export const issueBookSchema = z.object({
    book_id: z.string().min(1, 'Book is required'),
    student_id: z.string().min(1, 'Student is required'),
    issue_date: z.string().min(1, 'Issue date is required'),
    due_date: z.string().min(1, 'Due date is required'),
    return_date: z.string().optional(),
    status: z.enum(['Issued', 'Returned', 'Overdue']),
    fine_amount: z.number().min(0).default(0),
});

export type BookFormData = z.infer<typeof bookSchema>;
export type IssueBookFormData = z.infer<typeof issueBookSchema>;
