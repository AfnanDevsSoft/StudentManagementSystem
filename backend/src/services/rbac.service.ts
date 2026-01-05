import { prisma } from "../lib/db";

// Essential permissions that every role MUST have for the system to function
// These are automatically added to every new role
const ESSENTIAL_PERMISSIONS = [
  'branches:read',  // Required for dashboard and most pages
];

export class RBACService {
  // ============= Role Management =============

  static async defineRole(
    branchId: string | null,
    roleName: string,
    permissionModules: string[],  // Module names like 'students', 'teachers'
    description?: string
  ) {
    try {
      // Look up all permissions for the given module names (resources)
      // e.g., 'students' -> ['students:read', 'students:create', 'students:update', 'students:delete']
      let permissionIds: string[] = [];

      if (permissionModules.length > 0) {
        const permissions = await prisma.permission.findMany({
          where: {
            resource: { in: permissionModules }
          },
          select: { id: true }
        });
        permissionIds = permissions.map(p => p.id);
      }

      // Always add essential permissions that every role needs
      const essentialPerms = await prisma.permission.findMany({
        where: {
          permission_name: { in: ESSENTIAL_PERMISSIONS }
        },
        select: { id: true }
      });

      // Merge essential permissions with selected permissions (avoid duplicates)
      const essentialIds = essentialPerms.map(p => p.id);
      const allPermissionIds = [...new Set([...permissionIds, ...essentialIds])];


      // Create RBAC role
      const role = await prisma.rBACRole.create({
        data: {
          branch_id: branchId || undefined,  // null = global role
          role_name: roleName,
          description: description || "",
          is_system: false,
          permissions: allPermissionIds.length > 0 ? {
            connect: allPermissionIds.map((id) => ({ id })),
          } : undefined,
        },
        include: { permissions: true },
      });

      // Also create legacy Role entry (for User assignment - FK constraint)
      // This ensures roles appear in User dropdown
      try {
        await prisma.role.create({
          data: {
            name: roleName,
            description: description || "",
            is_system: false,
            branch_id: branchId || undefined,
          },
        });
      } catch (legacyError: any) {
        // Ignore if legacy role already exists (unique constraint)
        console.log("Legacy role may already exist:", legacyError.message);
      }

      return {
        success: true,
        message: "Role created successfully",
        data: role,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        code: "ROLE_CREATE_ERROR",
      };
    }
  }

