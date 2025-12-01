import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/error.middleware";
import CourseContentService from "../services/courseContent.service";

const router = Router();

/**
 * @swagger
 * /api/v1/course-content/upload:
 *   post:
 *     summary: Upload course content
 *     tags: [Course Content]
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
 *               contentType:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               fileName:
 *                 type: string
 *               fileSize:
 *                 type: number
 *               uploadedBy:
 *                 type: string
 *     responses:
 *       201:
 *         description: Content uploaded
 */
router.post("/upload", authMiddleware, async (req: Request, res: Response) => {
  try {
    const {
      courseId,
      contentType,
      title,
      description,
      fileName,
      fileSize,
      filePath,
      uploadedBy,
      duration,
    } = req.body;

    if (!courseId || !contentType || !title || !fileName || !uploadedBy) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const result = await CourseContentService.uploadContent(courseId, {
      contentType,
      title,
      description,
      fileName,
      fileSize,
      filePath: filePath || "",
      duration,
      uploadedBy,
    });

    return res.status(result.success ? 201 : 400).json(result);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/v1/course-content/{courseId}:
 *   get:
 *     summary: Get course content
 *     tags: [Course Content]
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
 *         description: Course content
 */
router.get(
  "/:courseId",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { courseId } = req.params;
      const { limit = 20, offset = 0 } = req.query;

      const result = await CourseContentService.getContent(
        courseId,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/v1/course-content/{courseId}/published:
 *   get:
 *     summary: Get published course content
 *     tags: [Course Content]
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
 *         description: Published course content
 */
router.get(
  "/:courseId/published",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { courseId } = req.params;

      const result = await CourseContentService.getPublishedContent(courseId);

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/v1/course-content/{contentId}:
 *   patch:
 *     summary: Update content
 *     tags: [Course Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
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
 *         description: Content updated
 */
router.patch(
  "/:contentId",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { contentId } = req.params;

      const result = await CourseContentService.updateContent(
        contentId,
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
 * /api/v1/course-content/{contentId}:
 *   delete:
 *     summary: Delete content
 *     tags: [Course Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Content deleted
 */
router.delete(
  "/:contentId",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { contentId } = req.params;

      const result = await CourseContentService.deleteContent(contentId);

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/v1/course-content/{contentId}/view:
 *   post:
 *     summary: Track content view
 *     tags: [Course Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: View tracked
 */
router.post(
  "/:contentId/view",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { contentId } = req.params;

      const result = await CourseContentService.trackView(contentId);

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/v1/course-content/{contentId}/pin:
 *   post:
 *     summary: Pin/unpin content
 *     tags: [Course Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
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
 *         description: Content pinned/unpinned
 */
router.post(
  "/:contentId/pin",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { contentId } = req.params;
      const { isPinned } = req.body;

      const result = await CourseContentService.pinContent(contentId, isPinned);

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/v1/course-content/{courseId}/by-type/{contentType}:
 *   get:
 *     summary: Get content by type
 *     tags: [Course Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: string
 *         required: true
 *       - in: path
 *         name: contentType
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Content by type
 */
router.get(
  "/:courseId/by-type/:contentType",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { courseId, contentType } = req.params;

      const result = await CourseContentService.getContentByType(
        courseId,
        contentType
      );

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/v1/course-content/{courseId}/popular:
 *   get:
 *     summary: Get popular content
 *     tags: [Course Content]
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
 *         description: Popular content
 */
router.get(
  "/:courseId/popular",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { courseId } = req.params;

      const result = await CourseContentService.getPopularContent(courseId);

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);

export default router;
