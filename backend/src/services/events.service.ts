import { prisma } from "../lib/db";

interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    pagination?: any;
}

class EventsService {
    /**
     * Get all events for a branch
     */
    static async getEvents(
        branchId: string,
        filters?: any,
        userContext?: any
    ): Promise<ApiResponse> {
        try {
            // Data Scoping
            if (userContext && userContext.role?.name !== 'SuperAdmin') {
                branchId = userContext.branch_id;
            }

            const where: any = { branch_id: branchId, is_active: true };

            if (filters?.eventType) {
                where.event_type = filters.eventType;
            }

            if (filters?.startDate && filters?.endDate) {
                where.start_date = {
                    gte: new Date(filters.startDate),
                    lte: new Date(filters.endDate),
                };
            }

            if (filters?.isHoliday !== undefined) {
                where.is_holiday = filters.isHoliday;
            }

            const events = await prisma.event.findMany({
                where,
                orderBy: { start_date: "asc" },
            });

            return {
                success: true,
                message: "Events fetched successfully",
                data: events,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to fetch events",
            };
        }
    }

    /**
     * Get upcoming events (next 30 days)
     */
    static async getUpcomingEvents(branchId: string, userContext?: any): Promise<ApiResponse> {
        try {
            // Data Scoping
            if (userContext && userContext.role?.name !== 'SuperAdmin') {
                branchId = userContext.branch_id;
            }
            const now = new Date();
            const thirtyDaysLater = new Date();
            thirtyDaysLater.setDate(now.getDate() + 30);

            const events = await prisma.event.findMany({
                where: {
                    branch_id: branchId,
                    is_active: true,
                    start_date: {
                        gte: now,
                        lte: thirtyDaysLater,
                    },
                },
                orderBy: { start_date: "asc" },
                take: 20,
            });

            return {
                success: true,
                message: "Upcoming events fetched successfully",
                data: events,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to fetch upcoming events",
            };
        }
    }

    /**
     * Create an event
     */
    static async createEvent(data: any, userContext?: any): Promise<ApiResponse> {
        try {
            // Data Scoping
            if (userContext && userContext.role?.name !== 'SuperAdmin') {
                data.branch_id = userContext.branch_id;
            }
            const event = await prisma.event.create({
                data: {
                    branch_id: data.branch_id,
                    title: data.title,
                    description: data.description,
                    event_type: data.event_type,
                    target_audience: data.target_audience || "all",
                    grade_level_id: data.grade_level_id,
                    start_date: new Date(data.start_date),
                    end_date: new Date(data.end_date),
                    start_time: data.start_time,
                    end_time: data.end_time,
                    location: data.location,
                    organizer: data.organizer,
                    is_holiday: data.is_holiday || false,
                    is_recurring: data.is_recurring || false,
                    recurrence_rule: data.recurrence_rule,
                    attachments: data.attachments,
                    created_by: data.created_by,
                },
            });

            return {
                success: true,
                message: "Event created successfully",
                data: event,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to create event",
            };
        }
    }

    /**
     * Update an event
     */
    static async updateEvent(id: string, data: any): Promise<ApiResponse> {
        try {
            const event = await prisma.event.update({
                where: { id },
                data,
            });

            return {
                success: true,
                message: "Event updated successfully",
                data: event,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to update event",
            };
        }
    }

    /**
     * Delete an event
     */
    static async deleteEvent(id: string): Promise<ApiResponse> {
        try {
            await prisma.event.update({
                where: { id },
                data: { is_active: false },
            });

            return {
                success: true,
                message: "Event deleted successfully",
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to delete event",
            };
        }
    }

    /**
     * Get events calendar (monthly view)
     */
    static async getMonthlyCalendar(
        branchId: string,
        year: number,
        month: number,
        userContext?: any
    ): Promise<ApiResponse> {
        try {
            // Data Scoping
            if (userContext && userContext.role?.name !== 'SuperAdmin') {
                branchId = userContext.branch_id;
            }
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);

            const events = await prisma.event.findMany({
                where: {
                    branch_id: branchId,
                    is_active: true,
                    OR: [
                        {
                            start_date: {
                                gte: startDate,
                                lte: endDate,
                            },
                        },
                        {
                            end_date: {
                                gte: startDate,
                                lte: endDate,
                            },
                        },
                    ],
                },
                orderBy: { start_date: "asc" },
            });

            return {
                success: true,
                message: "Monthly calendar fetched successfully",
                data: events,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to fetch monthly calendar",
            };
        }
    }
}

export default EventsService;
