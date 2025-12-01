import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/error.middleware";
import MessagingService from "../services/messaging.service";

const router = Router();

/**
 * @swagger
 * /api/v1/messages/send:
 *   post:
 *     summary: Send direct message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               senderId:
 *                 type: string
 *               recipientId:
 *                 type: string
 *               subject:
 *                 type: string
 *               messageBody:
 *                 type: string
 *               attachmentUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent
 */
router.post("/send", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { senderId, recipientId, subject, messageBody, attachmentUrl } =
      req.body;

    if (!senderId || !recipientId || !subject || !messageBody) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const result = await MessagingService.sendMessage(senderId, recipientId, {
      subject,
      messageBody,
      attachmentUrl,
    });

    return res.status(result.success ? 201 : 400).json(result);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/v1/messages/inbox:
 *   get:
 *     summary: Get inbox messages
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Inbox messages
 */
router.get("/inbox", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId, limit = 20, offset = 0 } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const result = await MessagingService.getInboxMessages(
      userId as string,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/v1/messages/sent:
 *   get:
 *     summary: Get sent messages
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sent messages
 */
router.get("/sent", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId, limit = 20, offset = 0 } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const result = await MessagingService.getSentMessages(
      userId as string,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/v1/messages/conversation:
 *   get:
 *     summary: Get conversation between two users
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: otherUserId
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Conversation
 */
router.get(
  "/conversation",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { userId, otherUserId, limit = 50 } = req.query;

      if (!userId || !otherUserId) {
        return res
          .status(400)
          .json({ message: "User ID and other user ID are required" });
      }

      const result = await MessagingService.getConversation(
        userId as string,
        otherUserId as string,
        parseInt(limit as string)
      );

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/v1/messages/{messageId}/read:
 *   post:
 *     summary: Mark message as read
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Message marked as read
 */
router.post(
  "/:messageId/read",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { messageId } = req.params;

      const result = await MessagingService.markAsRead(messageId);

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/v1/messages/mark-multiple-read:
 *   post:
 *     summary: Mark multiple messages as read
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               messageIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Messages marked as read
 */
router.post(
  "/mark-multiple-read",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { messageIds } = req.body;

      if (!messageIds || !Array.isArray(messageIds)) {
        return res
          .status(400)
          .json({ message: "Message IDs array is required" });
      }

      const result = await MessagingService.markMultipleAsRead(messageIds);

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/v1/messages/{messageId}:
 *   delete:
 *     summary: Delete message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Message deleted
 */
router.delete(
  "/:messageId",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { messageId } = req.params;

      const result = await MessagingService.deleteMessage(messageId);

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/v1/messages/search:
 *   get:
 *     summary: Search messages
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Search results
 */
router.get("/search", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId, searchTerm, limit = 20 } = req.query;

    if (!userId || !searchTerm) {
      return res
        .status(400)
        .json({ message: "User ID and search term are required" });
    }

    const result = await MessagingService.searchMessages(
      userId as string,
      searchTerm as string,
      parseInt(limit as string)
    );

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/v1/messages/unread-count:
 *   get:
 *     summary: Get unread message count
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Unread count
 */
router.get(
  "/unread-count",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const result = await MessagingService.getUnreadCount(userId as string);

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);

export default router;
