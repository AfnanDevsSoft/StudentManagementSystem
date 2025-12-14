import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class AssignmentService {
    /**
     * Create a new assignment
     */
    async create(data: {
        title: string;
        description?: string;
        course_id: string;
        teacher_id: string;
        due_date: Date;
        max_score: number;
        status: string;
    }) {
        // Verify course and teacher exist
        const course = await prisma.course.findUnique({
            where: { id: data.course_id },
        });
        if (!course) {
            throw new Error("Course not found");
        }

        const teacher = await prisma.teacher.findUnique({
            where: { id: data.teacher_id }
        });
        if (!teacher) {
            throw new Error("Teacher not found");
        }

        const assignment = await (prisma as any).assignment.create({
            data: {
                title: data.title,
                description: data.description,
                course_id: data.course_id,
                teacher_id: data.teacher_id,
                due_date: new Date(data.due_date),
                max_score: data.max_score,
                status: data.status,
            },
        });

        return {
            success: true,
            message: "Assignment created successfully",
            data: assignment,
        };
    }

    /**
     * Get assignments by course ID
     */
    /**
     * Get assignments by course ID (public/teacher view)
     */
    async getByCourse(courseId: string) {
        const assignments = await (prisma as any).assignment.findMany({
            where: { course_id: courseId },
            orderBy: { created_at: "desc" },
            include: {
                _count: {
                    select: { submissions: true }
                }
            }
        });

        return {
            success: true,
            message: "Assignments retrieved successfully",
            data: assignments,
        };
    }

    /**
     * Get assignments for a student (includes submission status)
     */
    async getStudentAssignments(courseId: string, studentId: string) {
        const assignments = await (prisma as any).assignment.findMany({
            where: { course_id: courseId },
            orderBy: { created_at: "desc" },
            include: {
                submissions: {
                    where: { student_id: studentId },
                    select: {
                        id: true,
                        status: true,
                        submitted_at: true,
                        grade: true,
                        content_url: true
                    },
                    take: 1
                }
            }
        });

        return {
            success: true,
            message: "Assignments retrieved successfully",
            data: assignments,
        };
    }

    /**
     * Get submissions for an assignment
     */
    async getSubmissions(assignmentId: string) {
        const submissions = await (prisma as any).submission.findMany({
            where: { assignment_id: assignmentId },
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
            orderBy: { submitted_at: "desc" },
        });

        return {
            success: true,
            message: "Submissions retrieved successfully",
            data: submissions,
        };
    }

    /**
     * Delete an assignment
     */
    async delete(id: string) {
        const existing = await (prisma as any).assignment.findUnique({ where: { id } });
        if (!existing) {
            throw new Error("Assignment not found");
        }

        await (prisma as any).assignment.delete({ where: { id } });

        return {
            success: true,
            message: "Assignment deleted successfully",
        };
    }

    /**
     * Update an assignment
     */
    async update(id: string, data: {
        title?: string;
        description?: string;
        due_date?: Date;
        max_score?: number;
        status?: string;
    }) {
        const existing = await (prisma as any).assignment.findUnique({ where: { id } });
        if (!existing) {
            throw new Error("Assignment not found");
        }

        const assignment = await (prisma as any).assignment.update({
            where: { id },
            data: {
                title: data.title,
                description: data.description,
                due_date: data.due_date ? new Date(data.due_date) : undefined,
                max_score: data.max_score,
                status: data.status,
            },
        });

        return {
            success: true,
            message: "Assignment updated successfully",
            data: assignment,
        };
    }

    /**
     * Submit an assignment (Student)
     */
    async submitAssignment(data: {
        student_id: string;
        assignment_id: string;
        content_url?: string;
    }) {
        const submission = await (prisma as any).submission.create({
            data: {
                student_id: data.student_id,
                assignment_id: data.assignment_id,
                content_url: data.content_url,
                status: "submitted",
            },
        });

        return {
            success: true,
            message: "Assignment submitted successfully",
            data: submission,
        };
    }
}

export default new AssignmentService();
