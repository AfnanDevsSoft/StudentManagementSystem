import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const STUDENT_ID = "78628698-263d-4898-abc7-fe28d03e2d94"; // The student getting the error

async function enrollStudent() {
    try {
        console.log("Connecting to database...");

        // 1. Find the student to get their branch_id
        const student = await prisma.student.findUnique({
            where: { id: STUDENT_ID },
        });

        if (!student) {
            throw new Error(`Student ${STUDENT_ID} not found!`);
        }
        console.log(`Found Student: ${student.first_name} ${student.last_name} (Branch: ${student.branch_id})`);

        // 2. Find a course in this branch
        const course = await prisma.course.findFirst({
            where: { branch_id: student.branch_id }
        });

        if (!course) {
            throw new Error(`No courses found in branch ${student.branch_id}. Please create a course first.`);
        }
        console.log(`Found Course: ${course.course_name} (ID: ${course.id})`);

        // 3. Enroll the student
        const existingEnrollment = await prisma.studentEnrollment.findFirst({
            where: {
                student_id: STUDENT_ID,
                course_id: course.id
            }
        });

        if (existingEnrollment) {
            console.log("Student is already enrolled in this course.");
        } else {
            const enrollment = await prisma.studentEnrollment.create({
                data: {
                    student_id: STUDENT_ID,
                    course_id: course.id,
                    enrollment_date: new Date(),
                    status: 'active'
                }
            });
            console.log("Successfully enrolled student in course!");
        }

    } catch (error) {
        console.error("Error enveloping student:", error);
    } finally {
        await prisma.$disconnect();
    }
}

enrollStudent();
