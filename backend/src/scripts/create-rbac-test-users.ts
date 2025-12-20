import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUsers() {
    console.log('🚀 Creating test users for each RBAC role...\n');

    // Get default branch  
    const branch = await prisma.branch.findFirst();
    if (!branch) {
        throw new Error('No branch found. Please seed branches first.');
    }

    // Get all roles for this branch
    const roles = await prisma.role.findMany({
        where: { branch_id: branch.id }
    });

    console.log(`Found ${roles.length} roles: ${roles.map(r => r.name).join(', ')}\n`);

    const testUsers = [
        { username: 'superadmin', email: 'superadmin@test.com', password: 'Super@123', firstName: 'Super', lastName: 'Admin', roleName: 'SuperAdmin' },
        { username: 'branchadmin', email: 'branchadmin@test.com', password: 'Admin@123', firstName: 'Branch', lastName: 'Administrator', roleName: 'BranchAdmin' },
        { username: 'teacher', email: 'teacher@test.com', password: 'Teacher@123', firstName: 'Jane', lastName: 'Teacher', roleName: 'Teacher' },
        { username: 'student', email: 'student@test.com', password: 'Student@123', firstName: 'Alex', lastName: 'Student', roleName: 'Student' }
    ];

    const results = [];

    for (const userData of testUsers) {
        try {
            // Find legacy role
            const role = roles.find(r => r.name === userData.roleName);
            if (!role) {
                console.log(`❌ Role "${userData.roleName}" not found - skipping`);
                continue;
            }

            // Check if user exists
            const existingUser = await prisma.user.findUnique({
                where: { email: userData.email }
            });

            if (existingUser) {
                console.log(`⏭️  User ${userData.email} already exists - skipping`);
                results.push({
                    username: userData.username,
                    email: userData.email,
                    password: userData.password,
                    role: userData.roleName,
                    status: 'EXISTS'
                });
                continue;
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(userData.password, 10);

            // Create user with legacy role
            const user = await prisma.user.create({
                data: {
                    username: userData.username,
                    email: userData.email,
                    password_hash: hashedPassword,
                    first_name: userData.firstName,
                    last_name: userData.lastName,
                    branch_id: branch.id,
                    role_id: role.id,
                    is_active: true
                }
            });

            console.log(`✅ Created: ${userData.email} (${userData.roleName})`);

            results.push({
                username: userData.username,
                email: userData.email,
                password: userData.password,
                role: userData.roleName,
                status: 'CREATED'
            });

        } catch (error: any) {
            console.error(`❌ Error creating ${userData.email}:`, error.message);
            results.push({
                username: userData.username,
                email: userData.email,
                password: userData.password,
                role: userData.roleName,
                status: 'ERROR'
            });
        }
    }

    console.log('\n' + '='.repeat(100));
    console.log('🔐 TEST USER CREDENTIALS - RBAC DEMONSTRATION');
    console.log('='.repeat(100) + '\n');

    console.log('┌─────────────────┬──────────────────────────┬──────────────────┬────────────────┬──────────────┐');
    console.log('│ Username        │ Email                    │ Password         │ Role           │ Status       │');
    console.log('├─────────────────┼──────────────────────────┼──────────────────┼────────────────┼──────────────┤');

    results.forEach(r => {
        const username = r.username.padEnd(15);
        const email = r.email.padEnd(24);
        const password = r.password.padEnd(16);
        const role = r.role.padEnd(14);
        const status = r.status.padEnd(12);
        console.log(`│ ${username} │ ${email} │ ${password} │ ${role} │ ${status} │`);
    });

    console.log('└─────────────────┴──────────────────────────┴──────────────────┴────────────────┴──────────────┘');
    console.log(`\n✅ Summary: ${results.filter(r => r.status === 'CREATED').length} created, ${results.filter(r => r.status === 'EXISTS').length} existing, ${results.filter(r => r.status === 'ERROR').length} errors`);
    console.log('='.repeat(100) + '\n');

    console.log('💡 Quick Start Guide:');
    console.log('   1. Navigate to: http://localhost:3001/');
    console.log('   2. Login with USERNAME or EMAIL + PASSWORD from above');
    console.log('   3. Test permission-based access based on your role');
    console.log('   4. Try accessing restricted routes to see 403 Forbidden responses');
    console.log('');
    console.log('📊 Permission Overview:');
    console.log('   • SuperAdmin    ➜ Full system access (all permissions)');
    console.log('   • BranchAdmin   ➜ Branch management, user administration');
    console.log('   • Teacher       ➜ Course management, student grades, attendance');
    console.log('   • Student       ➜ View courses, grades, assignments (read-only)');
    console.log('');

    return results;
}

createTestUsers()
    .then(() => {
        console.log('✨ Test user creation completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
