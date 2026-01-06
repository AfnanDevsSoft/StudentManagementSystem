import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugUser() {
    const username = 'stdeeeeee';

    console.log(`\n🔍 Debugging user: ${username}\n`);
    console.log('='.repeat(80));

    try {
        // Find the user
        const user = await prisma.user.findUnique({
            where: { username },
            include: {
                role: true,
                branch: true,
                user_roles: {
                    include: {
                        rbac_role: {
                            include: {
                                permissions: true
                            }
                        }
                    }
                }
            }
        });

        if (!user) {
            console.log(`❌ User "${username}" not found!`);
            return;
        }

        console.log('\n📋 USER INFO:');
        console.log(`   ID: ${user.id}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Name: ${user.first_name} ${user.last_name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Active: ${user.is_active}`);
        console.log(`   Branch ID: ${user.branch_id}`);
        console.log(`   Branch: ${user.branch?.name || 'N/A'}`);

        console.log('\n📋 LEGACY ROLE:');
        console.log(`   Role ID: ${user.role_id}`);
        console.log(`   Role Name: ${user.role?.name || 'N/A'}`);

        console.log('\n📋 RBAC ROLES (UserRole entries):');
        if (user.user_roles.length === 0) {
            console.log('   ❌ NO UserRole entries! User has no RBAC permissions!');
        } else {
            for (const ur of user.user_roles) {
                console.log(`   ✅ RBAC Role: ${ur.rbac_role.role_name}`);
                console.log(`      Branch ID: ${ur.branch_id}`);
                console.log(`      Permissions (${ur.rbac_role.permissions.length}):`);
                for (const perm of ur.rbac_role.permissions) {
                    console.log(`         - ${perm.permission_name}`);
                }
            }
        }

        // Check if Student RBAC role exists
        console.log('\n📋 STUDENT RBAC ROLE CHECK:');
        const studentRbacRole = await prisma.rBACRole.findFirst({
            where: { role_name: 'Student' },
            include: { permissions: true }
        });

        if (!studentRbacRole) {
            console.log('   ❌ No "Student" RBAC role exists in the system!');
            console.log('   This needs to be created via seed or manually.');
        } else {
            console.log(`   ✅ Student RBAC Role exists: ${studentRbacRole.id}`);
            console.log(`   Permissions: ${studentRbacRole.permissions.map(p => p.permission_name).join(', ')}`);
        }

        // If user has no UserRole, offer to fix
        if (user.user_roles.length === 0 && studentRbacRole && user.branch_id) {
            console.log('\n🔧 FIXING: Creating UserRole entry...');

            // Get a superadmin for assigned_by
            const superadmin = await prisma.user.findFirst({
                where: { role: { name: 'SuperAdmin' } }
            });

            await prisma.userRole.create({
                data: {
                    user_id: user.id,
                    rbac_role_id: studentRbacRole.id,
                    branch_id: user.branch_id,
                    assigned_by: superadmin?.id || user.id,
                }
            });
            console.log('   ✅ UserRole created! User should now have permissions.');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugUser();
