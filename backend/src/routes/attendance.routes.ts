import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/error.middleware";

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
        const { branch_id, student_id, course_id, date } = req.query;

        // For now, return empty array
        // Attendance is usually accessed through /students/:studentId/attendance
        // or /courses/:courseId/attendance
        return res.status(200).json({
            success: true,
            message: "Attendance records retrieved",
            data: [],
            note: "Use /students/:id/attendance or /courses/:id/attendance for specific records"
        });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
});

export default router;
