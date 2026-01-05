import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixOrphanedRoles() {
    console.log('🔧 Fixing orphaned RBAC roles with null branch_id...\n');

    try {
        // Get the first available branch to use as default
        const defaultBranch = await prisma.branch.findFirst({
            where: { is_active: true },
            orderBy: { created_at: 'asc' }
        });

        if (!defaultBranch) {
            console.error('❌ No active branches found in database!');
            process.exit(1);
        }

        console.log(`📍 Using default branch: ${defaultBranch.name} (${defaultBranch.id})\n`);

        // Find all RBAC roles with null branch_id
        const orphanedRoles = await prisma.rBACRole.findMany({
            where: { branch_id: null }
        });

        if (orphanedRoles.length === 0) {
            console.log('✅ No orphaned roles found. All roles have valid branch_id.');
            return;
        }

        console.log(`Found ${orphanedRoles.length} orphaned role(s):\n`);
        orphanedRoles.forEach(role => {
            console.log(`  - ${role.role_name} (${role.id})`);
        });

        console.log('\n🔄 Updating roles...\n');

        // Update all orphaned roles with the default branch_id
        const result = await prisma.rBACRole.updateMany({
            where: { branch_id: null },
            data: { branch_id: defaultBranch.id }
        });

        console.log(`✅ Successfully updated ${result.count} role(s) with branch_id: ${defaultBranch.id}`);
        console.log('\n🎉 Fix complete! Users with these roles should now have proper access.');

    } catch (error) {
        console.error('❌ Error fixing orphaned roles:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

fixOrphanedRoles();
