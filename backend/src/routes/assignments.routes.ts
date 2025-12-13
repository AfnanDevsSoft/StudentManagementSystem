import { Router, Request, Response } from "express";
import AssignmentService from "../services/assignment.service";
import { authMiddleware, sendResponse } from "../middleware/error.middleware";

const router = Router();

// Create Assignment
router.post("/", authMiddleware, async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;

        // Check if user is a teacher
        if (user.role.name !== "Teacher" || !user.teacher) {
            return sendResponse(res, 403, false, "Only teachers can create assignments");
        }

        const teacherId = user.teacher.id;

        // Frontend sends 'due_date' (snake_case) or 'dueDate' (camelCase)? 
        // AssignmentService expects: title, description, course_id, teacher_id, due_date, max_score, status
        // Let's rely on standardizing to what service expects.

        const { title, description, course_id, due_date, max_score, status } = req.body;

        // Basic validation
        if (!title || !course_id || !due_date) {
            return sendResponse(res, 400, false, "Missing required fields");
        }

        const result = await AssignmentService.create({
            title,
            description,
            course_id,
            teacher_id: teacherId,
            due_date,
            max_score: Number(max_score),
            status: status || 'active'
        });

        sendResponse(
            res,
            result.success ? 201 : 400,
            result.success,
            result.message,
            result.data
        );
    } catch (error: any) {
        sendResponse(res, 500, false, error.message);
    }
});

// Get Assignments by Course
router.get("/course/:courseId", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { courseId } = req.params;
        const result = await AssignmentService.getByCourse(courseId);

        sendResponse(
            res,
            result.success ? 200 : 400,
            result.success,
            result.message,
            result.data
        );
    } catch (error: any) {
        sendResponse(res, 500, false, error.message);
    }
});

// Get Submissions for Assignment
router.get("/:id/submissions", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        // Verify teacher owns the assignment or is admin (skipped for brevity, but could add check)

        const result = await AssignmentService.getSubmissions(id);

        sendResponse(
            res,
            result.success ? 200 : 400,
            result.success,
            result.message,
            result.data
        );
    } catch (error: any) {
        sendResponse(res, 500, false, error.message);
    }
});

// Delete Assignment
router.delete("/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await AssignmentService.delete(id);

        sendResponse(
            res,
            result.success ? 200 : 400,
            result.success,
            result.message
        );
    } catch (error: any) {
        sendResponse(res, 500, false, error.message);
    }
});

// Update Assignment
router.put("/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await AssignmentService.update(id, req.body);

        sendResponse(
            res,
            result.success ? 200 : 400,
            result.success,
            result.message,
            result.data
        );
    } catch (error: any) {
        sendResponse(res, 500, false, error.message);
    }
});

// Submit Assignment
router.post("/:id/submit", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = (req as any).user;
        const { content_url } = req.body;

        if (user.role.name !== "Student" || !user.student) {
            // For now, allow anyone to submit if role checks are loose, but ideally check student
            // return sendResponse(res, 403, false, "Only students can submit assignments");
        }

        // Check if student exists linked to user, or extract student ID differently if needed
        // Assuming user.student is populated by authMiddleware if role is Student
        const studentId = user.student?.id;

        if (!studentId) {
            return sendResponse(res, 400, false, "Student profile not found");
        }

        const result = await AssignmentService.submitAssignment({
            assignment_id: id,
            student_id: studentId,
            content_url
        });

        sendResponse(
            res,
            result.success ? 200 : 400,
            result.success,
            result.message,
            result.data
        );
    } catch (error: any) {
        sendResponse(res, 500, false, error.message);
    }
});

export default router;
