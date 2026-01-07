import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/error.middleware";
import AttendanceService from "../services/attendance.service";
import { requirePermission, requireAnyPermission } from "../middleware/permission.middleware";

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
router.get("/", authMiddleware, requireAnyPermission(["attendance:read", "attendance:read_own"]), async (req: Request, res: Response) => {
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
router.post("/", authMiddleware, requirePermission("attendance:create"), async (req: Request, res: Response) => {
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

/**
 * Get student attendance summary
 * GET /api/v1/attendance/summary/student/:studentId?academicYearId=&branchId=
 */
router.get(
    "/summary/student/:studentId",
    authMiddleware,
    // requirePermission("attendance:read"), // Moved check inside
    async (req: Request, res: Response) => {
        try {
            const { studentId } = req.params;
            const { academicYearId, branchId } = req.query;
            const user = (req as any).user;

            if (!user) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            // Check permissions: Owner (student profile id matches) OR Has attendance:read
            const isOwner = user.student?.id === studentId;

            let hasPermission = false;
            if (isOwner) {
                hasPermission = true;
            } else {
                // Import RBACService to check permission manually
                const { RBACService } = require("../services/rbac.service");
                hasPermission = await RBACService.checkUserPermission(user.id, "attendance:read");
            }

            if (!hasPermission) {
                return res.status(403).json({ success: false, message: "Permission denied" });
            }

            const result = await AttendanceService.getStudentAttendanceSummary(
                studentId,
                academicYearId as string,
                (branchId as string) || user.branch_id
            );

            return res.status(result.success ? 200 : 400).json(result);
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
);

/**
 * @swagger
 * /api/v1/attendance/teacher:
 *   post:
 *     summary: Mark attendance for a teacher
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
 *               - teacher_id
 *               - date
 *               - status
 *             properties:
 *               teacher_id:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [Present, Absent, Leave, Late]
 *               remarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: Teacher attendance marked successfully
 */
router.post("/teacher", authMiddleware, requirePermission("attendance:create"), async (req: Request, res: Response) => {
    try {
        const { teacher_id, date, status, remarks } = req.body;

        const result = await AttendanceService.markTeacherAttendance({
            teacher_id,
            date,
            status,
            remarks
        });

        if (!result.success) {
            return res.status(400).json(result);
        }

        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * Get teacher attendance summary
 * GET /api/v1/attendance/summary/teacher/:teacherId?academicYearId=&branchId=
 */
router.get(
    "/summary/teacher/:teacherId",
    authMiddleware,
    requirePermission("attendance:read"),
    async (req: Request, res: Response) => {
        try {
            const { teacherId } = req.params;
            const { academicYearId, branchId } = req.query;
            const user = (req as any).user;

            const result = await AttendanceService.getTeacherAttendanceSummary(
                teacherId,
                academicYearId as string,
                (branchId as string) || user.branch_id
            );

            return res.status(result.success ? 200 : 400).json(result);
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
);

/**
 * Recalculate attendance summary
 * POST /api/v1/attendance/summary/recalculate
 */
router.post(
    "/summary/recalculate",
    authMiddleware,
    requirePermission("attendance:create"),
    async (req: Request, res: Response) => {
        try {
            const { entityType, entityId, academicYearId, branchId } = req.body;
            const user = (req as any).user;

            if (!entityType || !entityId) {
                return res.status(400).json({
                    success: false,
                    message: "Entity type and entity ID are required",
                });
            }

            const result = await AttendanceService.recalculateAttendanceSummary(
                entityType,
                entityId,
                academicYearId,
                branchId || user.branch_id
            );

            return res.status(result.success ? 200 : 400).json(result);
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
);

export default router;
