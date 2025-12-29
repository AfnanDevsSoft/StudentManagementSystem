import { prisma } from "../lib/db";

export class WorkingDaysService {
    /**
     * Get working days configuration for a branch/academic year
     */
    static async getConfig(
        branchId: string,
        academicYearId?: string,
        gradeLevelId?: string
    ) {
        try {
            const where: any = {
                branch_id: branchId,
                is_active: true,
            };

            if (academicYearId) {
                where.academic_year_id = academicYearId;
            }

            if (gradeLevelId) {
                where.grade_level_id = gradeLevelId;
            }

            const config = await prisma.workingDaysConfig.findFirst({
                where,
                orderBy: { created_at: "desc" },
            });

            return {
                success: true,
                data: config,
            };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }

    /**
     * Get all working days configurations
     */
    static async getAllConfigs(
        branchId: string,
        page: number = 1,
        limit: number = 20
    ) {
        try {
            const skip = (page - 1) * limit;

            const [configs, total] = await Promise.all([
                prisma.workingDaysConfig.findMany({
                    where: { branch_id: branchId },
                    skip,
                    take: limit,
                    orderBy: { created_at: "desc" },
                }),
                prisma.workingDaysConfig.count({
                    where: { branch_id: branchId },
                }),
            ]);

            return {
                success: true,
                data: configs,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }

    /**
     * Create or update working days configuration
     */
    static async upsertConfig(data: {
        branch_id: string;
        academic_year_id?: string;
        grade_level_id?: string;
        total_days: number;
        start_date: string | Date;
        end_date: string | Date;
    }) {
        try {
            const {
                branch_id,
                academic_year_id,
                grade_level_id,
                total_days,
                start_date,
                end_date,
            } = data;

            // Check if config already exists
            const existing = await prisma.workingDaysConfig.findFirst({
                where: {
                    branch_id,
                    academic_year_id: academic_year_id || null,
                    grade_level_id: grade_level_id || null,
                },
            });

            let config;

            if (existing) {
                // Update existing config
                config = await prisma.workingDaysConfig.update({
                    where: { id: existing.id },
                    data: {
                        total_days,
                        start_date: new Date(start_date),
                        end_date: new Date(end_date),
                        is_active: true,
                    },
                });
            } else {
                // Create new config
                config = await prisma.workingDaysConfig.create({
                    data: {
                        branch_id,
                        academic_year_id: academic_year_id || null,
                        grade_level_id: grade_level_id || null,
                        total_days,
                        start_date: new Date(start_date),
                        end_date: new Date(end_date),
                        is_active: true,
                    },
                });
            }

            return {
                success: true,
                data: config,
                message: existing
                    ? "Working days config updated successfully"
                    : "Working days config created successfully",
            };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }

    /**
     * Delete working days configuration
     */
    static async deleteConfig(id: string) {
        try {
            await prisma.workingDaysConfig.delete({
                where: { id },
            });

            return {
                success: true,
                message: "Working days config deleted successfully",
            };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }

    /**
     * Calculate total working days between two dates
     * This is a helper function that can be used to set total_days
     */
    static async calculateWorkingDays(
        startDate: Date | string,
        endDate: Date | string,
        branchId: string
    ): Promise<number> {
        const start = new Date(startDate);
        const end = new Date(endDate);

        let workingDays = 0;
        const current = new Date(start);

        while (current <= end) {
            const dayOfWeek = current.getDay();
            // Skip weekends (Saturday = 6, Sunday = 0)
            // Adjust this logic based on your region's weekend days
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                workingDays++;
            }
            current.setDate(current.getDate() + 1);
        }

        // TODO: In the future, you could also subtract public holidays
        // by querying an events table for holidays in this date range

        return workingDays;
    }
}

export default WorkingDaysService;
