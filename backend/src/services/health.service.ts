import { prisma } from "../lib/db";

interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    pagination?: {
        total: number;
        pages: number;
        page: number;
        limit: number;
    };
}

class HealthService {
    // ==================== HEALTH RECORDS ====================

    /**
     * Get all health records with pagination
     */
    static async getAllRecords(page: number = 1, limit: number = 20, userContext?: any): Promise<ApiResponse> {
        try {
            const skip = (page - 1) * limit;
            const where: any = {};

            // Data Scoping
            if (userContext && userContext.role?.name !== 'SuperAdmin') {
                where.student = { branch_id: userContext.branch_id };
            }

            const [records, total] = await Promise.all([
                prisma.healthRecord.findMany({
                    where,
                    skip,
                    take: limit,
                    include: {
                        student: {
                            select: {
                                id: true,
                                first_name: true,
                                last_name: true,
                                student_code: true,
                            },
                        },
                        medical_checkups: {
                            orderBy: { checkup_date: 'desc' },
                            take: 1,
                        },
                    },
                    orderBy: { created_at: 'desc' },
                }),
                prisma.healthRecord.count({ where }),
            ]);

            // Transform records to match frontend HealthRecord interface
            const transformedRecords = records.map((r: any) => ({
                ...r,
                last_checkup_date: r.medical_checkups?.[0]?.checkup_date || null,
            }));

            return {
                success: true,
                message: "Health records fetched successfully",
                data: transformedRecords,
                pagination: {
                    total,
                    pages: Math.ceil(total / limit),
                    page,
                    limit,
                },
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to fetch health records",
            };
        }
    }

    /**
     * Update health record by ID
     */
    static async updateRecordById(id: string, data: any): Promise<ApiResponse> {
        try {
            const record = await prisma.healthRecord.update({
                where: { id },
                data: {
                    blood_group: data.blood_group,
                    height: data.height,
                    weight: data.weight,
                    allergies: data.allergies,
                    chronic_conditions: data.chronic_conditions || data.medical_history,
                    medications: data.medications,
                    emergency_contact: data.emergency_contact,
                    emergency_phone: data.emergency_phone,
                    doctor_name: data.doctor_name,
                    doctor_phone: data.doctor_phone,
                    insurance_provider: data.insurance_provider,
                    insurance_number: data.insurance_number,
                    notes: data.notes,
                },
                include: {
                    student: {
                        select: {
                            first_name: true,
                            last_name: true,
                        },
                    },
                },
            });

            return {
                success: true,
                message: "Health record updated successfully",
                data: record,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to update health record",
            };
        }
    }

    /**
     * Delete health record by ID
     */
    static async deleteRecordById(id: string): Promise<ApiResponse> {
        try {
            await prisma.healthRecord.delete({
                where: { id },
            });

            return {
                success: true,
                message: "Health record deleted successfully",
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to delete health record",
            };
        }
    }

    /**
     * Get health record for a student
     */
    static async getHealthRecord(studentId: string, userContext?: any): Promise<ApiResponse> {
        try {
            const where: any = { student_id: studentId };

            // Data Scoping
            if (userContext && userContext.role?.name !== 'SuperAdmin') {
                where.student = { branch_id: userContext.branch_id };
            }

            const healthRecord = await prisma.healthRecord.findUnique({
                where,
                include: {
                    medical_checkups: {
                        orderBy: { checkup_date: "desc" },
                        take: 10,
                    },
                    vaccinations: {
                        orderBy: { administered_date: "desc" },
                    },
                    student: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true,
                            student_code: true,
                        },
                    },
                },
            });

