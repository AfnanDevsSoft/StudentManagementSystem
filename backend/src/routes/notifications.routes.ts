import { Router, Request, Response } from "express";
import { NotificationService } from "../services/notification.service";
import { authMiddleware, sendResponse } from "../middleware/error.middleware";
import { requirePermission } from "../middleware/permission.middleware";

const router: Router = Router();

/**
 * POST /api/v1/notifications-advanced/send
 * Send notification to user
 */
router.post(
  "/send",
  authMiddleware,
  requirePermission("messaging:send"),
  async (req: Request, res: Response): Promise<void> => {
    const { userId, notificationType, subject, message } = req.body;

    if (!userId || !notificationType || !subject || !message) {
      sendResponse(res, 400, false, "Missing required fields");
      return;
    }

    const result = await NotificationService.sendNotification(
      userId,
      notificationType,
      subject,
      message
    );
    sendResponse(res, 201, result.success, result.message, result.data);
  }
);

/**
 * GET /api/v1/notifications-advanced/user/:userId
 * Get notifications for user
 */
router.get(
  "/user/:userId",
  authMiddleware,
  requirePermission("messaging:read"),
  async (req: Request, res: Response): Promise<void> => {
    const { skip = 0, limit = 20 } = req.query;
    const result = await NotificationService.getNotifications(
      req.params.userId,
      parseInt(skip as string) || 0,
      parseInt(limit as string) || 20
    );
    sendResponse(res, 200, result.success, result.message, result.data);
  }
);

/**
 * PUT /api/v1/notifications-advanced/:notificationId/read
 * Mark notification as read
 */
router.put(
  "/:notificationId/read",
  authMiddleware,
  requirePermission("messaging:read"),
  async (req: Request, res: Response): Promise<void> => {
    const result = await NotificationService.markAsRead(req.params.notificationId);
    sendResponse(res, 200, result.success, result.message, result.data);
  }
);

/**
 * PUT /api/v1/notifications-advanced/user/:userId/read-all
 * Mark all notifications as read for user
 */
router.put(
  "/user/:userId/read-all",
  authMiddleware,
  requirePermission("messaging:read"),
  async (req: Request, res: Response): Promise<void> => {
    const result = await NotificationService.markAllAsRead(req.params.userId);
    sendResponse(res, 200, result.success, result.message, result.data);
  }
);

/**
 * DELETE /api/v1/notifications-advanced/:notificationId
 * Delete notification
 */
router.delete(
  "/:notificationId",
  authMiddleware,
  requirePermission("messaging:send"),
  async (req: Request, res: Response): Promise<void> => {
    const result = await NotificationService.deleteNotification(req.params.notificationId);
    sendResponse(res, 200, result.success, result.message);
  }
);

/**
 * POST /api/v1/notifications-advanced/bulk
 * Send bulk notifications
 */
router.post(
  "/bulk",
  authMiddleware,
  requirePermission("messaging:send"),
  async (req: Request, res: Response): Promise<void> => {
    const { userIds, notificationType, subject, message } = req.body;

    if (!userIds || !notificationType || !subject || !message) {
      sendResponse(res, 400, false, "Missing required fields");
      return;
    }

    const result = await NotificationService.sendBulkNotifications(
      userIds,
      notificationType,
      subject,
      message
    );
    sendResponse(res, 201, result.success, result.message, result.data);
  }
);

/**
 * GET /api/v1/notifications-advanced/stats
 * Get notification statistics
 */
router.get(
  "/stats",
  authMiddleware,
  requirePermission("messaging:read"),
  async (req: Request, res: Response): Promise<void> => {
    const result = await NotificationService.getNotificationStats();
    sendResponse(res, 200, result.success, result.message, result.data);
  }
);

export default router;
