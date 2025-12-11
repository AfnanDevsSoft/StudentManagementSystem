import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/error.middleware";

const router = Router();

/**
 * @swagger
 * /api/v1/grades:
 *   get:
 *     summary: Get all grades (general query)
 *     tags: [Grades]
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
 *     responses:
 *       200:
 *         description: Grade records
 */
router.get("/", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { branch_id, student_id, course_id } = req.query;

        // For now, return empty array
        // Grades are usually accessed through /students/:studentId/grades
        return res.status(200).json({
            success: true,
            message: "Grades retrieved",
            data: [],
            note: "Use /students/:id/grades for student-specific grades"
        });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
});

export default router;
