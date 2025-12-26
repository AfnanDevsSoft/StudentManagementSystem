import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/error.middleware";
import { requirePermission } from "../middleware/permission.middleware";

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
router.get("/", authMiddleware, requirePermission("grades:read"), async (req: Request, res: Response) => {
    try {
        const branch_id = (req.query.branch_id || req.query.branchId) as string;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        const GradeService = require("../services/grade.service").default;
        const result = await GradeService.getAllGrades(
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
 * /api/v1/grades:
 *   post:
 *     summary: Bulk create/update grades
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *               - assessmentType
 *               - totalMarks
 *               - grades
 *             properties:
 *               courseId:
 *                 type: string
 *               assessmentType:
 *                 type: string
 *               totalMarks:
 *                 type: number
 *               grades:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     studentId:
 *                       type: string
 *                     marksObtained:
 *                       type: number
 *                     remarks:
 *                       type: string
 *     responses:
 *       200:
 *         description: Grades published successfully
 */
router.post("/", authMiddleware, requirePermission("grades:create"), async (req: Request, res: Response) => {
    try {
        const { courseId, assessmentType, totalMarks, grades } = req.body;
        const user = (req as any).user;

        const GradeService = require("../services/grade.service").default;
        const result = await GradeService.bulkCreate({
            courseId,
            assessmentType,
            totalMarks,
            userId: user.id,
            grades
        });

        if (!result.success) {
            return res.status(400).json(result);
        }

        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
});

export default router;
