import { Request, Response, NextFunction } from "express";
import { RBACService } from "../services/rbac.service";
import { prisma } from "../lib/db";

/**
 * Audit Log for Permission Checks
 * Comprehensive tracking of all authorization attempts
 */
interface PermissionAuditLog {
  timestamp: Date;
  userId: string;
  username: string;
  role: string;
  requiredPermission: string | string[];
  granted: boolean;
  ipAddress: string;
  userAgent?: string;
  resource?: string;
  action?: string;
}

/**
 * Log permission check to database for security auditing
 */
async function logPermissionCheck(
  req: Request,
  user: any,
  requiredPermission: string | string[],
  granted: boolean
): Promise<void> {
  try {
    const auditLog: PermissionAuditLog = {
      timestamp: new Date(),
      userId: user.id,
      username: user.username,
      role: user.role?.name || 'NONE',
      requiredPermission,
      granted,
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent'),
      resource: Array.isArray(requiredPermission) ? 'multiple' : requiredPermission.split(':')[0],
      action: Array.isArray(requiredPermission) ? 'multiple' : requiredPermission.split(':')[1]
    };

    // Log synchronously but don't await - we don't want to block requests
    prisma.auditLog.create({
      data: {
        user_id: auditLog.userId,
        action: 'PERMISSION_CHECK',
        resource: auditLog.resource || 'unknown',
        resource_id: auditLog.userId,
        details: {
          timestamp: auditLog.timestamp,
          username: auditLog.username,
          role: auditLog.role,
          requiredPermission: auditLog.requiredPermission,
          granted: auditLog.granted,
          ipAddress: auditLog.ipAddress,
          userAgent: auditLog.userAgent
        }
      }
    }).catch(err => {
      console.error('Failed to write audit log:', err);
    });

    // Also log to console for immediate visibility
    console.log(`[AUDIT] Permission ${granted ? 'GRANTED' : 'DENIED'}: User=${auditLog.username} (${auditLog.userId}), Role=${auditLog.role}, Permission=${requiredPermission}, IP=${auditLog.ipAddress}`);
  } catch (error) {
    console.error('Error creating audit log:', error);
  }
}

/**
 * Permission Middleware for RBAC
 * Checks if authenticated user has required permissions
 * NO EXCEPTIONS - All users including SuperAdmin must pass permission checks
 */

/**
 * Middleware to check if user has a specific permission
 * @param requiredPermission - Permission string (e.g., "students:create")
 */
export const requirePermission = (requiredPermission: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = (req as any).user;

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication required",
                    code: "UNAUTHORIZED",
                });
            }

            // --- SECURITY FIX: SuperAdmin Bypass Removed ---
            // Previously: SuperAdmin could bypass all permission checks
            // Now: SuperAdmin must have explicit permissions like any user
            // This enforces principle of least privilege and auditability

            // Check if user has the required permission
            const hasPermission = await RBACService.checkUserPermission(
                user.id,
                requiredPermission
            );

            // Log all permission checks for security audit
            await logPermissionCheck(req, user, requiredPermission, hasPermission);

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: `Permission denied. Required: ${requiredPermission}`,
                    code: "FORBIDDEN",
                    requiredPermission,
                });
            }

            return next();
        } catch (error: any) {
            console.error("Permission check error:", error);
            return res.status(500).json({
                success: false,
                message: "Permission check failed",
                code: "INTERNAL_SERVER_ERROR",
            });
        }
    };
};

/**
 * Middleware to check if user has ANY of the specified permissions
 * @param permissions - Array of permission strings
 */
export const requireAnyPermission = (permissions: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = (req as any).user;

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication required",
                    code: "UNAUTHORIZED",
                });
            }

            // --- SECURITY FIX: SuperAdmin Bypass Removed ---
            // SuperAdmin must have explicit permissions

            // Get all user permissions
            const userPermissions = await RBACService.getUserPermissions(user.id);

            // Check if user has any of the required permissions
            const hasAnyPermission = permissions.some((p) =>
                userPermissions.includes(p)
            );

            // Log the permission check
            await logPermissionCheck(req, user, permissions, hasAnyPermission);

            if (!hasAnyPermission) {
                return res.status(403).json({
                    success: false,
                    message: `Permission denied. Required one of: ${permissions.join(", ")}`,
                    code: "FORBIDDEN",
                    requiredPermissions: permissions,
                });
            }

            return next();
        } catch (error: any) {
            console.error("Permission check error:", error);
            return res.status(500).json({
                success: false,
                message: "Permission check failed",
                code: "INTERNAL_SERVER_ERROR",
            });
        }
    };
};

/**
 * Middleware to check if user has ALL specified permissions
 * @param permissions - Array of permission strings
 */
export const requireAllPermissions = (permissions: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = (req as any).user;

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication required",
                    code: "UNAUTHORIZED",
                });
            }

            // --- SECURITY FIX: SuperAdmin Bypass Removed ---
            // SuperAdmin must have explicit permissions

            // Get all user permissions
            const userPermissions = await RBACService.getUserPermissions(user.id);

            // Check if user has all required permissions
            const hasAllPermissions = permissions.every((p) =>
                userPermissions.includes(p)
            );

            // Log the permission check
            await logPermissionCheck(req, user, permissions, hasAllPermissions);

            if (!hasAllPermissions) {
                const missingPermissions = permissions.filter(
                    (p) => !userPermissions.includes(p)
                );

                return res.status(403).json({
                    success: false,
                    message: `Permission denied. Missing: ${missingPermissions.join(", ")}`,
                    code: "FORBIDDEN",
                    missingPermissions,
                });
            }

            return next();
        } catch (error: any) {
            console.error("Permission check error:", error);
            return res.status(500).json({
                success: false,
                message: "Permission check failed",
                code: "INTERNAL_SERVER_ERROR",
            });
        }
    };
};

/**
 * Middleware to check if user owns the resource or has permission
 * @param resourceIdParam - URL parameter containing the resource ID
 * @param ownershipCheck - Function to check if user owns the resource
 * @param requiredPermission - Permission required if not owner
 */
export const requireOwnershipOrPermission = (
  resourceIdParam: string,
  ownershipCheck: (userId: string, resourceId: string) => Promise<boolean>,
  requiredPermission: string
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = (req as any).user;
            const resourceId = req.params[resourceIdParam];

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication required",
                    code: "UNAUTHORIZED",
                });
            }

            // Check ownership first
            const isOwner = await ownershipCheck(user.id, resourceId);
            
            if (isOwner) {
                await logPermissionCheck(req, user, 'ownership', true);
                return next();
            }

            // If not owner, check permission
            const hasPermission = await RBACService.checkUserPermission(
                user.id,
                requiredPermission
            );

            await logPermissionCheck(req, user, requiredPermission, hasPermission);

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: `Permission denied. Required: ${requiredPermission}`,
                    code: "FORBIDDEN",
                    reason: "Neither owner nor has required permission",
                    requiredPermission,
                });
            }

            return next();
        } catch (error: any) {
            console.error("Ownership/Permission check error:", error);
            return res.status(500).json({
                success: false,
                message: "Permission check failed",
                code: "INTERNAL_SERVER_ERROR",
            });
        }
    };
};
