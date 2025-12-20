import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Enhanced RBAC Seed Script
 * Seeds permissions, RBAC roles, and links them to the existing role system
 */

async function seedRBAC() {
    console.log("🔐 Seeding RBAC System...");

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

        // ROLE MANAGEMENT
        { permission_name: "roles:create", resource: "roles", action: "create", description: "Create new roles" },
        { permission_name: "roles:read", resource: "roles", action: "read", description: "View role details" },
        { permission_name: "roles:update", resource: "roles", action: "update", description: "Update role permissions" },
        { permission_name: "roles:delete", resource: "roles", action: "delete", description: "Delete roles" },

        // STUDENT MANAGEMENT
        { permission_name: "students:create", resource: "students", action: "create", description: "Create new students" },
        { permission_name: "students:read", resource: "students", action: "read", description: "View student details" },
        { permission_name: "students:update", resource: "students", action: "update", description: "Update student information" },
        { permission_name: "students:delete", resource: "students", action: "delete", description: "Delete students" },
        { permission_name: "students:read_own", resource: "students", action: "read_own", description: "View own student profile" },

        // TEACHER MANAGEMENT
        { permission_name: "teachers:create", resource: "teachers", action: "create", description: "Create new teachers" },
        { permission_name: "teachers:read", resource: "teachers", action: "read", description: "View teacher details" },
        { permission_name: "teachers:update", resource: "teachers", action: "update", description: "Update teacher information" },
        { permission_name: "teachers:delete", resource: "teachers", action: "delete", description: "Delete teachers" },

        // COURSE MANAGEMENT
        { permission_name: "courses:create", resource: "courses", action: "create", description: "Create new courses" },
        { permission_name: "courses:read", resource: "courses", action: "read", description: "View course details" },
        { permission_name: "courses:update", resource: "courses", action: "update", description: "Update course information" },
        { permission_name: "courses:delete", resource: "courses", action: "delete", description: "Delete courses" },

        // ATTENDANCE MANAGEMENT
        { permission_name: "attendance:create", resource: "attendance", action: "create", description: "Mark attendance" },
        { permission_name: "attendance:read", resource: "attendance", action: "read", description: "View attendance records" },
        { permission_name: "attendance:update", resource: "attendance", action: "update", description: "Update attendance records" },
        { permission_name: "attendance:delete", resource: "attendance", action: "delete", description: "Delete attendance records" },
        { permission_name: "attendance:read_own", resource: "attendance", action: "read_own", description: "View own attendance" },

        // GRADE MANAGEMENT
        { permission_name: "grades:create", resource: "grades", action: "create", description: "Enter grades" },
        { permission_name: "grades:read", resource: "grades", action: "read", description: "View grade records" },
        { permission_name: "grades:update", resource: "grades", action: "update", description: "Update grades" },
        { permission_name: "grades:delete", resource: "grades", action: "delete", description: "Delete grades" },
        { permission_name: "grades:read_own", resource: "grades", action: "read_own", description: "View own grades" },

        // ADMISSION MANAGEMENT
        { permission_name: "admissions:create", resource: "admissions", action: "create", description: "Create admission applications" },
        { permission_name: "admissions:read", resource: "admissions", action: "read", description: "View admissions" },
        { permission_name: "admissions:update", resource: "admissions", action: "update", description: "Update admission status" },
        { permission_name: "admissions:delete", resource: "admissions", action: "delete", description: "Delete admissions" },

        // FINANCE MANAGEMENT
        { permission_name: "finance:create", resource: "finance", action: "create", description: "Create fee records" },
        { permission_name: "finance:read", resource: "finance", action: "read", description: "View financial records" },
        { permission_name: "finance:update", resource: "finance", action: "update", description: "Update financial records" },
        { permission_name: "finance:read_own", resource: "finance", action: "read_own", description: "View own fee status" },

        // PAYROLL MANAGEMENT
        { permission_name: "payroll:create", resource: "payroll", action: "create", description: "Generate payroll" },
        { permission_name: "payroll:read", resource: "payroll", action: "read", description: "View payroll records" },
        { permission_name: "payroll:update", resource: "payroll", action: "update", description: "Update payroll" },
        { permission_name: "payroll:read_own", resource: "payroll", action: "read_own", description: "View own payroll" },

        // LIBRARY MANAGEMENT
        { permission_name: "library:create", resource: "library", action: "create", description: "Add library items" },
        { permission_name: "library:read", resource: "library", action: "read", description: "View library catalog" },
        { permission_name: "library:update", resource: "library", action: "update", description: "Update library items" },
        { permission_name: "library:delete", resource: "library", action: "delete", description: "Delete library items" },

        // HEALTH RECORDS
        { permission_name: "health:create", resource: "health", action: "create", description: "Create health records" },
        { permission_name: "health:read", resource: "health", action: "read", description: "View health records" },
        { permission_name: "health:update", resource: "health", action: "update", description: "Update health records" },

        // ANALYTICS & REPORTS
        { permission_name: "analytics:read", resource: "analytics", action: "read", description: "View analytics and reports" },
        { permission_name: "reports:generate", resource: "reports", action: "generate", description: "Generate reports" },
        { permission_name: "reports:export", resource: "reports", action: "export", description: "Export data" },

        // ANNOUNCEMENTS & MESSAGING
        { permission_name: "announcements:create", resource: "announcements", action: "create", description: "Create announcements" },
        { permission_name: "announcements:read", resource: "announcements", action: "read", description: "View announcements" },
        { permission_name: "messaging:send", resource: "messaging", action: "send", description: "Send messages" },
        { permission_name: "messaging:read", resource: "messaging", action: "read", description: "Read messages" },

        // ASSIGNMENTS
        { permission_name: "assignments:create", resource: "assignments", action: "create", description: "Create assignments" },
        { permission_name: "assignments:read", resource: "assignments", action: "read", description: "View assignments" },
        { permission_name: "assignments:update", resource: "assignments", action: "update", description: "Update assignments" },
        { permission_name: "assignments:submit", resource: "assignments", action: "submit", description: "Submit assignments" },

        // SYSTEM ADMINISTRATION
        { permission_name: "system:settings", resource: "system", action: "settings", description: "Modify system settings" },
        { permission_name: "system:audit", resource: "system", action: "audit", description: "View audit logs" },
        { permission_name: "system:backup", resource: "system", action: "backup", description: "Manage backups" },
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

    // Get all branches to create RBAC roles for each
    const branches = await prisma.branch.findMany();

    console.log(`🏢 Creating RBAC roles for ${branches.length} branches...`);

    for (const branch of branches) {
        // SUPER ADMIN RBAC ROLE (All Permissions)
        const superAdminPerms = allPermissions.map((p) => ({ id: p.id }));
        await prisma.rBACRole.upsert({
            where: {
                branch_id_role_name: {
                    branch_id: branch.id,
                    role_name: "SuperAdmin"
                }
            },
            update: {},
            create: {
                branch_id: branch.id,
                role_name: "SuperAdmin",
                description: "System administrator with full access to all resources",
                is_system: true,
                permissions: {
                    connect: superAdminPerms,
                },
            },
        });

        // BRANCH ADMIN RBAC ROLE
        const branchAdminPermNames = [
            "users:create", "users:read", "users:update",
            "students:create", "students:read", "students:update", "students:delete",
            "teachers:create", "teachers:read", "teachers:update", "teachers:delete",
            "courses:create", "courses:read", "courses:update", "courses:delete",
            "attendance:create", "attendance:read", "attendance:update",
            "grades:create", "grades:read", "grades:update",
            "admissions:create", "admissions:read", "admissions:update",
            "finance:create", "finance:read", "finance:update",
            "payroll:create", "payroll:read", "payroll:update",
            "library:create", "library:read", "library:update",
            "health:create", "health:read", "health:update",
            "analytics:read", "reports:generate", "reports:export",
            "announcements:create", "announcements:read",
            "messaging:send", "messaging:read",
        ];
        const branchAdminPerms = allPermissions
            .filter((p) => branchAdminPermNames.includes(p.permission_name))
            .map((p) => ({ id: p.id }));

        await prisma.rBACRole.upsert({
            where: {
                branch_id_role_name: {
                    branch_id: branch.id,
                    role_name: "BranchAdmin"
                }
            },
            update: {},
            create: {
                branch_id: branch.id,
                role_name: "BranchAdmin",
                description: "Branch administrator with management access to branch resources",
                is_system: true,
                permissions: {
                    connect: branchAdminPerms,
                },
            },
        });

        // TEACHER RBAC ROLE
        const teacherPermNames = [
            "students:read",
            "courses:read", "courses:update",
            "attendance:create", "attendance:read", "attendance:update",
            "grades:create", "grades:read", "grades:update",
            "assignments:create", "assignments:read", "assignments:update",
            "announcements:create", "announcements:read",
            "messaging:send", "messaging:read",
            "library:read",
            "payroll:read_own",
        ];
        const teacherPerms = allPermissions
            .filter((p) => teacherPermNames.includes(p.permission_name))
            .map((p) => ({ id: p.id }));

        await prisma.rBACRole.upsert({
            where: {
                branch_id_role_name: {
                    branch_id: branch.id,
                    role_name: "Teacher"
                }
            },
            update: {},
            create: {
                branch_id: branch.id,
                role_name: "Teacher",
                description: "Teaching staff with access to classes and student management",
                is_system: true,
                permissions: {
                    connect: teacherPerms,
                },
            },
        });

        // STUDENT RBAC ROLE
        const studentPermNames = [
            "students:read_own",
            "courses:read",
            "attendance:read_own",
            "grades:read_own",
            "assignments:read", "assignments:submit",
            "announcements:read",
            "messaging:read",
            "library:read",
            "finance:read_own",
        ];
        const studentPerms = allPermissions
            .filter((p) => studentPermNames.includes(p.permission_name))
            .map((p) => ({ id: p.id }));

        await prisma.rBACRole.upsert({
            where: {
                branch_id_role_name: {
                    branch_id: branch.id,
                    role_name: "Student"
                }
            },
            update: {},
            create: {
                branch_id: branch.id,
                role_name: "Student",
                description: "Student with access to own academic records",
                is_system: true,
                permissions: {
                    connect: studentPerms,
                },
            },
        });
    }

    const rbacRoles = await prisma.rBACRole.findMany({
        include: { permissions: true },
    });

    console.log(`✅ Created ${rbacRoles.length} RBAC roles across all branches!`);
    console.log("\n📊 RBAC Role Summary:");
    rbacRoles.forEach((role) => {
        console.log(`   - ${role.role_name} (${role.branch_id.substring(0, 8)}...): ${role.permissions.length} permissions`);
    });

    console.log("\n✨ RBAC Seeding completed successfully!");
}

seedRBAC()
    .catch((e: any) => {
        console.error("❌ RBAC Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
