import express, { Router, Request, Response } from "express";
import TimetableService from "../services/timetable.service";
import { authMiddleware, sendResponse } from "../middleware/error.middleware";

const router: Router = express.Router();

// ==================== TIME SLOTS ====================

// GET all time slots for a branch
router.get(
    "/time-slots",
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        const branchId = req.query.branch_id as string;
        const result = await TimetableService.getTimeSlots(branchId);
        sendResponse(
            res,
            result.success ? 200 : 404,
            result.success,
            result.message,
            result.data
        );
    }
);

// POST create a new time slot
router.post(
    "/time-slots",
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        const result = await TimetableService.createTimeSlot(req.body);
        sendResponse(
            res,
            result.success ? 201 : 400,
            result.success,
            result.message,
            result.data
        );
    }
);

// PATCH update a time slot
router.patch(
    "/time-slots/:id",
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const result = await TimetableService.updateTimeSlot(id, req.body);
        sendResponse(
            res,
            result.success ? 200 : 400,
            result.success,
            result.message,
            result.data
        );
    }
);

// DELETE a time slot
router.delete(
    "/time-slots/:id",
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const result = await TimetableService.deleteTimeSlot(id);
        sendResponse(
            res,
            result.success ? 200 : 400,
            result.success,
            result.message
        );
    }
);

// ==================== ROOMS ====================

// GET all rooms for a branch
router.get(
    "/rooms",
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        const branchId = req.query.branch_id as string;
        const result = await TimetableService.getRooms(branchId);
        sendResponse(
            res,
            result.success ? 200 : 404,
            result.success,
            result.message,
            result.data
        );
    }
);

// POST create a new room
router.post(
    "/rooms",
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        const result = await TimetableService.createRoom(req.body);
        sendResponse(
            res,
            result.success ? 201 : 400,
            result.success,
            result.message,
            result.data
        );
    }
);

// PATCH update a room
router.patch(
    "/rooms/:id",
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const result = await TimetableService.updateRoom(id, req.body);
        sendResponse(
            res,
            result.success ? 200 : 400,
            result.success,
            result.message,
            result.data
        );
    }
);

// DELETE a room
router.delete(
    "/rooms/:id",
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const result = await TimetableService.deleteRoom(id);
        sendResponse(
            res,
            result.success ? 200 : 400,
            result.success,
            result.message
        );
    }
);

// ==================== TIMETABLE ENTRIES ====================

// GET timetable for a course
router.get(
    "/course/:courseId",
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        const { courseId } = req.params;
        const result = await TimetableService.getCourseTimetable(courseId);
        sendResponse(
            res,
            result.success ? 200 : 404,
            result.success,
            result.message,
            result.data
        );
    }
);

// GET timetable for a teacher
router.get(
    "/teacher/:teacherId",
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        const { teacherId } = req.params;
        const result = await TimetableService.getTeacherTimetable(teacherId);
        sendResponse(
            res,
            result.success ? 200 : 404,
            result.success,
            result.message,
            result.data
        );
    }
);

// GET timetable for a student
router.get(
    "/student/:studentId",
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        const { studentId } = req.params;
        const result = await TimetableService.getStudentTimetable(studentId);
        sendResponse(
            res,
            result.success ? 200 : 404,
            result.success,
            result.message,
            result.data
        );
    }
);

// GET full branch timetable
router.get(
    "/branch/:academicYearId",
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        const { academicYearId } = req.params;
        const result = await TimetableService.getBranchTimetable(academicYearId);
        sendResponse(
            res,
            result.success ? 200 : 404,
            result.success,
            result.message,
            result.data
        );
    }
);

// POST create a timetable entry
router.post(
    "/entries",
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        const result = await TimetableService.createTimetableEntry(req.body);
        sendResponse(
            res,
            result.success ? 201 : 400,
            result.success,
            result.message,
            result.data
        );
    }
);

// PATCH update a timetable entry
router.patch(
    "/entries/:id",
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const result = await TimetableService.updateTimetableEntry(id, req.body);
        sendResponse(
            res,
            result.success ? 200 : 400,
            result.success,
            result.message,
            result.data
        );
    }
);

// DELETE a timetable entry
router.delete(
    "/entries/:id",
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const result = await TimetableService.deleteTimetableEntry(id);
        sendResponse(
            res,
            result.success ? 200 : 400,
            result.success,
            result.message
        );
    }
);

export default router;
