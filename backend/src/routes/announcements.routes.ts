import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/error.middleware";
import AnnouncementService from "../services/announcement.service";
import { requirePermission } from "../middleware/permission.middleware";

const router = Router();

/**
 * @swagger
 * /api/v1/announcements:
 *   post:
 *     summary: Create announcement
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               courseId:
 *                 type: string
 *               createdBy:
 *                 type: string
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               priority:
 *                 type: string
 *               announcementType:
 *                 type: string
 *               attachmentUrl:
 *                 type: string
 *               expiresAt:
 *                 type: string
 *     responses:
 *       201:
 *         description: Announcement created
 */
router.post("/", authMiddleware, requirePermission("announcements:create"), async (req: Request, res: Response) => {
  try {
    const {
      courseId,
      createdBy,
      title,
      content,
      priority,
      announcementType,
      attachmentUrl,
      scheduledFor,
      expiresAt,
    } = req.body;

    if (!courseId || !createdBy || !title || !content) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const result = await AnnouncementService.createAnnouncement(
      courseId,
      createdBy,
      {
        title,
        content,
        priority,
        announcementType,
        attachmentUrl,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      }
    );

    return res.status(result.success ? 201 : 400).json(result);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/v1/announcements:
 *   get:
 *     summary: Get all announcements (general, not course-specific)
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *       - in: query
 *         name: targetAudience
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of general announcements
 */
router.get("/", authMiddleware, requirePermission("announcements:read"), async (req: Request, res: Response) => {
  try {
    const { limit = 50, offset = 0, targetAudience } = req.query;

    // Return empty array for now - this would query general/system-wide announcements
    // For most use cases, announcements are course-specific
    return res.status(200).json({
      success: true,
      message: "Announcements retrieved successfully",
      data: [], // General announcements would go here
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: 0
      }
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/v1/announcements/{courseId}:
 *   get:
 *     summary: Get announcements for a course
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
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
 *         description: List of announcements
 */
router.get(
  "/:courseId",
  authMiddleware,
  requirePermission("announcements:read"),
  async (req: Request, res: Response) => {
    try {
      const { courseId } = req.params;
      const { limit = 20, offset = 0 } = req.query;

      const result = await AnnouncementService.getAnnouncements(
        courseId,
        parseInt(limit as string),
        parseInt(offset as string),
        (req as any).user
      );

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/v1/announcements/{courseId}/priority/{priority}:
 *   get:
 *     summary: Get announcements by priority
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: string
 *         required: true
 *       - in: path
 *         name: priority
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Announcements by priority
 */
router.get(
  "/:courseId/priority/:priority",
  authMiddleware,
  requirePermission("announcements:read"),
  async (req: Request, res: Response) => {
    try {
      const { courseId, priority } = req.params;
      const { limit = 20 } = req.query;

      const result = await AnnouncementService.getAnnouncementsByPriority(
        courseId,
        priority as any,
        parseInt(limit as string),
        (req as any).user
      );

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/v1/announcements/{courseId}/type/{announcementType}:
 *   get:
 *     summary: Get announcements by type
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: string
 *         required: true
 *       - in: path
 *         name: announcementType
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Announcements by type
 */
router.get(
  "/:courseId/type/:announcementType",
  authMiddleware,
  requirePermission("announcements:read"),
  async (req: Request, res: Response) => {
    try {
      const { courseId, announcementType } = req.params;
      const { limit = 20 } = req.query;

      const result = await AnnouncementService.getAnnouncementsByType(
        courseId,
        announcementType as any,
        parseInt(limit as string),
        (req as any).user
      );

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/v1/announcements/{announcementId}:
 *   patch:
 *     summary: Update announcement
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: announcementId
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Announcement updated
 */
router.patch(
  "/:announcementId",
  authMiddleware,
  requirePermission("announcements:create"),
  async (req: Request, res: Response) => {
    try {
      const { announcementId } = req.params;

      const result = await AnnouncementService.updateAnnouncement(
        announcementId,
        req.body
      );

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/v1/announcements/{announcementId}:
 *   delete:
 *     summary: Delete announcement
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: announcementId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Announcement deleted
 */
router.delete(
  "/:announcementId",
  authMiddleware,
  requirePermission("announcements:create"),
  async (req: Request, res: Response) => {
    try {
      const { announcementId } = req.params;

      const result =
        await AnnouncementService.deleteAnnouncement(announcementId);

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/v1/announcements/{announcementId}/pin:
 *   post:
 *     summary: Pin/unpin announcement
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: announcementId
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isPinned:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Announcement pinned/unpinned
 */
router.post(
  "/:announcementId/pin",
  authMiddleware,
  requirePermission("announcements:create"),
  async (req: Request, res: Response) => {
    try {
      const { announcementId } = req.params;
      const { isPinned } = req.body;

      const result = await AnnouncementService.pinAnnouncement(
        announcementId,
        isPinned
      );

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/v1/announcements/{announcementId}/view:
 *   post:
 *     summary: Track announcement view
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: announcementId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: View tracked
 */
router.post(
  "/:announcementId/view",
  authMiddleware,
  requirePermission("announcements:read"),
  async (req: Request, res: Response) => {
    try {
      const { announcementId } = req.params;

      const result = await AnnouncementService.trackView(announcementId);

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/v1/announcements/{courseId}/pinned:
 *   get:
 *     summary: Get pinned announcements
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Pinned announcements
 */
router.get(
  "/:courseId/pinned",
  authMiddleware,
  requirePermission("announcements:read"),
  async (req: Request, res: Response) => {
    try {
      const { courseId } = req.params;

      const result = await AnnouncementService.getPinnedAnnouncements(courseId);

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/v1/announcements/{courseId}/upcoming:
 *   get:
 *     summary: Get upcoming announcements
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Upcoming announcements
 */
router.get(
  "/:courseId/upcoming",
  authMiddleware,
  requirePermission("announcements:read"),
  async (req: Request, res: Response) => {
    try {
      const { courseId } = req.params;

      const result =
        await AnnouncementService.getUpcomingAnnouncements(courseId, 10, (req as any).user);

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/v1/announcements/{courseId}/statistics:
 *   get:
 *     summary: Get announcement statistics
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Announcement statistics
 */
router.get(
  "/:courseId/statistics",
  authMiddleware,
  requirePermission("announcements:read"),
  async (req: Request, res: Response) => {
    try {
      const { courseId } = req.params;

      const result = await AnnouncementService.getAnnouncementStats(courseId);

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/v1/announcements/{courseId}/search:
 *   get:
 *     summary: Search announcements
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
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
router.get(
  "/:courseId/search",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { courseId } = req.params;
      const { searchTerm, limit = 20 } = req.query;

      if (!searchTerm) {
        return res.status(400).json({ message: "Search term is required" });
      }

      const result = await AnnouncementService.searchAnnouncements(
        courseId,
        searchTerm as string,
        parseInt(limit as string)
      );

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);

export default router;
