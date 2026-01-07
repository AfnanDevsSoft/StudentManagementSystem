import { Router, Request, Response } from "express";
import { FeeService } from "../services/fee.service";
import { sendResponse, authMiddleware } from "../middleware/error.middleware";
import { requirePermission } from "../middleware/permission.middleware";

const router = Router();

// Get fee structures
router.get(
  "/structures",
  authMiddleware,
  requirePermission("finance:read"),
  async (req: Request, res: Response) => {
    const branchId = (req.query.branch_id || req.query.branchId) as string;
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


// Create fee structure
router.post(
  "/structures",
  authMiddleware,
  requirePermission("finance:create"),
  async (req: Request, res: Response) => {
    const result = await FeeService.createFee({
      ...req.body,
      branch_id: (req as any).user.branch_id // Ensure branch context
    }, (req as any).user);
    sendResponse(
      res,
      result.success ? 201 : 400,
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
  requirePermission("finance:read"),
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
// Process fee payment
router.post("/payment", authMiddleware, requirePermission("finance:create"), async (req: Request, res: Response) => {
  const {
    studentId, student_id,
    feeId, fee_id,
    amountPaid, amount_paid,
    paymentMethod, payment_method,
    recordedBy,
    transactionId, transaction_id
  } = req.body;

  const finalStudentId = studentId || student_id;
  const finalFeeId = feeId || fee_id;
  const finalAmount = amountPaid || amount_paid;
  const finalMethod = paymentMethod || payment_method;
  const finalRecordedBy = recordedBy || (req as any).user.id; // Fallback to auth user
  const finalTxId = transactionId || transaction_id;

  if (!finalStudentId || !finalFeeId || !finalAmount || !finalMethod || !finalRecordedBy) {
    return sendResponse(res, 400, false, "Missing required fields");
  }

  const result = await FeeService.processFeePayment(
    finalStudentId,
    finalFeeId,
    finalAmount,
    finalMethod,
    finalRecordedBy,
    finalTxId
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
router.get("/records", authMiddleware, requirePermission("finance:read"), async (req: Request, res: Response) => {
  const studentId = req.query.studentId as string;
  const status = req.query.status as string;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;
  const branchId = (req.query.branch_id || req.query.branchId) as string;
  const result = await FeeService.getFeeRecords(
    studentId,
    status,
    limit,
    offset,
    branchId,
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
    const { studentId } = req.params;
    const user = (req as any).user;

    if (!user) {
      return sendResponse(res, 401, false, "Unauthorized");
    }

    // Check permissions: Owner (student profile id matches) OR Has finance:read
    const isOwner = user.student?.id === studentId;

    let hasPermission = false;
    if (isOwner) {
      hasPermission = true;
    } else {
      const { RBACService } = require("../services/rbac.service");
      hasPermission = await RBACService.checkUserPermission(user.id, "finance:read");
    }

    if (!hasPermission) {
      return sendResponse(res, 403, false, "Permission denied");
    }

    const result = await FeeService.getOutstandingFees(studentId);
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
    const user = (req as any).user;

    if (!user) {
      return sendResponse(res, 401, false, "Unauthorized");
    }

    // Check permissions: Owner (student profile id matches) OR Has finance:read
    const isOwner = user.student?.id === studentId;

    let hasPermission = false;
    if (isOwner) {
      hasPermission = true;
    } else {
      const { RBACService } = require("../services/rbac.service");
      hasPermission = await RBACService.checkUserPermission(user.id, "finance:read");
    }

    if (!hasPermission) {
      return sendResponse(res, 403, false, "Permission denied");
    }

    const result = await FeeService.getFeeRecords(
      studentId,
      undefined,
      limit,
      offset,
      undefined,
      user
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
  requirePermission("finance:read"),
  async (req: Request, res: Response) => {
    const branchId = (req.query.branch_id || req.query.branchId) as string;
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
