import { Router, Request, Response } from "express";
import { BackupService } from "../services/backup.service";
import { authMiddleware, sendResponse } from "../middleware/error.middleware";
import { requirePermission } from "../middleware/permission.middleware";

const router: Router = Router();

/**
 * POST /api/v1/backups/full
 * Create full backup
 */
router.post(
  "/full",
  authMiddleware,
  requirePermission("system:admin"),
  async (req: Request, res: Response): Promise<void> => {
    const { description } = req.body;
    const result = await BackupService.createFullBackup(description);
    sendResponse(res, 201, result.success, result.message, result.data);
  }
);

/**
 * POST /api/v1/backups/incremental
 * Create incremental backup
 */
router.post(
  "/incremental",
  authMiddleware,
  requirePermission("system:admin"),
  async (req: Request, res: Response): Promise<void> => {
    const { sinceLastBackup } = req.body;
    const result = await BackupService.createIncrementalBackup(
      sinceLastBackup ? new Date(sinceLastBackup) : undefined
    );
    sendResponse(res, 201, result.success, result.message, result.data);
  }
);

/**
 * GET /api/v1/backups
 * Get all backups
 */
router.get(
  "/",
  authMiddleware,
  requirePermission("system:admin"),
  async (req: Request, res: Response): Promise<void> => {
    const { skip = 0, limit = 20 } = req.query;
    const result = await BackupService.getBackupHistory(
      parseInt(limit as string) || 20,
      parseInt(skip as string) || 0
    );
    sendResponse(res, 200, result.success, result.message, result.data);
  }
);

/**
 * GET /api/v1/backups/available
 * Get available backups for restoration
 */
router.get(
  "/available",
  authMiddleware,
  requirePermission("system:admin"),
  async (req: Request, res: Response): Promise<void> => {
    const result = await BackupService.listAvailableBackups();
    sendResponse(res, 200, result.success, result.message, result.data);
  }
);

/**
 * GET /api/v1/backups/:backupId
 * Get backup details
 */
router.get(
  "/:backupId",
  authMiddleware,
  requirePermission("system:admin"),
  async (req: Request, res: Response): Promise<void> => {
    const result = await BackupService.getBackupStatus(req.params.backupId);
    sendResponse(res, 200, result.success, result.message, result.data);
  }
);

/**
 * GET /api/v1/backups/:backupId/preview
 * Preview backup contents
 */
router.get(
  "/:backupId/preview",
  authMiddleware,
  requirePermission("system:admin"),
  async (req: Request, res: Response): Promise<void> => {
    const result = await BackupService.previewBackup(req.params.backupId);
    sendResponse(res, 200, result.success, result.message, result.data);
  }
);

/**
 * POST /api/v1/backups/:backupId/verify
 * Verify backup integrity
 */
router.post(
  "/:backupId/verify",
  authMiddleware,
  requirePermission("system:admin"),
  async (req: Request, res: Response): Promise<void> => {
    const result = await BackupService.verifyBackupIntegrity(req.params.backupId);
    sendResponse(res, 200, true, result ? "Backup verified" : "Backup verification failed");
  }
);

/**
 * POST /api/v1/backups/:backupId/restore
 * Restore from backup
 */
router.post(
  "/:backupId/restore",
  authMiddleware,
  requirePermission("system:admin"),
  async (req: Request, res: Response): Promise<void> => {
    const result = await BackupService.restoreFromBackup(req.params.backupId);
    sendResponse(res, 200, result.success, result.message, result.data);
  }
);

/**
 * POST /api/v1/backups/restore/point-in-time
 * Restore to specific point in time
 */
router.post(
  "/restore/point-in-time",
  authMiddleware,
  requirePermission("system:admin"),
  async (req: Request, res: Response): Promise<void> => {
    const { timestamp } = req.body;

    if (!timestamp) {
      sendResponse(res, 400, false, "Timestamp is required");
      return;
    }

    const result = await BackupService.restoreToPointInTime(new Date(timestamp));
    sendResponse(res, 200, result.success, result.message, result.data);
  }
);

/**
 * POST /api/v1/backups/schedule
 * Schedule recurring backup
 */
router.post(
  "/schedule",
  authMiddleware,
  requirePermission("system:admin"),
  async (req: Request, res: Response): Promise<void> => {
    const { backupType = "full", frequency, timeOfDay, retentionDays } = req.body;

    if (!frequency) {
      sendResponse(res, 400, false, "Frequency is required");
      return;
    }

    const result = await BackupService.scheduleBackup(
      backupType,
      frequency,
      timeOfDay || "02:00",
      retentionDays || 30
    );

    sendResponse(res, 201, result.success, result.message, result.data);
  }
);

/**
 * GET /api/v1/backups/schedules
 * Get backup schedules
 */
router.get(
  "/schedules",
  authMiddleware,
  requirePermission("system:admin"),
  async (req: Request, res: Response): Promise<void> => {
    const result = await BackupService.getBackupSchedules();
    sendResponse(res, 200, result.success, result.message, result.data);
  }
);

/**
 * DELETE /api/v1/backups/schedules/:scheduleId
 * Cancel backup schedule
 */
router.delete(
  "/schedules/:scheduleId",
  authMiddleware,
  requirePermission("system:admin"),
  async (req: Request, res: Response): Promise<void> => {
    const result = await BackupService.cancelScheduledBackup(req.params.scheduleId);
    sendResponse(res, 200, result.success, result.message);
  }
);

/**
 * GET /api/v1/backups/stats
 * Get backup storage statistics
 */
router.get(
  "/stats",
  authMiddleware,
  requirePermission("system:admin"),
  async (req: Request, res: Response): Promise<void> => {
    const result = await BackupService.getBackupStorageStats();
    sendResponse(res, 200, result.success, result.message, result.data);
  }
);

export default router;
