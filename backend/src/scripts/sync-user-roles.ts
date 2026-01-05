import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function syncUserRoles() {
    console.log('🔧 Syncing all users with their RBAC roles...\n');

    try {
        // Get all users with their legacy roles
        const users = await prisma.user.findMany({
            include: {
                role: true,
                branch: true,
            }
        });

        console.log(`Found ${users.length} users to process.\n`);

        let synced = 0;
        let skipped = 0;
        let errors = 0;

        for (const user of users) {
            try {
                // Skip users without a role
                if (!user.role) {
                    console.log(`⏭️  ${user.username} - No legacy role assigned, skipping`);
                    skipped++;
                    continue;
                }

                // Check if user already has a UserRole entry
                const existingUserRole = await prisma.userRole.findFirst({
                    where: { user_id: user.id }
                });

                if (existingUserRole) {
                    console.log(`✅ ${user.username} - Already has UserRole entry`);
                    skipped++;
                    continue;
                }

                // Find matching RBAC role by name
                const rbacRole = await prisma.rBACRole.findFirst({
                    where: { role_name: user.role.name }
                });

                if (!rbacRole) {
                    console.log(`⚠️  ${user.username} - No RBAC role found for "${user.role.name}"`);
                    errors++;
                    continue;
                }

                // Create UserRole entry
                await prisma.userRole.create({
                    data: {
                        user_id: user.id,
                        rbac_role_id: rbacRole.id,
                        branch_id: user.branch_id,
                        assigned_by: user.id, // Self-assigned during migration
                    }
                });

                console.log(`🔗 ${user.username} - Linked to RBAC role "${rbacRole.role_name}"`);
                synced++;

            } catch (err: any) {
                console.log(`❌ ${user.username} - Error: ${err.message}`);
                errors++;
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log(`📊 Summary:`);
        console.log(`   ✅ Synced: ${synced}`);
        console.log(`   ⏭️  Skipped (already have UserRole): ${skipped}`);
        console.log(`   ❌ Errors: ${errors}`);
        console.log('='.repeat(60));

        if (synced > 0) {
            console.log('\n🎉 Users should now have proper RBAC permissions!');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

syncUserRoles();
