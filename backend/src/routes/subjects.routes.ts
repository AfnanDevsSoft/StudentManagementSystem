import express, { Router, Request, Response } from "express";
import SubjectService from "../services/subject.service";
import { authMiddleware, sendResponse } from "../middleware/error.middleware";
import { requirePermission } from "../middleware/permission.middleware";

const router: Router = express.Router();

router.get("/", authMiddleware, requirePermission("courses:read"), async (req: Request, res: Response) => {
    const branch_id = (req as any).user.branch_id || (req as any).user.branch?.id;
    const result = await SubjectService.getAll(branch_id);
    sendResponse(res, result.success ? 200 : 400, result.success, result.message, result.data);
});

// POST create subject
router.post("/", authMiddleware, requirePermission("courses:create"), async (req: Request, res: Response) => {
    const user = (req as any).user;
    const branch_id = user.branch_id || user.branch?.id;
    const result = await SubjectService.create({ ...req.body, branch_id });
    sendResponse(res, result.success ? 201 : 400, result.success, result.message, result.data);
});

// PUT update subject
router.put("/:id", authMiddleware, requirePermission("courses:update"), async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await SubjectService.update(id, req.body);
    sendResponse(res, result.success ? 200 : 400, result.success, result.message, result.data);
});

// DELETE delete subject
router.delete("/:id", authMiddleware, requirePermission("courses:update"), async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await SubjectService.delete(id);
    sendResponse(res, result.success ? 200 : 400, result.success, result.message);
});

export default router;
