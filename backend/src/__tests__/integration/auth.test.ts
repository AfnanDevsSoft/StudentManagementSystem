import request from 'supertest';
import app from '../../app';
import { prisma, setupTestDatabase, clearDatabase, teardownTestDatabase } from '../setup/testDb';
import { testUsers, testBranch } from '../setup/fixtures';
import { createTestRoles, uniqueId } from '../setup/helpers';

describe('Authentication API Tests', () => {
    let roleIds: any;

    beforeAll(async () => {
        await setupTestDatabase();
    });

    beforeEach(async () => {
        await clearDatabase();

        // Create roles dynamically
        roleIds = await createTestRoles(prisma);

        // Create branch and admin user
        const branch = await prisma.branch.create({ data: testBranch });

        const adminUsername = `admin-auth-${uniqueId('auth')}@test.com`;
        const createdUser = await prisma.user.create({
            data: {
                email: adminUsername,
                username: adminUsername,
                password_hash: testUsers.admin.password_hash,
                first_name: testUsers.admin.first_name,
                last_name: testUsers.admin.last_name,
                phone: testUsers.admin.phone,
                is_active: testUsers.admin.is_active,
                branch_id: branch.id,
                role_id: roleIds.adminId,
            },
        });
    });

    afterAll(async () => {
        await teardownTestDatabase();
    });

    describe('POST /api/v1/auth/login', () => {
        it('should login with valid credentials', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    username: testUsers.admin.username,
                    password: testUsers.admin.password,
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.email).toBe(testUsers.admin.email);
        });

        it('should reject invalid email', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    username: 'invalid@test.com',
                    password: testUsers.admin.password,
                });

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message');
        });

        it('should reject invalid password', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    username: testUsers.admin.username,
                    password: 'WrongPassword123',
                });

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message');
        });

        it('should reject missing fields', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: testUsers.admin.email,
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message');
        });

        it('should verify password is hashed in database', async () => {
            const user = await prisma.user.findUnique({
                where: { email: testUsers.admin.email },
            });

            expect(user).toBeTruthy();
            expect(user!.password_hash).not.toBe(testUsers.admin.password);
            expect(user!.password_hash).toMatch(/^\$2[aby]\$.{56}$/); // bcrypt hash pattern
        });
    });

    describe('POST /api/v1/auth/register', () => {
        it('should register new user with valid data', async () => {
            const newUser = {
                email: 'newuser@test.com',
                username: 'newuser@test.com',
                password: 'NewUser@123',
                first_name: 'New',
                last_name: 'User',
                phone: '+1234567899',
                role_id: roleIds.adminId,
            };

            const response = await request(app)
                .post('/api/v1/auth/register')
                .send(newUser);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.email).toBe(newUser.email);

            // Verify in database
            const dbUser = await prisma.user.findUnique({
                where: { email: newUser.email },
            });
            expect(dbUser).toBeTruthy();
            expect(dbUser!.password_hash).not.toBe(newUser.password);
        });

        it('should reject duplicate email', async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    ...testUsers.admin,
                    password: 'Test@123',
                    role_id: roleIds.adminId,
                });

            expect(response.status).toBe(409);
            expect(response.body).toHaveProperty('message');
        });

        it('should reject weak password', async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    email: 'weak@test.com',
                    username: 'weak@test.com',
                    password: '123',
                    first_name: 'Weak',
                    last_name: 'Password',
                    phone: '+1234567898',
                    role_id: roleIds.adminId,
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message');
        });
    });

    describe('GET /api/v1/auth/me', () => {
        let authToken: string;

        beforeEach(async () => {
            // Login to get token
            const loginResponse = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    username: testUsers.admin.username,
                    password: testUsers.admin.password,
                });

            authToken = loginResponse.body.token || loginResponse.body.access_token;
        });

        it('should return user profile with valid token', async () => {
            const response = await request(app)
                .get('/api/v1/auth/me')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.email).toBe(testUsers.admin.email);
        });

        it('should reject request without token', async () => {
            const response = await request(app)
                .get('/api/v1/auth/me');

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message');
        });

        it('should reject invalid token', async () => {
            const response = await request(app)
                .get('/api/v1/auth/me')
                .set('Authorization', 'Bearer invalid_token_here');

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message');
        });
    });

    describe('POST /api/v1/auth/logout', () => {
        let authToken: string;

        beforeEach(async () => {
            const loginResponse = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    username: testUsers.admin.username,
                    password: testUsers.admin.password,
                });

            authToken = loginResponse.body.token || loginResponse.body.access_token;
        });

        it('should successfully logout', async () => {
            const response = await request(app)
                .post('/api/v1/auth/logout')
                .set('Authorization', `Bearer ${authToken}`);

            expect([200, 204]).toContain(response.status);
        });
    });
});
