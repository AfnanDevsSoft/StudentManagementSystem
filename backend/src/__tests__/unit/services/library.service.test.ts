import LibraryService from '../../../services/library.service';
import { prisma } from '../../../lib/db';

jest.mock('../../../lib/db', () => ({
    prisma: {
        book: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
        bookLoan: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
        bookFine: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    },
}));

describe('LibraryService Unit Tests', () => {
    const mockBook = { id: 'book-123', title: 'Test Book', author: 'Author', available_copies: 5, branch_id: 'b-123' };
    const mockLoan = { id: 'loan-123', book_id: 'book-123', student_id: 's-123', status: 'active', due_date: new Date() };

    beforeEach(() => { jest.clearAllMocks(); });

    describe('getBooks', () => {
        it('should return books for branch', async () => {
            (prisma.book.findMany as jest.Mock).mockResolvedValue([mockBook]);
            const result = await LibraryService.getBooks('b-123');
            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(1);
        });

        it('should filter by category', async () => {
            (prisma.book.findMany as jest.Mock).mockResolvedValue([mockBook]);
            await LibraryService.getBooks('b-123', { category: 'Fiction' });
            expect(prisma.book.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({ category: 'Fiction' })
            }));
        });
    });

    describe('createBook', () => {
        it('should create book', async () => {
            (prisma.book.create as jest.Mock).mockResolvedValue(mockBook);
            const result = await LibraryService.createBook({ branch_id: 'b-123', title: 'New Book', author: 'Author' });
            expect(result.success).toBe(true);
        });
    });

    describe('updateBook', () => {
        it('should update book', async () => {
            (prisma.book.update as jest.Mock).mockResolvedValue({ ...mockBook, title: 'Updated' });
            const result = await LibraryService.updateBook('book-123', { title: 'Updated' });
            expect(result.success).toBe(true);
        });
    });

    describe('deleteBook', () => {
        it('should soft delete book', async () => {
            (prisma.book.update as jest.Mock).mockResolvedValue({ ...mockBook, is_active: false });
            const result = await LibraryService.deleteBook('book-123');
            expect(result.success).toBe(true);
        });
    });

    describe('issueBook', () => {
        it('should issue book when available', async () => {
            (prisma.book.findUnique as jest.Mock).mockResolvedValue(mockBook);
            (prisma.bookLoan.findMany as jest.Mock).mockResolvedValue([]);
            (prisma.bookLoan.create as jest.Mock).mockResolvedValue(mockLoan);
            (prisma.book.update as jest.Mock).mockResolvedValue({ ...mockBook, available_copies: 4 });

            const result = await LibraryService.issueBook({
                book_id: 'book-123', student_id: 's-123', borrower_type: 'student', issued_by: 'lib-1'
            });
            expect(result.success).toBe(true);
        });

        it('should reject if book not available', async () => {
            (prisma.book.findUnique as jest.Mock).mockResolvedValue({ ...mockBook, available_copies: 0 });
            const result = await LibraryService.issueBook({ book_id: 'book-123', borrower_type: 'student' });
            expect(result.success).toBe(false);
            expect(result.message).toContain('not available');
        });
    });

    describe('returnBook', () => {
        it('should return book successfully', async () => {
            (prisma.bookLoan.findUnique as jest.Mock).mockResolvedValue({ ...mockLoan, due_date: new Date(Date.now() + 86400000) });
            (prisma.bookLoan.update as jest.Mock).mockResolvedValue({ ...mockLoan, status: 'returned' });
            (prisma.book.update as jest.Mock).mockResolvedValue({ ...mockBook, available_copies: 6 });

            const result = await LibraryService.returnBook('loan-123', 'lib-1');
            expect(result.success).toBe(true);
        });

        it('should reject if already returned', async () => {
            (prisma.bookLoan.findUnique as jest.Mock).mockResolvedValue({ ...mockLoan, status: 'returned' });
            const result = await LibraryService.returnBook('loan-123', 'lib-1');
            expect(result.success).toBe(false);
            expect(result.message).toContain('already returned');
        });
    });

    describe('renewBook', () => {
        it('should renew book', async () => {
            (prisma.bookLoan.findUnique as jest.Mock).mockResolvedValue({ ...mockLoan, renewed_count: 0 });
            (prisma.bookLoan.update as jest.Mock).mockResolvedValue({ ...mockLoan, renewed_count: 1 });
            const result = await LibraryService.renewBook('loan-123');
            expect(result.success).toBe(true);
        });

        it('should reject if max renewals reached', async () => {
            (prisma.bookLoan.findUnique as jest.Mock).mockResolvedValue({ ...mockLoan, renewed_count: 2 });
            const result = await LibraryService.renewBook('loan-123');
            expect(result.success).toBe(false);
            expect(result.message).toContain('Maximum renewals');
        });
    });

    describe('getBorrowerLoans', () => {
        it('should return loans for borrower', async () => {
            (prisma.bookLoan.findMany as jest.Mock).mockResolvedValue([mockLoan]);
            const result = await LibraryService.getBorrowerLoans('s-123', 'student');
            expect(result.success).toBe(true);
        });
    });
});
