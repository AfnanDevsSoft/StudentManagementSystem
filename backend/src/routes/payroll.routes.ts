import { Router, Request, Response } from "express";
import { PayrollService } from "../services/payroll.service";
import { sendResponse, authMiddleware } from "../middleware/error.middleware";

const router = Router();

// Get salaries for a month/year
router.get("/salaries", authMiddleware, async (req: Request, res: Response) => {
  const branchId = req.query.branchId as string;
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

// Process salary
router.post("/process", authMiddleware, async (req: Request, res: Response) => {
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

// Get payroll records
router.get("/records", authMiddleware, async (req: Request, res: Response) => {
  const branchId = req.query.branchId as string;
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
