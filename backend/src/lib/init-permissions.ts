import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Initialize RBAC System on Backend Startup
 * 
 * This function runs EVERY time the backend starts and ensures:
 * 1. All permissions exist in the database
 * 2. Global RBAC roles exist (SuperAdmin, BranchAdmin, Teacher, Student)
 * 3. SuperAdmin user is created if not exists
 * 4. Existing users are synced with their RBAC roles
 */

// ============================================================
// PERMISSION DEFINITIONS
// ============================================================
const ALL_PERMISSIONS = [
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

    // ENROLLMENT MANAGEMENT (NEW)
    { permission_name: "enrollments:create", resource: "enrollments", action: "create", description: "Enroll students in courses" },
    { permission_name: "enrollments:read", resource: "enrollments", action: "read", description: "View enrollment records" },
    { permission_name: "enrollments:update", resource: "enrollments", action: "update", description: "Update enrollment status" },
    { permission_name: "enrollments:delete", resource: "enrollments", action: "delete", description: "Delete enrollments" },

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

    // SCHOLARSHIPS (NEW)
    { permission_name: "scholarships:create", resource: "scholarships", action: "create", description: "Create scholarships" },
    { permission_name: "scholarships:read", resource: "scholarships", action: "read", description: "View scholarships" },
    { permission_name: "scholarships:update", resource: "scholarships", action: "update", description: "Update scholarships" },
    { permission_name: "scholarships:delete", resource: "scholarships", action: "delete", description: "Delete scholarships" },

    // ANALYTICS & REPORTS
    { permission_name: "analytics:read", resource: "analytics", action: "read", description: "View analytics and reports" },
    { permission_name: "reports:generate", resource: "reports", action: "generate", description: "Generate reports" },
    { permission_name: "reports:export", resource: "reports", action: "export", description: "Export data" },

    // ANNOUNCEMENTS & MESSAGING
    { permission_name: "announcements:create", resource: "announcements", action: "create", description: "Create announcements" },
    { permission_name: "announcements:read", resource: "announcements", action: "read", description: "View announcements" },
    { permission_name: "messaging:send", resource: "messaging", action: "send", description: "Send messages" },
    { permission_name: "messaging:read", resource: "messaging", action: "read", description: "Read messages" },

    // CHAT (Real-time messaging)
    { permission_name: "chat:read", resource: "chat", action: "read", description: "View chat conversations and messages" },
    { permission_name: "chat:send", resource: "chat", action: "send", description: "Send chat messages and create conversations" },

    // ASSIGNMENTS
    { permission_name: "assignments:create", resource: "assignments", action: "create", description: "Create assignments" },
    { permission_name: "assignments:read", resource: "assignments", action: "read", description: "View assignments" },
    { permission_name: "assignments:update", resource: "assignments", action: "update", description: "Update assignments" },
    { permission_name: "assignments:submit", resource: "assignments", action: "submit", description: "Submit assignments" },

    // LEAVE MANAGEMENT
    { permission_name: "leave:create", resource: "leave", action: "create", description: "Create leave requests" },
    { permission_name: "leave:read", resource: "leave", action: "read", description: "View leave requests" },
    { permission_name: "leave:update", resource: "leave", action: "update", description: "Update/approve leave" },
    { permission_name: "leave:delete", resource: "leave", action: "delete", description: "Delete leave requests" },

    // EVENTS
    { permission_name: "events:create", resource: "events", action: "create", description: "Create events" },
    { permission_name: "events:read", resource: "events", action: "read", description: "View events" },
    { permission_name: "events:update", resource: "events", action: "update", description: "Update events" },
    { permission_name: "events:delete", resource: "events", action: "delete", description: "Delete events" },

    // SYSTEM ADMINISTRATION
    { permission_name: "system:admin", resource: "system", action: "admin", description: "Full system administration access" },
    { permission_name: "system:settings", resource: "system", action: "settings", description: "Modify system settings" },
    { permission_name: "system:audit", resource: "system", action: "audit", description: "View audit logs" },
    { permission_name: "system:backup", resource: "system", action: "backup", description: "Manage backups" },
];

// ============================================================
// ROLE PERMISSION MAPPING
// ============================================================

