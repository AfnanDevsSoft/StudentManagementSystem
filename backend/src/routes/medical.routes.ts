import express, { Router, Request, Response } from "express";
import HealthService from "../services/health.service";
import { authMiddleware, sendResponse } from "../middleware/error.middleware";
import { requirePermission } from "../middleware/permission.middleware";

const router: Router = express.Router();

// ==================== HEALTH RECORDS ====================

// GET health record for a student
router.get(
    "/student/:studentId",
    authMiddleware,
    requirePermission("health:read"),
    async (req: Request, res: Response): Promise<void> => {
        const { studentId } = req.params;
        const result = await HealthService.getHealthRecord(studentId, (req as any).user);
        sendResponse(
            res,
            result.success ? 200 : 404,
            result.success,
            result.message,
            result.data
        );
    }
);

// POST/PUT create or update health record
router.post(
    "/student/:studentId",
    authMiddleware,
    requirePermission("health:create"),
    async (req: Request, res: Response): Promise<void> => {
        const { studentId } = req.params;
        const result = await HealthService.upsertHealthRecord(studentId, req.body, (req as any).user);
        sendResponse(
            res,
            result.success ? 200 : 400,
            result.success,
            result.message,
            result.data
        );
    }
);

// ==================== MEDICAL CHECKUPS ====================

// GET medical checkups for a student
router.get(
    "/checkups/:studentId",
    authMiddleware,
    requirePermission("health:read"),
    async (req: Request, res: Response): Promise<void> => {
        const { studentId } = req.params;
        const result = await HealthService.getMedicalCheckups(studentId, (req as any).user);
        sendResponse(
            res,
            result.success ? 200 : 404,
            result.success,
            result.message,
            result.data
        );
    }
);

// POST add a medical checkup
router.post(
    "/checkups/:studentId",
    authMiddleware,
    requirePermission("health:create"),
    async (req: Request, res: Response): Promise<void> => {
        const { studentId } = req.params;
        const result = await HealthService.addMedicalCheckup(studentId, req.body, (req as any).user);
        sendResponse(
            res,
            result.success ? 201 : 400,
            result.success,
            result.message,
            result.data
        );
    }
);

// PATCH update a medical checkup
router.patch(
    "/checkups/:id",
    authMiddleware,
    requirePermission("health:update"),
    async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const result = await HealthService.updateMedicalCheckup(id, req.body);
        sendResponse(
            res,
            result.success ? 200 : 400,
            result.success,
            result.message,
            result.data
        );
    }
);

// DELETE a medical checkup
router.delete(
    "/checkups/:id",
    authMiddleware,
    requirePermission("health:update"),
    async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const result = await HealthService.deleteMedicalCheckup(id);
        sendResponse(
            res,
            result.success ? 200 : 400,
            result.success,
            result.message
        );
    }
);

// ==================== VACCINATIONS ====================

// GET vaccinations for a student
router.get(
    "/vaccinations/:studentId",
    authMiddleware,
    requirePermission("health:read"),
    async (req: Request, res: Response): Promise<void> => {
        const { studentId } = req.params;
        const result = await HealthService.getVaccinations(studentId);
        sendResponse(
            res,
            result.success ? 200 : 404,
            result.success,
            result.message,
            result.data
        );
    }
);

// POST add a vaccination record
router.post(
    "/vaccinations/:studentId",
    authMiddleware,
    requirePermission("health:create"),
    async (req: Request, res: Response): Promise<void> => {
        const { studentId } = req.params;
        const result = await HealthService.addVaccination(studentId, req.body);
        sendResponse(
            res,
            result.success ? 201 : 400,
            result.success,
            result.message,
            result.data
        );
    }
);

// PATCH update a vaccination record
router.patch(
    "/vaccinations/:id",
    authMiddleware,
    requirePermission("health:update"),
    async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const result = await HealthService.updateVaccination(id, req.body);
        sendResponse(
            res,
            result.success ? 200 : 400,
            result.success,
            result.message,
            result.data
        );
    }
);

// DELETE a vaccination record
router.delete(
    "/vaccinations/:id",
    authMiddleware,
    requirePermission("health:update"),
    async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const result = await HealthService.deleteVaccination(id);
        sendResponse(
            res,
            result.success ? 200 : 400,
            result.success,
            result.message
        );
    }
);

// ==================== MEDICAL INCIDENTS ====================

// GET medical incidents for a student
router.get(
    "/incidents/:studentId",
    authMiddleware,
    requirePermission("health:read"),
    async (req: Request, res: Response): Promise<void> => {
        const { studentId } = req.params;
        const result = await HealthService.getMedicalIncidents(studentId);
        sendResponse(
            res,
            result.success ? 200 : 404,
            result.success,
            result.message,
            result.data
        );
    }
);

// POST report a medical incident
router.post(
    "/incidents",
    authMiddleware,
    requirePermission("health:create"),
    async (req: Request, res: Response): Promise<void> => {
        const result = await HealthService.reportIncident(req.body);
        sendResponse(
            res,
            result.success ? 201 : 400,
            result.success,
            result.message,
            result.data
        );
    }
);

// PATCH update a medical incident
router.patch(
    "/incidents/:id",
    authMiddleware,
    requirePermission("health:update"),
    async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const result = await HealthService.updateIncident(id, req.body);
        sendResponse(
            res,
            result.success ? 200 : 400,
            result.success,
            result.message,
            result.data
        );
    }
);

// DELETE a medical incident
router.delete(
    "/incidents/:id",
    authMiddleware,
    requirePermission("health:update"),
    async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const result = await HealthService.deleteIncident(id);
        sendResponse(
            res,
            result.success ? 200 : 400,
            result.success,
            result.message
        );
    }
);

// ==================== HEALTH SUMMARY ====================

// GET comprehensive health summary for a student
router.get(
    "/summary/:studentId",
    authMiddleware,
    requirePermission("health:read"),
    async (req: Request, res: Response): Promise<void> => {
        const { studentId } = req.params;
        const result = await HealthService.getHealthSummary(studentId, (req as any).user);
        sendResponse(
            res,
            result.success ? 200 : 404,
            result.success,
            result.message,
            result.data
        );
    }
);

export default router;
