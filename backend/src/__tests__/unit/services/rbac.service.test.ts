import { RBACService } from '../../../services/rbac.service';
import { prisma } from '../../../lib/db';

// Mock Prisma client
jest.mock('../../../lib/db', () => ({
    prisma: {
        rBACRole: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            count: jest.fn(),
        },
        permission: {
            create: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            count: jest.fn(),
        },
        userRole: {
            create: jest.fn(),
            deleteMany: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
        },
        auditLog: {
            create: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
        },
    },
}));

describe('RBACService Unit Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('defineRole', () => {
        it('should create a role with permissions', async () => {
            // Arrange
            const mockRole = {
                id: 'role-123',
                branch_id: 'branch-123',
                role_name: 'Custom Admin',
                description: 'Custom admin role',
                is_system: false,
                permissions: [{ id: 'perm-1', permission_name: 'users:read' }],
            };
            (prisma.rBACRole.create as jest.Mock).mockResolvedValue(mockRole);

            // Act
            const result = await RBACService.defineRole(
                'branch-123',
                'Custom Admin',
                ['perm-1'],
                'Custom admin role'
            );

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockRole);
            expect(prisma.rBACRole.create).toHaveBeenCalledWith({
                data: {
                    branch_id: 'branch-123',
                    role_name: 'Custom Admin',
                    description: 'Custom admin role',
                    is_system: false,
                    permissions: {
                        connect: [{ id: 'perm-1' }],
                    },
                },
                include: { permissions: true },
            });
        });

        it('should handle errors gracefully', async () => {
            // Arrange
            (prisma.rBACRole.create as jest.Mock).mockRejectedValue(new Error('Database error'));

            // Act
            const result = await RBACService.defineRole('branch-123', 'Role', ['perm-1']);

            // Assert
            expect(result.success).toBe(false);
            expect(result.code).toBe('ROLE_CREATE_ERROR');
        });
    });

    describe('updateRolePermissions', () => {
        it('should update role permissions', async () => {
            // Arrange
            const mockUpdatedRole = {
                id: 'role-123',
                role_name: 'Admin',
                permissions: [
                    { id: 'perm-1', permission_name: 'users:read' },
                    { id: 'perm-2', permission_name: 'users:write' },
                ],
            };
            (prisma.rBACRole.update as jest.Mock).mockResolvedValue(mockUpdatedRole);

            // Act
            const result = await RBACService.updateRolePermissions('role-123', ['perm-1', 'perm-2']);

            // Assert
            expect(result.success).toBe(true);
            expect(result.data!.permissions.length).toBe(2);
            expect(prisma.rBACRole.update).toHaveBeenCalledWith({
                where: { id: 'role-123' },
                data: {
                    permissions: {
                        set: [{ id: 'perm-1' }, { id: 'perm-2' }],
                    },
                },
                include: { permissions: true },
            });
        });
    });

    describe('deleteRole', () => {
        it('should delete a role', async () => {
            // Arrange
            const mockRole = { id: 'role-123', role_name: 'Old Role' };
            (prisma.rBACRole.delete as jest.Mock).mockResolvedValue(mockRole);

            // Act
            const result = await RBACService.deleteRole('role-123');

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockRole);
        });
    });

    describe('getRoles', () => {
        it('should return roles with pagination', async () => {
            // Arrange
            const mockRoles = [
                { id: 'role-1', role_name: 'Admin', permissions: [] },
                { id: 'role-2', role_name: 'Teacher', permissions: [] },
            ];
            (prisma.rBACRole.findMany as jest.Mock).mockResolvedValue(mockRoles);
            (prisma.rBACRole.count as jest.Mock).mockResolvedValue(2);

            // Act
            const result = await RBACService.getRoles('branch-123', 20, 0);

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockRoles);
            expect(result.total).toBe(2);
        });

        it('should get all roles when branchId not provided', async () => {
            // Arrange
            (prisma.rBACRole.findMany as jest.Mock).mockResolvedValue([]);
            (prisma.rBACRole.count as jest.Mock).mockResolvedValue(0);

            // Act
            await RBACService.getRoles(undefined, 20, 0);

            // Assert
            expect(prisma.rBACRole.findMany).toHaveBeenCalledWith({
                where: {},
                include: { permissions: true },
                take: 20,
                skip: 0,
            });
        });
    });

    describe('getRoleById', () => {
        it('should return role by ID', async () => {
            // Arrange
            const mockRole = {
                id: 'role-123',
                role_name: 'Admin',
                permissions: [],
                user_roles: [],
            };
            (prisma.rBACRole.findUnique as jest.Mock).mockResolvedValue(mockRole);

            // Act
            const result = await RBACService.getRoleById('role-123');

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockRole);
        });

        it('should return error when role not found', async () => {
            // Arrange
            (prisma.rBACRole.findUnique as jest.Mock).mockResolvedValue(null);

            // Act
            const result = await RBACService.getRoleById('nonexistent-id');

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toBe('Role not found');
            expect(result.code).toBe('NOT_FOUND');
        });
    });

    describe('createPermission', () => {
        it('should create a permission', async () => {
            // Arrange
            const mockPermission = {
                id: 'perm-123',
                permission_name: 'students:delete',
                resource: 'students',
                action: 'delete',
                description: 'Delete students',
            };
            (prisma.permission.create as jest.Mock).mockResolvedValue(mockPermission);

            // Act
            const result = await RBACService.createPermission(
                'students:delete',
                'students',
                'delete',
                'Delete students'
            );

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockPermission);
        });
    });

    describe('assignRoleToUser', () => {
        it('should assign role to user', async () => {
            // Arrange
            const mockUserRole = {
                id: 'user-role-123',
                user_id: 'user-123',
                rbac_role_id: 'role-123',
                branch_id: 'branch-123',
                assigned_by: 'admin-123',
                rbac_role: {
                    id: 'role-123',
                    role_name: 'Teacher',
                    permissions: [],
                },
            };
            (prisma.userRole.create as jest.Mock).mockResolvedValue(mockUserRole);

            // Act
            const result = await RBACService.assignRoleToUser(
                'user-123',
                'role-123',
                'branch-123',
                'admin-123'
            );

            // Assert
            expect(result.success).toBe(true);
            expect(result.data!.user_id).toBe('user-123');
            expect(result.data!.rbac_role_id).toBe('role-123');
        });
    });

    describe('removeRoleFromUser', () => {
        it('should remove role from user', async () => {
            // Arrange
            (prisma.userRole.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

            // Act
            const result = await RBACService.removeRoleFromUser('user-123', 'role-123', 'branch-123');

            // Assert
            expect(result.success).toBe(true);
            expect(result.data!.deletedCount).toBe(1);
            expect(prisma.userRole.deleteMany).toHaveBeenCalledWith({
                where: {
                    user_id: 'user-123',
                    rbac_role_id: 'role-123',
                    branch_id: 'branch-123',
                },
            });
        });
    });

    describe('getUserRoles', () => {
        it('should return user roles with permissions', async () => {
            // Arrange
            const mockUserRoles = [
                {
                    id: 'user-role-1',
                    user_id: 'user-123',
                    rbac_role: {
                        id: 'role-1',
                        role_name: 'Admin',
                        permissions: [{ id: 'perm-1', permission_name: 'users:read' }],
                    },
                },
            ];
            (prisma.userRole.findMany as jest.Mock).mockResolvedValue(mockUserRoles);

            // Act
            const result = await RBACService.getUserRoles('user-123');

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockUserRoles);
        });
    });

    describe('checkUserPermission', () => {
        it('should return true when user has permission', async () => {
            // Arrange
            const mockUserRoles = [
                {
                    rbac_role: {
                        permissions: [
                            { id: 'perm-1', permission_name: 'students:read' },
                        ],
                    },
                },
            ];
            (prisma.userRole.findMany as jest.Mock).mockResolvedValue(mockUserRoles);

            // Act
            const result = await RBACService.checkUserPermission('user-123', 'students:read');

            // Assert
            expect(result).toBe(true);
        });

        it('should return false when user does not have permission', async () => {
            // Arrange
            const mockUserRoles = [
                {
                    rbac_role: {
                        permissions: [],
                    },
                },
            ];
            (prisma.userRole.findMany as jest.Mock).mockResolvedValue(mockUserRoles);

            // Act
            const result = await RBACService.checkUserPermission('user-123', 'students:delete');

            // Assert
            expect(result).toBe(false);
        });

        it('should return false on error', async () => {
            // Arrange
            (prisma.userRole.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

            // Act
            const result = await RBACService.checkUserPermission('user-123', 'students:read');

            // Assert
            expect(result).toBe(false);
        });
    });

    describe('getUserPermissions', () => {
        it('should return all user permissions', async () => {
            // Arrange
            const mockUserRoles = [
                {
                    rbac_role: {
                        permissions: [
                            { permission_name: 'students:read' },
                            { permission_name: 'students:write' },
                        ],
                    },
                },
                {
                    rbac_role: {
                        permissions: [
                            { permission_name: 'courses:read' },
                            { permission_name: 'students:read' }, // Duplicate
                        ],
                    },
                },
            ];
            (prisma.userRole.findMany as jest.Mock).mockResolvedValue(mockUserRoles);

            // Act
            const result = await RBACService.getUserPermissions('user-123');

            // Assert
            expect(result).toEqual(['students:read', 'students:write', 'courses:read']);
            expect(result.length).toBe(3); // No duplicates
        });
    });

    describe('auditAccessLog', () => {
        it('should create audit log', async () => {
            // Arrange
            const mockLog = {
                id: 'log-123',
                user_id: 'user-123',
                action: 'create',
                entity_type: 'student',
                entity_id: 'student-123',
            };
            (prisma.auditLog.create as jest.Mock).mockResolvedValue(mockLog);

            // Act
            const result = await RBACService.auditAccessLog(
                'user-123',
                'create',
                'student',
                'student-123',
                { branch_id: 'branch-123' }
            );

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockLog);
        });
    });

    describe('getActiveRolesForUser', () => {
        it('should return only non-expired roles', async () => {
            // Arrange
            const mockRoles = [
                {
                    id: 'user-role-1',
                    expires_at: null,
                    rbac_role: { id: 'role-1', permissions: [] },
                },
            ];
            (prisma.userRole.findMany as jest.Mock).mockResolvedValue(mockRoles);

            // Act
            const result = await RBACService.getActiveRolesForUser('user-123');

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockRoles);
            expect(prisma.userRole.findMany).toHaveBeenCalledWith({
                where: {
                    user_id: 'user-123',
                    OR: [
                        { expires_at: null },
                        { expires_at: { gt: expect.any(Date) } },
                    ],
                },
                include: { rbac_role: { include: { permissions: true } } },
            });
        });
    });

    describe('getPermissionHierarchy', () => {
        it('should group permissions by resource', async () => {
            // Arrange
            const mockPermissions = [
                { id: 'p1', resource: 'students', action: 'read', permission_name: 'students:read' },
                { id: 'p2', resource: 'students', action: 'write', permission_name: 'students:write' },
                { id: 'p3', resource: 'courses', action: 'read', permission_name: 'courses:read' },
            ];
            (prisma.permission.findMany as jest.Mock).mockResolvedValue(mockPermissions);

            // Act
            const result = await RBACService.getPermissionHierarchy();

            // Assert
            expect(result.success).toBe(true);
            expect(result.data.students.length).toBe(2);
            expect(result.data.courses.length).toBe(1);
        });
    });
});
