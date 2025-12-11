/**
 * Simple Test User Creator
 * Creates users with easy-to-type credentials
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUsers() {
    console.log('🚀 Creating simple test users...\n');

    try {
        // Get the first branch
        let branch = await prisma.branch.findFirst();
        if (!branch) {
            console.log('Creating branch...');
            branch = await prisma.branch.create({
                data: {
                    name: 'Main Campus',
                    code: 'MAIN',
                    is_active: true
                }
            });
        }
        console.log('✅ Branch:', branch.name);

        // Get or create roles
        let adminRole = await prisma.role.findFirst({ where: { name: 'admin' } });
        let teacherRole = await prisma.role.findFirst({ where: { name: 'teacher' } });
        let studentRole = await prisma.role.findFirst({ where: { name: 'student' } });

        if (!adminRole) {
            adminRole = await prisma.role.create({
                data: { name: 'admin', description: 'Admin', branch_id: branch.id }
            });
        }
        if (!teacherRole) {
            teacherRole = await prisma.role.create({
                data: { name: 'teacher', description: 'Teacher', branch_id: branch.id }
            });
        }
        if (!studentRole) {
            studentRole = await prisma.role.create({
                data: { name: 'student', description: 'Student', branch_id: branch.id }
            });
        }

        // Simple password: test123
        const passwordHash = await bcrypt.hash('test123', 10);

        // Test credentials
        const users = [
            { username: 'admin', email: 'admin@test.com', role: 'admin', roleId: adminRole.id, firstName: 'Admin', lastName: 'User' },
            { username: 'teacher', email: 'teacher@test.com', role: 'teacher', roleId: teacherRole.id, firstName: 'Teacher', lastName: 'One' },
            { username: 'student', email: 'student@test.com', role: 'student', roleId: studentRole.id, firstName: 'Student', lastName: 'One' }
        ];

        for (const userData of users) {
            // Delete if exists
            await prisma.user.deleteMany({ where: { username: userData.username } });

            // Create new
            const user = await prisma.user.create({
                data: {
                    username: userData.username,
                    email: userData.email,
                    password_hash: passwordHash,
                    role_id: userData.roleId,
                    branch_id: branch.id,
                    first_name: userData.firstName,
                    last_name: userData.lastName,
                    is_active: true
                }
            });
            console.log(`✅ Created ${userData.role}: ${userData.username}`);
        }

        console.log('\n' + '='.repeat(50));
        console.log('🎉 TEST USERS CREATED!');
        console.log('='.repeat(50));
        console.log('\n📋 LOGIN CREDENTIALS (use these exactly):');
        console.log('-'.repeat(50));
        console.log('\n👤 ADMIN:');
        console.log('   Username: admin');
        console.log('   Password: test123');
        console.log('\n👨‍🏫 TEACHER:');
        console.log('   Username: teacher');
        console.log('   Password: test123');
        console.log('\n👨‍🎓 STUDENT:');
        console.log('   Username: student');
        console.log('   Password: test123');
        console.log('\n' + '='.repeat(50));

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

createTestUsers();
