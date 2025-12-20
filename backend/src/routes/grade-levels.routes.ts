import express, { Router, Request, Response } from "express";
import GradeLevelService from "../services/grade-level.service";
import { authMiddleware, sendResponse } from "../middleware/error.middleware";
import { requirePermission } from "../middleware/permission.middleware";

const router: Router = express.Router();

router.get("/", authMiddleware, requirePermission("courses:read"), async (req: Request, res: Response) => {
    const branch_id = (req as any).user.branch_id || (req as any).user.branch?.id;
    const result = await GradeLevelService.getAll(branch_id);
    sendResponse(res, result.success ? 200 : 400, result.success, result.message, result.data);
});

// POST create grade level
router.post("/", authMiddleware, requirePermission("courses:create"), async (req: Request, res: Response) => {
    const user = (req as any).user;
    const branch_id = user.branch_id || user.branch?.id;
    const result = await GradeLevelService.create({ ...req.body, branch_id });
    sendResponse(res, result.success ? 201 : 400, result.success, result.message, result.data);
});

// PUT update grade level
router.put("/:id", authMiddleware, requirePermission("courses:update"), async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await GradeLevelService.update(id, req.body);
    sendResponse(res, result.success ? 200 : 400, result.success, result.message, result.data);
});

// DELETE delete grade level
router.delete("/:id", authMiddleware, requirePermission("courses:update"), async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await GradeLevelService.delete(id);
    sendResponse(res, result.success ? 200 : 400, result.success, result.message);
});

export default router;
