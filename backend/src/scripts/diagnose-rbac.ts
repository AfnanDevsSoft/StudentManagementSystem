import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Detailed RBAC Diagnosis Script
 * Traces the complete permission chain for a user
 */
async function diagnoseRBAC() {
    console.log('🔬 DETAILED RBAC DIAGNOSIS\n');
    console.log('='.repeat(80));

    try {
        // =====================================================================
        // STEP 1: Show ALL users with custom roles (non-system roles)
        // =====================================================================
        console.log('\n📋 STEP 1: Users with Custom Roles\n');

        const usersWithCustomRoles = await prisma.user.findMany({
            where: {
                role: {
                    is_system: false
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

        if (usersWithCustomRoles.length === 0) {
            console.log('   No users found with custom roles.');
        } else {
            console.log(`   Found ${usersWithCustomRoles.length} users with custom roles:\n`);
            for (const u of usersWithCustomRoles) {
                console.log(`   👤 ${u.username}`);
                console.log(`      Legacy Role: ${u.role?.name} (ID: ${u.role_id})`);
                console.log(`      Branch: ${u.branch?.name} (ID: ${u.branch_id})`);
                console.log(`      UserRole entries: ${u.user_roles.length}`);
                if (u.user_roles.length > 0) {
                    for (const ur of u.user_roles) {
                        console.log(`         → RBAC Role: ${ur.rbac_role.role_name}`);
                        console.log(`           Branch in UserRole: ${ur.branch_id}`);
                        console.log(`           Permissions count: ${ur.rbac_role.permissions.length}`);
                    }
                }
                console.log('');
            }
        }

        // =====================================================================
        // STEP 2: Check if "branches:read" permission exists
        // =====================================================================
        console.log('\n📋 STEP 2: Check "branches:read" Permission Existence\n');

        const branchesReadPerm = await prisma.permission.findFirst({
            where: { permission_name: 'branches:read' }
        });

        if (branchesReadPerm) {
            console.log(`   ✅ "branches:read" EXISTS`);
            console.log(`      ID: ${branchesReadPerm.id}`);
            console.log(`      Resource: ${branchesReadPerm.resource}`);
            console.log(`      Action: ${branchesReadPerm.action}`);
        } else {
            console.log(`   ❌ "branches:read" DOES NOT EXIST!`);
            console.log(`      This is the root cause! Run fix-permissions.ts script.`);
        }

        // =====================================================================
        // STEP 3: Check which RBAC Roles have "branches:read"
        // =====================================================================
        console.log('\n📋 STEP 3: RBAC Roles with "branches:read" Permission\n');

        const rolesWithBranchesRead = await prisma.rBACRole.findMany({
            where: {
                permissions: {
                    some: {
                        permission_name: 'branches:read'
                    }
                }
            },
            include: {
                permissions: {
                    where: {
                        permission_name: 'branches:read'
                    }
                }
            }
        });

        if (rolesWithBranchesRead.length === 0) {
            console.log(`   ❌ NO ROLES have "branches:read" permission!`);
        } else {
            console.log(`   ${rolesWithBranchesRead.length} roles have "branches:read":`);
            for (const role of rolesWithBranchesRead) {
                console.log(`      ✅ ${role.role_name} (ID: ${role.id})`);
            }
        }

        // =====================================================================
        // STEP 4: Full permission list for custom roles
        // =====================================================================
        console.log('\n📋 STEP 4: Full Permissions for Custom RBAC Roles\n');

        const customRbacRoles = await prisma.rBACRole.findMany({
            where: { is_system: false },
            include: {
                permissions: true
            }
        });

        if (customRbacRoles.length === 0) {
            console.log('   No custom RBAC roles found.');
        } else {
            for (const role of customRbacRoles) {
                console.log(`   📦 Role: ${role.role_name}`);
                console.log(`      Branch: ${role.branch_id}`);
                console.log(`      Is System: ${role.is_system}`);
                if (role.permissions.length === 0) {
                    console.log(`      ❌ NO PERMISSIONS ASSIGNED!`);
                } else {
                    console.log(`      Permissions (${role.permissions.length}):`);
                    role.permissions.forEach(p => {
                        console.log(`         - ${p.permission_name}`);
                    });
                }
                console.log('');
            }
        }

        // =====================================================================
        // STEP 5: Simulate permission check for a test user
        // =====================================================================
        console.log('\n📋 STEP 5: Simulate Permission Check\n');

        // Get a user with a custom role
        const testUser = usersWithCustomRoles[0];
        if (testUser) {
            console.log(`   Testing user: ${testUser.username}`);
            console.log(`   Checking permission: "branches:read"\n`);

            // Simulate what rbac.service.ts checkUserPermission does
            const userRoles = await prisma.userRole.findMany({
                where: { user_id: testUser.id },
                include: {
                    rbac_role: {
                        include: {
                            permissions: {
                                where: { permission_name: 'branches:read' }
                            }
                        }
                    }
                }
            });

            console.log(`   UserRole entries found: ${userRoles.length}`);

            if (userRoles.length === 0) {
                console.log(`   ❌ PROBLEM: No UserRole entries for this user!`);
                console.log(`      The user cannot have any permissions without UserRole entries.`);
            } else {
                const hasPermission = userRoles.some(ur => ur.rbac_role.permissions.length > 0);
                console.log(`   Has "branches:read": ${hasPermission ? '✅ YES' : '❌ NO'}`);

                for (const ur of userRoles) {
                    console.log(`\n   UserRole Entry:`);
                    console.log(`      RBAC Role: ${ur.rbac_role.role_name}`);
                    console.log(`      RBAC Role ID: ${ur.rbac_role_id}`);
                    console.log(`      Matching permissions: ${ur.rbac_role.permissions.length}`);
                    if (ur.rbac_role.permissions.length > 0) {
                        console.log(`      ✅ Found: ${ur.rbac_role.permissions.map(p => p.permission_name).join(', ')}`);
                    } else {
                        console.log(`      ❌ This role does not have "branches:read"`);
                    }
                }
            }
        } else {
            console.log('   No test user with custom role found.');
        }

        // =====================================================================
        // STEP 6: Check SuperAdmin bypass
        // =====================================================================
        console.log('\n📋 STEP 6: SuperAdmin Bypass Check\n');

        const superAdmins = await prisma.user.findMany({
            where: {
                role: { name: 'SuperAdmin' }
            },
            select: {
                username: true,
                role: { select: { name: true } }
            }
        });

        console.log(`   SuperAdmin users: ${superAdmins.length}`);
        superAdmins.forEach(sa => console.log(`      - ${sa.username}`));
        console.log('   (SuperAdmins bypass all permission checks)');

        // =====================================================================
        // SUMMARY
        // =====================================================================
        console.log('\n' + '='.repeat(80));
        console.log('📊 DIAGNOSIS SUMMARY');
        console.log('='.repeat(80));

        const issues: string[] = [];

        if (!branchesReadPerm) {
            issues.push('❌ "branches:read" permission does not exist in database');
        }

        if (rolesWithBranchesRead.length === 0) {
            issues.push('❌ No RBAC roles have "branches:read" permission');
        }

        const rolesWithNoPermissions = customRbacRoles.filter(r => r.permissions.length === 0);
        if (rolesWithNoPermissions.length > 0) {
            issues.push(`❌ ${rolesWithNoPermissions.length} custom roles have ZERO permissions: ${rolesWithNoPermissions.map(r => r.role_name).join(', ')}`);
        }

        if (issues.length === 0) {
            console.log('\n✅ No obvious issues found in RBAC configuration.');
            console.log('\nPossible causes:');
            console.log('  - User needs to log out and log back in to refresh JWT');
            console.log('  - Browser cache may have stale auth token');
            console.log('  - Check browser Network tab for exact error response');
        } else {
            console.log('\n🚨 ISSUES FOUND:\n');
            issues.forEach((issue, i) => console.log(`   ${i + 1}. ${issue}`));
        }

    } catch (error) {
        console.error('❌ Error during diagnosis:', error);
    } finally {
        await prisma.$disconnect();
    }
}

diagnoseRBAC();
