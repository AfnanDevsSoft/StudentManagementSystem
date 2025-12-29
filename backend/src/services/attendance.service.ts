import { prisma } from "../lib/db";

export class AttendanceService {
    /**
     * Mark attendance for a student
     */
    static async markAttendance(data: {
        student_id: string;
        branch_id: string;
        date: string;
        status: string;
        remarks?: string;
        recorded_by: string; // Made mandatory to match schema
        course_id?: string;
    }) {
        try {
            const { student_id, branch_id, date, status, remarks, recorded_by, course_id } = data;

            let targetCourseId = course_id;

            // If course_id is missing, try to find the student's primary/first enrollment
            if (!targetCourseId) {
                const student = await prisma.student.findUnique({
                    where: { id: student_id },
                    include: {
                        enrollments: {
                            take: 1, // Just take the first one for now as default
                            include: { course: true }
                        }
                    }
                });

                if (!student) throw new Error("Student not found");

                if (student.enrollments.length > 0) {
                    targetCourseId = student.enrollments[0].course_id;
                } else {
                    // Fallback or error? For now, throw error as schema requires it.
                    throw new Error("Student is not enrolled in any course. Cannot mark attendance.");
                }
            }

            // Check if attendance already exists
            const existingAttendance = await prisma.attendance.findUnique({
                where: {
                    student_id_course_id_date: {
                        student_id,
                        course_id: targetCourseId!,
                        date: new Date(date),
                    }
                },
            });

            if (existingAttendance) {
                // Update existing attendance
                const updatedAttendance = await prisma.attendance.update({
                    where: { id: existingAttendance.id },
                    data: {
                        status,
                        remarks,
                        recorded_by, // Update recorded_by to current user
                    },
                });
                return {
                    success: true,
                    message: "Attendance updated successfully",
                    data: updatedAttendance,
                };
            }

            // Create new attendance record
            const attendance = await prisma.attendance.create({
                data: {
                    student_id,
                    course_id: targetCourseId!, // Ensure we have it
                    date: new Date(date),
                    status,
                    remarks,
                    recorded_by,
                },
            });

            return {
                success: true,
                message: "Attendance marked successfully",
                data: attendance,
            };
        } catch (error: any) {
            console.error("markAttendance error:", error);
            return {
                success: false,
                message: error.message || "Failed to mark attendance",
            };
        }
    }

