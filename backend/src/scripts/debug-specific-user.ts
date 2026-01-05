import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Debug a specific user's RBAC setup
 */
async function debugSpecificUser() {
    console.log('🔍 DEBUGGING SPECIFIC USER: billa lulu / final role test\n');
    console.log('='.repeat(80));

    try {
        // Find the user by name
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: { contains: 'billa', mode: 'insensitive' } },
                    { first_name: { contains: 'billa', mode: 'insensitive' } },
                    { email: { contains: 'billa', mode: 'insensitive' } }
                ]
            },
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
            orderBy: { created_at: 'desc' }
        });

        // Also find users with "final role test" role
        const usersWithFinalRoleTest = await prisma.user.findMany({
            where: {
                role: {
                    name: { contains: 'final', mode: 'insensitive' }
                }
            },
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

        // Find the "final role test" RBAC role
        const finalRoleTestRbac = await prisma.rBACRole.findFirst({
            where: {
                role_name: { contains: 'final', mode: 'insensitive' }
            },
            include: {
                permissions: true
            }
        });

        // Find the "final role test" legacy role
        const finalRoleTestLegacy = await prisma.role.findFirst({
            where: {
                name: { contains: 'final', mode: 'insensitive' }
            }
        });

        console.log('\n📋 STEP 1: Looking for "final role test" Role\n');

        if (finalRoleTestLegacy) {
            console.log('   ✅ Legacy Role Found:');
            console.log(`      Name: ${finalRoleTestLegacy.name}`);
            console.log(`      ID: ${finalRoleTestLegacy.id}`);
            console.log(`      Branch: ${finalRoleTestLegacy.branch_id}`);
        } else {
            console.log('   ❌ Legacy Role NOT Found!');
        }

        if (finalRoleTestRbac) {
            console.log('\n   ✅ RBAC Role Found:');
            console.log(`      Name: ${finalRoleTestRbac.role_name}`);
            console.log(`      ID: ${finalRoleTestRbac.id}`);
            console.log(`      Branch: ${finalRoleTestRbac.branch_id}`);
            console.log(`      Permissions (${finalRoleTestRbac.permissions.length}):`);
            finalRoleTestRbac.permissions.forEach(p => {
                console.log(`         - ${p.permission_name}`);
            });

            // Check if branches:read is there
            const hasBranchesRead = finalRoleTestRbac.permissions.some(p => p.permission_name === 'branches:read');
            if (hasBranchesRead) {
                console.log('\n      ✅ Has branches:read');
            } else {
                console.log('\n      ❌ MISSING branches:read!');
            }
        } else {
            console.log('\n   ❌ RBAC Role NOT Found!');
        }

        console.log('\n📋 STEP 2: Users with "final role test" role\n');

        if (usersWithFinalRoleTest.length === 0) {
            console.log('   No users found with this role.');
        } else {
            for (const u of usersWithFinalRoleTest) {
                console.log(`   👤 User: ${u.username}`);
                console.log(`      First Name: ${u.first_name}`);
                console.log(`      Last Name: ${u.last_name}`);
                console.log(`      User ID: ${u.id}`);
                console.log(`      Legacy Role: ${u.role?.name} (${u.role_id})`);
                console.log(`      Branch: ${u.branch?.name} (${u.branch_id})`);
                console.log(`      UserRole entries: ${u.user_roles.length}`);

                if (u.user_roles.length === 0) {
                    console.log(`      ❌ NO UserRole ENTRIES!`);
                    console.log(`         This user has NO RBAC permissions!`);
                } else {
                    for (const ur of u.user_roles) {
                        console.log(`         → RBAC Role: ${ur.rbac_role.role_name} (${ur.rbac_role_id})`);
                        console.log(`           Permissions: ${ur.rbac_role.permissions.length}`);
                        const hasBrRead = ur.rbac_role.permissions.some(p => p.permission_name === 'branches:read');
                        console.log(`           Has branches:read: ${hasBrRead ? '✅ YES' : '❌ NO'}`);
                    }
                }
                console.log('');
            }
        }

        console.log('\n📋 STEP 3: All recently created roles\n');

        const recentRoles = await prisma.rBACRole.findMany({
            orderBy: { created_at: 'desc' },
            take: 5,
            include: {
                permissions: true
            }
        });

        for (const role of recentRoles) {
            console.log(`   📦 ${role.role_name} (created: ${role.created_at.toISOString()})`);
            console.log(`      Permissions: ${role.permissions.length}`);
            const hasBrRead = role.permissions.some(p => p.permission_name === 'branches:read');
            console.log(`      Has branches:read: ${hasBrRead ? '✅ YES' : '❌ NO'}`);
        }

        console.log('\n' + '='.repeat(80));
        console.log('📊 DIAGNOSIS COMPLETE');
        console.log('='.repeat(80));

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugSpecificUser();
