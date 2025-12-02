import { Router, Request, Response } from "express";
import { CacheService } from "../services/cache.service";
import { authMiddleware, sendResponse } from "../middleware/error.middleware";

const router: Router = Router();

/**
 * GET /api/v1/cache/stats
 * Get cache statistics
 */
router.get(
  "/stats",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const result = CacheService.getStats();
    sendResponse(res, 200, true, "Cache stats retrieved", result);
  }
);

/**
 * GET /api/v1/cache/detailed-stats
 * Get detailed cache statistics
 */
router.get(
  "/detailed-stats",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const result = CacheService.getDetailedStats();
    sendResponse(res, 200, true, "Detailed cache stats retrieved", result);
  }
);

/**
 * POST /api/v1/cache/clear
 * Clear all cache
 */
router.post(
  "/clear",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    CacheService.clear();
    sendResponse(res, 200, true, "Cache cleared successfully");
  }
);

/**
 * POST /api/v1/cache/flush
 * Flush expired cache entries
 */
router.post(
  "/flush",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    CacheService.flush();
    sendResponse(res, 200, true, "Cache flushed successfully");
  }
);

/**
 * POST /api/v1/cache/reset-stats
 * Reset cache statistics
 */
router.post(
  "/reset-stats",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const result = CacheService.resetStats();
    sendResponse(res, 200, true, "Cache stats reset", result);
  }
);

/**
 * DELETE /api/v1/cache/invalidate/all
 * Invalidate all cache
 */
router.delete(
  "/invalidate/all",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    CacheService.invalidateAllCache();
    sendResponse(res, 200, true, "All cache invalidated");
  }
);

export default router;
