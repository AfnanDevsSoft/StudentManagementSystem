import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/error.middleware";
import AttendanceService from "../services/attendance.service";

const router = Router();

/**
 * @swagger
 * /api/v1/attendance:
 *   get:
 *     summary: Get all attendance records (general query)
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: branch_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: student_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: course_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attendance records
 */
router.get("/", authMiddleware, async (req: Request, res: Response) => {
    try {
        const branch_id = (req.query.branch_id || req.query.branchId) as string;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        const result = await AttendanceService.getAllAttendance(
            branch_id,
            limit,
            page,
            (req as any).user
        );

        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/v1/attendance:
 *   post:
 *     summary: Mark attendance for a student
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - student_id
 *               - date
 *               - status
 *             properties:
 *               student_id:
 *                 type: string
 *               course_id:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [Present, Absent, Late, Excused]
 *               remarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: Attendance marked successfully
 */
router.post("/", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { student_id, course_id, date, status, remarks } = req.body;
        const user = (req as any).user;

        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const result = await AttendanceService.markAttendance({
            student_id,
            course_id,
            branch_id: user.branch_id,
            date,
            status,
            remarks,
            recorded_by: user.id
        });

        if (!result.success) {
            return res.status(400).json(result);
        }

        return res.status(200).json(result);
    } catch (error: any) {
        console.error("Attendance POST error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
