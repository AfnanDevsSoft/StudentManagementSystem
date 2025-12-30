import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { prisma } from "../lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "your-refresh-secret";
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || "1h";
const JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || "7d";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    access_token: string;
    refresh_token: string;
    user: {
      id: string;
      username: string;
      email: string;
      firstName: string;
      lastName: string;
      role: {
        id: string;
        name: string;
      };
      branch?: {
        id: string;
        name: string;
      };
      permissions?: string[];
      studentId?: string | null;
      teacherId?: string | null;
    };
  };
}

export class AuthService {
  /**
   * Generate JWT token with user ID and branch ID for stateless access
   */
  private static generateToken(
    userId: string,
    branchId: string,
    expiresIn: string = JWT_EXPIRATION
  ): string {
    return jwt.sign({ userId, branchId }, JWT_SECRET, { expiresIn } as SignOptions);
  }

  /**
   * Generate refresh token
   */
  private static generateRefreshToken(
    userId: string,
    expiresIn: string = JWT_REFRESH_EXPIRATION
  ): string {
    return jwt.sign({ userId }, JWT_REFRESH_SECRET, {
      expiresIn,
    } as SignOptions);
  }

  /**
   * Login user with username and password
   */
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const { username, password } = credentials;

      // Validate input
      if (!username || !password) {
        return {
          success: false,
          message: "Username and password are required",
        };
      }

      // Find user by username
      const user = await prisma.user.findUnique({
        where: { username },
        include: {
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      console.log('🔍 User lookup result:', {
        username,
        userFound: !!user,
        userId: user?.id,
        isActive: user?.is_active,
      });

      if (!user) {
        return {
          success: false,
          message: "Invalid username or password",
        };
      }

      // Check if user is active
      if (!user.is_active) {
        return {
          success: false,
          message: "User account is inactive",
        };
      }

      // Verify password
      console.log('🔐 Password verification:', {
        username,
        providedPassword: password,
        hashFromDB: user.password_hash.substring(0, 20) + '...',
      });

      const isPasswordValid = await bcrypt.compare(
        password,
        user.password_hash
      );

      console.log('🔐 bcrypt.compare result:', isPasswordValid);

      if (!isPasswordValid) {
        return {
          success: false,
          message: "Invalid username or password",
        };
      }

      // Generate tokens
      const access_token = this.generateToken(user.id, user.branch_id);
      const refresh_token = this.generateRefreshToken(user.id);

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { last_login: new Date() },
      });

      // Get entity ID based on role (student_id or teacher_id)
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

      // Get RBAC permissions for the user (SuperAdmin gets all)
      let permissions: string[] = [];
      if (user.role.name === 'SuperAdmin') {
        permissions = ['*']; // Special marker for all permissions
      } else {
        // Fetch actual RBAC permissions
        const { RBACService } = require('./rbac.service');
        permissions = await RBACService.getUserPermissions(user.id);
      }

      // Get branch data
      const branch = await prisma.branch.findUnique({
        where: { id: user.branch_id },
        select: { id: true, name: true }
      });

      return {
        success: true,
        message: "Login successful",
        data: {
          access_token,
          refresh_token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: {
              id: user.role.id,
              name: user.role.name,
            },
            branch: branch || undefined,
            permissions,
            studentId: roleName === 'student' ? entityId : undefined,
            teacherId: roleName === 'teacher' ? entityId : undefined,
          },
        },
      };
    } catch (error: any) {
      console.error("Login error:", error);
      return {
        success: false,
        message: error.message || "An error occurred during login",
      };
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      if (!refreshToken) {
        return {
          success: false,
          message: "Refresh token is required",
        };
      }

      // Verify refresh token
      const decoded: any = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
      const userId = decoded.userId;

      // Check if user still exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!user || !user.is_active) {
        return {
          success: false,
          message: "User not found or inactive",
        };
      }

      // Generate new access token
      const access_token = this.generateToken(user.id, user.branch_id);
      const new_refresh_token = this.generateRefreshToken(user.id);

      return {
        success: true,
        message: "Token refreshed successfully",
        data: {
          access_token,
          refresh_token: new_refresh_token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: {
              id: user.role.id,
              name: user.role.name,
            },
          },
        },
      };
    } catch (error: any) {
      console.error("Token refresh error:", error);
      return {
        success: false,
        message:
          error.message === "jwt expired"
            ? "Refresh token expired"
            : "Invalid refresh token",
      };
    }
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }
}

export default AuthService;
