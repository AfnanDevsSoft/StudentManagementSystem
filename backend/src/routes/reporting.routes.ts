import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/error.middleware";
import ReportingService from "../services/reporting.service";
import { requirePermission } from "../middleware/permission.middleware";

const router = Router();

/**
 * @swagger
 * /api/v1/reports/student-progress:
 *   post:
 *     summary: Generate student progress report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               branchId:
 *                 type: string
 *               courseId:
 *                 type: string
 *               format:
 *                 type: string
 *                 enum: [pdf, excel]
 *     responses:
 *       201:
 *         description: Student progress report generated
 */
router.post(
  "/student-progress",
  authMiddleware,
  requirePermission("reports:generate"),
  async (req: Request, res: Response) => {
    try {
      const { branchId, courseId, format } = req.body;

      if (!branchId) {
        return res.status(400).json({ message: "Branch ID is required" });
      }

      const result = await ReportingService.generateStudentReport(
        branchId,
        courseId,
        format
      );

      return res.status(result.success ? 201 : 400).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/v1/reports/teacher-performance:
 *   post:
 *     summary: Generate teacher performance report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               branchId:
 *                 type: string
 *               teacherId:
 *                 type: string
 *               format:
 *                 type: string
 *                 enum: [pdf, excel]
 *     responses:
 *       201:
 *         description: Teacher performance report generated
 */
router.post(
  "/teacher-performance",
  authMiddleware,
  requirePermission("reports:generate"),
  async (req: Request, res: Response) => {
    try {
      const { branchId, teacherId, format } = req.body;

      if (!branchId) {
        return res.status(400).json({ message: "Branch ID is required" });
      }

      const result = await ReportingService.generateTeacherReport(
        branchId,
        teacherId,
        format
      );

      return res.status(result.success ? 201 : 400).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/v1/reports/fee-collection:
 *   post:
 *     summary: Generate fee collection report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               branchId:
 *                 type: string
 *               format:
 *                 type: string
 *                 enum: [pdf, excel]
 *     responses:
 *       201:
 *         description: Fee collection report generated
 */
router.post(
  "/fee-collection",
  authMiddleware,
  requirePermission("reports:generate"),
  async (req: Request, res: Response) => {
    try {
      const { branchId, format } = req.body;

      if (!branchId) {
        return res.status(400).json({ message: "Branch ID is required" });
      }

      const result = await ReportingService.generateFeeReport(branchId, format);

      return res.status(result.success ? 201 : 400).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/v1/reports/attendance:
 *   post:
 *     summary: Generate attendance summary report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               branchId:
 *                 type: string
 *               startDate:
 *                 type: string
 *               endDate:
 *                 type: string
 *               format:
 *                 type: string
 *                 enum: [pdf, excel]
 *     responses:
 *       201:
 *         description: Attendance report generated
 */
router.post(
  "/attendance",
  authMiddleware,
  requirePermission("reports:generate"),
  async (req: Request, res: Response) => {
    try {
      const { branchId, startDate, endDate, format } = req.body;

      if (!branchId || !startDate || !endDate) {
        return res
          .status(400)
          .json({
            message: "Branch ID, start date, and end date are required",
          });
      }

      const result = await ReportingService.generateAttendanceReport(
        branchId,
        new Date(startDate),
        new Date(endDate),
        format
      );

      return res.status(result.success ? 201 : 400).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/v1/reports:
 *   get:
 *     summary: Get all reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: string
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
 *         description: List of reports
 */
router.get("/", authMiddleware, requirePermission("reports:generate"), async (req: Request, res: Response) => {
  try {
    const { branchId, limit = 20, offset = 0 } = req.query;

    if (!branchId) {
      return res.status(400).json({ message: "Branch ID is required" });
    }

    const result = await ReportingService.getReports(
      branchId as string,
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
 * /api/v1/reports/{reportId}:
 *   delete:
 *     summary: Delete report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Report deleted
 */
router.delete(
  "/:reportId",
  authMiddleware,
  requirePermission("reports:generate"),
  async (req: Request, res: Response) => {
    try {
      const { reportId } = req.params;

      const result = await ReportingService.deleteReport(reportId);

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);

export default router;
