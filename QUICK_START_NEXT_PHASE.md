# 🚀 NEXT PHASE - ROUTE INTEGRATION

## What's Complete ✅
- 7 Service files created (800+ lines of code)
- Middleware enhanced with auth + response utilities
- Prisma schema perfectly aligned with documentation
- All database models ready

## What Needs To Happen Next

### PHASE 1: Update Route Handlers (2-3 hours)

#### Step 1: Update users.routes.ts
```typescript
import { Router } from "express";
import UserService from "../services/user.service";
import { authMiddleware, sendResponse } from "../middleware/error.middleware";

const router = Router();

// Get all users
router.get("/", authMiddleware, async (req, res) => {
  const { page, limit, search } = req.query;
  const result = await UserService.getAllUsers(
    page ? parseInt(page as string) : 1,
    limit ? parseInt(limit as string) : 20,
    search as string
  );
  sendResponse(res, result.success ? 200 : 400, result.success, result.message, result.data, result.pagination);
});

// Get user by ID
router.get("/:id", authMiddleware, async (req, res) => {
  const result = await UserService.getUserById(req.params.id);
  sendResponse(res, result.success ? 200 : 404, result.success, result.message, result.data);
});

// Create user
router.post("/", authMiddleware, async (req, res) => {
  const result = await UserService.createUser(req.body);
  sendResponse(res, result.success ? 201 : 400, result.success, result.message, result.data);
});

// Update user
router.put("/:id", authMiddleware, async (req, res) => {
  const result = await UserService.updateUser(req.params.id, req.body);
  sendResponse(res, result.success ? 200 : 400, result.success, result.message, result.data);
});

// Delete user
router.delete("/:id", authMiddleware, async (req, res) => {
  const result = await UserService.deleteUser(req.params.id);
  sendResponse(res, result.success ? 200 : 400, result.success, result.message);
});

export default router;
```

#### Step 2-5: Repeat for Other Routes
- branches.routes.ts → Use BranchService
- students.routes.ts → Use StudentService
- teachers.routes.ts → Use TeacherService
- courses.routes.ts → Use CourseService

### PHASE 2: Add Enrollment Endpoints (1-2 hours)

#### Update courses.routes.ts to add:
```typescript
// Enroll student in course
router.post("/:courseId/enroll", authMiddleware, async (req, res) => {
  const { studentId } = req.body;
  const result = await EnrollmentService.enrollStudent(studentId, req.params.courseId);
  sendResponse(res, result.success ? 201 : 400, result.success, result.message, result.data);
});

// Drop course
router.delete("/:courseId/enroll/:studentId", authMiddleware, async (req, res) => {
  const result = await EnrollmentService.dropCourse(req.params.studentId, req.params.courseId);
  sendResponse(res, result.success ? 200 : 400, result.success, result.message);
});

// Record attendance
router.post("/attendance", authMiddleware, async (req, res) => {
  const result = await EnrollmentService.recordAttendance(
    req.body.studentId,
    req.body.courseId,
    req.body.status,
    req.body.date
  );
  sendResponse(res, result.success ? 201 : 400, result.success, result.message, result.data);
});

// Record grade
router.post("/grades", authMiddleware, async (req, res) => {
  const result = await EnrollmentService.recordGrade(
    req.body.studentId,
    req.body.courseId,
    req.body
  );
  sendResponse(res, result.success ? 201 : 400, result.success, result.message, result.data);
});
```

## File Locations
- **Services:** `/backend/src/services/`
- **Routes:** `/backend/src/routes/`
- **Middleware:** `/backend/src/middleware/`

## Testing After Updates

1. Start backend: `cd backend && npm run dev`
2. Go to: `http://localhost:3000/api-docs`
3. Test endpoints:
   - GET /api/v1/users
   - POST /api/v1/users (with auth)
   - GET /api/v1/students
   - POST /api/v1/courses/:id/enroll

## Service Method Cheat Sheet

```typescript
// UserService
UserService.getAllUsers(page, limit, search)
UserService.getUserById(userId)
UserService.createUser(userData)
UserService.updateUser(userId, userData)
UserService.deleteUser(userId)

// StudentService
StudentService.getAllStudents(page, limit, search, branchId)
StudentService.getStudentById(studentId)
StudentService.getStudentEnrollments(studentId)
StudentService.getStudentGrades(studentId)
StudentService.getStudentAttendance(studentId)

// EnrollmentService
EnrollmentService.enrollStudent(studentId, courseId)
EnrollmentService.dropCourse(studentId, courseId)
EnrollmentService.recordAttendance(studentId, courseId, status, date)
EnrollmentService.recordGrade(studentId, courseId, gradeData)
```

## Estimated Timeline
- Route Integration: 2-3 hours
- Testing: 1-2 hours
- Bug Fixes: 1 hour
- **Total: 4-6 hours to 100% alignment**

---
**Status:** Ready for Phase 1  
**Backend Alignment:** 75% → 100% pending route integration
