
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createSuperAdmin() {
    console.log('🚀 Creating Super Admin User...\n');

    try {
        // 1. Get Main Branch
        let branch = await prisma.branch.findFirst();
        if (!branch) {
            console.log('Creating default branch...');
            branch = await prisma.branch.create({
                data: {
                    name: 'Main Campus',
                    code: 'MAIN',
                    is_active: true
                }
            });
        }
        console.log('✅ Branch used:', branch.name);

        // 2. Create Legacy Role 'SuperAdmin'
        let role = await prisma.role.findFirst({ where: { name: 'SuperAdmin' } });
        if (!role) {
            console.log('Creating SuperAdmin role...');
            role = await prisma.role.create({
                data: {
                    name: 'SuperAdmin',
                    description: 'System Super Administrator',
                    branch_id: branch.id,
                    is_system: true
                }
            });
        }
        console.log('✅ Legacy Role:', role.name);

        // 3. Create RBAC Role 'SuperAdmin' (if RBAC is active)
        // Check if RBACRole model exists in schema (it should based on previous analysis)
        try {
            let rbacRole = await prisma.rBACRole.findFirst({ where: { role_name: 'SuperAdmin' } });
            if (!rbacRole) {
                console.log('Creating RBAC SuperAdmin role...');
                rbacRole = await prisma.rBACRole.create({
                    data: {
                        role_name: 'SuperAdmin',
                        description: 'System Super Administrator',
                        branch_id: branch.id,
                        is_system: true
                    }
                });
            }
            console.log('✅ RBAC Role:', rbacRole.role_name);
        } catch (e: any) {
            console.log('⚠️ RBAC Role creation skipped (Model might not exist or error):', e.message);
        }

        // 4. Create User
        const passwordHash = await bcrypt.hash('admin123', 10);

        await prisma.user.deleteMany({ where: { username: 'superadmin' } });

        const user = await prisma.user.create({
            data: {
                username: 'superadmin',
                email: 'superadmin@school.com',
                password_hash: passwordHash,
                role_id: role.id, // Link to legacy role for now as it's the primary auth
                branch_id: branch.id,
                first_name: 'Super',
                last_name: 'Admin',
                is_active: true
            }
        });

        console.log('\n✅ SUPER ADMIN CREATED SUCCESSFULLY!');
        console.log('username: superadmin');
        console.log('password: admin123');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createSuperAdmin();
