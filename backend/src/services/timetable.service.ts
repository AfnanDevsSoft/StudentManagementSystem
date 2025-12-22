import { prisma } from "../lib/db";

interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    pagination?: any;
}

class TimetableService {
    // ==================== TIME SLOTS ====================

    /**
     * Get all time slots for a branch
     */
    static async getTimeSlots(branchId: string): Promise<ApiResponse> {
        try {
            const timeSlots = await prisma.timeSlot.findMany({
                where: { branch_id: branchId, is_active: true },
                orderBy: { sort_order: "asc" },
            });

            return {
                success: true,
                message: "Time slots fetched successfully",
                data: timeSlots,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to fetch time slots",
            };
        }
    }

    /**
     * Create a new time slot
     */
    static async createTimeSlot(data: any): Promise<ApiResponse> {
        try {
            const timeSlot = await prisma.timeSlot.create({
                data: {
                    branch_id: data.branch_id,
                    slot_name: data.slot_name,
                    start_time: data.start_time,
                    end_time: data.end_time,
                    slot_type: data.slot_type || "class",
                    sort_order: data.sort_order,
                },
            });

            return {
                success: true,
                message: "Time slot created successfully",
                data: timeSlot,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to create time slot",
            };
        }
    }

    /**
     * Update a time slot
     */
    static async updateTimeSlot(id: string, data: any): Promise<ApiResponse> {
        try {
            const timeSlot = await prisma.timeSlot.update({
                where: { id },
                data,
            });

            return {
                success: true,
                message: "Time slot updated successfully",
                data: timeSlot,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to update time slot",
            };
        }
    }

    /**
     * Delete a time slot
     */
    static async deleteTimeSlot(id: string): Promise<ApiResponse> {
        try {
            await prisma.timeSlot.update({
                where: { id },
                data: { is_active: false },
            });

            return {
                success: true,
                message: "Time slot deleted successfully",
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to delete time slot",
            };
        }
    }

    // ==================== ROOMS ====================

    /**
     * Get all rooms for a branch
     */
    static async getRooms(branchId: string): Promise<ApiResponse> {
        try {
            const rooms = await prisma.room.findMany({
                where: { branch_id: branchId, is_active: true },
                orderBy: { room_number: "asc" },
            });

            return {
                success: true,
                message: "Rooms fetched successfully",
                data: rooms,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to fetch rooms",
            };
        }
    }

    /**
     * Create a new room
     */
    static async createRoom(data: any): Promise<ApiResponse> {
        try {
            const room = await prisma.room.create({
                data: {
                    branch_id: data.branch_id,
                    room_number: data.room_number,
                    room_name: data.room_name,
                    building: data.building,
                    floor: data.floor,
                    capacity: data.capacity || 40,
                    room_type: data.room_type || "classroom",
                    facilities: data.facilities,
                },
            });

            return {
                success: true,
                message: "Room created successfully",
                data: room,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to create room",
            };
        }
    }

    /**
     * Update a room
     */
    static async updateRoom(id: string, data: any): Promise<ApiResponse> {
        try {
            const room = await prisma.room.update({
                where: { id },
                data,
            });

            return {
                success: true,
                message: "Room updated successfully",
                data: room,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to update room",
            };
        }
    }

    /**
     * Delete a room
     */
    static async deleteRoom(id: string): Promise<ApiResponse> {
        try {
            await prisma.room.update({
                where: { id },
                data: { is_active: false },
            });

            return {
                success: true,
                message: "Room deleted successfully",
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to delete room",
            };
        }
    }

    // ==================== TIMETABLE ENTRIES ====================

    /**
     * Get timetable for a specific course
     */
    static async getCourseTimetable(courseId: string): Promise<ApiResponse> {
        try {
            const entries = await prisma.timetableEntry.findMany({
                where: { course_id: courseId, is_active: true },
                include: {
                    time_slot: true,
                    room: true,
                },
                orderBy: [
                    { day_of_week: "asc" },
                    { time_slot: { sort_order: "asc" } },
                ],
            });

            return {
                success: true,
                message: "Course timetable fetched successfully",
                data: entries,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to fetch course timetable",
            };
        }
    }

    /**
     * Get timetable for a specific teacher
     */
    static async getTeacherTimetable(teacherId: string): Promise<ApiResponse> {
        try {
            const entries = await prisma.timetableEntry.findMany({
                where: {
                    course: { teacher_id: teacherId },
                    is_active: true,
                },
                include: {
                    course: {
                        include: {
                            subject: true,
                            grade_level: true,
                        },
                    },
                    time_slot: true,
                    room: true,
                },
                orderBy: [
                    { day_of_week: "asc" },
                    { time_slot: { sort_order: "asc" } },
                ],
            });

            return {
                success: true,
                message: "Teacher timetable fetched successfully",
                data: entries,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to fetch teacher timetable",
            };
        }
    }

