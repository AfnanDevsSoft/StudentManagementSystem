import { UserService } from '../../../services/user.service';
import { prisma } from '../../../lib/db';
import bcryptjs from 'bcryptjs';

// Mock Prisma and bcryptjs
jest.mock('../../../lib/db', () => ({
    prisma: {
        user: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
            findFirst: jest.fn(),
        },
        role: {
            findFirst: jest.fn(),
            findUnique: jest.fn(),
        },
    },
}));

jest.mock('bcryptjs', () => ({
    hash: jest.fn().mockResolvedValue('hashed_password'),
    compare: jest.fn().mockResolvedValue(true),
}));

describe('UserService Unit Tests', () => {
    const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        branch_id: 'branch-123',
        role_id: 'role-123',
        is_active: true,
        role: { name: 'Admin' },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllUsers', () => {
        it('should return paginated users', async () => {
            // Arrange
            (prisma.user.findMany as jest.Mock).mockResolvedValue([mockUser]);
            (prisma.user.count as jest.Mock).mockResolvedValue(1);

            // Act
            const result = await UserService.getAllUsers(1, 10, undefined, { role: { name: 'SuperAdmin' } });

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toEqual([mockUser]);
            expect(result.pagination).toEqual({
                page: 1,
                limit: 10,
                total: 1,
                pages: 1,
            });
        });

        it('should filter by branch_id', async () => {
            // Arrange
            (prisma.user.findMany as jest.Mock).mockResolvedValue([mockUser]);
            (prisma.user.count as jest.Mock).mockResolvedValue(1);

            // Act
            await UserService.getAllUsers(1, 10, undefined, { role: { name: 'BranchAdmin' }, branch_id: 'branch-123' });

            // Assert
            expect(prisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { branch_id: 'branch-123' },
                skip: 0,
                take: 10,
                select: expect.any(Object),
            }));
        });

        it('should filter by search query', async () => {
            // Arrange
            (prisma.user.findMany as jest.Mock).mockResolvedValue([mockUser]);
            (prisma.user.count as jest.Mock).mockResolvedValue(1);

            // Act
            await UserService.getAllUsers(1, 10, 'test', { role: { name: 'SuperAdmin' } });

            // Assert
            expect(prisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    OR: expect.arrayContaining([
                        expect.objectContaining({ username: expect.any(Object) }),
                        expect.objectContaining({ email: expect.any(Object) }),
                    ]),
                }),
                skip: 0,
                take: 10,
            }));
        });
    });

    describe('getUserById', () => {
        it('should return user by ID', async () => {
            // Arrange
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            // Act
            const result = await UserService.getUserById('user-123');

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockUser);
        });

        it('should return error when user not found', async () => {
            // Arrange
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            // Act
            const result = await UserService.getUserById('nonexistent-id');

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toBe('User not found');
        });
    });

    describe('createUser', () => {
        it('should create user successfully', async () => {
            // Arrange
            const userData = {
                username: 'newuser',
                email: 'newuser@example.com',
                password: 'Password@123',
                first_name: 'New',
                last_name: 'User',
                branch_id: 'branch-123',
                role_id: 'role-123',
            };
            (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
            (prisma.role.findUnique as jest.Mock).mockResolvedValue({ id: 'role-123', name: 'Student' });
            (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

            // Act
            const result = await UserService.createUser(userData);

            // Assert
            expect(result.success).toBe(true);
            expect(bcryptjs.hash).toHaveBeenCalledWith('Password@123', 10);
        });

        it('should validate required fields', async () => {
            // Act
            const result = await UserService.createUser({
                username: 'test',
                // Missing required fields
            });

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toContain('required');
        });

        it('should reject duplicate username', async () => {
            // Arrange
            const userData = {
                username: 'existing',
                email: 'new@example.com',
                password: 'Password@123',
                first_name: 'Test',
                last_name: 'User',
                branch_id: 'branch-123',
                role_id: 'role-123',
            };
            (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);

            // Act
            const result = await UserService.createUser(userData);

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toContain('already exists');
        });
    });

    describe('updateUser', () => {
        it('should update user successfully', async () => {
            // Arrange
            (prisma.user.update as jest.Mock).mockResolvedValue({
                ...mockUser,
                first_name: 'Updated',
            });

            // Act
            const result = await UserService.updateUser('user-123', {
                first_name: 'Updated',
            });

            // Assert
            expect(result.success).toBe(true);
            expect(result.data!.first_name).toBe('Updated');
        });
    });

    describe('deleteUser', () => {
        it('should delete user', async () => {
            // Arrange
            (prisma.user.delete as jest.Mock).mockResolvedValue(mockUser);

            // Act
            const result = await UserService.deleteUser('user-123');

            // Assert
            expect(result.success).toBe(true);
            expect(prisma.user.delete).toHaveBeenCalledWith({
                where: { id: 'user-123' },
            });
        });
    });
});
