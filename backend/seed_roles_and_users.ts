
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedRolesAndUsers() {
    console.log('🚀 Seeding Roles and Users (BranchAdmin, Teacher, Student)...');

    try {
        // 1. Get Main Branch
        const branch = await prisma.branch.findFirst({ where: { code: 'MAIN' } });
        if (!branch) {
            console.error('❌ Main Branch not found. Please run create_super_admin.ts first.');
            return;
        }

        // Roles to Create
        const rolesToSeed = [
            { name: 'BranchAdmin', description: 'Branch Administrator' },
            { name: 'Teacher', description: 'Academic Teacher' },
            { name: 'Student', description: 'Student' }
        ];

        for (const roleDef of rolesToSeed) {
            console.log(`\n--- Processing Role: ${roleDef.name} ---`);

            // 2. Legacy Role
            let role = await prisma.role.findFirst({
                where: { name: { equals: roleDef.name, mode: 'insensitive' } }
            });

            if (!role) {
                console.log(`Creating Legacy Role ${roleDef.name}...`);
                role = await prisma.role.create({
                    data: {
                        name: roleDef.name,
                        description: roleDef.description,
                        branch_id: branch.id
                    }
                });
            } else {
                console.log(`Legacy Role ${roleDef.name} exists.`);
            }

            // 3. RBAC Role
            try {
                let rbacRole = await prisma.rBACRole.findFirst({
                    where: { role_name: { equals: roleDef.name, mode: 'insensitive' } }
                });

                if (!rbacRole) {
                    console.log(`Creating RBAC Role ${roleDef.name}...`);
                    rbacRole = await prisma.rBACRole.create({
                        data: {
                            role_name: roleDef.name,
                            description: roleDef.description,
                            branch_id: branch.id,
                            is_system: false
                        }
                    });
                } else {
                    console.log(`RBAC Role ${roleDef.name} exists.`);
                }
            } catch (e: any) {
                console.log(`⚠️ Skipped RBAC for ${roleDef.name}`);
            }

            // 4. Create User
            const username = roleDef.name.toLowerCase(); // branchadmin, teacher, student
            const email = `${username}@school.com`;
            const passwordHash = await bcrypt.hash('test1234', 10);

            await prisma.user.deleteMany({ where: { username } });

            const user = await prisma.user.create({
                data: {
                    username: username,
                    email: email,
                    password_hash: passwordHash,
                    role_id: role.id,
                    branch_id: branch.id,
                    first_name: roleDef.name,
                    last_name: 'User',
                    is_active: true
                }
            });
            console.log(`✅ User created: ${username} / test1234`);
        }

        console.log('\n✅ SEEDING COMPLETE');

    } catch (error: any) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedRolesAndUsers();
