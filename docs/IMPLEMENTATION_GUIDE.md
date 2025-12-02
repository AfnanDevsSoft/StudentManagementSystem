# IMPLEMENTATION GUIDE - BACKEND ARCHITECTURE

**Version:** 1.0  
**Date:** November 30, 2025  
**Technology Stack:** Node.js + Express.js + TypeScript + Prisma + PostgreSQL

---

## TABLE OF CONTENTS

1. [Project Setup](#project-setup)
2. [Architecture Overview](#architecture-overview)
3. [Folder Structure](#folder-structure)
4. [Core Modules](#core-modules)
5. [Middleware Stack](#middleware-stack)
6. [Database Integration](#database-integration)
7. [Error Handling](#error-handling)
8. [Authentication & Security](#authentication--security)
9. [API Response Format](#api-response-format)
10. [Testing Strategy](#testing-strategy)

---

## PROJECT SETUP

### Initial Setup Steps

```bash
# Create project directory
mkdir koolhub-backend
cd koolhub-backend

# Initialize Node.js project
npm init -y

# Install dependencies
npm install express cors helmet dotenv joi bcryptjs jsonwebtoken multer axios
npm install -D typescript ts-node @types/node @types/express nodemon jest ts-jest @types/jest

# Install database dependencies
npm install @prisma/client
npm install -D prisma

# Initialize TypeScript
npx tsc --init

# Initialize Prisma
npx prisma init
```

### Environment Configuration (.env)

```env
# Server Configuration
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/koolhub_db"
DATABASE_POOL_SIZE=20

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRY=3600
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRY=604800

# Email Configuration
EMAIL_SERVICE=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# File Upload
MAX_FILE_SIZE=10485760 # 10MB in bytes
UPLOAD_DIR=./uploads

# AWS S3 (for production file storage)
AWS_S3_BUCKET=koolhub-files
AWS_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret

# Logging
LOG_FILE_PATH=./logs/app.log

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Redis (for caching/sessions)
REDIS_URL=redis://localhost:6379
```

---

## ARCHITECTURE OVERVIEW

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                              │
│              (Next.js Frontend Application)                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                    HTTP/REST
                         │
┌─────────────────────────▼────────────────────────────────────┐
│                   API GATEWAY LAYER                           │
│  (Express.js Server + CORS + Rate Limiting + Auth Tokens)   │
└────────────────────────┬────────────────────────────────────┘
                         │
┌─────────────────────────▼────────────────────────────────────┐
│              MIDDLEWARE STACK                                 │
│  • Authentication (JWT Verification)                         │
│  • Authorization (RBAC + Branch Isolation)                   │
│  • Validation (Request Body + Parameters)                    │
│  • Error Handling (Centralized Exception)                    │
│  • Logging (Request/Response Tracking)                       │
└────────────────────────┬────────────────────────────────────┘
                         │
┌─────────────────────────▼────────────────────────────────────┐
│            APPLICATION LAYER                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Controllers │  │  Services    │  │  Validators  │       │
│  │  (Route      │  │  (Business   │  │  (Input      │       │
│  │   Handlers)  │  │   Logic)     │  │   Validation)│       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└────────────────────────┬────────────────────────────────────┘
                         │
┌─────────────────────────▼────────────────────────────────────┐
│            DATA ACCESS LAYER                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │        Prisma ORM + Repository Pattern               │   │
│  │  • Repositories (Data Access Abstraction)            │   │
│  │  • Query Builders (Complex Queries)                  │   │
│  │  • Data Mapping (DTO/Entity Conversion)              │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
┌─────────────────────────▼────────────────────────────────────┐
│            DATABASE LAYER                                     │
│  PostgreSQL Database with Prisma Schema                       │
└─────────────────────────────────────────────────────────────┘

SUPPORTING SERVICES:
│
├─→ Redis Cache (Sessions, Rate Limiting)
├─→ Email Service (Notifications, Welcome Emails)
├─→ File Storage (AWS S3 or Local)
└─→ Logging Service (Winston/Pino)
```

---

## FOLDER STRUCTURE

```
koolhub-backend/
├── src/
│   ├── config/
│   │   ├── database.ts          # Prisma database configuration
│   │   ├── environment.ts       # Environment variable validation
│   │   ├── authentication.ts    # JWT configuration
│   │   └── logger.ts            # Logging configuration
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts   # JWT verification middleware
│   │   ├── rbac.middleware.ts   # Role-based access control
│   │   ├── validation.middleware.ts   # Request validation
│   │   ├── error.middleware.ts  # Error handling
│   │   ├── logging.middleware.ts    # Request/response logging
│   │   └── rateLimit.middleware.ts  # Rate limiting
│   │
│   ├── routes/
│   │   ├── v1/
│   │   │   ├── auth.routes.ts        # Authentication endpoints
│   │   │   ├── branches.routes.ts    # Branch management
│   │   │   ├── users.routes.ts       # User management
│   │   │   ├── students.routes.ts    # Student management
│   │   │   ├── teachers.routes.ts    # Teacher management
│   │   │   ├── courses.routes.ts     # Course management
│   │   │   ├── attendance.routes.ts  # Attendance tracking
│   │   │   ├── grades.routes.ts      # Grades & assessment
│   │   │   ├── admissions.routes.ts  # Admissions system
│   │   │   ├── payroll.routes.ts     # Payroll system
│   │   │   ├── analytics.routes.ts   # Analytics & reporting
│   │   │   └── index.ts              # Route aggregator
│   │   └── health.routes.ts     # Health check endpoints
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── branch.controller.ts
│   │   ├── user.controller.ts
│   │   ├── student.controller.ts
│   │   ├── teacher.controller.ts
│   │   ├── course.controller.ts
│   │   ├── attendance.controller.ts
│   │   ├── grade.controller.ts
│   │   ├── admission.controller.ts
│   │   ├── payroll.controller.ts
│   │   ├── analytics.controller.ts
│   │   └── health.controller.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts      # Authentication logic
│   │   ├── user.service.ts      # User management
│   │   ├── student.service.ts   # Student operations
│   │   ├── teacher.service.ts   # Teacher operations
│   │   ├── course.service.ts    # Course management
│   │   ├── enrollment.service.ts    # Student enrollment
│   │   ├── attendance.service.ts    # Attendance tracking
│   │   ├── grade.service.ts     # Grade management
│   │   ├── admission.service.ts # Admission processing
│   │   ├── payroll.service.ts   # Payroll calculation
│   │   ├── notification.service.ts  # Notifications
│   │   ├── email.service.ts     # Email sending
│   │   ├── file.service.ts      # File management
│   │   ├── cache.service.ts     # Redis caching
│   │   └── analytics.service.ts # Analytics queries
│   │
│   ├── repositories/
│   │   ├── base.repository.ts   # Generic repository pattern
│   │   ├── user.repository.ts
│   │   ├── student.repository.ts
│   │   ├── teacher.repository.ts
│   │   ├── course.repository.ts
│   │   ├── grade.repository.ts
│   │   └── ... (one per entity)
│   │
│   ├── validators/
│   │   ├── auth.validator.ts
│   │   ├── user.validator.ts
│   │   ├── student.validator.ts
│   │   ├── teacher.validator.ts
│   │   ├── course.validator.ts
│   │   └── ... (validation schemas using Joi)
│   │
│   ├── dtos/
│   │   ├── auth.dto.ts
│   │   ├── user.dto.ts
│   │   ├── student.dto.ts
│   │   ├── teacher.dto.ts
│   │   ├── course.dto.ts
│   │   └── ... (data transfer objects)
│   │
│   ├── entities/
│   │   ├── user.entity.ts
│   │   ├── student.entity.ts
│   │   ├── teacher.entity.ts
│   │   ├── course.entity.ts
│   │   └── ... (entity interfaces)
│   │
│   ├── exceptions/
│   │   ├── base.exception.ts
│   │   ├── auth.exception.ts
│   │   ├── validation.exception.ts
│   │   ├── not-found.exception.ts
│   │   └── unauthorized.exception.ts
│   │
│   ├── utils/
│   │   ├── response.util.ts     # API response formatting
│   │   ├── security.util.ts     # Security utilities
│   │   ├── date.util.ts         # Date/time utilities
│   │   ├── file.util.ts         # File utilities
│   │   └── math.util.ts         # Math utilities (GPA calc, etc)
│   │
│   ├── migrations/
│   │   └── (Prisma migrations)
│   │
│   ├── seeds/
│   │   ├── seed.ts              # Main seed file
│   │   ├── roles.seed.ts        # Default roles
│   │   ├── branches.seed.ts     # Sample branches
│   │   └── permissions.seed.ts  # Default permissions
│   │
│   └── app.ts                   # Express app initialization
│   └── server.ts                # Server startup
│
├── prisma/
│   ├── schema.prisma            # Prisma schema
│   └── migrations/              # Database migrations
│
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── utils/
│   ├── integration/
│   │   ├── auth.test.ts
│   │   ├── students.test.ts
│   │   └── ...
│   └── e2e/
│       ├── workflows/
│       └── ...
│
├── logs/
│   └── (Generated log files)
│
├── uploads/
│   └── (Local file uploads)
│
├── .env.example
├── .env.production
├── .gitignore
├── tsconfig.json
├── jest.config.js
├── package.json
├── docker-compose.yml           # Development database setup
├── Dockerfile                   # Production container
└── README.md
```

---

## CORE MODULES

### 1. Authentication Module

**File: `src/services/auth.service.ts`**

```typescript
export interface AuthCredentials {
  username: string;
  password: string;
  branch_id?: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export class AuthService {
  async login(
    credentials: AuthCredentials
  ): Promise<TokenPair & { user: UserDTO }> {
    // Validate credentials
    // Find user by username
    // Verify password with bcrypt
    // Load user permissions
    // Generate JWT tokens
    // Log login event
    // Return tokens and user data
  }

  async refreshToken(refresh_token: string): Promise<TokenPair> {
    // Verify refresh token
    // Extract user ID
    // Generate new access token
    // Return new tokens
  }

  async logout(user_id: string, token: string): Promise<void> {
    // Invalidate refresh token in Redis
    // Log logout event
  }

  async changePassword(
    user_id: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    // Verify old password
    // Hash new password
    // Update user record
    // Log password change event
  }

  async initiatePasswordReset(email: string): Promise<void> {
    // Find user by email
    // Generate reset token
    // Store token in Redis with TTL (30 minutes)
    // Send reset email with token
  }

  async verifyOTP(email: string, otp: string): Promise<void> {
    // Validate OTP
    // Mark email as verified
  }

  private generateTokens(user_id: string, permissions: string[]): TokenPair {
    // Create JWT with claims
    // Create refresh token
  }

  private generateAccessToken(user_id: string, permissions: string[]): string {
    // JWT with 1 hour expiry
  }

  private generateRefreshToken(user_id: string): string {
    // JWT with 7 days expiry
  }
}
```

### 2. Student Service

**File: `src/services/student.service.ts`**

```typescript
export interface CreateStudentDTO {
  branch_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: Date;
  // ... other fields
}

export class StudentService {
  constructor(private studentRepo: StudentRepository) {}

  async createStudent(data: CreateStudentDTO): Promise<StudentDTO> {
    // Validate input
    // Generate student code (e.g., STU-2024-001)
    // Create student record
    // Trigger welcome email to parents
    // Log creation event
    // Return student DTO
  }

  async getStudent(student_id: string, branch_id: string): Promise<StudentDTO> {
    // Verify branch_id ownership (multi-tenancy)
    // Fetch student record
    // Load relationships (parents, enrollments, etc)
    // Return full student profile
  }

  async listStudents(
    branch_id: string,
    filters: StudentFilters
  ): Promise<PaginatedResult<StudentDTO>> {
    // Apply branch filter
    // Apply search filters
    // Execute paginated query
    // Return results with pagination metadata
  }

  async updateStudent(
    student_id: string,
    branch_id: string,
    data: Partial<StudentDTO>
  ): Promise<StudentDTO> {
    // Verify branch_id ownership
    // Update student fields
    // Log changes for audit trail
    // Return updated student
  }

  async enrollStudent(
    student_id: string,
    course_id: string
  ): Promise<EnrollmentDTO> {
    // Verify student exists
    // Verify course exists and has capacity
    // Create enrollment record
    // Update student's current grade level if needed
    // Trigger notification to course teacher
    // Return enrollment
  }

  async getStudentTranscript(student_id: string): Promise<TranscriptDTO> {
    // Fetch all enrollments
    // Calculate GPA for each academic year
    // Fetch all grades
    // Generate transcript view
  }

  async generatePromotionList(
    branch_id: string,
    from_grade: string,
    to_grade: string,
    academic_year: string
  ): Promise<StudentDTO[]> {
    // Get students in from_grade
    // Apply promotion criteria (attendance, grades, etc)
    // Filter students who should be promoted
    // Return list for approval
  }
}
```

### 3. Teacher Service

**File: `src/services/teacher.service.ts`**

```typescript
export class TeacherService {
  constructor(private teacherRepo: TeacherRepository) {}

  async createTeacher(data: CreateTeacherDTO): Promise<TeacherDTO> {
    // Validate input
    // Generate employee code
    // Create teacher record
    // Create user account if requested
    // Send onboarding email
    // Log event
    // Return teacher DTO
  }

  async assignCourse(teacher_id: string, course_id: string): Promise<void> {
    // Verify teacher exists
    // Verify course exists
    // Update course.teacher_id
    // Notify teacher of assignment
  }

  async getTeacherSchedule(
    teacher_id: string,
    academic_year: string
  ): Promise<ScheduleDTO> {
    // Get all courses assigned to teacher
    // Compile schedule from course schedules
    // Return formatted schedule
  }

  async recordAttendance(
    teacher_id: string,
    date: Date,
    status: string
  ): Promise<void> {
    // Create attendance record
    // Check for duplicate entries
    // Update attendance summary
  }

  async getAttendanceReport(
    teacher_id: string,
    month: number,
    year: number
  ): Promise<AttendanceReportDTO> {
    // Fetch all attendance records for month/year
    // Calculate statistics
    // Generate report
  }

  async getPerformanceMetrics(
    teacher_id: string
  ): Promise<PerformanceMetricsDTO> {
    // Calculate average student grades in courses
    // Count students passed vs failed
    // Calculate student satisfaction scores
    // Generate performance summary
  }
}
```

### 4. Grade Service

**File: `src/services/grade.service.ts`**

```typescript
export class GradeService {
  constructor(private gradeRepo: GradeRepository) {}

  async recordGrade(data: CreateGradeDTO): Promise<GradeDTO> {
    // Validate score within range
    // Create grade record
    // Trigger auto-calculation of final grade if all assessments complete
    // Update student's overall GPA
    // Log grade entry
    // Return grade
  }

  async bulkUploadGrades(
    course_id: string,
    file: Express.Multer.File
  ): Promise<BulkUploadResultDTO> {
    // Parse Excel/CSV file
    // Validate all rows
    // Create grade records for valid rows
    // Return upload results (success count, errors)
  }

  async calculateFinalGrade(
    student_id: string,
    course_id: string
  ): Promise<string> {
    // Fetch all grades for student+course
    // Apply weights to each assessment
    // Calculate weighted average
    // Convert to letter grade (A, B, C, etc)
    // Return letter grade
  }

  async getClassAnalytics(
    course_id: string,
    academic_year: string
  ): Promise<ClassAnalyticsDTO> {
    // Get all grades for course
    // Calculate: average, median, std dev, distribution
    // Identify high performers and at-risk students
    // Generate analytics DTO
  }

  async updateGrade(
    grade_id: string,
    score: number,
    remarks: string
  ): Promise<GradeDTO> {
    // Verify grade exists
    // Check if grade is locked (after deadline)
    // Update grade record
    // Log change for audit trail
    // Recalculate final grades if needed
    // Return updated grade
  }
}
```

### 5. Payroll Service

**File: `src/services/payroll.service.ts`**

```typescript
export class PayrollService {
  constructor(private payrollRepo: PayrollRepository) {}

  async generatePayroll(
    branch_id: string,
    month: number,
    year: number
  ): Promise<PayrollSummaryDTO> {
    // Get all active teachers in branch
    // Get salary structures
    // For each teacher:
    //   - Calculate base salary
    //   - Add allowances
    //   - Apply deductions
    //   - Handle absences/leaves
    //   - Handle overtime
    // Create payroll records
    // Generate payslips
    // Return summary
  }

  async calculateSalary(
    teacher_id: string,
    month: number,
    year: number
  ): Promise<SalaryCalculationDTO> {
    // Get teacher's salary structure
    // Get attendance records
    // Get leave records
    // Get overtime records
    // Calculate:
    //   - Base salary
    //   - Allowances
    //   - Gross salary
    //   - Deductions (tax, etc)
    //   - Net salary
    // Return calculation details
  }

  async generatePayslip(payroll_id: string): Promise<PayslipDTO> {
    // Fetch payroll record
    // Fetch teacher details
    // Generate payslip HTML/PDF
    // Return payslip
  }

  async approveSalary(payroll_id: string, approved_by: string): Promise<void> {
    // Update payroll status to approved
    // Log approval event
    // Trigger payment processing
  }

  async requestLeave(data: LeaveRequestDTO): Promise<LeaveRequestDTO> {
    // Validate leave balance
    // Create leave request
    // Notify manager
    // Return leave request
  }

  async approveLeave(
    leave_request_id: string,
    approved_by: string
  ): Promise<void> {
    // Update leave status
    // Deduct from leave balance
    // Log approval event
  }
}
```

---

## MIDDLEWARE STACK

### Authentication Middleware

**File: `src/middleware/auth.middleware.ts`**

```typescript
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
    branch_id: string;
    permissions: string[];
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedException(
        "Missing or invalid authorization header"
      );
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    // Load user permissions from database or cache
    const user = await userService.getUserWithPermissions(decoded.user_id);

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: "Unauthorized",
      message: error.message,
    });
  }
};
```

### RBAC Middleware

**File: `src/middleware/rbac.middleware.ts`**

```typescript
export const rbacMiddleware = (requiredPermissions: string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const hasPermission = requiredPermissions.every((permission) =>
      req.user!.permissions.includes(permission)
    );

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "Insufficient permissions",
      });
      return;
    }

    next();
  };
};
```

### Branch Isolation Middleware

**File: `src/middleware/branch.middleware.ts`**

```typescript
export const branchIsolationMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  // Extract branch_id from URL params or query
  const branch_id = req.params.branch_id || req.query.branch_id;

  if (!branch_id) {
    res.status(400).json({ success: false, error: "branch_id is required" });
    return;
  }

  // Verify user has access to this branch
  if (!req.user!.branches.includes(branch_id)) {
    res.status(403).json({
      success: false,
      error: "Forbidden",
      message: "No access to this branch",
    });
    return;
  }

  // Attach to request for use in controllers
  req.branch_id = branch_id;
  next();
};
```

---

## DATABASE INTEGRATION

### Repository Pattern

**File: `src/repositories/base.repository.ts`**

```typescript
export abstract class BaseRepository<T> {
  constructor(protected prismaModel: any) {}

  async findById(id: string): Promise<T | null> {
    return this.prismaModel.findUnique({ where: { id } });
  }

  async findMany(
    where: any,
    skip: number = 0,
    take: number = 20
  ): Promise<T[]> {
    return this.prismaModel.findMany({ where, skip, take });
  }

  async create(data: any): Promise<T> {
    return this.prismaModel.create({ data });
  }

  async update(id: string, data: any): Promise<T> {
    return this.prismaModel.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<T> {
    return this.prismaModel.delete({ where: { id } });
  }

  async count(where: any): Promise<number> {
    return this.prismaModel.count({ where });
  }
}
```

### Student Repository

**File: `src/repositories/student.repository.ts`**

```typescript
export class StudentRepository extends BaseRepository<Student> {
  constructor(private prisma: PrismaClient) {
    super(prisma.student);
  }

  async findByStudentCode(studentCode: string): Promise<Student | null> {
    return this.prisma.student.findUnique({
      where: { student_code: studentCode },
    });
  }

  async findByBranch(
    branch_id: string,
    skip: number,
    take: number
  ): Promise<Student[]> {
    return this.prisma.student.findMany({
      where: { branch_id },
      skip,
      take,
      include: {
        user: true,
        parents: true,
        enrollments: {
          include: { course: true },
        },
      },
    });
  }

  async findWithFullDetails(student_id: string): Promise<Student> {
    return this.prisma.student.findUnique({
      where: { id: student_id },
      include: {
        user: true,
        parents: true,
        enrollments: {
          include: {
            course: {
              include: { teacher: true, subject: true },
            },
          },
        },
        attendance: true,
        grades: true,
      },
    });
  }
}
```

---

## ERROR HANDLING

### Custom Exception Classes

**File: `src/exceptions/base.exception.ts`**

```typescript
export class AppException extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationException extends AppException {
  constructor(message: string, details?: any) {
    super(400, message, "VALIDATION_ERROR", details);
  }
}

export class UnauthorizedException extends AppException {
  constructor(message: string) {
    super(401, message, "UNAUTHORIZED");
  }
}

export class ForbiddenException extends AppException {
  constructor(message: string) {
    super(403, message, "FORBIDDEN");
  }
}

export class NotFoundException extends AppException {
  constructor(resource: string, id: string) {
    super(404, `${resource} not found: ${id}`, "NOT_FOUND");
  }
}

export class ConflictException extends AppException {
  constructor(message: string) {
    super(409, message, "CONFLICT");
  }
}
```

### Global Error Handler

**File: `src/middleware/error.middleware.ts`**

```typescript
export const errorHandlerMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const appError =
    error instanceof AppException
      ? error
      : new AppException(500, "Internal server error", "INTERNAL_SERVER_ERROR");

  // Log error
  logger.error({
    message: appError.message,
    statusCode: appError.statusCode,
    code: appError.code,
    path: req.path,
    method: req.method,
    stack: appError.stack,
  });

  // Send response
  res.status(appError.statusCode).json({
    success: false,
    error: appError.code,
    message: appError.message,
    ...(process.env.NODE_ENV === "development" && {
      details: appError.details,
    }),
  });
};
```

---

## AUTHENTICATION & SECURITY

### JWT Strategy

```typescript
// Payload structure for access token
interface AccessTokenPayload {
  user_id: string;
  username: string;
  email: string;
  role: string;
  branch_id: string;
  permissions: string[];
  iat: number;
  exp: number;
}

// Payload structure for refresh token
interface RefreshTokenPayload {
  user_id: string;
  iat: number;
  exp: number;
}
```

### Password Security

```typescript
export class SecurityUtil {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  static async verifyPassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateRandomString(length: number = 32): string {
    return crypto.randomBytes(length).toString("hex");
  }

  static validatePasswordStrength(password: string): boolean {
    // Minimum 8 characters, 1 uppercase, 1 number, 1 special char
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  }
}
```

---

## API RESPONSE FORMAT

### Standard Response Structure

```typescript
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
  pagination?: PaginationMeta;
  timestamp: string;
}

export interface PaginationMeta {
  total: number;
  skip: number;
  limit: number;
  has_more: boolean;
}
```

### Response Utility

**File: `src/utils/response.util.ts`**

```typescript
export class ResponseUtil {
  static success<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  static paginated<T>(
    data: T[],
    total: number,
    skip: number,
    limit: number
  ): ApiResponse<T[]> {
    return {
      success: true,
      data,
      pagination: {
        total,
        skip,
        limit,
        has_more: skip + limit < total,
      },
      timestamp: new Date().toISOString(),
    };
  }

  static error(error: string, code?: string, details?: any): ApiResponse<null> {
    return {
      success: false,
      error,
      code,
      ...(details && { details }),
      timestamp: new Date().toISOString(),
    };
  }
}
```

---

## TESTING STRATEGY

### Unit Tests Example

**File: `tests/unit/services/student.service.test.ts`**

```typescript
describe("StudentService", () => {
  let service: StudentService;
  let repository: jest.Mocked<StudentRepository>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByStudentCode: jest.fn(),
      // ... other mock methods
    } as any;

    service = new StudentService(repository);
  });

  describe("createStudent", () => {
    it("should create a student with valid data", async () => {
      const input = {
        branch_id: "branch-123",
        first_name: "John",
        last_name: "Doe",
        date_of_birth: new Date("2010-01-01"),
        // ... other fields
      };

      repository.create.mockResolvedValue({
        id: "student-123",
        student_code: "STU-2024-001",
        ...input,
        created_at: new Date(),
      });

      const result = await service.createStudent(input);

      expect(result).toHaveProperty("student_code");
      expect(result.student_code).toMatch(/^STU-\d{4}-\d{3}$/);
    });

    it("should throw error for missing required fields", async () => {
      const input = {
        branch_id: "branch-123",
        first_name: "John",
        // missing required fields
      };

      await expect(service.createStudent(input as any)).rejects.toThrow();
    });
  });
});
```

### Integration Tests Example

**File: `tests/integration/auth.test.ts`**

```typescript
describe("Authentication API", () => {
  let app: Express.Application;
  let prisma: PrismaClient;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("POST /api/v1/auth/login", () => {
    it("should login user with valid credentials", async () => {
      const response = await request(app).post("/api/v1/auth/login").send({
        username: "testuser",
        password: "TestPassword123!",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("access_token");
      expect(response.body.data).toHaveProperty("refresh_token");
    });

    it("should reject invalid credentials", async () => {
      const response = await request(app).post("/api/v1/auth/login").send({
        username: "testuser",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
```

---

**END OF IMPLEMENTATION GUIDE**
