import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
}

class LibraryService {
    // ==================== BOOKS ====================

    /**
     * Get all books
     */
    static async getBooks(branchId: string, filters?: any, userContext?: any): Promise<ApiResponse> {
        try {
            // Data Scoping
            if (userContext && userContext.role?.name !== 'SuperAdmin') {
                branchId = userContext.branch_id;
            }

            const where: any = { branch_id: branchId, is_active: true };

            if (filters?.category) where.category = filters.category;
            if (filters?.author) where.author = { contains: filters.author, mode: "insensitive" };
            if (filters?.title) where.title = { contains: filters.title, mode: "insensitive" };

            const books = await prisma.book.findMany({
                where,
                orderBy: { title: "asc" },
            });

            return {
                success: true,
                message: "Books fetched successfully",
                data: books,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to fetch books",
            };
        }
    }

    /**
     * Create a book
     */
    static async createBook(data: any, userContext?: any): Promise<ApiResponse> {
        try {
            // Data Scoping
            if (userContext && userContext.role?.name !== 'SuperAdmin') {
                data.branch_id = userContext.branch_id;
            }

            const book = await prisma.book.create({
                data: {
                    branch_id: data.branch_id,
                    isbn: data.isbn,
                    title: data.title,
                    author: data.author,
                    publisher: data.publisher,
                    publication_year: data.publication_year,
                    category: data.category,
                    language: data.language || "English",
                    total_copies: data.total_copies || 1,
                    available_copies: data.total_copies || 1,
                    shelf_location: data.shelf_location,
                    description: data.description,
                    cover_image_url: data.cover_image_url,
                    price: data.price,
                },
            });

            return {
                success: true,
                message: "Book created successfully",
                data: book,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to create book",
            };
        }
    }

    /**
     * Update a book
     */
    static async updateBook(id: string, data: any): Promise<ApiResponse> {
        try {
            const book = await prisma.book.update({
                where: { id },
                data,
            });

            return {
                success: true,
                message: "Book updated successfully",
                data: book,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to update book",
            };
        }
    }

    /**
     * Delete a book
     */
    static async deleteBook(id: string): Promise<ApiResponse> {
        try {
            await prisma.book.update({
                where: { id },
                data: { is_active: false },
            });

            return {
                success: true,
                message: "Book deleted successfully",
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to delete book",
            };
        }
    }

    // ==================== BOOK LOANS ====================

