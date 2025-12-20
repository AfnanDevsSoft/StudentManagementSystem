import { Router, Request, Response } from "express";
import { AdmissionService } from "../services/admission.service";
import { sendResponse, authMiddleware } from "../middleware/error.middleware";
import { requirePermission } from "../middleware/permission.middleware";

const router = Router();

// Submit application
router.post("/apply", async (req: Request, res: Response) => {
  const { branchId, applicantData, applicantEmail, applicantPhone } = req.body;
  if (!branchId || !applicantData || !applicantEmail || !applicantPhone) {
    return sendResponse(res, 400, false, "Missing required fields");
  }
  const result = await AdmissionService.submitApplication(
    branchId,
    applicantData,
    applicantEmail,
    applicantPhone
  );
  sendResponse(
    res,
    result.success ? 201 : 400,
    result.success,
    result.message,
    result.data
  );
});

// Get statistics
router.get(
  "/statistics",
  authMiddleware,
  requirePermission("admissions:read"),
  async (req: Request, res: Response) => {
    const branchId = req.query.branchId as string;
    const result = await AdmissionService.getAdmissionStats(branchId, (req as any).user);
    sendResponse(
      res,
      result.success ? 200 : 400,
      result.success,
      result.message,
      result.data
    );
  }
);

// Get applications
router.get("/", authMiddleware, requirePermission("admissions:read"), async (req: Request, res: Response) => {
  const branchId = req.query.branchId as string;
  const status = req.query.status as string;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;
  const result = await AdmissionService.getApplications(
    branchId,
    status,
    limit,
    offset,
    (req as any).user
  );
  sendResponse(
    res,
    result.success ? 200 : 400,
    result.success,
    result.message,
    result.data
  );
});

// Update application
router.put("/:id", authMiddleware, requirePermission("admissions:update"), async (req: Request, res: Response) => {
  const result = await AdmissionService.updateApplication(req.params.id, req.body);
  sendResponse(
    res,
    result.success ? 200 : 400,
    result.success,
    result.message,
    result.data
  );
});

// Get application details
router.get("/:id", authMiddleware, requirePermission("admissions:read"), async (req: Request, res: Response) => {
  const result = await AdmissionService.getApplicationDetails(req.params.id);
  sendResponse(
    res,
    result.success ? 200 : 404,
    result.success,
    result.message,
    result.data
  );
});

// Approve application
router.post(
  "/:id/approve",
  authMiddleware,
  requirePermission("admissions:update"),
  async (req: Request, res: Response) => {
    const { reviewedBy, reviewNotes } = req.body;
    if (!reviewedBy) {
      return sendResponse(res, 400, false, "Missing reviewedBy field");
    }
    const result = await AdmissionService.approveApplication(
      req.params.id,
      reviewedBy,
      reviewNotes
    );
    sendResponse(
      res,
      result.success ? 200 : 400,
      result.success,
      result.message,
      result.data
    );
  }
);

// Reject application
router.post(
  "/:id/reject",
  authMiddleware,
  requirePermission("admissions:update"),
  async (req: Request, res: Response) => {
    const { reviewedBy, reason } = req.body;
    if (!reviewedBy || !reason) {
      return sendResponse(res, 400, false, "Missing required fields");
    }
    const result = await AdmissionService.rejectApplication(
      req.params.id,
      reviewedBy,
      reason
    );
    sendResponse(
      res,
      result.success ? 200 : 400,
      result.success,
      result.message,
      result.data
    );
  }
);

// Update payment status
router.post(
  "/:id/payment-status",
  authMiddleware,
  requirePermission("admissions:update"),
  async (req: Request, res: Response) => {
    const { paymentStatus } = req.body;
    if (!paymentStatus) {
      return sendResponse(res, 400, false, "Missing paymentStatus field");
    }
    const result = await AdmissionService.updatePaymentStatus(
      req.params.id,
      paymentStatus
    );
    sendResponse(
      res,
      result.success ? 200 : 400,
      result.success,
      result.message,
      result.data
    );
  }
);

export default router;
