import { prisma } from "../lib/db";

export class SubjectService {
    static async getAll(branch_id: string) {
        try {
            const subjects = await prisma.subject.findMany({
                where: { branch_id, is_active: true },
                orderBy: { name: 'asc' }
            });
            return { success: true, data: subjects };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }
    static async create(data: any) {
        try {
            const subject = await prisma.subject.create({ data });
            return { success: true, data: subject, message: "Subject created successfully" };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }

    static async update(id: string, data: any) {
        try {
            const subject = await prisma.subject.update({
                where: { id },
                data
            });
            return { success: true, data: subject, message: "Subject updated successfully" };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }

    static async delete(id: string) {
        try {
            await prisma.subject.delete({ where: { id } });
            return { success: true, message: "Subject deleted successfully" };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }
}

export default SubjectService;
