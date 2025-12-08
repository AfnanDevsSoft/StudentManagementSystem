import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class BranchService {
  /**
   * Get all branches with pagination
   */
  static async getAllBranches(
    page: number = 1,
    limit: number = 20,
    search?: string
  ) {
    try {
      const skip = (page - 1) * limit;

      // Build where clause - don't filter by is_active, show all branches
      const where: any = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { code: { contains: search, mode: "insensitive" } },
          { city: { contains: search, mode: "insensitive" } },
        ];
      }

      const [branches, total] = await Promise.all([
        prisma.branch.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: "desc" }, // Order by latest first
        }),
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

      // Check for duplicate code
      const existingBranch = await prisma.branch.findUnique({
        where: { code: branchData.code },
      });

      if (existingBranch) {
        return {
          success: false,
          message: "A branch with this code already exists",
        };
      }

      // Build create data object with only defined values
      const createData: any = {
        name: branchData.name,
        code: branchData.code,
        timezone: branchData.timezone || "UTC",
        currency: branchData.currency || "USD",
        is_active:
          branchData.is_active !== undefined ? branchData.is_active : true,
      };

      // Only add optional fields if they have values
      if (branchData.address) createData.address = branchData.address;
      if (branchData.city) createData.city = branchData.city;
      if (branchData.state_province) createData.state = branchData.state_province;
      else if (branchData.state) createData.state = branchData.state;
      if (branchData.country) createData.country = branchData.country;
      if (branchData.postal_code) createData.postal_code = branchData.postal_code;
      if (branchData.phone) createData.phone = branchData.phone;
      if (branchData.email) createData.email = branchData.email;
      if (branchData.website) createData.website = branchData.website;
      if (branchData.principal_name) createData.principal_name = branchData.principal_name;
      if (branchData.principal_email) createData.principal_email = branchData.principal_email;

      const branch = await prisma.branch.create({
        data: createData,
      });

      return {
        success: true,
        data: branch,
        message: "Branch created successfully",
      };
    } catch (error: any) {
      console.error("Branch creation error:", error);
      return {
        success: false,
        message: error.message || "Failed to create branch"
      };
    }
  }

  /**
   * Update branch
   */
  static async updateBranch(branchId: string, branchData: any) {
    try {
      // Check if code already exists for a different branch
      if (branchData.code) {
        const existingBranch = await prisma.branch.findFirst({
          where: {
            code: branchData.code,
            NOT: { id: branchId },
          },
        });

        if (existingBranch) {
          return {
            success: false,
            message: "A branch with this code already exists",
          };
        }
      }

      // Prepare update data with proper field mapping
      const updateData: any = {};

      if (branchData.name !== undefined) updateData.name = branchData.name;
      if (branchData.code !== undefined) updateData.code = branchData.code;
      if (branchData.address !== undefined)
        updateData.address = branchData.address;
      if (branchData.city !== undefined) updateData.city = branchData.city;
      if (branchData.state_province !== undefined)
        updateData.state = branchData.state_province;
      else if (branchData.state !== undefined)
        updateData.state = branchData.state;
      if (branchData.country !== undefined)
        updateData.country = branchData.country;
      if (branchData.phone !== undefined) updateData.phone = branchData.phone;
      if (branchData.email !== undefined) updateData.email = branchData.email;
      if (branchData.principal_name !== undefined)
        updateData.principal_name = branchData.principal_name;
      if (branchData.principal_email !== undefined)
        updateData.principal_email = branchData.principal_email;
      if (branchData.timezone !== undefined)
        updateData.timezone = branchData.timezone;
      if (branchData.currency !== undefined)
        updateData.currency = branchData.currency;
      if (branchData.is_active !== undefined)
        updateData.is_active = branchData.is_active;
      if (branchData.website !== undefined)
        updateData.website = branchData.website;
      if (branchData.postal_code !== undefined)
        updateData.postal_code = branchData.postal_code;

      const branch = await prisma.branch.update({
        where: { id: branchId },
        data: updateData,
      });

      return {
        success: true,
        data: branch,
        message: "Branch updated successfully",
      };
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
