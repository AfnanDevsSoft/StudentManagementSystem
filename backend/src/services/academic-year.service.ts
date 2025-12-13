import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class AcademicYearService {
    static async getAll(branch_id: string) {
        try {
            const academicYears = await prisma.academicYear.findMany({
                where: { branch_id },
                orderBy: { start_date: 'desc' }
            });
            return { success: true, data: academicYears };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }
    static async create(data: any) {
        try {
            const academicYear = await prisma.academicYear.create({
                data: {
                    ...data,
                    start_date: new Date(data.start_date),
                    end_date: new Date(data.end_date)
                }
            });
            return { success: true, data: academicYear, message: "Academic Year created successfully" };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }

    static async update(id: string, data: any) {
        try {
            const updateData = { ...data };
            if (updateData.start_date) updateData.start_date = new Date(updateData.start_date);
            if (updateData.end_date) updateData.end_date = new Date(updateData.end_date);

            const academicYear = await prisma.academicYear.update({
                where: { id },
                data: updateData
            });
            return { success: true, data: academicYear, message: "Academic Year updated successfully" };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }

    static async delete(id: string) {
        try {
            await prisma.academicYear.delete({ where: { id } });
            return { success: true, message: "Academic Year deleted successfully" };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }
}

export default AcademicYearService;
