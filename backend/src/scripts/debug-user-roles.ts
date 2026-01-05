import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugUserRoles() {
    console.log('🔍 Debugging User Roles and RBAC Assignments...\n');

    try {
        // Get all users with their roles
        const users = await prisma.user.findMany({
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
            },
            take: 20 // Limit for debugging
        });

        console.log(`Found ${users.length} users:\n`);
        console.log('='.repeat(100));

        for (const user of users) {
            console.log(`\n👤 User: ${user.username} (${user.id})`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Branch: ${user.branch?.name || 'None'} (${user.branch_id})`);
            console.log(`   Legacy Role: ${user.role?.name || 'None'} (${user.role_id})`);

            if (user.user_roles.length === 0) {
                console.log(`   ❌ NO UserRole ENTRIES - User has no RBAC permissions!`);
            } else {
                console.log(`   ✅ UserRole entries: ${user.user_roles.length}`);
                for (const ur of user.user_roles) {
                    console.log(`      - RBAC Role: ${ur.rbac_role.role_name} (${ur.rbac_role_id})`);
                    console.log(`        Branch: ${ur.branch_id}`);
                    console.log(`        Permissions: ${ur.rbac_role.permissions.length}`);
                    if (ur.rbac_role.permissions.length > 0) {
                        console.log(`        Sample: ${ur.rbac_role.permissions.slice(0, 5).map(p => p.permission_name).join(', ')}...`);
                    }
                }
            }
            console.log('-'.repeat(100));
        }

        // Also check for orphaned RBACRoles (roles without any legacy Role counterpart)
        console.log('\n\n📋 Checking Role Sync (Legacy Role vs RBAC Role):\n');

        const legacyRoles = await prisma.role.findMany();
        const rbacRoles = await prisma.rBACRole.findMany();

        console.log(`Legacy Roles: ${legacyRoles.length}`);
        legacyRoles.forEach(r => console.log(`  - ${r.name} (${r.id})`));

        console.log(`\nRBAC Roles: ${rbacRoles.length}`);
        rbacRoles.forEach(r => console.log(`  - ${r.role_name} (${r.id}) | branch: ${r.branch_id || 'null'}`));

        // Find mismatches
        const legacyNames = new Set(legacyRoles.map(r => r.name));
        const rbacNames = new Set(rbacRoles.map(r => r.role_name));

        const inRbacNotLegacy = [...rbacNames].filter(n => !legacyNames.has(n));
        const inLegacyNotRbac = [...legacyNames].filter(n => !rbacNames.has(n));

        if (inRbacNotLegacy.length > 0) {
            console.log(`\n⚠️  RBAC Roles without Legacy Role: ${inRbacNotLegacy.join(', ')}`);
        }
        if (inLegacyNotRbac.length > 0) {
            console.log(`\n⚠️  Legacy Roles without RBAC Role: ${inLegacyNotRbac.join(', ')}`);
        }

        if (inRbacNotLegacy.length === 0 && inLegacyNotRbac.length === 0) {
            console.log('\n✅ All roles are properly synced between Legacy and RBAC tables.');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugUserRoles();
