import { Router, Request, Response } from "express";
import { RBACService } from "../services/rbac.service";
import { authMiddleware, sendResponse } from "../middleware/error.middleware";

const router: Router = Router();

/**
 * GET /api/v1/rbac/roles/:branchId
 * Get all roles for branch
 */
router.get(
  "/roles/:branchId",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const { branchId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const result = await RBACService.getRoles(
      branchId,
      parseInt(limit as string) || 20,
      parseInt(offset as string) || 0
    );
    sendResponse(res, 200, result.success, result.message, result.data);
  }
);

/**
 * GET /api/v1/rbac/roles/detail/:roleId
 * Get role by ID
 */
router.get(
  "/roles/detail/:roleId",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const result = await RBACService.getRoleById(req.params.roleId);
    const statusCode = result.success ? 200 : 404;
    sendResponse(res, statusCode, result.success, result.message, result.data);
  }
);

/**
 * POST /api/v1/rbac/roles
 * Create new role
 */
router.post(
  "/roles",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const { branchId, roleName, permissions, description } = req.body;

    if (!branchId || !roleName) {
      sendResponse(res, 400, false, "Branch ID and role name required");
      return;
    }

    const result = await RBACService.defineRole(
      branchId,
      roleName,
      permissions || [],
      description
    );
    sendResponse(res, 201, result.success, result.message, result.data);
  }
);

/**
 * PUT /api/v1/rbac/roles/:roleId
 * Update role permissions
 */
router.put(
  "/roles/:roleId",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const { permissionIds } = req.body;

    if (!permissionIds || !Array.isArray(permissionIds)) {
      sendResponse(res, 400, false, "Permission IDs array required");
      return;
    }

    const result = await RBACService.updateRolePermissions(
      req.params.roleId,
      permissionIds
    );
    sendResponse(res, 200, result.success, result.message, result.data);
  }
);

/**
 * DELETE /api/v1/rbac/roles/:roleId
 * Delete role
 */
router.delete(
  "/roles/:roleId",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const result = await RBACService.deleteRole(req.params.roleId);
    sendResponse(
      res,
      result.success ? 200 : 400,
      result.success,
      result.message
    );
  }
);

/**
 * GET /api/v1/rbac/permissions
 * Get all permissions
 */
router.get(
  "/permissions",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const { limit = 100, offset = 0 } = req.query;
    const result = await RBACService.getAllPermissions(
      parseInt(limit as string) || 100,
      parseInt(offset as string) || 0
    );
    sendResponse(res, 200, result.success, result.message, result.data);
  }
);

/**
 * POST /api/v1/rbac/permissions
 * Create permission
 */
router.post(
  "/permissions",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const { permissionName, resource, action, description } = req.body;

    if (!permissionName || !resource || !action) {
      sendResponse(res, 400, false, "Missing required fields");
      return;
    }

    const result = await RBACService.createPermission(
      permissionName,
      resource,
      action,
      description
    );
    sendResponse(res, 201, result.success, result.message, result.data);
  }
);

/**
 * POST /api/v1/rbac/assign
 * Assign role to user
 */
router.post(
  "/assign",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const { userId, roleId, branchId, assignedBy, expiryDate } = req.body;

    if (!userId || !roleId || !branchId || !assignedBy) {
      sendResponse(res, 400, false, "Missing required fields");
      return;
    }

    const result = await RBACService.assignRoleToUser(
      userId,
      roleId,
      branchId,
      assignedBy,
      expiryDate ? new Date(expiryDate) : undefined
    );
    sendResponse(res, 201, result.success, result.message, result.data);
  }
);

/**
 * DELETE /api/v1/rbac/user-roles/:userRoleId
 * Remove role from user
 */
router.delete(
  "/user-roles/:userRoleId",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    // This endpoint needs custom implementation - userRoleId is composite key
    sendResponse(res, 501, false, "Use DELETE /user-roles endpoint instead");
  }
);

/**
 * GET /api/v1/rbac/user-roles/:userId
 * Get user roles
 */
router.get(
  "/user-roles/:userId",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const result = await RBACService.getUserRoles(req.params.userId);
    sendResponse(res, 200, result.success, result.message, result.data);
  }
);

/**
 * POST /api/v1/rbac/check-permission
 * Check user permission
 */
router.post(
  "/check-permission",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const { userId, permission } = req.body;

    if (!userId || !permission) {
      sendResponse(res, 400, false, "User ID and permission required");
      return;
    }

    const hasPermission = await RBACService.checkUserPermission(
      userId,
      permission
    );
    sendResponse(
      res,
      200,
      hasPermission,
      hasPermission ? "Permission granted" : "Permission denied",
      { hasPermission }
    );
  }
);

/**
 * GET /api/v1/rbac/user-permissions/:userId
 * Get user permissions
 */
router.get(
  "/user-permissions/:userId",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const permissions = await RBACService.getUserPermissions(req.params.userId);
    sendResponse(res, 200, true, "Permissions retrieved", { permissions });
  }
);

/**
 * GET /api/v1/rbac/permission-hierarchy
 * Get permission hierarchy
 */
router.get(
  "/permission-hierarchy",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const result = await RBACService.getPermissionHierarchy();
    sendResponse(res, 200, result.success, result.message, result.data);
  }
);

export default router;
