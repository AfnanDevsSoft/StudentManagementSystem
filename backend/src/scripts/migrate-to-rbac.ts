import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Migrate existing users from Role system to RBAC system
 * Creates UserRole entries linking User to RBACRole
 */

async function migrateUsersToRBAC() {
    console.log("🔄 Starting User-to-RBAC Migration...\n");

    try {
        // Get all users with their current roles and branches
        const users = await prisma.user.findMany({
            include: {
                role: true,
                branch: true,
            },
        });

        console.log(` Found ${users.length} users to migrate\n`);

        let successCount = 0;
        let skipCount = 0;
        let errorCount = 0;

        for (const user of users) {
            try {
                // Find matching RBAC role for this user
                const rbacRole = await prisma.rBACRole.findFirst({
                    where: {
                        branch_id: user.branch_id,
                        role_name: user.role.name,
                    },
                });

                if (!rbacRole) {
                    console.warn(
                        `⚠️  No RBAC role found for "${user.role.name}" in branch "${user.branch.name}"`
                    );
                    console.warn(`   User: ${user.username} (${user.email})\n`);
                    errorCount++;
                    continue;
                }

                // Check if UserRole already exists
                const existingUserRole = await prisma.userRole.findFirst({
                    where: {
                        user_id: user.id,
                        rbac_role_id: rbacRole.id,
                        branch_id: user.branch_id,
                    },
                });

                if (existingUserRole) {
                    console.log(`✓ User ${user.username} already has RBAC role assigned`);
                    skipCount++;
                    continue;
                }

                // Create UserRole assignment
                await prisma.userRole.create({
                    data: {
                        user_id: user.id,
                        rbac_role_id: rbacRole.id,
                        branch_id: user.branch_id,
                        assigned_by: user.id, // Self-assigned during migration
                        assigned_at: new Date(),
                        // No expiration for migrated roles
                    },
                });

                console.log(
                    `✅ Assigned "${rbacRole.role_name}" to ${user.username} (${user.email})`
                );
                successCount++;
            } catch (error: any) {
                console.error(`❌ Error migrating user ${user.username}:`, error.message);
                errorCount++;
            }
        }

        console.log("\n" + "=".repeat(60));
        console.log("📊 Migration Summary:");
        console.log("=".repeat(60));
        console.log(`Total Users:     ${users.length}`);
        console.log(`✅ Migrated:     ${successCount}`);
        console.log(`⏭️  Skipped:      ${skipCount}`);
        console.log(`❌ Errors:       ${errorCount}`);
        console.log("=".repeat(60) + "\n");

        if (errorCount === 0) {
            console.log("🎉 Migration completed successfully!\n");
        } else {
            console.log(
                "⚠️  Migration completed with errors. Please review the log above.\n"
            );
        }

        // Verification: Check total UserRole count
        const totalUserRoles = await prisma.userRole.count();
        console.log(`📈 Total UserRole records in database: ${totalUserRoles}\n`);

        // Sample verification: Show some migrated users
        console.log("🔍 Sample Verification (first 5 users):");
        const sampleUsers = await prisma.user.findMany({
            take: 5,
            include: {
                role: true,
                user_roles: {
                    include: {
                        rbac_role: {
                            include: {
                                permissions: {
                                    take: 3, // Show first 3 permissions
                                },
                            },
                        },
                    },
                },
            },
        });

        for (const user of sampleUsers) {
            console.log(`\n👤 ${user.username} (${user.role.name}):`);
            if (user.user_roles.length > 0) {
                user.user_roles.forEach((ur) => {
                    console.log(`   ✓ RBAC Role: ${ur.rbac_role.role_name}`);
                    console.log(`   ✓ Permissions: ${ur.rbac_role.permissions.length} total`);
                    console.log(
                        `      Sample: ${ur.rbac_role.permissions.map((p) => p.permission_name).join(", ")}...`
                    );
                });
            } else {
                console.log("   ❌ No RBAC roles assigned!");
            }
        }

        console.log("\n✨ Migration process complete!\n");
    } catch (error: any) {
        console.error("❌ Migration failed:", error);
        throw error;
    }
}

// Run migration
migrateUsersToRBAC()
    .catch((e) => {
        console.error("Fatal error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
