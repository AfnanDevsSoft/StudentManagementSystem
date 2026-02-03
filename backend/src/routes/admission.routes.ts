import { Router, Request, Response } from "express";
import multer from "multer";
import { AdmissionService } from "../services/admission.service";
import { sendResponse, authMiddleware } from "../middleware/error.middleware";
import { requirePermission } from "../middleware/permission.middleware";

const router = Router();

// Multer with memory storage (files stored in DB, not disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Allowed: PDF, JPG, PNG, DOC, DOCX"));
    }
  },
});

// Submit application (with document uploads)
router.post(
  "/apply",
  authMiddleware,
  requirePermission("admissions:create"),
  upload.array("documents", 10),
  async (req: Request, res: Response) => {
    const { branchId, applicantData, applicantEmail, applicantPhone } = req.body;
    if (!branchId || !applicantData || !applicantEmail || !applicantPhone) {
      return sendResponse(res, 400, false, "Missing required fields");
    }

    // Parse applicantData if sent as string (multipart form)
    const parsedApplicantData =
      typeof applicantData === "string" ? JSON.parse(applicantData) : applicantData;

    const files = (req as any).files as Express.Multer.File[] | undefined;

    const result = await AdmissionService.submitApplication(
      branchId,
      parsedApplicantData,
      applicantEmail,
      applicantPhone,
      files,
      (req as any).user?.id
    );
    sendResponse(
      res,
      result.success ? 201 : 400,
      result.success,
      result.message,
      result.data
    );
  }
);

// Get per-agent statistics
router.get(
  "/agent-stats",
  authMiddleware,
  requirePermission("admissions:read"),
  async (req: Request, res: Response) => {
    const result = await AdmissionService.getAgentStats((req as any).user);
    sendResponse(
      res,
      result.success ? 200 : 400,
      result.success,
      result.message,
      result.data
    );
  }
);

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

// Download document from database
router.get(
  "/documents/:docId/download",
  authMiddleware,
  requirePermission("admissions:read"),
  async (req: Request, res: Response) => {
    const result = await AdmissionService.getDocumentFile(req.params.docId);
    if (!result.success || !result.data) {
      return sendResponse(res, 404, false, result.message || "Document not found");
    }

    const doc = result.data;
    res.set({
      "Content-Type": doc.file_type,
      "Content-Disposition": `inline; filename="${doc.file_name}"`,
      "Content-Length": doc.file_size.toString(),
    });
    res.send(doc.file_data);
  }
);

// Get applications
router.get(
  "/",
  authMiddleware,
  requirePermission("admissions:read"),
  async (req: Request, res: Response) => {
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
      result.data,
      (result as any).pagination
    );
  }
);

// Update application
router.put(
  "/:id",
  authMiddleware,
  requirePermission("admissions:update"),
  async (req: Request, res: Response) => {
    const result = await AdmissionService.updateApplication(req.params.id, req.body);
    sendResponse(
      res,
      result.success ? 200 : 400,
      result.success,
      result.message,
      result.data
    );
  }
);

// Get application details
router.get(
  "/:id",
  authMiddleware,
  requirePermission("admissions:read"),
  async (req: Request, res: Response) => {
    const result = await AdmissionService.getApplicationDetails(req.params.id);
    sendResponse(
      res,
      result.success ? 200 : 404,
      result.success,
      result.message,
      result.data
    );
  }
);

// Suggest username
router.get(
  "/:id/suggest-username",
  authMiddleware,
  requirePermission("admissions:read"),
  async (req: Request, res: Response) => {
    const result = await AdmissionService.suggestUsername(req.params.id);
    sendResponse(
      res,
      result.success ? 200 : 400,
      result.success,
      result.message,
      result.data
    );
  }
);

// Approve application (requires offer letter upload)
router.post(
  "/:id/approve",
  authMiddleware,
  requirePermission("admissions:update"),
  upload.single("offerLetter"),
  async (req: Request, res: Response) => {
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) {
      return sendResponse(res, 400, false, "Offer letter file is required for approval");
    }
    const { reviewNotes } = req.body;
    const result = await AdmissionService.approveApplication(
      req.params.id,
      (req as any).user.id,
      reviewNotes,
      file
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
    const { reason } = req.body;
    if (!reason) {
      return sendResponse(res, 400, false, "Rejection reason is required");
    }
    const result = await AdmissionService.rejectApplication(
      req.params.id,
      (req as any).user.id,
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

// Set credentials and enroll student
router.post(
  "/:id/set-credentials",
  authMiddleware,
  requirePermission("admissions:update"),
  async (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return sendResponse(res, 400, false, "Username and password are required");
    }
    const result = await AdmissionService.setCredentialsAndEnroll(
      req.params.id,
      username,
      password,
      (req as any).user.id
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
