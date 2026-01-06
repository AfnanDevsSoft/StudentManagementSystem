import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Sync existing student users with their RBAC roles
 * This fixes students who were created before RBAC role assignment was added
 */
async function syncStudentRoles() {
    console.log('🔧 Syncing Student Users with RBAC Roles...\n');
    console.log('='.repeat(80));

    try {
        // Find the Student RBAC role
        const studentRbacRole = await prisma.rBACRole.findFirst({
            where: { role_name: 'Student' }
        });

        if (!studentRbacRole) {
            console.log('❌ No "Student" RBAC role found! Please run seed first.');
            return;
        }

        console.log(`\n✅ Found Student RBAC Role: ${studentRbacRole.role_name} (${studentRbacRole.id})`);

        // Find all users with Student role who don't have UserRole entries
        const studentRole = await prisma.role.findFirst({
            where: { name: 'Student' }
        });

        if (!studentRole) {
            console.log('❌ No legacy "Student" role found!');
            return;
        }

        // Get all student users
        const studentUsers = await prisma.user.findMany({
            where: {
                role_id: studentRole.id
            },
            include: {
                user_roles: true,
                branch: true
            }
        });

        console.log(`\n📋 Found ${studentUsers.length} users with Student role`);

        let synced = 0;
        let alreadyHasRole = 0;
        let failed = 0;

        for (const user of studentUsers) {
            // Check if user already has a UserRole entry
            if (user.user_roles.length > 0) {
                alreadyHasRole++;
                continue;
            }

            // Create UserRole entry
            try {
                await prisma.userRole.create({
                    data: {
                        user_id: user.id,
                        rbac_role_id: studentRbacRole.id,
                        branch_id: user.branch_id!,
                        assigned_by: 'SYSTEM_SYNC',  // Required field - using system marker
                    }
                });
                synced++;
                console.log(`   ✅ Synced: ${user.username} (${user.first_name} ${user.last_name})`);
            } catch (err: any) {
                failed++;
                console.log(`   ❌ Failed: ${user.username} - ${err.message}`);
            }
        }

        console.log('\n' + '='.repeat(80));
        console.log('📊 SYNC SUMMARY');
        console.log('='.repeat(80));
        console.log(`   Total Student Users: ${studentUsers.length}`);
        console.log(`   Already Had RBAC Role: ${alreadyHasRole}`);
        console.log(`   Newly Synced: ${synced}`);
        console.log(`   Failed: ${failed}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

syncStudentRoles();
