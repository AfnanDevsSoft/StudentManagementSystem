import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class GradeService {

    /**
     * Get grades for a course
     */
    static async getByCourse(courseId: string) {
        try {
            const grades = await prisma.grade.findMany({
                where: { course_id: courseId },
                include: {
                    student: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true,
                            student_code: true
                        }
                    }
                },
                orderBy: {
                    created_at: 'desc'
                }
            });

            return {
                success: true,
                data: grades
            };
        } catch (error: any) {
            console.error("getByCourse grades error:", error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    /**
     * Bulk create/update grades
     */
    static async bulkCreate(data: {
        courseId: string;
        assessmentType: string;
        totalMarks: number;
        userId: string; // Changed from gradedBy
        grades: Array<{
            studentId: string;
            marksObtained: number;
            remarks?: string;
        }>;
    }) {
        try {
            console.log("bulkCreate received:", JSON.stringify(data, null, 2));
            const { courseId, assessmentType, totalMarks, userId, grades } = data;

            // 1. Get Course to find Academic Year
            const course = await prisma.course.findUnique({
                where: { id: courseId }
            });

            if (!course) {
                console.error("Course not found for ID:", courseId);
                throw new Error("Course not found");
            }
            console.log("Found course:", course.course_name, "AcademicYear:", course.academic_year_id);

            // 2. Find Teacher by User ID to get correct graded_by (Teacher ID)
            const teacher = await prisma.teacher.findUnique({
                where: { user_id: userId }
            });

            if (!teacher) {
                console.error("Teacher profile not found for User ID:", userId);
                throw new Error("User must be a teacher to grade.");
            }
            const gradedBy = teacher.id;

            // 2. Process grades
            const results = await prisma.$transaction(async (tx) => {
                const promises = grades.map(async (record) => {
                    // Check if grade exists for this student + course + assessmentType
                    // (Assuming assessment_name is the same as type or derived)

                    const existing = await tx.grade.findFirst({
                        where: {
                            student_id: record.studentId,
                            course_id: courseId,
                            assessment_type: assessmentType
                        }
                    });

                    if (existing) {
                        return tx.grade.update({
                            where: { id: existing.id },
                            data: {
                                score: record.marksObtained,
                                max_score: totalMarks,
                                remarks: record.remarks,
                                graded_by: gradedBy,
                                updated_at: new Date()
                            }
                        });
                    } else {
                        return tx.grade.create({
                            data: {
                                student_id: record.studentId,
                                course_id: courseId,
                                academic_year_id: course.academic_year_id,
                                assessment_type: assessmentType,
                                assessment_name: assessmentType, // Using type as name for now
                                score: record.marksObtained,
                                max_score: totalMarks,
                                graded_by: gradedBy,
                                remarks: record.remarks,
                                grade_date: new Date(),
                                weight: 0 // Default weight
                            }
                        });
                    }
                });
                return Promise.all(promises);
            });

            return {
                success: true,
                message: `Grades published for ${grades.length} students`,
                data: results
            };

        } catch (error: any) {
            console.error("bulkCreate grades error:", error);
            return {
                success: false,
                message: error.message || "Failed to publish grades"
            };
        }
    }
}

export default GradeService;
