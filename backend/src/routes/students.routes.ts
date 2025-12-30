import express, { Router, Request, Response } from "express";
import StudentService from "../services/student.service";
import { authMiddleware, sendResponse } from "../middleware/error.middleware";
import { requirePermission, requireAnyPermission } from "../middleware/permission.middleware";


const router: Router = express.Router();

// ⭐ IMPORTANT: Nested routes MUST come before /:id to avoid conflicts!

// GET student enrollments
router.get(
  "/:id/enrollment",
  authMiddleware,
  requirePermission("students:read"),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await StudentService.getStudentEnrollments(id);
    sendResponse(
      res,
      result.success ? 200 : 404,
      result.success,
      result.message,
      result.data
    );
  }
);

// GET student grades
router.get(
  "/:id/grades",
  authMiddleware,
  requirePermission("students:read"),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await StudentService.getStudentGrades(id);
    sendResponse(
      res,
      result.success ? 200 : 404,
      result.success,
      result.message,
      result.data
    );
  }
);

// GET student attendance
// GET student attendance
router.get(
  "/:id/attendance",
  authMiddleware,
  // requirePermission("students:read"), // Check inside
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const user = (req as any).user;

    if (!user) {
      sendResponse(res, 401, false, "Unauthorized");
      return;
    }

    // Check permissions: Owner OR Has Permission
    const isOwner = user.student_id === id || user.id === id;

    let hasPermission = false;
    if (isOwner) {
      hasPermission = true;
    } else {
      // Import RBACService to check permission manually
      // Note: need to handle import if not present, but for now we trust it's effectively available via module system or I can add import if needed.
      // Actually RBACService is NOT imported in this file. I need to add it or use require.
      const { RBACService } = require("../services/rbac.service");
      hasPermission = await RBACService.checkUserPermission(user.id, "students:read");
    }

    if (!hasPermission) {
      sendResponse(res, 403, false, "Permission denied");
      return;
    }

    const result = await StudentService.getStudentAttendance(id);
    sendResponse(
      res,
      result.success ? 200 : 404,
      result.success,
      result.message,
      result.data
    );
  }
);

// GET all students with pagination and search
router.get(
  "/",
  authMiddleware,
  requirePermission("students:read"),
  async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const branchId = (req.query.branch_id as string) || "";

    const result = await StudentService.getAllStudents(
      page,
      limit,
      search,
      branchId,
      (req as any).user
    );
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

// GET single student by ID
router.get(
  "/:id",
  authMiddleware,
  requirePermission("students:read"),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await StudentService.getStudentById(id);

    if (!result.success) {
      sendResponse(res, 404, false, result.message);
      return;
    }

    // Flatten response for tests
    res.status(200).json(result.data);
  }
);

// POST create student
router.post(
  "/",
  authMiddleware,
  requirePermission("students:create"),
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

    const result = await StudentService.createStudent(payload);
    if (!result.success) {
      // Return 409 for duplicates, 400 for validation errors
      const statusCode = result.message.includes('already exists') ? 409 : 400;
      sendResponse(res, statusCode, false, result.message);
      return;
    }
    // Flatten response for tests
    res.status(201).json(result.data);
  }
);

// PUT update student
router.put(
  "/:id",
  authMiddleware,
  requirePermission("students:update"),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await StudentService.updateStudent(id, req.body);
    if (!result.success) {
      const statusCode = result.message.includes('not found') ? 404 : 400;
      sendResponse(res, statusCode, false, result.message);
      return;
    }
    // Flatten response for tests
    res.status(200).json(result.data);
  }
);

// DELETE student
router.delete(
  "/:id",
  authMiddleware,
  requirePermission("students:delete"),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await StudentService.deleteStudent(id);
    sendResponse(
      res,
      result.success ? 200 : 400,
      result.success,
      result.message
    );
  }
);

export default router;
