import express, { Router, Request, Response } from "express";
import StudentService from "../services/student.service";
import { authMiddleware, sendResponse } from "../middleware/error.middleware";

const router: Router = express.Router();

// ⭐ IMPORTANT: Nested routes MUST come before /:id to avoid conflicts!

// GET student enrollments
router.get(
  "/:id/enrollment",
  authMiddleware,
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
router.get(
  "/:id/attendance",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
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
  async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const branchId = (req.query.branch_id as string) || "";

    const result = await StudentService.getAllStudents(
      page,
      limit,
      search,
      branchId
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
  async (req: Request, res: Response): Promise<void> => {
    const result = await StudentService.createStudent(req.body);
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
