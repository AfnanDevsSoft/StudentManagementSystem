
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Starting Debug Process...");

    // 1. Find User
    const username = "afnanteacher";
    const user = await prisma.user.findUnique({
        where: { username },
        include: { role: true }
    });

    if (!user) {
        console.error("User not found!");
        return;
    }
    console.log("User found:", user.id, user.username, user.role.name);

    // 2. Find Teacher
    const teacher = await prisma.teacher.findUnique({
        where: { user_id: user.id }
    });

    if (!teacher) {
        console.error("Teacher not found for user!");
        return;
    }
    console.log("Teacher found:", teacher.id);

    // 3. Find Courses
    const courses = await prisma.course.findMany({
        where: { teacher_id: teacher.id },
        include: { academic_year: true } // Check this relation
    });

    console.log("Courses found:", courses.length);

    if (courses.length === 0) {
        console.error("No courses for teacher.");
        return;
    }

    const course = courses[0];
    console.log("Testing with Course:", course.course_name, course.id);
    console.log("Academic Year:", course.academic_year_id, course.academic_year);

    if (!course.academic_year_id) {
        console.error("Course has no academic_year_id!");
        // return; // Don't return, let it fail
    }

    // 4. Find Student in Course
    // We need a student enrollment
    const enrollment = await prisma.studentEnrollment.findFirst({
        where: { course_id: course.id },
        include: { student: true }
    });

    let studentId;
    if (enrollment) {
        console.log("Student found via enrollment:", enrollment.student.first_name);
        studentId = enrollment.student_id;
    } else {
        console.log("No enrollment found. Finding any student...");
        const s = await prisma.student.findFirst();
        studentId = s?.id;
    }

    if (!studentId) {
        console.error("No student found to grade.");
        return;
    }

    // 5. Try Create Grade
    console.log("Attempting to create/update grade...");
    const assessmentType = "Midterm";
    const marks = 88;

    try {
        const result = await prisma.$transaction(async (tx) => {
            const existing = await tx.grade.findFirst({
                where: {
                    student_id: studentId,
                    course_id: course.id,
                    assessment_type: assessmentType
                }
            });

            if (existing) {
                console.log("Updating existing grade:", existing.id);
                return tx.grade.update({
                    where: { id: existing.id },
                    data: {
                        score: marks,
                        graded_by: teacher.id,
                        updated_at: new Date()
                    }
                });
            } else {
                console.log("Creating new grade...");
                return tx.grade.create({
                    data: {
                        student_id: studentId!,
                        course_id: course.id,
                        academic_year_id: course.academic_year_id,  // This is the suspect
                        assessment_type: assessmentType,
                        assessment_name: assessmentType,
                        score: marks,
                        max_score: 100,
                        graded_by: teacher.id,
                        grade_date: new Date(),
                        weight: 0
                    }
                });
            }
        });
        console.log("Grade operation successful:", result);
    } catch (e: any) {
        console.error("Grade operation FAILED:", e);
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
