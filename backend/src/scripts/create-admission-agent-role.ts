import { PrismaClient } from "@prisma/client";
import { RBACService } from "../services/rbac.service";

const prisma = new PrismaClient();

async function main() {
    console.log("Creating Admission Agent role...");

    const roleName = "Admission Agent";
    const description = "Can create, view, and update admission applications for their branch.";
    const permissions = [
        "admissions:read",
        "admissions:update",
        "admissions:create"
    ];

    try {
        // Since roles are unique by name per branch, and system roles might be unique by name globally?
        // Let's create a partial System Role or just create it directly.
        // The schema shows Role has 'branch_id' (nullable) and 'is_system' (boolean).
        // If we want this available for ANY branch, we should probably make it a template or system role?
        // But RBAC usually requires roles per branch or a template system. 

        // Let's check how other roles are created. The seed scripts usually create them.
        // Assuming we are just adding this to the pool of available roles.
        // If your system allows assigning new roles dynamically, we might need a template.
        // For now, let's create a "System Role" which can be cloned or used as reference?
        // OR better: Create it for a specific branch if that's how it works, BUT user said: 
        // "i want to add new role which is addmission agent whe i assign this to user ad bbranch"
        // This implies the role definition exists globally or we create it per branch.

        // Let's look at `rbac.service.ts` or `seed.ts` to see how 'Teacher' or 'Student' are structured. 
        // If they are system roles, `branch_id` is null.

        // Let's try to create a System Role (branch_id: null)

        const existingRole = await prisma.role.findFirst({
            where: {
                name: roleName,
                branch_id: null
            }
        });

        if (existingRole) {
            console.log(`Role '${roleName}' already exists.`);
            // Update permissions just in case
            await prisma.role.update({
                where: { id: existingRole.id },
                data: {
                    permissions: permissions
                }
            });
            console.log(`Updated permissions for '${roleName}'.`);
        } else {
            const role = await prisma.role.create({
                data: {
                    name: roleName,
                    description: description,
                    permissions: permissions,
                    is_system: true, // Mark as system role so it can be used across branches (if that's the logic)
                    branch_id: null  // Global role definition
                }
            });
            console.log(`Created role '${roleName}' with ID: ${role.id}`);
        }

    } catch (error) {
        console.error("Error creating role:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
