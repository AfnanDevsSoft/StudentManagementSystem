import express, { Router, Request, Response } from "express";
import LibraryService from "../services/library.service";
import { authMiddleware, sendResponse } from "../middleware/error.middleware";

const router: Router = express.Router();

// ==================== BOOKS ====================

// GET all books
router.get(
    "/books",
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        const { branch_id, category, author, title } = req.query;
        const result = await LibraryService.getBooks(branch_id as string, {
            category,
            author,
            title,
        }, (req as any).user);
        sendResponse(res, result.success ? 200 : 404, result.success, result.message, result.data);
    }
);

// POST create a book
router.post(
    "/books",
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        const result = await LibraryService.createBook(req.body, (req as any).user);
        sendResponse(res, result.success ? 201 : 400, result.success, result.message, result.data);
    }
);

// PATCH update a book
router.patch(
    "/books/:id",
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const result = await LibraryService.updateBook(id, req.body);
        sendResponse(res, result.success ? 200 : 400, result.success, result.message, result.data);
    }
);

// DELETE a book
router.delete(
    "/books/:id",
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const result = await LibraryService.deleteBook(id);
        sendResponse(res, result.success ? 200 : 400, result.success, result.message);
    }
);

// ==================== BOOK LOANS ====================

// GET all loans (general query)
router.get(
    "/loans",
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        const { borrowerId, borrower_type, branch_id } = req.query;

        // If borrowerId provided, get borrower-specific loans
        if (borrowerId) {
            const result = await LibraryService.getBorrowerLoans(
                borrowerId as string,
                borrower_type as string
            );
            return sendResponse(res, result.success ? 200 : 404, result.success, result.message, result.data);
        }

        // Otherwise get overdue loans for the branch
        const result = await LibraryService.getAllOverdueLoans(
            branch_id as string,
            (req as any).user
        );
        sendResponse(res, result.success ? 200 : 404, result.success, result.message, result.data);
    }
);

// POST issue a book
router.post(
    "/loans/issue",
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        const result = await LibraryService.issueBook(req.body);
        sendResponse(res, result.success ? 201 : 400, result.success, result.message, result.data);
    }
);

// POST return a book
router.post(
    "/loans/:id/return",
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const { returned_to } = req.body;
        const result = await LibraryService.returnBook(id, returned_to);
        sendResponse(res, result.success ? 200 : 400, result.success, result.message, result.data);
    }
);

// POST renew a book
router.post(
    "/loans/:id/renew",
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const result = await LibraryService.renewBook(id);
        sendResponse(res, result.success ? 200 : 400, result.success, result.message, result.data);
    }
);

// GET borrower loans
router.get(
    "/loans/borrower/:borrowerId",
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        const { borrowerId } = req.params;
        const { borrower_type } = req.query;
        const result = await LibraryService.getBorrowerLoans(borrowerId, borrower_type as string);
        sendResponse(res, result.success ? 200 : 404, result.success, result.message, result.data);
    }
);

// GET overdue loans
router.get(
    "/loans/overdue",
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        const { branch_id } = req.query;
        const result = await LibraryService.getAllOverdueLoans(branch_id as string, (req as any).user);
        sendResponse(res, result.success ? 200 : 404, result.success, result.message, result.data);
    }
);

// ==================== FINES ====================

// GET borrower fines
router.get(
    "/fines/borrower/:borrowerId",
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        const { borrowerId } = req.params;
        const { borrower_type } = req.query;
        const result = await LibraryService.getBorrowerFines(borrowerId, borrower_type as string);
        sendResponse(res, result.success ? 200 : 404, result.success, result.message, result.data);
    }
);

// POST pay a fine
router.post(
    "/fines/:id/pay",
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const { amount, method } = req.body;
        const result = await LibraryService.payFine(id, amount, method);
        sendResponse(res, result.success ? 200 : 400, result.success, result.message, result.data);
    }
);

// POST waive a fine
router.post(
    "/fines/:id/waive",
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const { waived_by, reason } = req.body;
        const result = await LibraryService.waiveFine(id, waived_by, reason);
        sendResponse(res, result.success ? 200 : 400, result.success, result.message, result.data);
    }
);

export default router;
