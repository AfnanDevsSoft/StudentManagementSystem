import { Router, Request, Response } from "express";
import { PayrollService } from "../services/payroll.service";
import { sendResponse, authMiddleware } from "../middleware/error.middleware";
import { requirePermission } from "../middleware/permission.middleware";

const router = Router();

// Get salaries for a month/year
router.get("/salaries", authMiddleware, requirePermission("payroll:read"), async (req: Request, res: Response) => {
  const branchId = (req.query.branch_id || req.query.branchId) as string;
  const month = req.query.month
    ? parseInt(req.query.month as string)
    : undefined;
  const year = req.query.year ? parseInt(req.query.year as string) : undefined;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;
  const result = await PayrollService.getSalaries(
    branchId,
    month,
    year,
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

// Calculate salary
router.post(
  "/calculate",
  authMiddleware,
  requirePermission("payroll:create"),
  async (req: Request, res: Response) => {
    const { teacherId, month, year, baseSalary, daysWorked, leaveDays } =
      req.body;
    if (!teacherId || !month || !year || !baseSalary) {
      return sendResponse(res, 400, false, "Missing required fields");
    }
    const result = await PayrollService.calculateSalary(
      teacherId,
      month,
      year,
      baseSalary,
      daysWorked,
      leaveDays
    );
    sendResponse(
      res,
      result.success ? 200 : 400,
      result.success,
      result.message,
      result.data
    );
  }
);

// Manual Create / Record Payment
router.post("/", authMiddleware, requirePermission("payroll:create"), async (req: Request, res: Response) => {
  try {
    const { teacher_id, salary_amount, bonus, deductions, payment_date, payment_method, status, remarks } = req.body;

    // Basic validation
    if (!teacher_id || !payment_date || salary_amount === undefined) {
      return sendResponse(res, 400, false, "Missing required fields");
    }

    const result = await PayrollService.createPayment({
      teacher_id,
      salary_amount,
      bonus,
      deductions,
      payment_date,
      payment_method,
      status,
      remarks,
      userContext: (req as any).user
    });

    return res.status(result.success ? 201 : 400).json(result);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Process salary (Calculated)
router.post("/process", authMiddleware, requirePermission("payroll:create"), async (req: Request, res: Response) => {
  const {
    teacherId,
    branchId,
    month,
    year,
    baseSalary,
    daysWorked,
    leaveDays,
  } = req.body;
  if (!teacherId || !branchId || !month || !year || !baseSalary) {
    return sendResponse(res, 400, false, "Missing required fields");
  }
  const result = await PayrollService.processSalary(
    teacherId,
    branchId,
    month,
    year,
    baseSalary,
    daysWorked,
    leaveDays,
    (req as any).user
  );
  sendResponse(
    res,
    result.success ? 201 : 400,
    result.success,
    result.message,
    result.data
  );
});

// Get payroll records for a specific teacher
router.get(
  "/teacher/:teacherId",
  authMiddleware,
  requirePermission("payroll:read"),
  async (req: Request, res: Response) => {
    const { teacherId } = req.params;
    const status = req.query.status as string;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    // Get payroll records for this teacher
    const result = await PayrollService.getPayrollRecords(
      undefined, // branchId not required when filtering by teacherId
      teacherId,
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
  }
);

// Get payroll records
router.get("/records", authMiddleware, requirePermission("payroll:read"), async (req: Request, res: Response) => {
  const branchId = (req.query.branch_id || req.query.branchId) as string;
  const teacherId = req.query.teacherId as string;
  const status = req.query.status as string;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;
  const result = await PayrollService.getPayrollRecords(
    branchId,
    teacherId,
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

// Approve salary
router.post(
  "/:id/approve",
  authMiddleware,
  requirePermission("payroll:update"),
  async (req: Request, res: Response) => {
    const { approvedBy } = req.body;
    if (!approvedBy) {
      return sendResponse(res, 400, false, "Missing approvedBy field");
    }
    const result = await PayrollService.approveSalary(
      req.params.id,
      approvedBy
    );
    sendResponse(
      res,
      result.success ? 200 : 400,
      result.success,
      result.message,
      result.data
    );
  }
);

// Mark as paid
router.post(
  "/:id/mark-paid",
  authMiddleware,
  requirePermission("payroll:update"),
  async (req: Request, res: Response) => {
    const result = await PayrollService.markAsPaid(req.params.id);
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
