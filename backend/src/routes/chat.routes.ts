import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authMiddleware } from "../middleware/error.middleware";
import { requirePermission } from "../middleware/permission.middleware";
import { ChatService } from "../services/chat.service";
import { PresenceService } from "../services/presence.service";
import { prisma } from "../lib/db";

const router = Router();

// Configure multer for file uploads
const uploadDir = path.join(__dirname, "../../uploads/chat");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/webm",
      "audio/mpeg",
      "audio/wav",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed"));
    }
  },
});

// Get user's conversations
router.get(
  "/conversations",
  authMiddleware,
  requirePermission("chat:read"),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { limit = "20", offset = "0" } = req.query;
      const result = await ChatService.getUserConversations(
        userId,
        Number(limit),
        Number(offset)
      );
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      console.error("Error getting conversations:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Get conversation by ID
router.get(
  "/conversations/:conversationId",
  authMiddleware,
  requirePermission("chat:read"),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { conversationId } = req.params;
      const result = await ChatService.getConversationById(conversationId, userId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      console.error("Error getting conversation:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Create direct conversation
router.post(
  "/conversations/direct",
  authMiddleware,
  requirePermission("chat:send"),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { recipientId } = req.body;
      if (!recipientId) {
        return res
          .status(400)
          .json({ success: false, message: "Recipient ID required" });
      }
      const result = await ChatService.createDirectConversation(userId, recipientId);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error: any) {
      console.error("Error creating direct conversation:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Create group conversation
router.post(
  "/conversations/group",
  authMiddleware,
  requirePermission("chat:send"),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { name, participantIds, description } = req.body;
      if (!name || !participantIds?.length) {
        return res
          .status(400)
          .json({ success: false, message: "Name and participants required" });
      }
      const result = await ChatService.createGroupConversation(
        userId,
        name,
        participantIds,
        description
      );
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error: any) {
      console.error("Error creating group:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Update group conversation
router.put(
  "/conversations/:conversationId",
  authMiddleware,
  requirePermission("chat:send"),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { conversationId } = req.params;
      const { name, description, avatar_url } = req.body;
      const result = await ChatService.updateGroup(conversationId, userId, {
        name,
        description,
        avatar_url,
      });
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      console.error("Error updating group:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Add participants to group
router.post(
  "/conversations/:conversationId/participants",
  authMiddleware,
  requirePermission("chat:send"),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { conversationId } = req.params;
      const { participantIds } = req.body;
      if (!participantIds?.length) {
        return res
          .status(400)
          .json({ success: false, message: "Participant IDs required" });
      }
      const result = await ChatService.addParticipants(
        conversationId,
        userId,
        participantIds
      );
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      console.error("Error adding participants:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Leave conversation
router.post(
  "/conversations/:conversationId/leave",
  authMiddleware,
  requirePermission("chat:read"),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { conversationId } = req.params;
      const result = await ChatService.leaveConversation(conversationId, userId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      console.error("Error leaving conversation:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Get messages for conversation
router.get(
  "/conversations/:conversationId/messages",
  authMiddleware,
  requirePermission("chat:read"),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { conversationId } = req.params;
      const { limit = "50", before } = req.query;
      const result = await ChatService.getMessages(
        conversationId,
        userId,
        Number(limit),
        before as string
      );
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      console.error("Error getting messages:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Search messages
router.get(
  "/search",
  authMiddleware,
  requirePermission("chat:read"),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { q, limit = "20" } = req.query;
      if (!q) {
        return res
          .status(400)
          .json({ success: false, message: "Search query required" });
      }
      const result = await ChatService.searchMessages(
        userId,
        q as string,
        Number(limit)
      );
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      console.error("Error searching messages:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Get unread count
router.get(
  "/unread-count",
  authMiddleware,
  requirePermission("chat:read"),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const result = await ChatService.getUnreadCount(userId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      console.error("Error getting unread count:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Get online users
router.get(
  "/presence/online",
  authMiddleware,
  requirePermission("chat:read"),
  async (req: Request, res: Response) => {
    try {
      const users = await PresenceService.getOnlineUsers();
      return res.status(200).json({ success: true, data: users });
    } catch (error: any) {
      console.error("Error getting online users:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Get presence for specific users
router.post(
  "/presence/users",
  authMiddleware,
  requirePermission("chat:read"),
  async (req: Request, res: Response) => {
    try {
      const { userIds } = req.body;
      if (!userIds?.length) {
        return res
          .status(400)
          .json({ success: false, message: "User IDs required" });
      }
      const presenceData = await PresenceService.getPresenceForUsers(userIds);
      return res.status(200).json({ success: true, data: presenceData });
    } catch (error: any) {
      console.error("Error getting presence:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Search users for starting new conversations
router.get(
  "/users/search",
  authMiddleware,
  requirePermission("chat:read"),
  async (req: Request, res: Response) => {
    try {
      const { q, limit = "20" } = req.query;
      const userId = (req as any).user.id;

      const users = await prisma.user.findMany({
        where: {
          id: { not: userId },
          is_active: true,
          OR: [
            { first_name: { contains: (q as string) || "", mode: "insensitive" } },
            { last_name: { contains: (q as string) || "", mode: "insensitive" } },
            { username: { contains: (q as string) || "", mode: "insensitive" } },
            { email: { contains: (q as string) || "", mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          username: true,
          email: true,
          profile_photo: true,
          role: { select: { name: true } },
        },
        take: Number(limit),
        orderBy: { first_name: "asc" },
      });

      return res.status(200).json({ success: true, data: users });
    } catch (error: any) {
      console.error("Error searching users:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Upload files for chat
router.post(
  "/upload",
  authMiddleware,
  requirePermission("chat:send"),
  upload.array("files", 10),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { conversationId } = req.body;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "No files uploaded" });
      }

      // Store file metadata in database
      const attachments = await Promise.all(
        files.map(async (file) => {
          const attachment = await prisma.chatAttachment.create({
            data: {
              file_name: file.originalname,
              file_url: `/uploads/chat/${file.filename}`,
              file_type: file.mimetype,
              file_size: file.size,
              uploaded_by_id: userId,
            },
          });
          return attachment;
        })
      );

      return res.status(200).json({
        success: true,
        data: { attachments },
      });
    } catch (error: any) {
      console.error("Error uploading files:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
);

export default router;
