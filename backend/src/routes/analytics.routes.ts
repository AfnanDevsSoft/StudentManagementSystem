import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/error.middleware";
import AnalyticsService from "../services/analytics.service";

const router = Router();

/**
 * @swagger
 * /api/v1/analytics/enrollment:
 *   get:
 *     summary: Get enrollment metrics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Enrollment metrics
 */
router.get(
  "/enrollment",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { branchId } = req.query;

      if (!branchId && (req as any).user.role.name !== 'SuperAdmin') {
        return res.status(400).json({ message: "Branch ID is required for non-SuperAdmin" });
      }

      const result = await AnalyticsService.getEnrollmentMetrics(
        branchId as string | undefined
      );

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/v1/analytics/attendance:
 *   get:
 *     summary: Get attendance metrics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attendance metrics
 */
router.get(
  "/attendance",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { branchId, startDate, endDate } = req.query;

      if (!branchId && (req as any).user.role.name !== 'SuperAdmin') {
        return res.status(400).json({ message: "Branch ID is required for non-SuperAdmin" });
      }

      const start = startDate ? new Date(startDate as string) : new Date();
      const end = endDate ? new Date(endDate as string) : new Date();

      const result = await AnalyticsService.getAttendanceMetrics(
        branchId as string | undefined,
        start,
        end
      );

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/v1/analytics/fees:
 *   get:
 *     summary: Get fee collection metrics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Fee metrics
 */
router.get("/fees", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { branchId } = req.query;

    if (!branchId && (req as any).user.role.name !== 'SuperAdmin') {
      return res.status(400).json({ message: "Branch ID is required for non-SuperAdmin" });
    }

    const result = await AnalyticsService.getFeeMetrics(branchId as string | undefined);

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/v1/analytics/teachers:
 *   get:
 *     summary: Get teacher performance metrics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: teacherId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Teacher metrics
 */
router.get("/teachers", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { branchId, teacherId } = req.query;

    if (!branchId && (req as any).user.role.name !== 'SuperAdmin') {
      return res.status(400).json({ message: "Branch ID is required for non-SuperAdmin" });
    }

    const result = await AnalyticsService.getTeacherMetrics(
      branchId as string | undefined,
      teacherId as string
    );

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/v1/analytics/dashboard:
 *   get:
 *     summary: Get dashboard summary
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Dashboard data
 */
router.get(
  "/dashboard",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { branchId } = req.query;

      const result = await AnalyticsService.getDashboardData(
        branchId as string | undefined // If empty string, treats as undefined? need to check, but TS accepts string | undefined
      );

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/v1/analytics/trends/{metricType}:
 *   get:
 *     summary: Get trend analysis
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: metricType
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Trend analysis
 */
router.get(
  "/trends/:metricType",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { metricType } = req.params;
      const { branchId, days = 30 } = req.query;

      if (!branchId) {
        return res.status(400).json({ message: "Branch ID is required" });
      }

      const result = await AnalyticsService.getTrendAnalysis(
        branchId as string,
        metricType,
        parseInt(days as string)
      );

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);

export default router;
