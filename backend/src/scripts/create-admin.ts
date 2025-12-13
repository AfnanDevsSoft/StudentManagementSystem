import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createAdmin() {
    try {
        const hashedPassword = await bcrypt.hash("password123", 10);

        // Find or create SuperAdmin role
        let role = await prisma.role.findFirst({ where: { name: "SuperAdmin" } });
        if (!role) {
            role = await prisma.role.create({
                data: {
                    name: "SuperAdmin",
                    description: "Super Administrator with full access",
                    permissions: ["*"],
                    is_system: true
                }
            });
        }

        const admin = await prisma.user.upsert({
            where: { username: "afnanadmin" },
            update: {},
            create: {
                username: "afnanadmin",
                password_hash: hashedPassword,
                email: "admin@example.com",
                first_name: "Afnan",
                last_name: "Admin",
                role_id: role.id,
                branch_id: "4cb48893-b4ab-4fc6-ace2-16d2933e6460", // Default branch from seed
                is_active: true
            }
        });

        console.log("Admin user created/verified:", admin.username);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
