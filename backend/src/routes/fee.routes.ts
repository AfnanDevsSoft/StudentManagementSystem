import { Router, Request, Response } from "express";
import { FeeService } from "../services/fee.service";
import { sendResponse, authMiddleware } from "../middleware/error.middleware";

const router = Router();

// Get fee structures
router.get(
  "/structures",
  authMiddleware,
  async (req: Request, res: Response) => {
    const branchId = req.query.branchId as string;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const result = await FeeService.getFeeStructure(branchId, limit, offset, (req as any).user);
    sendResponse(
      res,
      result.success ? 200 : 400,
      result.success,
      result.message,
      result.data
    );
  }
);

// Calculate fee for student
router.post(
  "/calculate",
  authMiddleware,
  async (req: Request, res: Response) => {
    const { studentId } = req.body;
    if (!studentId) {
      return sendResponse(res, 400, false, "Missing studentId field");
    }
    const result = await FeeService.calculateFee(studentId);
    sendResponse(
      res,
      result.success ? 200 : 404,
      result.success,
      result.message,
      result.data
    );
  }
);

// Process fee payment
router.post("/payment", authMiddleware, async (req: Request, res: Response) => {
  const {
    studentId,
    feeId,
    amountPaid,
    paymentMethod,
    recordedBy,
    transactionId,
  } = req.body;
  if (!studentId || !feeId || !amountPaid || !paymentMethod || !recordedBy) {
    return sendResponse(res, 400, false, "Missing required fields");
  }
  const result = await FeeService.processFeePayment(
    studentId,
    feeId,
    amountPaid,
    paymentMethod,
    recordedBy,
    transactionId
  );
  sendResponse(
    res,
    result.success ? 201 : 400,
    result.success,
    result.message,
    result.data
  );
});

// Get fee records
router.get("/records", authMiddleware, async (req: Request, res: Response) => {
  const studentId = req.query.studentId as string;
  const status = req.query.status as string;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;
  const result = await FeeService.getFeeRecords(
    studentId,
    status,
    limit,
    offset,
    (req as any).user
  );
  sendResponse(
    res,
    result.success ? 200 : 400,
    result.success,
    result.message,
    result.data
  );
});

// Get outstanding fees
router.get(
  "/:studentId/outstanding",
  authMiddleware,
  async (req: Request, res: Response) => {
    const result = await FeeService.getOutstandingFees(req.params.studentId);
    sendResponse(
      res,
      result.success ? 200 : 404,
      result.success,
      result.message,
      result.data
    );
  }
);

// Get payment history for student
router.get(
  "/:studentId/payment-history",
  authMiddleware,
  async (req: Request, res: Response) => {
    const { studentId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    // Get fee records which includes payment history
    const result = await FeeService.getFeeRecords(
      studentId,
      undefined, // all statuses
      limit,
      offset,
      (req as any).user
    );

    sendResponse(
      res,
      result.success ? 200 : 404,
      result.success,
      result.message,
      result.data
    );
  }
);

// Get fee statistics
router.get(
  "/statistics",
  authMiddleware,
  async (req: Request, res: Response) => {
    const branchId = req.query.branchId as string;
    const result = await FeeService.getFeeStatistics(branchId, (req as any).user);
    sendResponse(
      res,
      result.success ? 200 : 400,
      result.success,
      result.message,
      result.data
    );
  }
);

export default router;
