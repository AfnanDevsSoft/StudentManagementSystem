import express, { Router, Request, Response } from "express";
import BranchService from "../services/branch.service";
import { authMiddleware, sendResponse } from "../middleware/error.middleware";

const router: Router = express.Router();

// GET all branches with pagination and search
router.get(
  "/",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";

    const result = await BranchService.getAllBranches(page, limit, search);
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

// GET single branch by ID
router.get(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await BranchService.getBranchById(id);

    if (!result.success) {
      sendResponse(res, 404, false, result.message);
      return;
    }

    sendResponse(res, 200, result.success, result.message, result.data);
  }
);

// POST create branch
router.post(
  "/",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const result = await BranchService.createBranch(req.body);
    const statusCode = result.success ? 201 : 400;
    sendResponse(res, statusCode, result.success, result.message, result.data);
  }
);

// PUT update branch
router.put(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await BranchService.updateBranch(id, req.body);
    const statusCode = result.success ? 200 : 400;
    sendResponse(res, statusCode, result.success, result.message, result.data);
  }
);

// DELETE branch
router.delete(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await BranchService.deleteBranch(id);
    sendResponse(
      res,
      result.success ? 200 : 400,
      result.success,
      result.message
    );
  }
);

export default router;
