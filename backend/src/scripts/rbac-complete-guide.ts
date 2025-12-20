/**
 * COMPREHENSIVE RBAC ROUTE PROTECTION GUIDE
 * 
 * This script contains inline code examples for applying permissions
 * to all remaining 22 route files. Simply copy-paste the import and add
 * requirePermission to each route.
 */

// ============================================================
// TEMPLATE FOR ALL ROUTES
// ============================================================
/*
1. Add import at top:
   import { requirePermission } from "../middleware/permission.middleware";

2. Apply to routes:
   router.get("/", authMiddleware, requirePermission("resource:read"), handler);
   router.post("/",authMiddleware, requirePermission("resource:create"), handler);
   router.put("/:id", authMiddleware, requirePermission("resource:update"), handler);
   router.delete("/:id", authMiddleware, requirePermission("resource:delete"), handler);
*/

// ============================================================
// LIBRARY.ROUTES.TS
// ============================================================
// Permission: library:read, library:create, library:update, library:delete
/*
Import: import { requirePermission } from "../middleware/permission.middleware";

Apply:
router.get("/books", authMiddleware, requirePermission("library:read"), ...)
router.post("/books", authMiddleware, requirePermission("library:create"), ...)
router.put("/books/:id", authMiddleware, requirePermission("library:update"), ...)
router.delete("/books/:id", authMiddleware, requirePermission("library:delete"), ...)
router.post("/issue", authMiddleware, requirePermission("library:create"), ...)
router.post("/return", authMiddleware, requirePermission("library:update"), ...)
*/

// ============================================================
// ANNOUNCEMENTS.ROUTES.TS
// ============================================================
// Permission: announcements:read, announcements:create
/*
Import: import { requirePermission } from "../middleware/permission.middleware";

Apply:
router.get("/", authMiddleware, requirePermission("announcements:read"), ...)
router.get("/:id", authMiddleware, requirePermission("announcements:read"), ...)
router.post("/", authMiddleware, requirePermission("announcements:create"), ...)
router.put("/:id", authMiddleware, requirePermission("announcements:create"), ...)
router.delete("/:id", authMiddleware, requirePermission("announcements:create"), ...)
*/

// ============================================================
// MESSAGING.ROUTES.TS
// ============================================================
// Permission: messaging:read, messaging:send
/*
Import: import { requirePermission } from "../middleware/permission.middleware";

Apply:
router.get("/", authMiddleware, requirePermission("messaging:read"), ...)
router.get("/:id", authMiddleware, requirePermission("messaging:read"), ...)
router.post("/", authMiddleware, requirePermission("messaging:send"), ...)
router.put("/:id/read", authMiddleware, requirePermission("messaging:read"), ...)
*/

// ============================================================
// ANALYTICS.ROUTES.TS
// ============================================================
// Permission: analytics:read
/*
Import: import { requirePermission } from "../middleware/permission.middleware";

Apply:
router.get("/dashboard", authMiddleware, requirePermission("analytics:read"), ...)
router.get("/students", authMiddleware, requirePermission("analytics:read"), ...)
router.get("/teachers", authMiddleware, requirePermission("analytics:read"), ...)
router.get("/attendance", authMiddleware, requirePermission("analytics:read"), ...)
*/

// ============================================================
// REPORTING.ROUTES.TS
// ============================================================
// Permission: reports:generate, reports:export
/*
Import: import { requirePermission } from "../middleware/permission.middleware";

Apply:
router.get("/", authMiddleware, requirePermission("reports:generate"), ...)
router.post("/generate", authMiddleware, requirePermission("reports:generate"), ...)
router.get("/export", authMiddleware, requirePermission("reports:export"), ...)
*/

// ============================================================
// MEDICAL.ROUTES.TS
// ============================================================
// Permission: health:read, health:create, health:update
/*
Import: import { requirePermission } from "../middleware/permission.middleware";

Apply:
router.get("/", authMiddleware, requirePermission("health:read"), ...)
router.get("/:id", authMiddleware, requirePermission("health:read"), ...)
router.get("/student/:studentId", authMiddleware, requirePermission("health:read"), ...)
router.post("/", authMiddleware, requirePermission("health:create"), ...)
router.put("/:id", authMiddleware, requirePermission("health:update"), ...)
*/

// ============================================================
// TIMETABLE.ROUTES.TS
// ============================================================
// Permission: courses:read, courses:create, courses:update
/*
Import: import { requirePermission } from "../middleware/permission.middleware";

Apply:
router.get("/", authMiddleware, requirePermission("courses:read"), ...)
router.get("/:id", authMiddleware, requirePermission("courses:read"), ...)
router.post("/", authMiddleware, requirePermission("courses:create"), ...)
router.put("/:id", authMiddleware, requirePermission("courses:update"), ...)
*/

// ============================================================
// LEAVE.ROUTES.TS
// ============================================================
// Permission: leave:read, leave:create, leave:update
/*
Import: import { requirePermission } from "../middleware/permission.middleware";

Apply:
router.get("/", authMiddleware, requirePermission("leave:read"), ...)
router.get("/:id", authMiddleware, requirePermission("leave:read"), ...)
router.post("/", authMiddleware, requirePermission("leave:create"), ...)
router.put("/:id", authMiddleware, requirePermission("leave:update"), ...)
*/

// ============================================================
// EVENTS.ROUTES.TS
// ============================================================
// Permission: events:read, events:create
/*
Import: import { requirePermission } from "../middleware/permission.middleware";

Apply:
router.get("/", authMiddleware, requirePermission("events:read"), ...)
router.post("/", authMiddleware, requirePermission("events:create"), ...)
*/

// ============================================================
// SIMPLE ROUTES (Use matching resource permissions)
// ============================================================
// academic-years.routes.ts → branches:read, branches:create
// grade-levels.routes.ts → courses:read, courses:create
// subjects.routes.ts → courses:read, courses:create
// courseContent.routes.ts → courses:read, courses:create, courses:update
// notification.routes.ts → messaging:read
// notifications.routes.ts → messaging:read
// fileExport.routes.ts → reports:export

// ============================================================
// SYSTEM/ADMIN ONLY ROUTES (Use system permissions)
// ============================================================
// backup.routes.ts → Use requirePermission("system:admin") for ALL routes
// cache.routes.ts → Use requirePermission("system:admin") for ALL routes  
// logging.routes.ts → Use requirePermission("system:admin") for ALL routes

// ============================================================
// PUBLIC ROUTES (NO CHANGES NEEDED)
// ============================================================
// health.routes.ts → Public health check endpoint
// auth.routes.ts → Public auth endpoints (login, register)

// ============================================================
// PROTECTED ROUTES (ALREADY DONE)
// ============================================================
// rbac.routes.ts → Already has authMiddleware protection

console.log("✅ RBAC Protection Guide Generated");
console.log("📋 Apply permissions using the patterns above to complete RBAC coverage");
