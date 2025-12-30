import { prisma } from "../lib/db";

/**
 * Employee ID Generation Service
 * Generates unique employee IDs in format: EMP-YYYY-BRANCHCODE-XXXX
 */

export class EmployeeIdService {
    /**
     * Generate Employee ID
     * Format: EMP-2025-MC-0001
     */
    static async generateEmployeeId(userId: string, branchId: string): Promise<string> {
        try {
            // Get branch code
            const branch = await prisma.branch.findUnique({
                where: { id: branchId },
                select: { code: true },
            });

            if (!branch) {
                throw new Error("Branch not found");
            }

            const year = new Date().getFullYear();
            const branchCode = branch.code.toUpperCase();

            // Find the highest existing employee ID for this year and branch
            const existingIds = await prisma.user.findMany({
                where: {
                    employee_id: {
                        contains: `EMP-${year}-${branchCode}-`,
                    },
                },
                select: { employee_id: true },
                orderBy: { employee_id: "desc" },
                take: 1,
            });

            let nextSequence = 1;

            if (existingIds.length > 0 && existingIds[0].employee_id) {
                // Extract sequence number from last ID
                const lastId = existingIds[0].employee_id;
                const parts = lastId.split("-");
                if (parts.length === 4) {
                    const lastSequence = parseInt(parts[3]);
                    if (!isNaN(lastSequence)) {
                        nextSequence = lastSequence + 1;
                    }
                }
            }

            // Format: EMP-YYYY-BRANCHCODE-XXXX
            const employeeId = `EMP-${year}-${branchCode}-${String(nextSequence).padStart(4, "0")}`;

            return employeeId;
        } catch (error: any) {
            throw new Error(`Failed to generate employee ID: ${error.message}`);
        }
    }

    /**
     * Assign Employee ID to a user
     */
    static async assignEmployeeId(userId: string, branchId: string): Promise<string> {
        try {
            // Check if user already has an employee ID
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { employee_id: true },
            });

            if (user?.employee_id) {
                return user.employee_id;
            }

            // Generate new employee ID
            const employeeId = await this.generateEmployeeId(userId, branchId);

            // Update user with new employee ID
            await prisma.user.update({
                where: { id: userId },
                data: { employee_id: employeeId },
            });

            return employeeId;
        } catch (error: any) {
            throw new Error(`Failed to assign employee ID: ${error.message}`);
        }
    }

    /**
     * Generate Admission Number for students
     * Format: ADM-YYYY-BRANCHCODE-XXXX
     */
    static async generateAdmissionNumber(studentId: string, branchId: string): Promise<string> {
        try {
            // Get branch code
            const branch = await prisma.branch.findUnique({
                where: { id: branchId },
                select: { code: true },
            });

            if (!branch) {
                throw new Error("Branch not found");
            }

            const year = new Date().getFullYear();
            const branchCode = branch.code.toUpperCase();

            // Find the highest existing admission number for this year and branch
            const existingNumbers = await prisma.student.findMany({
                where: {
                    admission_number: {
                        contains: `ADM-${year}-${branchCode}-`,
                    },
                },
                select: { admission_number: true },
                orderBy: { admission_number: "desc" },
                take: 1,
            });

            let nextSequence = 1;

            if (existingNumbers.length > 0 && existingNumbers[0].admission_number) {
                const lastNumber = existingNumbers[0].admission_number;
                const parts = lastNumber.split("-");
                if (parts.length === 4) {
                    const lastSequence = parseInt(parts[3]);
                    if (!isNaN(lastSequence)) {
                        nextSequence = lastSequence + 1;
                    }
                }
            }

            const admissionNumber = `ADM-${year}-${branchCode}-${String(nextSequence).padStart(4, "0")}`;

            return admissionNumber;
        } catch (error: any) {
            throw new Error(`Failed to generate admission number: ${error.message}`);
        }
    }

    /**
     * Assign Admission Number to a student
     */
    static async assignAdmissionNumber(studentId: string, branchId: string): Promise<string> {
        try {
            // Check if student already has an admission number
            const student = await prisma.student.findUnique({
                where: { id: studentId },
                select: { admission_number: true },
            });

            if (student?.admission_number) {
                return student.admission_number;
            }

            // Generate new admission number
            const admissionNumber = await this.generateAdmissionNumber(studentId, branchId);

            // Update student with new admission number
            await prisma.student.update({
                where: { id: studentId },
                data: { admission_number: admissionNumber },
            });

            return admissionNumber;
        } catch (error: any) {
            throw new Error(`Failed to assign admission number: ${error.message}`);
        }
    }

    /**
     * Bulk generate employee IDs for existing users
     */
    static async bulkGenerateEmployeeIds(): Promise<{ generated: number; skipped: number }> {
        try {
            const users = await prisma.user.findMany({
                where: {
                    employee_id: null,
                    role: {
                        name: {
                            in: ["SuperAdmin", "BranchAdmin", "Teacher"],
                        },
                    },
                },
                select: { id: true, branch_id: true },
            });

            let generated = 0;
            let skipped = 0;

            for (const user of users) {
                try {
                    await this.assignEmployeeId(user.id, user.branch_id);
                    generated++;
                } catch (error) {
                    console.error(`Failed to generate employee ID for user ${user.id}:`, error);
                    skipped++;
                }
            }

            return { generated, skipped };
        } catch (error: any) {
            throw new Error(`Bulk generation failed: ${error.message}`);
        }
    }

    /**
     * Bulk generate admission numbers for existing students
     */
    static async bulkGenerateAdmissionNumbers(): Promise<{ generated: number; skipped: number }> {
        try {
            const students = await prisma.student.findMany({
                where: {
                    admission_number: null,
                },
                select: { id: true, branch_id: true },
            });

            let generated = 0;
            let skipped = 0;

            for (const student of students) {
                try {
                    await this.assignAdmissionNumber(student.id, student.branch_id);
                    generated++;
                } catch (error) {
                    console.error(`Failed to generate admission number for student ${student.id}:`, error);
                    skipped++;
                }
            }

            return { generated, skipped };
        } catch (error: any) {
            throw new Error(`Bulk generation failed: ${error.message}`);
        }
    }
}

export default EmployeeIdService;