  static async updateRolePermissions(roleId: string, permissionIds: string[]) {
    try {
      const role = await prisma.rBACRole.update({
        where: { id: roleId },
        data: {
          permissions: {
            set: permissionIds.map((id) => ({ id })),
          },
        },
        include: { permissions: true },
      });
      return { success: true, message: "Role permissions updated", data: role };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        code: "ROLE_UPDATE_ERROR",
      };
    }
  }

  static async deleteRole(roleId: string) {
    try {
      const role = await prisma.rBACRole.delete({
        where: { id: roleId },
      });
      return {
        success: true,
        message: "Role deleted successfully",
        data: role,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        code: "ROLE_DELETE_ERROR",
      };
    }
  }

  static async getRoles(branchId?: string, limit = 20, offset = 0) {
    try {
      // Always include global roles (branch_id is null) along with branch-specific roles
      const where = branchId
        ? { OR: [{ branch_id: branchId }, { branch_id: { equals: null } }] }
        : {};
      const roles = await prisma.rBACRole.findMany({
        where: where as any,  // Type assertion for complex OR with null
        include: { permissions: true },
        take: limit,
        skip: offset,
        orderBy: { role_name: 'asc' },
      });
      const total = await prisma.rBACRole.count({
        where: where as any,
      });
      return { success: true, data: roles, total, limit, offset };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        code: "ROLE_FETCH_ERROR",
      };
    }
  }

  static async getRoleById(roleId: string) {
    try {
      const role = await prisma.rBACRole.findUnique({
        where: { id: roleId },
        include: { permissions: true, user_roles: true },
      });
      if (!role)
        return { success: false, message: "Role not found", code: "NOT_FOUND" };
      return { success: true, data: role };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        code: "ROLE_FETCH_ERROR",
      };
    }
  }

  // ============= Permission Management =============

  static async createPermission(
    permissionName: string,
    resource: string,
    action: string,
    description?: string
  ) {
    try {
      const permission = await prisma.permission.create({
        data: {
          permission_name: permissionName,
          resource,
          action,
          description: description || "",
        },
      });
      return { success: true, message: "Permission created", data: permission };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        code: "PERMISSION_CREATE_ERROR",
      };
    }
  }

  static async getAllPermissions(limit = 100, offset = 0) {
    try {
      const permissions = await prisma.permission.findMany({
        take: limit,
        skip: offset,
      });
      const total = await prisma.permission.count();
      return { success: true, data: permissions, total, limit, offset };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        code: "PERMISSION_FETCH_ERROR",
      };
    }
  }

  static async updatePermission(permissionId: string, description: string) {
    try {
      const permission = await prisma.permission.update({
        where: { id: permissionId },
        data: { description },
      });
      return { success: true, message: "Permission updated", data: permission };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        code: "PERMISSION_UPDATE_ERROR",
      };
    }
  }

  // ============= User Access Management =============

  static async assignRoleToUser(
    userId: string,
    roleId: string,
    branchId: string,
    assignedBy: string,
    expiryDate?: Date
  ) {
    try {
      const userRole = await prisma.userRole.create({
        data: {
          user_id: userId,
          rbac_role_id: roleId,
          branch_id: branchId,
          assigned_by: assignedBy,
          expires_at: expiryDate || null,
        },
        include: { rbac_role: { include: { permissions: true } } },
      });
      return {
        success: true,
        message: "Role assigned to user",
        data: userRole,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        code: "ASSIGN_ROLE_ERROR",
      };
    }
  }

  static async removeRoleFromUser(
    userId: string,
    roleId: string,
    branchId: string
  ) {
    try {
      const removed = await prisma.userRole.deleteMany({
        where: {
          user_id: userId,
          rbac_role_id: roleId,
          branch_id: branchId,
        },
      });
      return {
        success: true,
        message: "Role removed from user",
        data: { deletedCount: removed.count },
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        code: "REMOVE_ROLE_ERROR",
      };
    }
  }

  static async getUserRoles(userId: string) {
    try {
      const userRoles = await prisma.userRole.findMany({
        where: { user_id: userId },
        include: { rbac_role: { include: { permissions: true } } },
      });
      return { success: true, data: userRoles };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        code: "USER_ROLES_FETCH_ERROR",
      };
    }
  }

  static async checkUserPermission(
    userId: string,
    requiredPermission: string
  ): Promise<boolean> {
    try {
      const userRoles = await prisma.userRole.findMany({
        where: { user_id: userId },
        include: {
          rbac_role: {
            include: {
              permissions: {
                where: { permission_name: requiredPermission },
              },
            },
          },
        },
      });

      return userRoles.some((ur) => ur.rbac_role.permissions.length > 0);
    } catch (error) {
      return false;
    }
  }

  static async getUserPermissions(userId: string): Promise<string[]> {
    try {
      const userRoles = await prisma.userRole.findMany({
        where: { user_id: userId },
        include: {
          rbac_role: {
            include: { permissions: true },
          },
        },
      });

      const permissions = new Set<string>();
      userRoles.forEach((ur) => {
        ur.rbac_role.permissions.forEach((p) => {
          permissions.add(p.permission_name);
        });
      });

      return Array.from(permissions);
    } catch (error) {
      return [];
    }
  }

  // ============= Audit Logging =============

  static async auditAccessLog(
    userId: string,
    action: string,
    resource: string,
    resourceId?: string,
    details?: any
  ) {
    try {
      const log = await prisma.auditLog.create({
        data: {
          user_id: userId,
          branch_id: details?.branch_id || "",
          action,
          entity_type: resource,
          entity_id: resourceId,
          changes: details || {},
        },
      });
      return { success: true, message: "Access logged", data: log };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        code: "AUDIT_LOG_ERROR",
      };
    }
  }

  static async getAccessLogs(
    userId: string,
    limit = 50,
    offset = 0,
    dateRange?: { start: Date; end: Date }
  ) {
    try {
      const logs = await prisma.auditLog.findMany({
        where: {
          user_id: userId,
          ...(dateRange && {
            created_at: {
              gte: dateRange.start,
              lte: dateRange.end,
            },
          }),
        },
        orderBy: { created_at: "desc" },
        take: limit,
        skip: offset,
      });
      const total = await prisma.auditLog.count({
        where: {
          user_id: userId,
          ...(dateRange && {
            created_at: {
              gte: dateRange.start,
              lte: dateRange.end,
            },
          }),
        },
      });
      return { success: true, data: logs, total, limit, offset };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        code: "AUDIT_LOG_FETCH_ERROR",
      };
    }
  }

  static async getAccessLogsByResource(
    resource: string,
    limit = 50,
    offset = 0
  ) {
    try {
      const logs = await prisma.auditLog.findMany({
        where: { entity_type: resource },
        orderBy: { created_at: "desc" },
        take: limit,
        skip: offset,
      });
      const total = await prisma.auditLog.count({
        where: { entity_type: resource },
      });
      return { success: true, data: logs, total, limit, offset };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        code: "AUDIT_LOG_FETCH_ERROR",
      };
    }
  }

  // ============= Utility Methods =============

  static async getPermissionHierarchy() {
    try {
      const permissions = await prisma.permission.findMany();
      const grouped = permissions.reduce((acc: any, perm) => {
        if (!acc[perm.resource]) acc[perm.resource] = [];
        acc[perm.resource].push({
          action: perm.action,
          permission: perm.permission_name,
        });
        return acc;
      }, {});
      return { success: true, data: grouped };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        code: "HIERARCHY_ERROR",
      };
    }
  }

  static async getActiveRolesForUser(userId: string) {
    try {
      const userRoles = await prisma.userRole.findMany({
        where: {
          user_id: userId,
          OR: [{ expires_at: null }, { expires_at: { gt: new Date() } }],
        },
        include: { rbac_role: { include: { permissions: true } } },
      });
      return { success: true, data: userRoles };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        code: "ACTIVE_ROLES_ERROR",
      };
    }
  }

  static async expireUserRole(userRoleId: string) {
    try {
      const userRole = await prisma.userRole.update({
        where: { id: userRoleId },
        data: { expires_at: new Date() },
      });
      return { success: true, message: "Role expiration set", data: userRole };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        code: "EXPIRE_ROLE_ERROR",
      };
    }
  }
}
