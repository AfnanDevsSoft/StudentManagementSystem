import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthService } from '../../../services/auth.service';
import { prisma } from '../../../lib/db';

// Mock dependencies
jest.mock('../../../lib/db', () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        student: {
            findUnique: jest.fn(),
        },
        teacher: {
            findUnique: jest.fn(),
        },
    },
}));

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthService Unit Tests', () => {
    const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        password_hash: '$2a$10$hashedpassword',
        is_active: true,
        role: {
            id: 'role-123',
            name: 'Admin',
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('should successfully login with valid credentials', async () => {
            // Arrange
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (jwt.sign as jest.Mock).mockReturnValue('mock-token');
            (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

            // Act
            const result = await AuthService.login({
                username: 'testuser',
                password: 'password123',
            });

            // Assert
            expect(result.success).toBe(true);
            expect(result.message).toBe('Login successful');
            expect(result.data).toBeDefined();
            expect(result.data?.access_token).toBe('mock-token');
            expect(result.data?.user.username).toBe('testuser');
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { username: 'testuser' },
                include: {
                    role: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });
            expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password_hash);
        });

        it('should reject login with invalid username', async () => {
            // Arrange
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            // Act
            const result = await AuthService.login({
                username: 'invaliduser',
                password: 'password123',
            });

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toBe('Invalid username or password');
            expect(result.data).toBeUndefined();
        });

        it('should reject login with invalid password', async () => {
            // Arrange
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            // Act
            const result = await AuthService.login({
                username: 'testuser',
                password: 'wrongpassword',
            });

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toBe('Invalid username or password');
            expect(result.data).toBeUndefined();
        });

        it('should reject login for inactive user', async () => {
            // Arrange
            const inactiveUser = { ...mockUser, is_active: false };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(inactiveUser);

            // Act
            const result = await AuthService.login({
                username: 'testuser',
                password: 'password123',
            });

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toBe('User account is inactive');
            expect(result.data).toBeUndefined();
        });

        it('should validate required fields', async () => {
            // Act
            const result1 = await AuthService.login({
                username: '',
                password: 'password123',
            });
            const result2 = await AuthService.login({
                username: 'testuser',
                password: '',
            });

            // Assert
            expect(result1.success).toBe(false);
            expect(result1.message).toBe('Username and password are required');
            expect(result2.success).toBe(false);
            expect(result2.message).toBe('Username and password are required');
        });

        it('should update last_login timestamp on successful login', async () => {
            // Arrange
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (jwt.sign as jest.Mock).mockReturnValue('mock-token');
            (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

            // Act
            await AuthService.login({
                username: 'testuser',
                password: 'password123',
            });

            // Assert
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: mockUser.id },
                data: { last_login: expect.any(Date) },
            });
        });

        it('should retrieve student ID for student role', async () => {
            // Arrange
            const studentUser = { ...mockUser, role: { id: 'role-student', name: 'Student' } };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(studentUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (jwt.sign as jest.Mock).mockReturnValue('mock-token');
            (prisma.user.update as jest.Mock).mockResolvedValue(studentUser);
            (prisma.student.findUnique as jest.Mock).mockResolvedValue({ id: 'student-123' });

            // Act
            const result = await AuthService.login({
                username: 'student',
                password: 'password123',
            });

            // Assert
            expect(prisma.student.findUnique).toHaveBeenCalledWith({
                where: { user_id: studentUser.id },
                select: { id: true },
            });
            expect(result.data?.user.studentId).toBe('student-123');
        });

        it('should retrieve teacher ID for teacher role', async () => {
            // Arrange
            const teacherUser = { ...mockUser, role: { id: 'role-teacher', name: 'Teacher' } };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(teacherUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (jwt.sign as jest.Mock).mockReturnValue('mock-token');
            (prisma.user.update as jest.Mock).mockResolvedValue(teacherUser);
            (prisma.teacher.findUnique as jest.Mock).mockResolvedValue({ id: 'teacher-123' });

            // Act
            const result = await AuthService.login({
                username: 'teacher',
                password: 'password123',
            });

            // Assert
            expect(prisma.teacher.findUnique).toHaveBeenCalledWith({
                where: { user_id: teacherUser.id },
                select: { id: true },
            });
            expect(result.data?.user.teacherId).toBe('teacher-123');
        });
    });

    describe('refreshToken', () => {
        it('should successfully refresh token with valid refresh token', async () => {
            // Arrange
            (jwt.verify as jest.Mock).mockReturnValue({ userId: mockUser.id });
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (jwt.sign as jest.Mock).mockReturnValue('new-mock-token');

            // Act
            const result = await AuthService.refreshToken('valid-refresh-token');

            // Assert
            expect(result.success).toBe(true);
            expect(result.message).toBe('Token refreshed successfully');
            expect(result.data?.access_token).toBe('new-mock-token');
            expect(jwt.verify).toHaveBeenCalledWith('valid-refresh-token', expect.any(String));
        });

        it('should reject refresh with invalid token', async () => {
            // Arrange
            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw new Error('Invalid token');
            });

            // Act
            const result = await AuthService.refreshToken('invalid-token');

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toBe('Invalid refresh token');
        });

        it('should reject refresh with expired token', async () => {
            // Arrange
            (jwt.verify as jest.Mock).mockImplementation(() => {
                const error = new Error('jwt expired');
                throw error;
            });

            // Act
            const result = await AuthService.refreshToken('expired-token');

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toBe('Refresh token expired');
        });

        it('should reject refresh for inactive user', async () => {
            // Arrange
            const inactiveUser = { ...mockUser, is_active: false };
            (jwt.verify as jest.Mock).mockReturnValue({ userId: mockUser.id });
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(inactiveUser);

            // Act
            const result = await AuthService.refreshToken('valid-refresh-token');

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toBe('User not found or inactive');
        });

        it('should validate refresh token is provided', async () => {
            // Act
            const result = await AuthService.refreshToken('');

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toBe('Refresh token is required');
        });
    });

    describe('verifyToken', () => {
        it('should verify valid token', () => {
            // Arrange
            const decoded = { userId: 'user-123', iat: 1234567890 };
            (jwt.verify as jest.Mock).mockReturnValue(decoded);

            // Act
            const result = AuthService.verifyToken('valid-token');

            // Assert
            expect(result).toEqual(decoded);
            expect(jwt.verify).toHaveBeenCalledWith('valid-token', expect.any(String));
        });

        it('should return null for invalid token', () => {
            // Arrange
            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw new Error('Invalid token');
            });

            // Act
            const result = AuthService.verifyToken('invalid-token');

            // Assert
            expect(result).toBeNull();
        });

        it('should return null for expired token', () => {
            // Arrange
            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw new Error('jwt expired');
            });

            // Act
            const result = AuthService.verifyToken('expired-token');

            // Assert
            expect(result).toBeNull();
        });
    });
});
