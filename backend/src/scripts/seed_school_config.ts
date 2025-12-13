import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// REPLACE WITH YOUR BRANCH ID IF NEEDED, OR IT WILL PICK THE FIRST ONE
const BRANCH_ID = "4cb48893-b4ab-4fc6-ace2-16d2933e6460";

async function seedSchoolData() {
    try {
        console.log("Connecting to database...");

        // 1. Create Academic Year
        const year = await prisma.academicYear.create({
            data: {
                year: "2025-2026",
                start_date: new Date("2025-08-01"),
                end_date: new Date("2026-06-30"),
                is_current: true,
                branch_id: BRANCH_ID,
            }
        });
        console.log("Created Academic Year:", year.year);

        // 2. Create Grade Levels
        const grades = ["Grade 9", "Grade 10", "Grade 11", "Grade 12"];
        for (const g of grades) {
            await prisma.gradeLevel.create({
                data: {
                    name: g,
                    code: g.replace(" ", ""),
                    branch_id: BRANCH_ID,
                }
            });
        }
        console.log("Created Grade Levels:", grades.join(", "));

        // 3. Create Subjects
        const subjects = ["Mathematics", "Physics", "Chemistry", "English", "History"];
        for (const s of subjects) {
            await prisma.subject.create({
                data: {
                    name: s,
                    code: s.substring(0, 3).toUpperCase(),
                    credits: 3,
                    branch_id: BRANCH_ID,
                }
            });
        }
        console.log("Created Subjects:", subjects.join(", "));

        console.log("✅ Seed completed! You can now edit your course.");

    } catch (error) {
        console.error("Error seeding data:", error);
    } finally {
        await prisma.$disconnect();
    }
}

seedSchoolData();
