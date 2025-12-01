import { Router, Request, Response } from "express";
import { NotificationService } from "../services/notification.service";
import { sendResponse, authMiddleware } from "../middleware/error.middleware";

const router = Router();

// Send notification
router.post("/send", authMiddleware, async (req: Request, res: Response) => {
  const { userId, notificationType, subject, message } = req.body;
  if (!userId || !notificationType || !subject || !message) {
    return sendResponse(res, 400, false, "Missing required fields");
  }
  const result = await NotificationService.sendNotification(
    userId,
    notificationType,
    subject,
    message
  );
  sendResponse(
    res,
    result.success ? 201 : 400,
    result.success,
    result.message,
    result.data
  );
});

// Send bulk notifications
router.post(
  "/send-bulk",
  authMiddleware,
  async (req: Request, res: Response) => {
    const { userIds, notificationType, subject, message } = req.body;
    if (
      !userIds ||
      !Array.isArray(userIds) ||
      !notificationType ||
      !subject ||
      !message
    ) {
      return sendResponse(res, 400, false, "Missing or invalid fields");
    }
    const result = await NotificationService.sendBulkNotifications(
      userIds,
      notificationType,
      subject,
      message
    );
    sendResponse(
      res,
      result.success ? 201 : 400,
      result.success,
      result.message,
      result.data
    );
  }
);

// Get user notifications
router.get(
  "/user/:userId",
  authMiddleware,
  async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const unreadOnly = req.query.unreadOnly === "true";
    const result = await NotificationService.getNotifications(
      req.params.userId,
      limit,
      offset,
      unreadOnly
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

// Mark notification as read
router.post(
  "/:id/read",
  authMiddleware,
  async (req: Request, res: Response) => {
    const result = await NotificationService.markAsRead(req.params.id);
    sendResponse(
      res,
      result.success ? 200 : 404,
      result.success,
      result.message,
      result.data
    );
  }
);

// Mark all notifications as read
router.post(
  "/user/:userId/read-all",
  authMiddleware,
  async (req: Request, res: Response) => {
    const result = await NotificationService.markAllAsRead(req.params.userId);
    sendResponse(
      res,
      result.success ? 200 : 404,
      result.success,
      result.message,
      (result as any).data
    );
  }
);

// Delete notification
router.delete("/:id", authMiddleware, async (req: Request, res: Response) => {
  const result = await NotificationService.deleteNotification(req.params.id);
  sendResponse(
    res,
    result.success ? 200 : 404,
    result.success,
    result.message,
    (result as any).data
  );
});

// Get notification statistics
router.get(
  "/statistics",
  authMiddleware,
  async (req: Request, res: Response) => {
    const branchId = req.query.branchId as string;
    const result = await NotificationService.getNotificationStats(branchId);
    sendResponse(
      res,
      result.success ? 200 : 400,
      result.success,
      result.message,
      (result as any).data
    );
  }
);

export default router;
