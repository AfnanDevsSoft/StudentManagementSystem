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
      if (userContext && userContext.role?.name !== 'SuperAdmin') {
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
  static async createUser(userData: any) {
    try {
      // Validate required fields
      if (!userData.username || !userData.email || !userData.password) {
        return {
          success: false,
          message: "Username, email, and password are required",
        };
      }

      // Check if user already exists
      const existing = await prisma.user.findFirst({
        where: {
          OR: [{ username: userData.username }, { email: userData.email }],
        },
      });

      if (existing) {
        return { success: false, message: "Username or email already exists" };
      }

      // Hash password
      const password_hash = await bcrypt.hash(userData.password, 10);

      const user = await prisma.user.create({
        data: {
          username: userData.username,
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
        data: user,
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
