import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createBranchAdmin() {
    try {
        const hashedPassword = await bcrypt.hash("password123", 10);

        // Find BranchAdmin role
        let role = await prisma.role.findFirst({ where: { name: "BranchAdmin" } });
        if (!role) {
            role = await prisma.role.create({
                data: {
                    name: "BranchAdmin",
                    description: "Admin for a specific branch",
                    permissions: ["*"],
                    is_system: true
                }
            });
        }

        // Branch 2 ID (different from default)
        const branch2Id = "550e8400-e29b-41d4-a716-446655440000";

        // Create Branch 2 if not exists
        const branch2 = await prisma.branch.upsert({
            where: { id: branch2Id },
            update: {},
            create: {
                id: branch2Id,
                name: "Second Branch",
                code: "BR2",
                is_active: true
            }
        });

        const admin = await prisma.user.upsert({
            where: { username: "branchadmin2" },
            update: {},
            create: {
                username: "branchadmin2",
                password_hash: hashedPassword,
                email: "branchadmin2@example.com",
                first_name: "Branch",
                last_name: "Admin2",
                role_id: role.id,
                branch_id: branch2Id,
                is_active: true
            }
        });

        console.log("Branch Admin created:", admin.username);
        console.log("Branch:", branch2.name);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

createBranchAdmin();