            return {
                success: true,
                message: healthRecord
                    ? "Health record fetched successfully"
                    : "No health record found",
                data: healthRecord,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to fetch health record",
            };
        }
    }

    /**
     * Create or update health record
     */
    static async upsertHealthRecord(
        studentId: string,
        data: any,
        userContext?: any
    ): Promise<ApiResponse> {
        try {
            // Data Scoping: Ensure student belongs to user's branch
            if (userContext && userContext.role?.name !== 'SuperAdmin') {
                const student = await prisma.student.findUnique({
                    where: { id: studentId, branch_id: userContext.branch_id }
                });
                if (!student) {
                    throw new Error("Student not found or access denied");
                }
            }

            const healthRecord = await prisma.healthRecord.upsert({
                where: { student_id: studentId },
                create: {
                    student_id: studentId,
                    blood_group: data.blood_group,
                    height: data.height,
                    weight: data.weight,
                    allergies: data.allergies,
                    chronic_conditions: data.chronic_conditions,
                    medications: data.medications,
                    emergency_contact: data.emergency_contact,
                    emergency_phone: data.emergency_phone,
                    doctor_name: data.doctor_name,
                    doctor_phone: data.doctor_phone,
                    insurance_provider: data.insurance_provider,
                    insurance_number: data.insurance_number,
                    notes: data.notes,
                },
                update: {
                    blood_group: data.blood_group,
                    height: data.height,
                    weight: data.weight,
                    allergies: data.allergies,
                    chronic_conditions: data.chronic_conditions,
                    medications: data.medications,
                    emergency_contact: data.emergency_contact,
                    emergency_phone: data.emergency_phone,
                    doctor_name: data.doctor_name,
                    doctor_phone: data.doctor_phone,
                    insurance_provider: data.insurance_provider,
                    insurance_number: data.insurance_number,
                    notes: data.notes,
                },
                include: {
                    student: {
                        select: {
                            first_name: true,
                            last_name: true,
                        },
                    },
                },
            });

            return {
                success: true,
                message: "Health record saved successfully",
                data: healthRecord,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to save health record",
            };
        }
    }

    // ==================== MEDICAL CHECKUPS ====================

    /**
     * Get medical checkups for a student
     */
    static async getMedicalCheckups(studentId: string, userContext?: any): Promise<ApiResponse> {
        try {
            const where: any = { student_id: studentId };
            // Data Scoping
            if (userContext && userContext.role?.name !== 'SuperAdmin') {
                where.student = { branch_id: userContext.branch_id };
            }

            // First get health record
            const healthRecord = await prisma.healthRecord.findUnique({
                where,
                select: { id: true },
            });

            if (!healthRecord) {
                return {
                    success: false,
                    message: "Health record not found. Please create one first.",
                };
            }

            const checkups = await prisma.medicalCheckup.findMany({
                where: { health_record_id: healthRecord.id },
                orderBy: { checkup_date: "desc" },
            });

            return {
                success: true,
                message: "Medical checkups fetched successfully",
                data: checkups,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to fetch medical checkups",
            };
        }
    }

    /**
     * Add a medical checkup
     */
    static async addMedicalCheckup(
        studentId: string,
        data: any,
        userContext?: any
    ): Promise<ApiResponse> {
        try {
            const where: any = { student_id: studentId };
            // Data Scoping
            if (userContext && userContext.role?.name !== 'SuperAdmin') {
                where.student = { branch_id: userContext.branch_id };
            }

            // Get or create health record
            let healthRecord = await prisma.healthRecord.findUnique({
                where,
            });

            if (!healthRecord) {
                healthRecord = await prisma.healthRecord.create({
                    data: { student_id: studentId },
                });
            }

            const checkup = await prisma.medicalCheckup.create({
                data: {
                    health_record_id: healthRecord.id,
                    checkup_date: new Date(data.checkup_date),
                    height: data.height,
                    weight: data.weight,
                    blood_pressure: data.blood_pressure,
                    temperature: data.temperature,
                    pulse_rate: data.pulse_rate,
                    vision_left: data.vision_left,
                    vision_right: data.vision_right,
                    dental_checkup: data.dental_checkup || false,
                    doctor_name: data.doctor_name,
                    findings: data.findings,
                    recommendations: data.recommendations,
                    next_checkup_date: data.next_checkup_date
                        ? new Date(data.next_checkup_date)
                        : null,
                },
            });

            return {
                success: true,
                message: "Medical checkup added successfully",
                data: checkup,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to add medical checkup",
            };
        }
    }

    /**
     * Update a medical checkup
     */
    static async updateMedicalCheckup(
        id: string,
        data: any
    ): Promise<ApiResponse> {
        try {
            const checkup = await prisma.medicalCheckup.update({
                where: { id },
                data,
            });

            return {
                success: true,
                message: "Medical checkup updated successfully",
                data: checkup,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to update medical checkup",
            };
        }
    }

    /**
     * Delete a medical checkup
     */
    static async deleteMedicalCheckup(id: string): Promise<ApiResponse> {
        try {
            await prisma.medicalCheckup.delete({
                where: { id },
            });

            return {
                success: true,
                message: "Medical checkup deleted successfully",
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to delete medical checkup",
            };
        }
    }

    // ==================== VACCINATIONS ====================

    /**
     * Get vaccinations for a student
     */
    static async getVaccinations(studentId: string): Promise<ApiResponse> {
        try {
            const healthRecord = await prisma.healthRecord.findUnique({
                where: { student_id: studentId },
                select: { id: true },
            });

            if (!healthRecord) {
                return {
                    success: false,
                    message: "Health record not found. Please create one first.",
                };
            }

            const vaccinations = await prisma.vaccination.findMany({
                where: { health_record_id: healthRecord.id },
                orderBy: { administered_date: "desc" },
            });

            return {
                success: true,
                message: "Vaccinations fetched successfully",
                data: vaccinations,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to fetch vaccinations",
            };
        }
    }

    /**
     * Add a vaccination record
     */
    static async addVaccination(
        studentId: string,
        data: any
    ): Promise<ApiResponse> {
        try {
            let healthRecord = await prisma.healthRecord.findUnique({
                where: { student_id: studentId },
            });

            if (!healthRecord) {
                healthRecord = await prisma.healthRecord.create({
                    data: { student_id: studentId },
                });
            }

            const vaccination = await prisma.vaccination.create({
                data: {
                    health_record_id: healthRecord.id,
                    vaccine_name: data.vaccine_name,
                    vaccine_type: data.vaccine_type,
                    dose_number: data.dose_number || 1,
                    administered_date: new Date(data.administered_date),
                    administered_by: data.administered_by,
                    batch_number: data.batch_number,
                    manufacturer: data.manufacturer,
                    next_dose_date: data.next_dose_date
                        ? new Date(data.next_dose_date)
                        : null,
                    side_effects: data.side_effects,
                    certificate_url: data.certificate_url,
                },
            });

            return {
                success: true,
                message: "Vaccination record added successfully",
                data: vaccination,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to add vaccination record",
            };
        }
    }

    /**
     * Update a vaccination record
     */
    static async updateVaccination(id: string, data: any): Promise<ApiResponse> {
        try {
            const vaccination = await prisma.vaccination.update({
                where: { id },
                data,
            });

            return {
                success: true,
                message: "Vaccination record updated successfully",
                data: vaccination,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to update vaccination record",
            };
        }
    }

    /**
     * Delete a vaccination record
     */
    static async deleteVaccination(id: string): Promise<ApiResponse> {
        try {
            await prisma.vaccination.delete({
                where: { id },
            });

            return {
                success: true,
                message: "Vaccination record deleted successfully",
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to delete vaccination record",
            };
        }
    }

    // ==================== MEDICAL INCIDENTS ====================

    /**
     * Get medical incidents for a student
     */
    static async getMedicalIncidents(studentId: string): Promise<ApiResponse> {
        try {
            const incidents = await prisma.medicalIncident.findMany({
                where: { student_id: studentId },
                orderBy: { incident_date: "desc" },
            });

            return {
                success: true,
                message: "Medical incidents fetched successfully",
                data: incidents,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to fetch medical incidents",
            };
        }
    }

    /**
     * Report a medical incident
     */
    static async reportIncident(data: any): Promise<ApiResponse> {
        try {
            const incident = await prisma.medicalIncident.create({
                data: {
                    student_id: data.student_id,
                    incident_date: data.incident_date
                        ? new Date(data.incident_date)
                        : new Date(),
                    incident_type: data.incident_type,
                    severity: data.severity,
                    description: data.description,
                    treatment_given: data.treatment_given,
                    attended_by: data.attended_by,
                    parent_notified: data.parent_notified || false,
                    hospital_visit: data.hospital_visit || false,
                    hospital_name: data.hospital_name,
                    follow_up_required: data.follow_up_required || false,
                    follow_up_notes: data.follow_up_notes,
                    resolved_at: data.resolved_at ? new Date(data.resolved_at) : null,
                },
                include: {
                    student: {
                        select: {
                            first_name: true,
                            last_name: true,
                            student_code: true,
                        },
                    },
                },
            });

            return {
                success: true,
                message: "Medical incident reported successfully",
                data: incident,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to report medical incident",
            };
        }
    }

    /**
     * Update a medical incident
     */
    static async updateIncident(id: string, data: any): Promise<ApiResponse> {
        try {
            const incident = await prisma.medicalIncident.update({
                where: { id },
                data,
            });

            return {
                success: true,
                message: "Medical incident updated successfully",
                data: incident,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to update medical incident",
            };
        }
    }

    /**
     * Delete a medical incident
     */
    static async deleteIncident(id: string): Promise<ApiResponse> {
        try {
            await prisma.medicalIncident.delete({
                where: { id },
            });

            return {
                success: true,
                message: "Medical incident deleted successfully",
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to delete medical incident",
            };
        }
    }

    /**
     * Get health summary report for a student
     */
    static async getHealthSummary(studentId: string, userContext?: any): Promise<ApiResponse> {
        try {
            const where: any = { student_id: studentId };
            // Data Scoping
            if (userContext && userContext.role?.name !== 'SuperAdmin') {
                where.student = { branch_id: userContext.branch_id };
            }

            const [healthRecord, recentCheckups, vaccinations, incidents] =
                await Promise.all([
                    prisma.healthRecord.findUnique({
                        where,
                        include: {
                            student: {
                                select: {
                                    first_name: true,
                                    last_name: true,
                                    student_code: true,
                                    date_of_birth: true,
                                },
                            },
                        },
                    }),
                    prisma.medicalCheckup.findMany({
                        where: {
                            health_record: {
                                student_id: studentId,
                            },
                        },
                        orderBy: { checkup_date: "desc" },
                        take: 3,
                    }),
                    prisma.vaccination.findMany({
                        where: {
                            health_record: {
                                student_id: studentId,
                            },
                        },
                        orderBy: { administered_date: "desc" },
                        take: 5,
                    }),
                    prisma.medicalIncident.findMany({
                        where: {
                            student_id: studentId,
                            resolved_at: null,
                        },
                        orderBy: { incident_date: "desc" },
                    }),
                ]);

            return {
                success: true,
                message: "Health summary fetched successfully",
                data: {
                    health_record: healthRecord,
                    recent_checkups: recentCheckups,
                    recent_vaccinations: vaccinations,
                    pending_incidents: incidents,
                },
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || "Failed to fetch health summary",
            };
        }
    }
}

export default HealthService;
