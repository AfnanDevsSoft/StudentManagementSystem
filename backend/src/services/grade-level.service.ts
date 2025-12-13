import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class GradeLevelService {
    static async getAll(branch_id: string) {
        try {
            const gradeLevels = await prisma.gradeLevel.findMany({
                where: { branch_id, is_active: true },
                orderBy: { sort_order: 'asc' }
            });
            return { success: true, data: gradeLevels };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }
    static async create(data: any) {
        try {
            const gradeLevel = await prisma.gradeLevel.create({ data });
            return { success: true, data: gradeLevel, message: "Grade Level created successfully" };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }

    static async update(id: string, data: any) {
        try {
            const gradeLevel = await prisma.gradeLevel.update({
                where: { id },
                data
            });
            return { success: true, data: gradeLevel, message: "Grade Level updated successfully" };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }

    static async delete(id: string) {
        try {
            await prisma.gradeLevel.delete({ where: { id } });
            return { success: true, message: "Grade Level deleted successfully" };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }
}

export default GradeLevelService;
