import express, { Router, Request, Response } from "express";
import TeacherService from "../services/teacher.service";
import { authMiddleware, sendResponse } from "../middleware/error.middleware";
import { requirePermission } from "../middleware/permission.middleware";

const router: Router = express.Router();

// ⭐ IMPORTANT: Nested routes MUST come before /:id to avoid conflicts!

// GET teacher courses
router.get(
  "/:id/courses",
  authMiddleware,
  requirePermission("teachers:read"),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await TeacherService.getTeacherCourses(id);
    sendResponse(
      res,
      result.success ? 200 : 404,
      result.success,
      result.message,
      result.data
    );
  }
);

// GET teacher attendance
router.get(
  "/:id/attendance",
  authMiddleware,
  requirePermission("teachers:read"),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await TeacherService.getTeacherAttendance(id);
    sendResponse(
      res,
      result.success ? 200 : 404,
      result.success,
      result.message,
      result.data
    );
  }
);

// GET all teachers with pagination and search
router.get(
  "/",
  authMiddleware,
  requirePermission("teachers:read"),
  async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const branchId = (req.query.branch_id as string) || "";

    const result = await TeacherService.getAllTeachers(page, limit, search, branchId, (req as any).user);
    sendResponse(
      res,
      200,
      result.success,
      result.message,
      result.data,
      result.pagination
    );
  }
);

// GET single teacher by ID
router.get(
  "/:id",
  authMiddleware,
  requirePermission("teachers:read"),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await TeacherService.getTeacherById(id);

    if (!result.success) {
      sendResponse(res, 404, false, result.message);
      return;
    }

    sendResponse(res, 200, result.success, result.message, result.data);
  }
);

// POST create teacher
router.post(
  "/",
  authMiddleware,
  requirePermission("teachers:create"),
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as any).user;
    const payload = { ...req.body };

    // Enforce branch isolation for non-SuperAdmins
    if (user.role.name !== 'SuperAdmin') {
      if (!user.branch_id) {
        sendResponse(res, 400, false, "User has no branch assigned");
        return;
      }
      payload.branch_id = user.branch_id;
    }

    const result = await TeacherService.createTeacher(payload);
    const statusCode = result.success ? 201 : 400;
    sendResponse(res, statusCode, result.success, result.message, result.data);
  }
);

// PUT update teacher
router.put(
  "/:id",
  authMiddleware,
  requirePermission("teachers:update"),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await TeacherService.updateTeacher(id, req.body);
    const statusCode = result.success ? 200 : 400;
    sendResponse(res, statusCode, result.success, result.message, result.data);
  }
);

// DELETE teacher
router.delete(
  "/:id",
  authMiddleware,
  requirePermission("teachers:delete"),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await TeacherService.deleteTeacher(id);
    sendResponse(
      res,
      result.success ? 200 : 400,
      result.success,
      result.message
    );
  }
);

export default router;
