import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testPermissions() {
    const userId = "63215da6-3908-4fd3-bbfa-04563314d4e7"; // branchadmin user ID
    const requiredPermissions = ["branches:read", "teachers:read"];

    console.log("\n🔍 Testing Permission Check for branchadmin user...\n");
    console.log(`User ID: ${userId}`);

    // Test 1: Check user_roles
    const userRoles = await prisma.userRole.findMany({
        where: { user_id: userId },
        include: {
            rbac_role: {
                include: {
                    permissions: true,
                },
            },
        },
    });

    console.log(`\n✅ User has ${userRoles.length} RBAC role(s):`);
    userRoles.forEach((ur) => {
        console.log(`   - ${ur.rbac_role.role_name} (${ur.rbac_role.permissions.length} permissions)`);
    });

    // Test 2: Check specific permissions
    console.log(`\n🔍 Checking specific permissions:`);
    for (const perm of requiredPermissions) {
        const userRolesWithPerm = await prisma.userRole.findMany({
            where: { user_id: userId },
            include: {
                rbac_role: {
                    include: {
                        permissions: {
                            where: { permission_name: perm },
                        },
                    },
                },
            },
        });

        const hasPermission = userRolesWithPerm.some(
            (ur) => ur.rbac_role.permissions.length > 0
        );

        console.log(`   ${perm}: ${hasPermission ? "✅ GRANTED" : "❌ DENIED"}`);

        if (hasPermission) {
            userRolesWithPerm.forEach((ur) => {
                if (ur.rbac_role.permissions.length > 0) {
                    console.log(`      → via ${ur.rbac_role.role_name}`);
                }
            });
        }
    }

    // Test 3: List all permissions
    console.log(`\n📋 All permissions for this user:`);
    const allPerms = new Set<string>();
    userRoles.forEach((ur) => {
        ur.rbac_role.permissions.forEach((p) => {
            allPerms.add(p.permission_name);
        });
    });

    const sortedPerms = Array.from(allPerms).sort();
    sortedPerms.forEach((p) => {
        console.log(`   - ${p}`);
    });

    console.log(`\n📊 Total unique permissions: ${allPerms.size}`);

    await prisma.$disconnect();
}

testPermissions()
    .then(() => {
        console.log("\n✨ Test completed!");
        process.exit(0);
    })
    .catch((error: any) => {
        console.error("\n❌ Test failed:", error);
        process.exit(1);
    });