    /**
     * Get timetable for a specific student (via enrollments)
     */
    static async getStudentTimetable(studentId: string): Promise<ApiResponse> {
        try {
            // First get student's enrolled courses
            const enrollments = await prisma.studentEnrollment.findMany({
                where: { student_id: studentId, status: "enrolled" },
                select: { course_id: true },
            });

            const courseIds = enrollments.map((e) => e.course_id);

            const entries = await prisma.timetableEntry.findMany({
                where: {
                    course_id: { in: courseIds },
                    is_active: true,
                },
                include: {
                    course: {
                        include: {
                            subject: true,
                            teacher: true,
                        },
                    },
                    time_slot: true,
                    room: true,
                },
                orderBy: [
                    { day_of_week: "asc" },
                    { time_slot: { sort_order: "asc" } },
                ],
            });

            return {
                success: true,
                message: "Student timetable fetched successfully",
                data: entries,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to fetch student timetable",
            };
        }
    }

    /**
     * Get full branch timetable (all entries for an academic year)
     */
    static async getBranchTimetable(academicYearId: string): Promise<ApiResponse> {
        try {
            const entries = await prisma.timetableEntry.findMany({
                where: {
                    academic_year_id: academicYearId,
                    is_active: true,
                },
                include: {
                    course: {
                        include: {
                            subject: true,
                            grade_level: true,
                            teacher: true,
                        },
                    },
                    time_slot: true,
                    room: true,
                },
                orderBy: [
                    { day_of_week: "asc" },
                    { time_slot: { sort_order: "asc" } },
                ],
            });

            return {
                success: true,
                message: "Branch timetable fetched successfully",
                data: entries,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to fetch branch timetable",
            };
        }
    }

    /**
     * Create a timetable entry
     */
    static async createTimetableEntry(data: any): Promise<ApiResponse> {
        try {
            // Check for conflicts (same teacher, same time, same day)
            const conflict = await this.checkForConflicts(
                data.course_id,
                data.time_slot_id,
                data.day_of_week,
                data.room_id
            );

            if (!conflict.success) {
                return conflict;
            }

            const entry = await prisma.timetableEntry.create({
                data: {
                    academic_year_id: data.academic_year_id,
                    course_id: data.course_id,
                    time_slot_id: data.time_slot_id,
                    room_id: data.room_id,
                    day_of_week: data.day_of_week,
                },
                include: {
                    course: true,
                    time_slot: true,
                    room: true,
                },
            });

            return {
                success: true,
                message: "Timetable entry created successfully",
                data: entry,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to create timetable entry",
            };
        }
    }

    /**
     * Update a timetable entry
     */
    static async updateTimetableEntry(id: string, data: any): Promise<ApiResponse> {
        try {
            const entry = await prisma.timetableEntry.update({
                where: { id },
                data,
                include: {
                    course: true,
                    time_slot: true,
                    room: true,
                },
            });

            return {
                success: true,
                message: "Timetable entry updated successfully",
                data: entry,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to update timetable entry",
            };
        }
    }

    /**
     * Delete a timetable entry
     */
    static async deleteTimetableEntry(id: string): Promise<ApiResponse> {
        try {
            await prisma.timetableEntry.delete({
                where: { id },
            });

            return {
                success: true,
                message: "Timetable entry deleted successfully",
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to delete timetable entry",
            };
        }
    }

    /**
     * Check for scheduling conflicts
     */
    private static async checkForConflicts(
        courseId: string,
        timeSlotId: string,
        dayOfWeek: number,
        roomId?: string
    ): Promise<ApiResponse> {
        try {
            // Get the course to find teacher
            const course = await prisma.course.findUnique({
                where: { id: courseId },
                select: { teacher_id: true },
            });

            if (!course) {
                return { success: false, message: "Course not found" };
            }

            // Check for teacher conflict
            const teacherConflict = await prisma.timetableEntry.findFirst({
                where: {
                    course: { teacher_id: course.teacher_id },
                    time_slot_id: timeSlotId,
                    day_of_week: dayOfWeek,
                    is_active: true,
                },
                include: {
                    course: true,
                },
            });

            if (teacherConflict) {
                return {
                    success: false,
                    message: `Teacher conflict: Already teaching ${teacherConflict.course.course_name} at this time`,
                };
            }

            // Check for room conflict (if room is specified)
            if (roomId) {
                const roomConflict = await prisma.timetableEntry.findFirst({
                    where: {
                        room_id: roomId,
                        time_slot_id: timeSlotId,
                        day_of_week: dayOfWeek,
                        is_active: true,
                    },
                    include: {
                        course: true,
                    },
                });

                if (roomConflict) {
                    return {
                        success: false,
                        message: `Room conflict: Room is already booked for ${roomConflict.course.course_name}`,
                    };
                }
            }

            return { success: true, message: "No conflicts found" };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to check conflicts",
            };
        }
    }
}

export default TimetableService;
