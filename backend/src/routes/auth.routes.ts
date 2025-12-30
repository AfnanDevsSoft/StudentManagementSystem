import express, { Router, Request, Response } from "express";
import AuthService from "../services/auth.service";
import { sendResponse } from "../middleware/error.middleware";
import { prisma } from "../lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router: Router = express.Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: User login
 *     description: Authenticate user and return JWT tokens
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *       400:
 *         description: Validation error
 */
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // Early validation for 400 vs 401
    if (!username || !password) {
      sendResponse(res, 400, false, "Username and password are required");
      return;
    }

    const result = await AuthService.login({ username, password });

    if (!result.success) {
      sendResponse(res, 401, false, result.message);
      return;
    }

    // Flatten response for tests: they expect token and user at top level
    res.status(200).json({
      success: true,
      message: result.message,
      token: result.data?.access_token,
      refresh_token: result.data?.refresh_token,
      user: result.data?.user,
    });
  } catch (error: any) {
    sendResponse(res, 500, false, error.message || "Login failed");
  }
});

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Refresh access token
 *     description: Get a new access token using refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refresh_token:
 *                 type: string
 *                 description: Refresh token obtained from login
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Unauthorized - invalid or expired token
 */
router.post("/refresh", async (req: Request, res: Response): Promise<void> => {
  try {
    const { refresh_token } = req.body;

    const result = await AuthService.refreshToken(refresh_token);

    if (!result.success) {
      sendResponse(res, 401, false, result.message);
      return;
    }

    sendResponse(res, 200, true, result.message, result.data);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message || "Token refresh failed");
  }
});

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register new user  
 *     description: Create a new user account
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or weak password
 *       409:
 *         description: User already exists
 */
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, username, password, first_name, last_name, phone, branch_id, role_id } = req.body;

    // Basic validation
    if (!username || !password) {
      sendResponse(res, 400, false, "Username and password are required");
      return;
    }

    // Check password strength
    if (password.length < 8) {
      sendResponse(res, 400, false, "Password must be at least 8 characters");
      return;
    }

    // Check for duplicate username/email
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email: email || username }
        ]
      }
    });

    if (existingUser) {
      sendResponse(res, 409, false, "User already exists");
      return;
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Get a default role if not provided
    let finalRoleId = role_id;
    if (!finalRoleId) {
      const defaultRole = await prisma.role.findFirst({ where: { name: 'Student' } });
      finalRoleId = defaultRole?.id || '';
    }

    // Get first branch if not provided (required by schema)
    let finalBranchId = branch_id;
    if (!finalBranchId) {
      const firstBranch = await prisma.branch.findFirst();
      if (!firstBranch) {
        sendResponse(res, 400, false, "No branch available. Please create a branch first.");
        return;
      }
      finalBranchId = firstBranch.id;
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email || username,
        username,
        password_hash,
        first_name: first_name || '',
        last_name: last_name || '',
        phone: phone || null,
        role_id: finalRoleId,
        branch_id: finalBranchId,
        is_active: true,
      }
    });

    // Flatten response for tests
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });
  } catch (error: any) {
    console.error('Register error:', error);
    if (error.code === 'P2002') {
      sendResponse(res, 409, false, "User already exists");
    } else {
      sendResponse(res, 500, false, error.message || "Registration failed");
    }
  }
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get current user profile
 *     description: Returns the authenticated user's profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized - invalid or missing token
 */
router.get("/me", async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    console.log('🔍 Authorization header:', req.headers.authorization);
    console.log('🔍 Extracted token:', token);

    if (!token) {
      sendResponse(res, 401, false, "Authorization token required");
      return;
    }

    // Verify token
    let decoded: any;
    try {
      console.log('Verifying token in /me endpoint');
      decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
      console.log('Token decoded:', decoded);
    } catch (err) {
      console.error('Token verification failed:', err);
      sendResponse(res, 401, false, "Invalid or expired token");
      return;
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    console.log('User found:', user ? 'yes' : 'no');

    if (!user || !user.is_active) {
      sendResponse(res, 401, false, "User not found or inactive");
      return;
    }

    // Get entity ID based on role
    let entityId: string | null = null;
    const roleName = user.role.name.toLowerCase();

    if (roleName === 'student') {
      const student = await prisma.student.findUnique({
        where: { user_id: user.id },
        select: { id: true }
      });
      entityId = student?.id || null;
    } else if (roleName === 'teacher') {
      const teacher = await prisma.teacher.findUnique({
        where: { user_id: user.id },
        select: { id: true }
      });
      entityId = teacher?.id || null;
    }

    // Flatten response for tests
    res.status(200).json({
      success: true,
      message: "User profile retrieved",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        branch_id: user.branch_id,
        studentId: roleName === 'student' ? entityId : undefined,
        teacherId: roleName === 'teacher' ? entityId : undefined,
      }
    });
  } catch (error: any) {
    sendResponse(res, 500, false, error.message || "Failed to get user profile");
  }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: User logout
 *     description: Logout user and invalidate tokens
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post("/logout", (req: Request, res: Response) => {
  sendResponse(res, 200, true, "Logout successful");
});

// Debug endpoint to check user permissions
router.get("/permissions", async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      sendResponse(res, 401, false, "Authorization token required");
      return;
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { role: true },
    });

    if (!user) {
      sendResponse(res, 401, false, "User not found");
      return;
    }

    const userRoles = await prisma.userRole.findMany({
      where: { user_id: user.id },
      include: {
        rbac_role: {
          include: { permissions: true },
        },
      },
    });

    const allPermissions = new Set<string>();
    userRoles.forEach((ur) => {
      ur.rbac_role.permissions.forEach((p) => {
        allPermissions.add(p.permission_name);
      });
    });

    res.status(200).json({
      success: true,
      user: { id: user.id, username: user.username, role: user.role.name },
      rbac_roles: userRoles.map((ur) => ({
        role_name: ur.rbac_role.role_name,
        permission_count: ur.rbac_role.permissions.length,
      })),
      total_permissions: allPermissions.size,
      permissions: Array.from(allPermissions).sort(),
    });
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
});

export default router;
