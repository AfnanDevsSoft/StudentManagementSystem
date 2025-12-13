import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createTeacher() {
    try {
        const hashedPassword = await bcrypt.hash("password123", 10);

        // Find Teacher role
        let role = await prisma.role.findFirst({ where: { name: "Teacher" } });
        if (!role) {
            console.error("Teacher role not found");
            return;
        }

        // Use default branch
        const branchId = "4cb48893-b4ab-4fc6-ace2-16d2933e6460";

        const user = await prisma.user.upsert({
            where: { username: "afnanteacher" },
            update: {},
            create: {
                username: "afnanteacher",
                password_hash: hashedPassword,
                email: "afnanteacher@koolhub.edu",
                first_name: "Afnan",
                last_name: "Teacher",
                role_id: role.id,
                branch_id: branchId,
                is_active: true
            }
        });

        // Create Teacher Profile
        await prisma.teacher.upsert({
            where: { user_id: user.id },
            update: {},
            create: {
                user_id: user.id,
                branch_id: branchId,
                employee_code: "EMP_AFNAN",
                first_name: "Afnan",
                last_name: "Teacher",
                email: "afnanteacher@koolhub.edu",
                hire_date: new Date(),
                employment_type: "Full Time"
            }
        });

        console.log("Teacher created:", user.username);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

createTeacher();
