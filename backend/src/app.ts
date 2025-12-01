import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import authRoutes from "./routes/auth.routes";
import branchRoutes from "./routes/branches.routes";
import usersRoutes from "./routes/users.routes";
import studentsRoutes from "./routes/students.routes";
import teachersRoutes from "./routes/teachers.routes";
import coursesRoutes from "./routes/courses.routes";
import healthRoutes from "./routes/health.routes";
import leaveRoutes from "./routes/leave.routes";
import payrollRoutes from "./routes/payroll.routes";
import admissionRoutes from "./routes/admission.routes";
import feeRoutes from "./routes/fee.routes";
import notificationRoutes from "./routes/notification.routes";
import reportingRoutes from "./routes/reporting.routes";
import analyticsRoutes from "./routes/analytics.routes";
import courseContentRoutes from "./routes/courseContent.routes";
import messagingRoutes from "./routes/messaging.routes";
import announcementRoutes from "./routes/announcements.routes";
import { errorHandler } from "./middleware/error.middleware";

const app: Express = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGINS?.split(",") || [
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Swagger Documentation
app.use(
  process.env.API_DOCS_PATH || "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      url: "/api/swagger.json",
    },
    customCss: `.swagger-ui .topbar { display: none }`,
    customSiteTitle: "KoolHub Student Management System - API Documentation",
  })
);

// Swagger JSON endpoint
app.get("/api/swagger.json", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Health Check
app.use("/health", healthRoutes);

// API Routes v1
const apiV1 = express.Router();

// Authentication Routes
apiV1.use("/auth", authRoutes);

// Branch Routes
apiV1.use("/branches", branchRoutes);

// User Routes
apiV1.use("/users", usersRoutes);

// Student Routes
apiV1.use("/students", studentsRoutes);

// Teacher Routes
apiV1.use("/teachers", teachersRoutes);

// Course Routes
apiV1.use("/courses", coursesRoutes);

// Phase 1 Routes - Leave Management
apiV1.use("/leaves", leaveRoutes);

// Phase 1 Routes - Payroll Management
apiV1.use("/payroll", payrollRoutes);

// Phase 1 Routes - Admission Management
apiV1.use("/admission", admissionRoutes);

// Phase 1 Routes - Fee Management
apiV1.use("/fees", feeRoutes);

// Phase 1 Routes - Notification Management
apiV1.use("/notifications", notificationRoutes);

// Phase 2 Routes - Reporting
apiV1.use("/reports", reportingRoutes);

// Phase 2 Routes - Analytics
apiV1.use("/analytics", analyticsRoutes);

// Phase 2 Routes - Course Content Management
apiV1.use("/course-content", courseContentRoutes);

// Phase 2 Routes - Direct Messaging
apiV1.use("/messages", messagingRoutes);

// Phase 2 Routes - Course Announcements
apiV1.use("/announcements", announcementRoutes);

// Mount v1 routes
app.use("/api/v1", apiV1);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    code: "ROUTE_NOT_FOUND",
  });
});

// Error Handler (must be last)
app.use(errorHandler);

export default app;
