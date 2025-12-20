import { Router, Request, Response } from "express";
import { LeaveService } from "../services/leave.service";
import { sendResponse, authMiddleware } from "../middleware/error.middleware";
import { requirePermission } from "../middleware/permission.middleware";

const router = Router();

// Get pending leaves (admin/branch admin)
router.get("/pending", authMiddleware, requirePermission("leave:read"), async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;

  const user = (req as any).user;
  let branchId = undefined;

  // If user is BranchAdmin, restrict to their branch
  if (user.role.name === "BranchAdmin") {
    branchId = user.branch_id;
  }

  const result = await LeaveService.getPendingLeaves(limit, offset, branchId);
  sendResponse(
    res,
    result.success ? 200 : 400,
    result.success,
    result.message,
    result.data
  );
});

// Get leave statistics
router.get(
  "/statistics",
  authMiddleware,
  requirePermission("leave:read"),
  async (req: Request, res: Response) => {
    const year = req.query.year
      ? parseInt(req.query.year as string)
      : undefined;
    const result = await LeaveService.getLeaveStatistics(year);
    sendResponse(
      res,
      result.success ? 200 : 400,
      result.success,
      result.message,
      result.data
    );
  }
);

// Request leave
router.post("/request", authMiddleware, requirePermission("leave:create"), async (req: Request, res: Response) => {
  const { teacherId, leaveType, startDate, endDate, reason } = req.body;
  if (!teacherId || !leaveType || !startDate || !endDate || !reason) {
    return sendResponse(res, 400, false, "Missing required fields");
  }
  const result = await LeaveService.requestLeave(
    teacherId,
    leaveType,
    new Date(startDate),
    new Date(endDate),
    reason
  );
  sendResponse(
    res,
    result.success ? 201 : 400,
    result.success,
    result.message,
    result.data
  );
});

// Approve leave
router.post(
  "/:id/approve",
  authMiddleware,
  requirePermission("leave:update"),
  async (req: Request, res: Response) => {
    const user = (req as any).user;
    const result = await LeaveService.approveLeave(req.params.id, user.id);
    sendResponse(
      res,
      result.success ? 200 : 400,
      result.success,
      result.message,
      result.data
    );
  }
);

// Reject leave
router.post(
  "/:id/reject",
  authMiddleware,
  requirePermission("leave:update"),
  async (req: Request, res: Response) => {
    const { reason } = req.body;
    const user = (req as any).user;

    const result = await LeaveService.rejectLeave(
      req.params.id,
      user.id,
      reason
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

// Get all leaves for a teacher (alias for history)
router.get(
  "/teacher/:teacherId",
  authMiddleware,
  requirePermission("leave:read"),
  async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const status = req.query.status as string;

    // This is the same as history - returns all leave records for a teacher
    const result = await LeaveService.getLeaveHistory(
      req.params.teacherId,
      limit,
      offset,
      status
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

// Get leave balance
router.get(
  "/:teacherId/balance",
  authMiddleware,
  requirePermission("leave:read"),
  async (req: Request, res: Response) => {
    const year = req.query.year
      ? parseInt(req.query.year as string)
      : undefined;
    const result = await LeaveService.getLeaveBalance(
      req.params.teacherId,
      year
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

// Get leave history
router.get(
  "/:teacherId/history",
  authMiddleware,
  requirePermission("leave:read"),
  async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const status = req.query.status as string;
    const result = await LeaveService.getLeaveHistory(
      req.params.teacherId,
      limit,
      offset,
      status
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

export default router;
