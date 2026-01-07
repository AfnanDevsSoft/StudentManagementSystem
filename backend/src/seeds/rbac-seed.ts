import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Legacy RBAC Seed Script
 * 
 * NOTE: This seed script is DEPRECATED.
 * The init-permissions.ts file now handles all RBAC initialization on server startup.
 * 
 * This file is kept for manual seeding if needed but should not be used in production.
 */

async function seedRBAC() {
    console.log("⚠️  DEPRECATED: Use init-permissions.ts instead");
    console.log("🔐 Running legacy RBAC seed (for manual override only)...");

    // Define all permissions for the system
    const permissionsData = [
        // USER MANAGEMENT
        { permission_name: "users:create", resource: "users", action: "create", description: "Create new users" },
        { permission_name: "users:read", resource: "users", action: "read", description: "View user details" },
        { permission_name: "users:update", resource: "users", action: "update", description: "Update user information" },
        { permission_name: "users:delete", resource: "users", action: "delete", description: "Delete users" },

        // BRANCH MANAGEMENT
        { permission_name: "branches:create", resource: "branches", action: "create", description: "Create new branches" },
        { permission_name: "branches:read", resource: "branches", action: "read", description: "View branch details" },
        { permission_name: "branches:update", resource: "branches", action: "update", description: "Update branch information" },
        { permission_name: "branches:delete", resource: "branches", action: "delete", description: "Delete branches" },

        // Add more as needed...
    ];

    console.log(`📋 Creating ${permissionsData.length} permissions...`);

    // Create permissions (using upsert to avoid duplicates)
    for (const perm of permissionsData) {
        await prisma.permission.upsert({
            where: { permission_name: perm.permission_name },
            update: {},
            create: perm,
        });
    }

    const allPermissions = await prisma.permission.findMany();
    console.log(`✅ Created/verified ${allPermissions.length} permissions!`);

    // Create GLOBAL RBAC roles (not branch-specific)
    console.log(`🏢 Creating global RBAC roles...`);

    const roleConfigs = [
        { role_name: "SuperAdmin", description: "System administrator with full access", perms: allPermissions },
        { role_name: "BranchAdmin", description: "Branch administrator", perms: allPermissions.filter(p => !p.permission_name.includes("system:")) },
        { role_name: "Teacher", description: "Teaching staff", perms: allPermissions.filter(p => p.resource === "courses" || p.resource === "attendance" || p.resource === "grades") },
        { role_name: "Student", description: "Student", perms: allPermissions.filter(p => p.permission_name.includes("read_own") || p.resource === "library") },
    ];

    for (const config of roleConfigs) {
        await prisma.rBACRole.upsert({
            where: { role_name: config.role_name },
            update: {
                permissions: { set: config.perms.map(p => ({ id: p.id })) }
            },
            create: {
                role_name: config.role_name,
                description: config.description,
                is_system: true,
                branch_id: null, // Global role
                permissions: { connect: config.perms.map(p => ({ id: p.id })) },
            },
        });
    }

    const rbacRoles = await prisma.rBACRole.findMany({ include: { permissions: true } });
    console.log(`✅ Created ${rbacRoles.length} global RBAC roles!`);

    console.log("\n✨ Legacy RBAC Seeding completed!");
}

seedRBAC()
    .catch((e: any) => {
        console.error("❌ RBAC Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
