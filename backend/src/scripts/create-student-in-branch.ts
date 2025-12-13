
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createStudent() {
    try {
        const branchId = '4cb48893-b4ab-4fc6-ace2-16d2933e6460'; // The branch ID from previous logs
        const studentCode = `ST${Date.now()}`;

        console.log(`Creating student in branch: ${branchId}`);

        const student = await prisma.student.create({
            data: {
                branch_id: branchId,
                student_code: studentCode,
                first_name: "Enrollment",
                last_name: "Candidate",
                personal_email: `enroll_${Date.now()}@example.com`,
                date_of_birth: new Date("2005-01-01"),
                gender: "Male",
                admission_date: new Date(),
                is_active: true
            }
        });

        console.log(`✅ Created student: ${student.first_name} ${student.last_name} (${student.id})`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createStudent();