// BranchAdmin: Full access to branch-level operations
const BRANCH_ADMIN_PERMISSIONS = [
    "branches:read", "branches:update",
    "users:create", "users:read", "users:update", "users:delete",
    "roles:read",
    "students:create", "students:read", "students:update", "students:delete",
    "teachers:create", "teachers:read", "teachers:update", "teachers:delete",
    "courses:create", "courses:read", "courses:update", "courses:delete",
    "enrollments:create", "enrollments:read", "enrollments:update", "enrollments:delete",
    "attendance:create", "attendance:read", "attendance:update", "attendance:delete",
    "grades:create", "grades:read", "grades:update", "grades:delete",
    "admissions:create", "admissions:read", "admissions:update", "admissions:delete",
    "finance:create", "finance:read", "finance:update",
    "payroll:create", "payroll:read", "payroll:update",
    "library:create", "library:read", "library:update", "library:delete",
    "health:create", "health:read", "health:update",
    "scholarships:create", "scholarships:read", "scholarships:update", "scholarships:delete",
    "analytics:read", "reports:generate", "reports:export",
    "announcements:create", "announcements:read",
    "messaging:send", "messaging:read",
    "chat:read", "chat:send",
    "assignments:create", "assignments:read", "assignments:update",
    "leave:create", "leave:read", "leave:update", "leave:delete",
    "events:create", "events:read", "events:update", "events:delete",
    "system:settings",
];

// Teacher: Assigned courses, enrolled students, attendance, grades, assignments
const TEACHER_PERMISSIONS = [
    "branches:read",
    "teachers:read",
    "students:read",
    "courses:read", "courses:update",
    "enrollments:create", "enrollments:read",  // Teachers can enroll students in their courses
    "attendance:create", "attendance:read", "attendance:update",
    "grades:create", "grades:read", "grades:update",
    "assignments:create", "assignments:read", "assignments:update",
    "announcements:create", "announcements:read",
    "messaging:send", "messaging:read",
    "chat:read", "chat:send",
    "library:read",
    "payroll:read_own",
    "leave:create", "leave:read",
];

// Student: Own data only
const STUDENT_PERMISSIONS = [
    "branches:read",
    "students:read_own",
    "courses:read",
    "attendance:read_own",
    "grades:read_own",
    "assignments:read", "assignments:submit",
    "announcements:read",
    "messaging:read",
    "chat:read", "chat:send",
    "library:read",
    "finance:read_own",
];

// ============================================================
// MAIN INITIALIZATION
// ============================================================

export async function initializePermissions() {
    try {
        console.log("🔐 Initializing RBAC System...");

        // Step 1: Seed all permissions
        await seedPermissions();

        // Step 2: Seed legacy Role entries (for User FK constraint)
        await seedLegacyRoles();

        // Step 3: Create global RBAC roles with permissions
        await seedGlobalRBACRoles();

        // Step 4: Create SuperAdmin user if not exists
        await ensureSuperAdminExists();

        // Step 5: Sync existing users with RBAC roles
        await syncExistingUsersWithRBACRoles();

        console.log("✨ RBAC System initialization completed!");
    } catch (error) {
        console.error("❌ RBAC initialization failed:", error);
        throw error;
    }
}

// ============================================================
// STEP 1: Seed Permissions
// ============================================================
async function seedPermissions() {
    console.log("   📋 Checking permissions...");

    let createdCount = 0;
    for (const perm of ALL_PERMISSIONS) {
        const existing = await prisma.permission.findUnique({
            where: { permission_name: perm.permission_name }
        });

        if (!existing) {
            await prisma.permission.create({ data: perm });
            createdCount++;
        }
    }

    if (createdCount > 0) {
        console.log(`   ✅ Created ${createdCount} new permissions`);
    } else {
        console.log(`   ✅ All ${ALL_PERMISSIONS.length} permissions exist`);
    }
}

// ============================================================
// STEP 2: Seed Legacy Roles (for User FK)
// ============================================================
async function seedLegacyRoles() {
    console.log("   📋 Checking legacy roles...");

    const legacyRoles = [
        { name: "SuperAdmin", description: "System administrator with full access" },
        { name: "BranchAdmin", description: "Branch administrator" },
        { name: "Teacher", description: "Teaching staff" },
        { name: "Student", description: "Student" },
    ];

    for (const role of legacyRoles) {
        const existing = await prisma.role.findFirst({
            where: { name: role.name, branch_id: null }
        });

        if (!existing) {
            await prisma.role.create({
                data: {
                    name: role.name,
                    description: role.description,
                    is_system: true,
                    branch_id: null,
                }
            });
            console.log(`   ✅ Created legacy role: ${role.name}`);
        }
    }
}

