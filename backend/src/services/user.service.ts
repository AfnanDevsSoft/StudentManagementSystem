import { prisma } from "../lib/db";
import bcrypt from "bcryptjs";

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
      const roleName = userContext?.role?.name?.toLowerCase();

      // RBAC Check: Only Admins can list all users
      if (roleName !== 'superadmin' && roleName !== 'branchadmin') {
        throw new Error('Unauthorized: Insufficient permissions');
      }

      if (roleName !== 'superadmin') {
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
            employee_id: true,
            email: true,
            first_name: true,
            last_name: true,
            phone: true,
            is_active: true,
            last_login: true,
            created_at: true,
            role_id: true,
            branch_id: true,
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
          employee_id: true,
          email: true,
          first_name: true,
          last_name: true,
          phone: true,
          is_active: true,
          last_login: true,
          created_at: true,
          role_id: true, // Added
          branch_id: true, // Added
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

      // Auto-generate Employee ID for staff roles
      if (user.role.name !== 'Student') {
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const { EmployeeIdService } = require('./employee-id.service');
          const employeeId = await EmployeeIdService.assignEmployeeId(user.id, user.branch_id);
          (user as any).employee_id = employeeId;
        } catch (err) {
          console.error("Failed to generate employee ID:", err);
        }
      }

      // SYNC RBAC ROLE: Find matching RBAC role and assign to user
      try {
        const rbacRole = await prisma.rBACRole.findUnique({
          where: { role_name: user.role.name }
        });

        if (rbacRole) {
          await prisma.userRole.create({
            data: {
              user_id: user.id,
              rbac_role_id: rbacRole.id,
              branch_id: user.branch_id,
              assigned_by: userContext?.id || user.id, // Fallback to self (e.g. seeding)
            }
          });
        }
      } catch (rbacError) {
        console.error("Failed to sync RBAC role:", rbacError);
        // Don't fail the request, but log it. 
        // In strict mode we might want to fail, but for now allow user creation.
      }

      // 4. Auto-Create Profile based on Role
      // If role is Teacher, create Teacher profile
      if (user.role.name === 'Teacher') {
        try {
          // Check if profile already exists (unlikely for new user but safe to check)
          const existingProfile = await prisma.teacher.findFirst({
            where: { user_id: user.id }
          });

          if (!existingProfile) {
            await prisma.teacher.create({
              data: {
                user_id: user.id,
                branch_id: user.branch_id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                phone: user.phone,
                employee_code: (user as any).employee_id || `TR-${Math.floor(1000 + Math.random() * 9000)}`,
                hire_date: new Date(),
                employment_type: "full-time",
                designation: "General Teacher",
                qualification: "Not Specified",
                employment_status: "active"
              }
            });
            console.log(`   ✅ Auto-created Teacher profile for user: ${user.username}`);
          }
        } catch (profileError) {
          console.error("Failed to auto-create Teacher profile:", profileError);
        }
      }

      // If role is Student, create Student profile
      if (user.role.name === 'Student') {
        try {
          const existingProfile = await prisma.student.findFirst({
            where: { user_id: user.id }
          });

          if (!existingProfile) {
            // Generate admission number
            const admissionNumber = `ST-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

            await prisma.student.create({
              data: {
                user_id: user.id,
                branch_id: user.branch_id,
                first_name: user.first_name,
                last_name: user.last_name,
                date_of_birth: new Date(),
                student_code: admissionNumber,
                admission_number: admissionNumber,
                admission_date: new Date(),
                admission_status: "active",
                current_grade_level_id: null
              }
            });
            console.log(`   ✅ Auto-created Student profile for user: ${user.username}`);
          }
        } catch (profileError) {
          console.error("Failed to auto-create Student profile:", profileError);
        }
      }

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
          role_id: userData.role_id,   // Added
          branch_id: userData.branch_id, // Added
        },
        include: { role: true, branch: true },
      });

      // SYNC RBAC ROLE if role or branch changed
      if (userData.role_id || userData.branch_id) {
        try {
          // Get the latest role name
          const currentRole = await prisma.role.findUnique({
            where: { id: user.role_id }
          });

          if (currentRole) {
            const rbacRole = await prisma.rBACRole.findUnique({
              where: { role_name: currentRole.name }
            });

            if (rbacRole) {
              // Remove existing user roles to strictly enforce single role for now (or manage accordingly)
              await prisma.userRole.deleteMany({
                where: { user_id: userId }
              });

              await prisma.userRole.create({
                data: {
                  user_id: userId,
                  rbac_role_id: rbacRole.id,
                  branch_id: user.branch_id,
                  assigned_by: userId, // Using modified user's ID as fallback or we need current user context in update
                }
              });
            }
          }
        } catch (rbacError) {
          console.error("Failed to update RBAC role:", rbacError);
        }
      }

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
