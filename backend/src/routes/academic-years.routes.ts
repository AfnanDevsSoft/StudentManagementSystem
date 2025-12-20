import express, { Router, Request, Response } from "express";
import AcademicYearService from "../services/academic-year.service";
import { authMiddleware, sendResponse } from "../middleware/error.middleware";
import { requirePermission } from "../middleware/permission.middleware";

const router: Router = express.Router();

router.get("/", authMiddleware, requirePermission("courses:read"), async (req: Request, res: Response) => {
    const branch_id = (req as any).user.branch_id || (req as any).user.branch?.id;
    const result = await AcademicYearService.getAll(branch_id);
    sendResponse(res, result.success ? 200 : 400, result.success, result.message, result.data);
});

// POST create academic year
router.post("/", authMiddleware, requirePermission("courses:create"), async (req: Request, res: Response) => {
    const user = (req as any).user;
    const branch_id = user.branch_id || user.branch?.id;
    const result = await AcademicYearService.create({ ...req.body, branch_id });
    sendResponse(res, result.success ? 201 : 400, result.success, result.message, result.data);
});

// PUT update academic year
router.put("/:id", authMiddleware, requirePermission("courses:update"), async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await AcademicYearService.update(id, req.body);
    sendResponse(res, result.success ? 200 : 400, result.success, result.message, result.data);
});

// DELETE delete academic year
router.delete("/:id", authMiddleware, requirePermission("courses:update"), async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await AcademicYearService.delete(id);
    sendResponse(res, result.success ? 200 : 400, result.success, result.message);
});

export default router;
