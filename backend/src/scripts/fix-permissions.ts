
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔧 Fixing Missing Permissions...');

    // Define critical missing permissions
    const newPermissions = [
        { permission_name: "branches:create", resource: "branches", action: "create", description: "Create new branches" },
        { permission_name: "branches:read", resource: "branches", action: "read", description: "View branch details" },
        { permission_name: "branches:update", resource: "branches", action: "update", description: "Update branch information" },
        { permission_name: "branches:delete", resource: "branches", action: "delete", description: "Delete branches" },

        { permission_name: "health:create", resource: "health", action: "create", description: "Create health records" },
        { permission_name: "health:read", resource: "health", action: "read", description: "View health records" },
        { permission_name: "health:update", resource: "health", action: "update", description: "Update health records" },
        { permission_name: "health:delete", resource: "health", action: "delete", description: "Delete health records" },

        { permission_name: "scholarships:create", resource: "scholarships", action: "create", description: "Create scholarships" },
        { permission_name: "scholarships:read", resource: "scholarships", action: "read", description: "View scholarships" },
        { permission_name: "scholarships:update", resource: "scholarships", action: "update", description: "Update scholarships" },
        { permission_name: "scholarships:delete", resource: "scholarships", action: "delete", description: "Delete scholarships" },

        { permission_name: "system:settings", resource: "system", action: "settings", description: "Modify system settings" },
    ];

    let addedCount = 0;

    for (const perm of newPermissions) {
        const exists = await prisma.permission.findUnique({
            where: { permission_name: perm.permission_name }
        });

        if (!exists) {
            await prisma.permission.create({ data: perm });
            console.log(`✅ Added permission: ${perm.permission_name}`);
            addedCount++;
        } else {
            console.log(`ℹ️  Permission exists: ${perm.permission_name}`);
        }
    }

    console.log(`\n🎉 Done! Added ${addedCount} missing permissions.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
