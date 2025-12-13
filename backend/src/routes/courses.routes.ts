import express, { Router, Request, Response } from "express";
import CourseService from "../services/course.service";
import EnrollmentService from "../services/enrollment.service";
import { authMiddleware, sendResponse } from "../middleware/error.middleware";

const router: Router = express.Router();

// ⭐ IMPORTANT: Nested routes MUST come before /:id to avoid conflicts!

// GET course enrollments
router.get(
  "/:id/enrollments",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await CourseService.getCourseEnrollments(id);
    sendResponse(
      res,
      result.success ? 200 : 404,
      result.success,
      result.message,
      result.data
    );
  }
);

// GET course students
router.get(
  "/:id/students",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await CourseService.getCourseStudents(id);
    sendResponse(
      res,
      result.success ? 200 : 404,
      result.success,
      result.message,
      result.data
    );
  }
);

// POST enroll student in course
router.post(
  "/:id/enroll",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { student_id } = req.body;

    const result = await EnrollmentService.enrollStudent(student_id, id);
    const statusCode = result.success ? 201 : 400;
    sendResponse(res, statusCode, result.success, result.message, result.data);
  }
);

// DELETE unenroll student from course
router.delete(
  "/:id/enroll/:student_id",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const { id, student_id } = req.params;

    const result = await EnrollmentService.dropCourse(student_id, id);
    sendResponse(
      res,
      result.success ? 200 : 400,
      result.success,
      result.message
    );
  }
);

// GET course attendance
router.get(
  "/:id/attendance",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { date } = req.query;

    // Import dynamically if needed or assume available
    const AttendanceService = require("../services/attendance.service").default;
    const result = await AttendanceService.getByCourse(id, date as string);

    sendResponse(
      res,
      result.success ? 200 : 400,
      result.success,
      result.message,
      result.data
    );
  }
);

// POST bulk mark attendance
router.post(
  "/:id/attendance/bulk",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { date, records } = req.body;
    const user = (req as any).user;

    const AttendanceService = require("../services/attendance.service").default;
    const result = await AttendanceService.bulkMark({
      courseId: id,
      date,
      records,
      recordedBy: user.id,
      branchId: user.branch_id
    });

    sendResponse(
      res,
      result.success ? 200 : 400,
      result.success,
      result.message,
      result.data
    );
  }
);
router.get(
  "/",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";

    const result = await CourseService.getAllCourses(page, limit, search, (req as any).user);
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

// GET single course by ID
router.get(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await CourseService.getCourseById(id);

    if (!result.success) {
      sendResponse(res, 404, false, result.message);
      return;
    }

    sendResponse(res, 200, result.success, result.message, result.data);
  }
);

// POST create course
router.post(
  "/",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const result = await CourseService.createCourse(req.body);
    const statusCode = result.success ? 201 : 400;
    sendResponse(res, statusCode, result.success, result.message, result.data);
  }
);

// GET course grades
router.get(
  "/:id/grades",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const GradeService = require("../services/grade.service").default;
    const result = await GradeService.getByCourse(id);

    sendResponse(
      res,
      result.success ? 200 : 400,
      result.success,
      result.message,
      result.data
    );
  }
);

// POST bulk grades
router.post(
  "/:id/grades/bulk",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const user = (req as any).user;

    const GradeService = require("../services/grade.service").default;
    const result = await GradeService.bulkCreate({
      ...req.body,
      courseId: id,
      userId: user.id
    });

    sendResponse(
      res,
      result.success ? 200 : 400,
      result.success,
      result.message,
      result.data
    );
  }
);

// PUT update course
router.put(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await CourseService.updateCourse(id, req.body);
    const statusCode = result.success ? 200 : 400;
    sendResponse(res, statusCode, result.success, result.message, result.data);
  }
);

// DELETE course
router.delete(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await CourseService.deleteCourse(id);
    sendResponse(
      res,
      result.success ? 200 : 400,
      result.success,
      result.message
    );
  }
);

export default router;
