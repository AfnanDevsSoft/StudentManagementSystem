import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export class UserService {
  /**
   * Get all users with pagination
   */
  static async getAllUsers(
    page: number = 1,
    limit: number = 20,
    search?: string,
    userContext?: any
  ) {
    try {
      const skip = (page - 1) * limit;

      const where: any = {};

      // Data Scoping
      if (userContext && userContext.role?.name?.toLowerCase() !== 'superadmin') {
        where.branch_id = userContext.branch_id;
      }

      if (search) {
        where.OR = [
          { username: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { first_name: { contains: search, mode: "insensitive" } },
          { last_name: { contains: search, mode: "insensitive" } },
        ];
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          select: {
            id: true,
            username: true,
            email: true,
            first_name: true,
            last_name: true,
            phone: true,
            is_active: true,
            last_login: true,
            created_at: true,
            role: { select: { id: true, name: true } },
            branch: { select: { id: true, name: true } },
          },
        }),
        prisma.user.count({ where }),
      ]);

      return {
        success: true,
        data: users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Get all system roles (Legacy Role table)
   * This is needed because Users table links to legacy Role, while RBAC links to new RBACRole
   */
  static async getRoles() {
    try {
      const roles = await prisma.role.findMany({
        orderBy: { name: 'asc' }
      });
      return { success: true, data: roles };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          email: true,
          first_name: true,
          last_name: true,
          phone: true,
          is_active: true,
          last_login: true,
          created_at: true,
          role: { select: { id: true, name: true } },
          branch: { select: { id: true, name: true } },
        },
      });

      if (!user) {
        return { success: false, message: "User not found" };
      }

      return { success: true, data: user };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Create new user
   */
  /**
   * Create new user
   */
  static async createUser(userData: any, userContext?: any) {
    try {
      // 1. Security Check: Branch Admin Scoping
      if (userContext && userContext.role?.name?.toLowerCase() !== 'superadmin') {
        // Force the branch_id to be the admin's branch
        if (userData.branch_id && userData.branch_id !== userContext.branch_id) {
          return { success: false, message: "Unauthorized: Cannot create user in another branch" };
        }
        userData.branch_id = userContext.branch_id;
      }

      // 2. Auto-Generate ID if not provided
      let finalUsername = userData.username;

      if (!finalUsername) {
        if (!userData.branch_id || !userData.role_id) {
          return { success: false, message: "Branch ID and Role ID are required for ID generation" };
        }

        // Fetch Role Name for ID generation
        const role = await prisma.role.findUnique({
          where: { id: userData.role_id }
        });

        if (!role) {
          return { success: false, message: "Invalid Role ID" };
        }

        // Import dynamically to avoid circular dependencies if any (though utils should be fine)
        const { generateSystemId } = require("../utils/id-generator");
        finalUsername = await generateSystemId(userData.branch_id, role.name);
      }

      // 3. Auto-Generate Password if not provided
      let finalPassword = userData.password;
      let isTempPassword = false;

      if (!finalPassword) {
        finalPassword = Math.random().toString(36).slice(-8); // Simple random password
        isTempPassword = true;
      }

      // Validate required fields
      if (!userData.email) {
        return {
          success: false,
          message: "Email is required",
        };
      }

      // Check if user already exists
      const existing = await prisma.user.findFirst({
        where: {
          OR: [{ username: finalUsername }, { email: userData.email }],
        },
      });

      if (existing) {
        return { success: false, message: "Username or email already exists" };
      }

      // Hash password
      const password_hash = await bcrypt.hash(finalPassword, 10);

      const user = await prisma.user.create({
        data: {
          username: finalUsername,
          email: userData.email,
          password_hash,
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
          phone: userData.phone,
          branch_id: userData.branch_id,
          role_id: userData.role_id,
        },
        include: { role: true, branch: true },
      });

      return {
        success: true,
        data: { ...user, tempPassword: isTempPassword ? finalPassword : null },
        message: "User created successfully",
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Update user
   */
  static async updateUser(userId: string, userData: any) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone: userData.phone,
          email: userData.email,
        },
        include: { role: true, branch: true },
      });

      return {
        success: true,
        data: user,
        message: "User updated successfully",
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(userId: string) {
    try {
      await prisma.user.delete({
        where: { id: userId },
      });

      return { success: true, message: "User deleted successfully" };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }
}

export default UserService;