    /**
     * Get all attendance with pagination and filtering
     */
    static async getAllAttendance(
        branchId?: string,
        limit: number = 20,
        page: number = 1,
        userContext?: any
    ) {
        try {
            const skip = (page - 1) * limit;
            const whereClause: any = {};

            // Data Scoping
            if (userContext && userContext.role?.name !== 'SuperAdmin') {
                branchId = userContext.branch_id;
            }

            if (branchId) {
                // Filter by course branch
                whereClause.course = { branch_id: branchId };
            }

            const attendance = await prisma.attendance.findMany({
                where: whereClause,
                include: {
                    student: {
                        select: {
                            first_name: true,
                            last_name: true,
                            student_code: true
                        }
                    },
                    course: {
                        select: {
                            course_name: true,
                            course_code: true
                        }
                    }
                },
                orderBy: { date: 'desc' },
                take: limit,
                skip: skip
            });

            const total = await prisma.attendance.count({ where: whereClause });

            return {
                success: true,
                message: "Attendance records retrieved",
                data: attendance,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }

    /**
     * Get attendance for a course, optionally filtered by date
     */
    static async getByCourse(courseId: string, date?: string) {
        try {
            const where: any = { course_id: courseId };

            if (date) {
                // Filter by specific date
                // Ensuring we catch the full day range if date is just YYYY-MM-DD
                const startOfDay = new Date(date);
                startOfDay.setHours(0, 0, 0, 0);

                const endOfDay = new Date(date);
                endOfDay.setHours(23, 59, 59, 999);

                where.date = {
                    gte: startOfDay,
                    lte: endOfDay
                };
            }

            const attendance = await prisma.attendance.findMany({
                where,
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
                    date: 'desc'
                }
            });

            return {
                success: true,
                data: attendance
            };
        } catch (error: any) {
            console.error("getByCourse error:", error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    /**
     * Bulk mark attendance for multiple students in a course
     */
    static async bulkMark(data: {
        courseId: string;
        date: string;
        records: Array<{
            studentId: string;
            status: string;
            remarks?: string;
        }>;
        recordedBy: string;
        branchId: string;
    }) {
        try {
            const { courseId, date, records, recordedBy, branchId } = data;
            const targetDate = new Date(date);
            const results = [];

            // We process sequentially or in parallel - transaction would be better but let's iterate for now
            // to reuse the upsert logic or simple updates

            // Using transaction for atomicity
            const transaction = await prisma.$transaction(async (tx) => {
                const upsertPromises = records.map(async (record) => {
                    // Check existence
                    const existing = await tx.attendance.findUnique({
                        where: {
                            student_id_course_id_date: {
                                student_id: record.studentId,
                                course_id: courseId,
                                date: targetDate
                            }
                        }
                    });

                    if (existing) {
                        return tx.attendance.update({
                            where: { id: existing.id },
                            data: {
                                status: record.status,
                                remarks: record.remarks,
                                recorded_by: recordedBy
                            }
                        });
                    } else {
                        return tx.attendance.create({
                            data: {
                                student_id: record.studentId,
                                course_id: courseId,
                                date: targetDate,
                                status: record.status,
                                remarks: record.remarks,
                                recorded_by: recordedBy
                            }
                        });
                    }
                });
                return Promise.all(upsertPromises);
            });

            return {
                success: true,
                message: `Attendance marked for ${records.length} students`,
                data: transaction
            };

        } catch (error: any) {
            console.error("bulkMark error:", error);
            return {
                success: false,
                message: error.message || "Failed to bulk mark attendance"
            };
        }
    }

    /**
     * Get or calculate student attendance summary
     */
    static async getStudentAttendanceSummary(
        studentId: string,
        academicYearId?: string,
        branchId?: string
    ) {
        try {
            // Get working days configuration
            const student = await prisma.student.findUnique({
                where: { id: studentId },
                select: { branch_id: true, current_grade_level_id: true },
            });

            if (!student) {
                return { success: false, message: "Student not found" };
            }

            const workingDaysConfig = await prisma.workingDaysConfig.findFirst({
                where: {
                    branch_id: branchId || student.branch_id,
                    academic_year_id: academicYearId || null,
                    grade_level_id: student.current_grade_level_id || null,
                    is_active: true,
                },
                orderBy: { created_at: "desc" },
            });

            if (!workingDaysConfig) {
                return {
                    success: false,
                    message: "Working days configuration not found",
                };
            }

            // Count attendance records by status
            const attendanceStats = await prisma.attendance.groupBy({
                by: ["status"],
                where: {
                    student_id: studentId,
                    date: {
                        gte: workingDaysConfig.start_date,
                        lte: workingDaysConfig.end_date,
                    },
                },
                _count: { status: true },
            });

            const daysPresent =
                attendanceStats.find((s) => s.status.toLowerCase() === "present")?._count.status || 0;
            const daysAbsent =
                attendanceStats.find((s) => s.status.toLowerCase() === "absent")?._count.status || 0;
            const daysLate =
                attendanceStats.find((s) => s.status.toLowerCase() === "late")?._count.status || 0;
            const daysExcused =
                attendanceStats.find((s) => s.status.toLowerCase() === "excused")?._count.status || 0;

            const attendancePercentage =
                workingDaysConfig.total_days > 0
                    ? (daysPresent / workingDaysConfig.total_days) * 100
                    : 0;

            const meetsMinimum = attendancePercentage >= 80;

            // Upsert attendance summary
            const summary = await prisma.attendanceSummary.upsert({
                where: {
                    entity_type_entity_id_academic_year_id: {
                        entity_type: "student",
                        entity_id: studentId,
                        academic_year_id: academicYearId || null,
                    },
                },
                create: {
                    entity_type: "student",
                    entity_id: studentId,
                    branch_id: branchId || student.branch_id,
                    academic_year_id: academicYearId || null,
                    total_working_days: workingDaysConfig.total_days,
                    days_present: daysPresent,
                    days_absent: daysAbsent,
                    days_late: daysLate,
                    days_excused: daysExcused,
                    attendance_percentage: attendancePercentage,
                    meets_minimum: meetsMinimum,
                    last_calculated: new Date(),
                },
                update: {
                    total_working_days: workingDaysConfig.total_days,
                    days_present: daysPresent,
                    days_absent: daysAbsent,
                    days_late: daysLate,
                    days_excused: daysExcused,
                    attendance_percentage: attendancePercentage,
                    meets_minimum: meetsMinimum,
                    last_calculated: new Date(),
                },
            });

            return {
                success: true,
                data: summary,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to get student attendance summary",
            };
        }
    }

    /**
     * Get or calculate teacher attendance summary
     */
    static async getTeacherAttendanceSummary(
        teacherId: string,
        academicYearId?: string,
        branchId?: string
    ) {
        try {
            // Get teacher's branch
            const teacher = await prisma.teacher.findUnique({
                where: { id: teacherId },
                select: { branch_id: true },
            });

            if (!teacher) {
                return { success: false, message: "Teacher not found" };
            }

            const workingDaysConfig = await prisma.workingDaysConfig.findFirst({
                where: {
                    branch_id: branchId || teacher.branch_id,
                    academic_year_id: academicYearId || null,
                    is_active: true,
                },
                orderBy: { created_at: "desc" },
            });

            if (!workingDaysConfig) {
                return {
                    success: false,
                    message: "Working days configuration not found",
                };
            }

            // For teachers, we would need to track their attendance separately
            // This is a placeholder - you'll need to implement teacher attendance tracking
            // For now, we'll return a summary with 0 values
            const summary = await prisma.attendanceSummary.upsert({
                where: {
                    entity_type_entity_id_academic_year_id: {
                        entity_type: "teacher",
                        entity_id: teacherId,
                        academic_year_id: academicYearId || null,
                    },
                },
                create: {
                    entity_type: "teacher",
                    entity_id: teacherId,
                    branch_id: branchId || teacher.branch_id,
                    academic_year_id: academicYearId || null,
                    total_working_days: workingDaysConfig.total_days,
                    days_present: 0,
                    days_absent: 0,
                    days_late: 0,
                    days_excused: 0,
                    attendance_percentage: 0,
                    meets_minimum: false,
                    last_calculated: new Date(),
                },
                update: {
                    last_calculated: new Date(),
                },
            });

            return {
                success: true,
                data: summary,
                message: "Teacher attendance tracking not fully implemented yet",
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to get teacher attendance summary",
            };
        }
    }

    /**
     * Recalculate attendance summary on demand
     */
    static async recalculateAttendanceSummary(
        entityType: "student" | "teacher",
        entityId: string,
        academicYearId?: string,
        branchId?: string
    ) {
        try {
            if (entityType === "student") {
                return await this.getStudentAttendanceSummary(
                    entityId,
                    academicYearId,
                    branchId
                );
            } else {
                return await this.getTeacherAttendanceSummary(
                    entityId,
                    academicYearId,
                    branchId
                );
            }
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to recalculate attendance summary",
            };
        }
    }

    /**
     * Get attendance percentage for quick lookup
     */
    static async getAttendancePercentage(
        entityId: string,
        entityType: "student" | "teacher",
        academicYearId?: string
    ) {
        try {
            const summary = await prisma.attendanceSummary.findFirst({
                where: {
                    entity_id: entityId,
                    entity_type: entityType,
                    academic_year_id: academicYearId || null,
                },
                select: {
                    attendance_percentage: true,
                    meets_minimum: true,
                    days_present: true,
                    total_working_days: true,
                },
            });

            return {
                success: true,
                data: summary,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to get attendance percentage",
            };
        }
    }

}

export default AttendanceService;
