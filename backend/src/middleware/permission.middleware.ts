import { Request, Response, NextFunction } from "express";
import { RBACService } from "../services/rbac.service";

/**
 * Permission Middleware for RBAC
 * Checks if authenticated user has required permissions
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

            // SuperAdmin bypass: Skip RBAC check for SuperAdmin users (legacy Role system bridge)
            if (user.role?.name === 'SuperAdmin') {
                return next();
            }

            // DEBUG: Log permission check
            console.log(`[PERM CHECK] User: ${user.username} (${user.id}), Role: ${user.role?.name}, Required: ${requiredPermission}`);

            // Check if user has the required permission
            const hasPermission = await RBACService.checkUserPermission(
                user.id,
                requiredPermission
            );

            console.log(`[PERM CHECK] Result: ${hasPermission ? 'GRANTED' : 'DENIED'}`);

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

            // SuperAdmin bypass: Skip RBAC check for SuperAdmin users
            if (user.role?.name === 'SuperAdmin') {
                return next();
            }

            // Get all user permissions
            const userPermissions = await RBACService.getUserPermissions(user.id);

            // Check if user has any of the required permissions
            const hasAnyPermission = permissions.some((p) =>
                userPermissions.includes(p)
            );

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

            // SuperAdmin bypass: Skip RBAC check for SuperAdmin users
            if (user.role?.name === 'SuperAdmin') {
                return next();
            }

            // Get all user permissions
            const userPermissions = await RBACService.getUserPermissions(user.id);

            // Check if user has all required permissions
            const hasAllPermissions = permissions.every((p) =>
                userPermissions.includes(p)
            );

            if (!hasAllPermissions) {
                const missingPermissions = permissions.filter(
                    (p) => !userPermissions.includes(p)
                );

                return res.status(403).json({
                    success: false,
                    message: `Permission denied. Missing: ${missingPermissions.join(", ")}`,
                    code: "FORBIDDEN",
                    requiredPermissions: permissions,
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
 * Middleware to check resource ownership (for :read_own, :update_own permissions)
 * @param resourceGetter - Function to get resource and check ownership
 */
export const requireOwnership = (
    resourceGetter: (req: Request) => Promise<{ userId: string } | null>
) => {
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

            const resource = await resourceGetter(req);

            if (!resource) {
                return res.status(404).json({
                    success: false,
                    message: "Resource not found",
                    code: "NOT_FOUND",
                });
            }

            if (resource.userId !== user.id) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. You can only access your own resources.",
                    code: "FORBIDDEN",
                });
            }

            return next();
        } catch (error: any) {
            console.error("Ownership check error:", error);
            return res.status(500).json({
                success: false,
                message: "Ownership check failed",
                code: "INTERNAL_SERVER_ERROR",
            });
        }
    };
};
