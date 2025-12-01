import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class BranchService {
  /**
   * Get all branches with pagination
   */
  static async getAllBranches(page: number = 1, limit: number = 20, search?: string) {
    try {
      const skip = (page - 1) * limit;
      
      const where: any = { is_active: true };
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { code: { contains: search, mode: "insensitive" } },
        ];
      }

      const [branches, total] = await Promise.all([
        prisma.branch.findMany({ where, skip, take: limit }),
        prisma.branch.count({ where }),
      ]);

      return {
        success: true,
        data: branches,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Get branch by ID
   */
  static async getBranchById(branchId: string) {
    try {
      const branch = await prisma.branch.findUnique({
        where: { id: branchId },
        include: { 
          users: { select: { id: true, username: true, email: true } },
          students: { select: { id: true, first_name: true, last_name: true } },
          teachers: { select: { id: true, first_name: true, last_name: true } },
        },
      });

      if (!branch) return { success: false, message: "Branch not found" };
      return { success: true, data: branch };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Create new branch
   */
  static async createBranch(branchData: any) {
    try {
      if (!branchData.name || !branchData.code) {
        return { success: false, message: "Name and code are required" };
      }

      const branch = await prisma.branch.create({
        data: {
          name: branchData.name,
          code: branchData.code,
          address: branchData.address,
          city: branchData.city,
          state: branchData.state,
          country: branchData.country,
          phone: branchData.phone,
          email: branchData.email,
          principal_name: branchData.principal_name,
          principal_email: branchData.principal_email,
          timezone: branchData.timezone || "UTC",
          currency: branchData.currency || "USD",
        },
      });

      return { success: true, data: branch, message: "Branch created successfully" };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Update branch
   */
  static async updateBranch(branchId: string, branchData: any) {
    try {
      const branch = await prisma.branch.update({
        where: { id: branchId },
        data: branchData,
      });

      return { success: true, data: branch, message: "Branch updated successfully" };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Delete branch
   */
  static async deleteBranch(branchId: string) {
    try {
      await prisma.branch.delete({ where: { id: branchId } });
      return { success: true, message: "Branch deleted successfully" };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }
}

export default BranchService;
