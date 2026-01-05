
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- DIAGNOSTIC: Permissions & Roles ---');

    // 1. Check if permission exists in DB
    const branchPerm = await prisma.permission.findUnique({
        where: { permission_name: 'branches:read' }
    });
    console.log(`Permission 'branches:read' exists in DB? ${branchPerm ? '✅ YES' : '❌ NO'}`);

    if (!branchPerm) {
        console.log('CRITICAL: The permission record is missing! You need to run a migration script.');
    }

    // 2. Check Roles
    const roles = await prisma.rBACRole.findMany({
        include: {
            permissions: true
        }
    });

    console.log('\n--- Checking Roles ---');
    for (const role of roles) {
        const permNames = role.permissions.map(p => p.permission_name);
        const hasBranchRead = permNames.includes('branches:read');
        console.log(`Role: [${role.role_name}]`);
        console.log(`  > Has 'branches:read'? ${hasBranchRead ? '✅ YES' : '❌ NO'}`);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