    /**
     * Issue a book
     */
    static async issueBook(data: any): Promise<ApiResponse> {
        try {
            // Check book availability
            const book = await prisma.book.findUnique({
                where: { id: data.book_id },
            });

            if (!book) {
                return { success: false, message: "Book not found" };
            }

            if (book.available_copies < 1) {
                return { success: false, message: "Book is not available" };
            }

            // Check if borrower has overdue books
            const overdueLoans = await this.getOverdueLoans(
                data.borrower_type === "student" ? data.student_id : data.teacher_id,
                data.borrower_type
            );

            if (overdueLoans.data && overdueLoans.data.length > 0) {
                return {
                    success: false,
                    message: "Cannot issue book. Borrower has overdue books.",
                };
            }

            // Calculate due date (14 days from now)
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 14);

            // Create loan
            const loan = await prisma.bookLoan.create({
                data: {
                    book_id: data.book_id,
                    student_id: data.student_id,
                    teacher_id: data.teacher_id,
                    borrower_type: data.borrower_type,
                    due_date: dueDate,
                    issued_by: data.issued_by,
                    notes: data.notes,
                },
                include: {
                    book: true,
                    student: data.student_id
                        ? { select: { first_name: true, last_name: true } }
                        : undefined,
                    teacher: data.teacher_id
                        ? { select: { first_name: true, last_name: true } }
                        : undefined,
                },
            });

            // Update book availability
            await prisma.book.update({
                where: { id: data.book_id },
                data: { available_copies: { decrement: 1 } },
            });

            return {
                success: true,
                message: "Book issued successfully",
                data: loan,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to issue book",
            };
        }
    }

    /**
     * Return a book
     */
    static async returnBook(id: string, returnedTo: string): Promise<ApiResponse> {
        try {
            const loan = await prisma.bookLoan.findUnique({
                where: { id },
                include: { book: true },
            });

            if (!loan) {
                return { success: false, message: "Loan not found" };
            }

            if (loan.status === "returned") {
                return { success: false, message: "Book already returned" };
            }

            const returnDate = new Date();
            const isOverdue = returnDate > loan.due_date;

            // Update loan
            const updatedLoan = await prisma.bookLoan.update({
                where: { id },
                data: {
                    return_date: returnDate,
                    returned_to: returnedTo,
                    status: "returned",
                },
                include: {
                    book: true,
                },
            });

            // Update book availability
            await prisma.book.update({
                where: { id: loan.book_id },
                data: { available_copies: { increment: 1 } },
            });

            // Create fine if overdue
            if (isOverdue) {
                const daysOverdue = Math.ceil(
                    (returnDate.getTime() - loan.due_date.getTime()) / (1000 * 60 * 60 * 24)
                );
                const fineAmount = daysOverdue * 5; // $5 per day

                await prisma.bookFine.create({
                    data: {
                        loan_id: loan.id,
                        fine_amount: fineAmount,
                        days_overdue: daysOverdue,
                    },
                });
            }

            return {
                success: true,
                message: isOverdue
                    ? "Book returned. Fine applied for overdue."
                    : "Book returned successfully",
                data: updatedLoan,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to return book",
            };
        }
    }

    /**
     * Renew a book
     */
    static async renewBook(id: string): Promise<ApiResponse> {
        try {
            const loan = await prisma.bookLoan.findUnique({
                where: { id },
            });

            if (!loan) {
                return { success: false, message: "Loan not found" };
            }

            if (loan.status !== "active") {
                return { success: false, message: "Cannot renew this loan" };
            }

            if (loan.renewed_count >= 2) {
                return { success: false, message: "Maximum renewals reached" };
            }

            // Extend due date by 14 days
            const newDueDate = new Date(loan.due_date);
            newDueDate.setDate(newDueDate.getDate() + 14);

            const updatedLoan = await prisma.bookLoan.update({
                where: { id },
                data: {
                    due_date: newDueDate,
                    renewed_count: { increment: 1 },
                },
            });

            return {
                success: true,
                message: "Book renewed successfully",
                data: updatedLoan,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to renew book",
            };
        }
    }

    /**
     * Get loans for a borrower
     */
    static async getBorrowerLoans(
        borrowerId: string,
        borrowerType: string
    ): Promise<ApiResponse> {
        try {
            const where: any = { borrower_type: borrowerType };
            if (borrowerType === "student") {
                where.student_id = borrowerId;
            } else {
                where.teacher_id = borrowerId;
            }

            const loans = await prisma.bookLoan.findMany({
                where,
                include: { book: true },
                orderBy: { issue_date: "desc" },
            });

            return {
                success: true,
                message: "Loans fetched successfully",
                data: loans,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to fetch loans",
            };
        }
    }

    /**
     * Get overdue loans
     */
    private static async getOverdueLoans(
        borrowerId?: string,
        borrowerType?: string,
        branchId?: string,
        userContext?: any
    ): Promise<ApiResponse> {
        try {
            // Data Scoping
            if (userContext && userContext.role?.name !== 'SuperAdmin') {
                branchId = userContext.branch_id;
            }

            const where: any = {
                status: "active",
                due_date: { lt: new Date() },
            };

            // If branchId is specified, we need to filter loans where the book belongs to the branch
            if (branchId) {
                where.book = { branch_id: branchId };
            }

            if (borrowerId && borrowerType) {
                where.borrower_type = borrowerType;
                if (borrowerType === "student") {
                    where.student_id = borrowerId;
                } else {
                    where.teacher_id = borrowerId;
                }
            }

            const overdueLoans = await prisma.bookLoan.findMany({
                where,
                include: {
                    book: true,
                    student: { select: { first_name: true, last_name: true } },
                    teacher: { select: { first_name: true, last_name: true } },
                },
            });

            return {
                success: true,
                message: "Overdue loans fetched successfully",
                data: overdueLoans,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to fetch overdue loans",
            };
        }
    }

    /**
     * Get all overdue loans (for librarian)
     */
    static async getAllOverdueLoans(branchId: string, userContext?: any): Promise<ApiResponse> {
        // Data Scoping logic is a bit complex here because getOverdueLoans doesn't inherently filter by branch unless filtering by student/teacher
        // But we can filter by including the borrower relation and checking their branch
        // For now, let's defer to getOverdueLoans with additional logic or just accept that getOverdueLoans needs an update too.
        // Actually, getOverdueLoans takes borrowerId/Type. 
        // If we want ALL overdue loans for a branch, we need a new query.

        // Let's implement branch filtering directly here if needed, or update getOverdueLoans.
        // Changing strategy: Update getOverdueLoans to support branchId filter.
        return this.getOverdueLoans(undefined, undefined, branchId, userContext);
    }

    // ==================== FINES ====================

    /**
     * Get fines for a borrower
     */
    static async getBorrowerFines(
        borrowerId: string,
        borrowerType: string
    ): Promise<ApiResponse> {
        try {
            const fines = await prisma.bookFine.findMany({
                where: {
                    loan:
                        borrowerType === "student"
                            ? { student_id: borrowerId }
                            : { teacher_id: borrowerId },
                },
                include: {
                    loan: {
                        include: { book: true },
                    },
                },
                orderBy: { created_at: "desc" },
            });

            return {
                success: true,
                message: "Fines fetched successfully",
                data: fines,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to fetch fines",
            };
        }
    }

    /**
     * Pay a fine
     */
    static async payFine(
        id: string,
        amount: number,
        method: string
    ): Promise<ApiResponse> {
        try {
            const fine = await prisma.bookFine.findUnique({ where: { id } });

            if (!fine) {
                return { success: false, message: "Fine not found" };
            }

            const totalPaid = Number(fine.paid_amount) + amount;
            const status =
                totalPaid >= Number(fine.fine_amount)
                    ? "paid"
                    : totalPaid > 0
                        ? "partially_paid"
                        : "unpaid";

            const updatedFine = await prisma.bookFine.update({
                where: { id },
                data: {
                    paid_amount: totalPaid,
                    payment_status: status,
                    payment_date: status === "paid" ? new Date() : fine.payment_date,
                    payment_method: method,
                },
            });

            return {
                success: true,
                message: "Payment recorded successfully",
                data: updatedFine,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to record payment",
            };
        }
    }

    /**
     * Waive a fine
     */
    static async waiveFine(
        id: string,
        waivedBy: string,
        reason: string
    ): Promise<ApiResponse> {
        try {
            const fine = await prisma.bookFine.update({
                where: { id },
                data: {
                    waived: true,
                    waived_by: waivedBy,
                    waived_reason: reason,
                    payment_status: "paid",
                },
            });

            return {
                success: true,
                message: "Fine waived successfully",
                data: fine,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to waive fine",
            };
        }
    }
}

export default LibraryService;
