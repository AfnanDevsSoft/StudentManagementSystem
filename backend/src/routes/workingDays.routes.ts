import express from "express";
import { WorkingDaysService } from "../services/workingDays.service";

const router = express.Router();

/**
 * Get working days configuration
 * GET /api/working-days?branchId=&academicYearId=&gradeLevelId=
 */
router.get("/", async (req, res) => {
    try {
        const { branchId, academicYearId, gradeLevelId } = req.query;

        if (!branchId) {
            return res.status(400).json({
                success: false,
                message: "Branch ID is required",
            });
        }

        const result = await WorkingDaysService.getConfig(
            branchId as string,
            academicYearId as string,
            gradeLevelId as string
        );

        if (result.success) {
            return res.json(result);
        } else {
            return res.status(400).json(result);
        }
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch working days config",
        });
    }
});

/**
 * Get all working days configurations for a branch
 * GET /api/working-days/all?branchId=&page=&limit=
 */
router.get("/all", async (req, res) => {
    try {
        const { branchId, page, limit } = req.query;

        if (!branchId) {
            return res.status(400).json({
                success: false,
                message: "Branch ID is required",
            });
        }

        const result = await WorkingDaysService.getAllConfigs(
            branchId as string,
            page ? parseInt(page as string) : 1,
            limit ? parseInt(limit as string) : 20
        );

        if (result.success) {
            return res.json(result);
        } else {
            return res.status(400).json(result);
        }
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch working days configs",
        });
    }
});

/**
 * Create or update working days configuration
 * POST /api/working-days
 */
router.post("/", async (req, res) => {
    try {
        const result = await WorkingDaysService.upsertConfig(req.body);

        if (result.success) {
            return res.status(result.data ? 200 : 201).json(result);
        } else {
            return res.status(400).json(result);
        }
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to save working days config",
        });
    }
});

/**
 * Update working days configuration
 * PUT /api/working-days
 */
router.put("/", async (req, res) => {
    try {
        const result = await WorkingDaysService.upsertConfig(req.body);

        if (result.success) {
            return res.json(result);
        } else {
            return res.status(400).json(result);
        }
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to update working days config",
        });
    }
});

/**
 * Delete working days configuration
 * DELETE /api/working-days/:id
 */
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await WorkingDaysService.deleteConfig(id);

        if (result.success) {
            return res.json(result);
        } else {
            return res.status(400).json(result);
        }
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to delete working days config",
        });
    }
});

/**
 * Calculate working days between dates
 * POST /api/working-days/calculate
 */
router.post("/calculate", async (req, res) => {
    try {
        const { startDate, endDate, branchId } = req.body;

        if (!startDate || !endDate || !branchId) {
            return res.status(400).json({
                success: false,
                message: "Start date, end date, and branch ID are required",
            });
        }

        const workingDays = await WorkingDaysService.calculateWorkingDays(
            startDate,
            endDate,
            branchId
        );

        return res.json({
            success: true,
            data: { workingDays },
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to calculate working days",
        });
    }
});

export default router;
