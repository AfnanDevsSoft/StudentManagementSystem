
import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("📍 Finding North Campus...");
    const northBranch = await prisma.branch.findFirst({
        where: { code: "NORTH" },
    });

    if (!northBranch) {
        console.error("❌ North Campus not found!");
        return;
    }

    console.log("👥 Finding BranchAdmin role...");
    const branchAdminRole = await prisma.role.findFirst({
        where: { name: "BranchAdmin" },
    });

    if (!branchAdminRole) {
        console.error("❌ BranchAdmin role not found!");
        return;
    }

    const hashedPassword = await bcryptjs.hash("password123", 10);

    console.log("👤 Creating North Campus Admin...");
    try {
        const northAdmin = await prisma.user.upsert({
            where: { username: "north_admin" },
            update: {},
            create: {
                username: "north_admin",
                email: "north_admin@koolhub.edu",
                password_hash: hashedPassword,
                first_name: "North",
                last_name: "Admin",
                phone: "+92-300-9999999",
                is_active: true,
                branch_id: northBranch.id,
                role_id: branchAdminRole.id,
            },
        });
        console.log("✅ Created user: north_admin / password123");
        console.log(`   Branch: ${northBranch.name}`);
        console.log(`   Role: ${branchAdminRole.name}`);
    } catch (error) {
        console.error("❌ Failed to create user:", error);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
