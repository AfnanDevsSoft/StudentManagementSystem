import { Router, Request, Response } from "express";
import { FileExportService } from "../services/fileExport.service";
import { authMiddleware, sendResponse } from "../middleware/error.middleware";
import { requirePermission } from "../middleware/permission.middleware";

const router: Router = Router();

/**
 * POST /api/v1/exports/create
 * Create new export
 */
router.post(
  "/create",
  authMiddleware,
  requirePermission("reports:export"),
  async (req: Request, res: Response): Promise<void> => {
    const { userId, entityType, format, filters } = req.body;

    if (!userId || !entityType || !format) {
      sendResponse(res, 400, false, "Missing required fields");
      return;
    }

    const result = await FileExportService.createExport(
      userId,
      entityType,
      format,
      filters
    );
    sendResponse(res, 201, result.success, result.message, result.data);
  }
);

/**
 * GET /api/v1/exports/status/:exportId
 * Get export status
 */
router.get(
  "/status/:exportId",
  authMiddleware,
  requirePermission("reports:export"),
  async (req: Request, res: Response): Promise<void> => {
    const result = await FileExportService.getExportStatus(req.params.exportId);
    sendResponse(res, 200, result.success, result.message, result.data);
  }
);

/**
 * GET /api/v1/exports/user/:userId
 * Get user's exports
 */
router.get(
  "/user/:userId",
  authMiddleware,
  requirePermission("reports:export"),
  async (req: Request, res: Response): Promise<void> => {
    const { limit = 20, offset = 0 } = req.query;
    const result = await FileExportService.getUserExports(
      req.params.userId,
      parseInt(limit as string) || 20,
      parseInt(offset as string) || 0
    );
    sendResponse(res, 200, result.success, result.message, result.data);
  }
);

/**
 * GET /api/v1/exports/all
 * Get all exports
 */
router.get(
  "/all",
  authMiddleware,
  requirePermission("reports:export"),
  async (req: Request, res: Response): Promise<void> => {
    const { limit = 50, offset = 0 } = req.query;
    const result = await FileExportService.getAllExports(
      parseInt(limit as string) || 50,
      parseInt(offset as string) || 0
    );
    sendResponse(res, 200, result.success, result.message, result.data);
  }
);

/**
 * GET /api/v1/exports/download/:exportId
 * Download export file
 */
router.get(
  "/download/:exportId",
  authMiddleware,
  requirePermission("reports:export"),
  async (req: Request, res: Response): Promise<void> => {
    const result = await FileExportService.downloadExport(req.params.exportId);
    sendResponse(res, 200, result.success, result.message, result.data);
  }
);

/**
 * POST /api/v1/exports/schedule
 * Schedule recurring export
 */
router.post(
  "/schedule",
  authMiddleware,
  requirePermission("reports:export"),
  async (req: Request, res: Response): Promise<void> => {
    const { userId, entityType, format, frequency, recipientEmails } = req.body;

    if (!userId || !entityType || !format || !frequency) {
      sendResponse(res, 400, false, "Missing required fields");
      return;
    }

    const result = await FileExportService.scheduleRecurringExport(
      userId,
      entityType,
      format,
      frequency,
      recipientEmails
    );

    sendResponse(res, 201, result.success, result.message, result.data);
  }
);

/**
 * GET /api/v1/exports/schedules/:userId
 * Get export schedules
 */
router.get(
  "/schedules/:userId",
  authMiddleware,
  requirePermission("reports:export"),
  async (req: Request, res: Response): Promise<void> => {
    const result = await FileExportService.getExportSchedules(
      req.params.userId
    );
    sendResponse(res, 200, result.success, result.message, result.data);
  }
);

/**
 * PUT /api/v1/exports/schedules/:scheduleId
 * Update export schedule
 */
router.put(
  "/schedules/:scheduleId",
  authMiddleware,
  requirePermission("reports:export"),
  async (req: Request, res: Response): Promise<void> => {
    const result = await FileExportService.updateSchedule(
      req.params.scheduleId,
      req.body
    );
    sendResponse(res, 200, result.success, result.message, result.data);
  }
);

/**
 * DELETE /api/v1/exports/schedules/:scheduleId
 * Cancel export schedule
 */
router.delete(
  "/schedules/:scheduleId",
  authMiddleware,
  requirePermission("reports:export"),
  async (req: Request, res: Response): Promise<void> => {
    const result = await FileExportService.cancelSchedule(
      req.params.scheduleId
    );
    sendResponse(res, 200, result.success, result.message);
  }
);

export default router;
