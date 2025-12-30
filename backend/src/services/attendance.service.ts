import { prisma } from "../lib/db";

export class AttendanceService {
    /**
     * Mark attendance for a student (course-independent)
     * Now supports general daily attendance without requiring course enrollment
     */
    static async markAttendance(data: {
        student_id: string;
        branch_id: string;
        date: string;
        status: string;
        remarks?: string;
        recorded_by: string;
        course_id?: string;  // Optional - for course-specific attendance
    }) {
        try {
            const { student_id, branch_id, date, status, remarks, recorded_by, course_id } = data;

            // Validate student exists
            const student = await prisma.student.findUnique({
                where: { id: student_id },
            });
            if (!student) throw new Error("Student not found");

            const attendanceDate = new Date(date);

            // Check if attendance already exists for this student on this date
            const existingAttendance = await prisma.attendance.findUnique({
                where: {
                    student_id_date: {
                        student_id,
                        date: attendanceDate,
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
                        recorded_by,
                        course_id: course_id || null,  // Allow updating course association
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
                    branch_id,
                    date: attendanceDate,
                    status,
                    remarks,
                    recorded_by,
                    course_id: course_id || null,  // Optional course association
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
     * Mark attendance for a teacher
     */
    static async markTeacherAttendance(data: {
        teacher_id: string;
        date: string;
        status: string;
        remarks?: string;
        check_in?: string;
        check_out?: string;
    }) {
        try {
            const { teacher_id, date, status, remarks, check_in, check_out } = data;
            const attendanceDate = new Date(date);

            // Check if attendance already exists
            const existingAttendance = await prisma.teacherAttendance.findUnique({
                where: {
                    teacher_id_date: {
                        teacher_id,
                        date: attendanceDate,
                    }
                },
            });

            // Handle Leave Logic
            let leaveAdjustment = 0;
            const isNewStatusLeave = status.toLowerCase() === 'leave';

            if (existingAttendance) {
                const isOldStatusLeave = existingAttendance.status.toLowerCase() === 'leave';

                if (isOldStatusLeave && !isNewStatusLeave) {
                    // Was leave, now present/absent -> Credit back a leave
                    leaveAdjustment = -1;
                } else if (!isOldStatusLeave && isNewStatusLeave) {
                    // Was present/absent, now leave -> Deduct a leave
                    leaveAdjustment = 1;
                }

                // Update existing
                await prisma.teacherAttendance.update({
                    where: { id: existingAttendance.id },
                    data: {
                        status,
                        remarks,
                        check_in: check_in ? new Date(check_in) : undefined,
                        check_out: check_out ? new Date(check_out) : undefined,
                    },
                });
            } else {
                // New record
                if (isNewStatusLeave) {
                    leaveAdjustment = 1;
                }

                await prisma.teacherAttendance.create({
                    data: {
                        teacher_id,
                        date: attendanceDate,
                        status,
                        remarks,
                        check_in: check_in ? new Date(check_in) : null,
                        check_out: check_out ? new Date(check_out) : null,
                    },
                });
            }

            // Apply leave adjustment if needed
            if (leaveAdjustment !== 0) {
                // We use increment with positive/negative values
                // If leaveAdjustment is 1 (add to used_leaves), we increment
                // If leaveAdjustment is -1 (subtract from used_leaves), we increment by -1
                await prisma.teacher.update({
                    where: { id: teacher_id },
                    data: {
                        used_leaves: {
                            increment: leaveAdjustment
                        }
                    }
                });
            }

            // Get updated teacher stats
            const teacher = await prisma.teacher.findUnique({
                where: { id: teacher_id },
                select: { total_leaves: true, used_leaves: true }
            });

            return {
                success: true,
                message: "Teacher attendance marked successfully",
                data: {
                    teacher_id,
                    status,
                    leaves_info: teacher ? {
                        total: teacher.total_leaves,
                        used: teacher.used_leaves,
                        remaining: teacher.total_leaves - teacher.used_leaves
                    } : null
                }
            };
        } catch (error: any) {
            console.error("markTeacherAttendance error:", error);
            return {
                success: false,
                message: error.message || "Failed to mark teacher attendance",
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
                        academic_year_id: academicYearId || "",
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
                        academic_year_id: academicYearId || "",
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

            // Re-fetch teacher to get latest leaves info (as it might have changed)
            const teacherInfo = await prisma.teacher.findUnique({
                where: { id: teacherId },
                select: { total_leaves: true, used_leaves: true }
            });

            return {
                success: true,
                data: {
                    ...summary,
                    leaves_info: {
                        total_leaves: teacherInfo?.total_leaves || 24,
                        used_leaves: teacherInfo?.used_leaves || 0,
                        leaves_remaining: (teacherInfo?.total_leaves || 24) - (teacherInfo?.used_leaves || 0)
                    }
                },
                message: "Teacher attendance summary retrieved"
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