// ============================================================
// STEP 3: Create Global RBAC Roles
// ============================================================
async function seedGlobalRBACRoles() {
    console.log("   📋 Checking global RBAC roles...");

    const allPermissions = await prisma.permission.findMany();
    const permissionMap = new Map(allPermissions.map(p => [p.permission_name, p.id]));

    // Helper to get permission IDs from names
    const getPermIds = (names: string[]) => {
        return names
            .map(name => permissionMap.get(name))
            .filter((id): id is string => id !== undefined)
            .map(id => ({ id }));
    };

    // SuperAdmin - ALL permissions
    await upsertGlobalRole(
        "SuperAdmin",
        "System administrator with full access to all resources",
        allPermissions.map(p => ({ id: p.id }))
    );

    // BranchAdmin
    await upsertGlobalRole(
        "BranchAdmin",
        "Branch administrator with management access to branch resources",
        getPermIds(BRANCH_ADMIN_PERMISSIONS)
    );

    // Teacher
    await upsertGlobalRole(
        "Teacher",
        "Teaching staff with access to classes and student management",
        getPermIds(TEACHER_PERMISSIONS)
    );

    // Student
    await upsertGlobalRole(
        "Student",
        "Student with access to own academic records",
        getPermIds(STUDENT_PERMISSIONS)
    );

    console.log("   ✅ Global RBAC roles configured");
}

async function upsertGlobalRole(roleName: string, description: string, permissions: { id: string }[]) {
    const existing = await prisma.rBACRole.findUnique({
        where: { role_name: roleName }
    });

    if (existing) {
        // Update permissions
        await prisma.rBACRole.update({
            where: { role_name: roleName },
            data: {
                description,
                permissions: { set: permissions }
            }
        });
    } else {
        // Create new
        await prisma.rBACRole.create({
            data: {
                role_name: roleName,
                description,
                is_system: true,
                branch_id: null, // Global role - no branch attachment
                permissions: { connect: permissions }
            }
        });
        console.log(`   ✅ Created global RBAC role: ${roleName}`);
    }
}

// ============================================================
// STEP 4: Ensure SuperAdmin Exists
// ============================================================
async function ensureSuperAdminExists() {
    console.log("   👤 Checking SuperAdmin user...");

    const existingSuperAdmin = await prisma.user.findFirst({
        where: {
            role: { name: "SuperAdmin" }
        }
    });

    if (existingSuperAdmin) {
        console.log(`   ✅ SuperAdmin exists: ${existingSuperAdmin.username}`);
        return;
    }

    // Need to create SuperAdmin
    console.log("   ⚠️ No SuperAdmin found - creating...");

    // Get or create default branch for SuperAdmin
    let defaultBranch = await prisma.branch.findFirst({ where: { code: "HQ" } });

    if (!defaultBranch) {
        defaultBranch = await prisma.branch.create({
            data: {
                name: "Headquarters",
                code: "HQ",
                address: "Main Office",
                is_active: true,
            }
        });
        console.log("   ✅ Created default HQ branch");
    }

    // Get SuperAdmin legacy role
    const superAdminRole = await prisma.role.findFirst({
        where: { name: "SuperAdmin", branch_id: null }
    });

    if (!superAdminRole) {
        throw new Error("SuperAdmin legacy role not found - seeding failed");
    }

    // Hash password
    const password_hash = await bcrypt.hash("admin123", 10);

    // Create SuperAdmin user
    const superAdmin = await prisma.user.create({
        data: {
            username: "superadmin",
            email: "superadmin@school.edu",
            password_hash,
            first_name: "Super",
            last_name: "Admin",
            role_id: superAdminRole.id,
            branch_id: defaultBranch.id,
            is_active: true,
        }
    });

    // Assign RBAC role
    const superAdminRBACRole = await prisma.rBACRole.findUnique({
        where: { role_name: "SuperAdmin" }
    });

    if (superAdminRBACRole) {
        await prisma.userRole.create({
            data: {
                user_id: superAdmin.id,
                rbac_role_id: superAdminRBACRole.id,
                branch_id: defaultBranch.id,
                assigned_by: superAdmin.id,
            }
        });
    }

    console.log("   ✅ Created SuperAdmin user:");
    console.log("      📧 Username: superadmin");
    console.log("      🔑 Password: admin123");
    console.log("      📬 Email: superadmin@school.edu");
}

// ============================================================
// STEP 5: Sync Existing Users with RBAC Roles
// ============================================================
async function syncExistingUsersWithRBACRoles() {
    console.log("   🔗 Syncing existing users with RBAC roles...");

    const usersWithoutRBACRole = await prisma.user.findMany({
        where: {
            user_roles: { none: {} }
        },
        include: { role: true }
    });

    if (usersWithoutRBACRole.length === 0) {
        console.log("   ✅ All users have RBAC roles");
        return;
    }

    let syncedCount = 0;
    for (const user of usersWithoutRBACRole) {
        const rbacRole = await prisma.rBACRole.findUnique({
            where: { role_name: user.role.name }
        });

        if (rbacRole) {
            await prisma.userRole.create({
                data: {
                    user_id: user.id,
                    rbac_role_id: rbacRole.id,
                    branch_id: user.branch_id,
                    assigned_by: user.id,
                }
            });
            syncedCount++;
        }
    }

    console.log(`   ✅ Synced ${syncedCount} users with RBAC roles`);
}
