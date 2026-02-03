import { prisma } from "../lib/db";
import bcryptjs from "bcryptjs";

export class AdmissionService {
  /**
   * Get per-agent admission statistics
   */
  static async getAgentStats(userContext?: any) {
    try {
      // Get all admission agents
      const agentRole = await prisma.role.findFirst({
        where: { name: { in: ["Admission Agent", "admission_agent", "Admission agent"] } },
      });

      if (!agentRole) {
        return { success: true, message: "No admission agent role found", data: [] };
      }

      const whereAgent: any = { role_id: agentRole.id };

      // Branch scoping for non-superadmin
      if (userContext && userContext.role?.name !== "SuperAdmin") {
        whereAgent.branch_id = userContext.branch_id;
      }

      const agents = await prisma.user.findMany({
        where: whereAgent,
        select: {
          id: true,
          username: true,
          first_name: true,
          last_name: true,
          email: true,
          is_active: true,
          created_at: true,
          branch: { select: { id: true, name: true, code: true } },
        },
      });

      // Get stats for each agent
      const agentStats = await Promise.all(
        agents.map(async (agent) => {
          const [submitted, approved, rejected, enrolled, total] = await Promise.all([
            prisma.admissionApplication.count({ where: { created_by: agent.id, status: "submitted" } }),
            prisma.admissionApplication.count({ where: { created_by: agent.id, status: "approved" } }),
            prisma.admissionApplication.count({ where: { created_by: agent.id, status: "rejected" } }),
            prisma.admissionApplication.count({ where: { created_by: agent.id, status: "enrolled" } }),
            prisma.admissionApplication.count({ where: { created_by: agent.id } }),
          ]);

          return {
            ...agent,
            stats: { submitted, approved, rejected, enrolled, total },
          };
        })
      );

      return {
        success: true,
        message: "Agent statistics retrieved",
        data: agentStats,
      };
    } catch (error) {
      console.error("Error getting agent stats:", error);
      return {
        success: false,
        message: "Failed to get agent statistics",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Submit admission application with document uploads
   */
  static async submitApplication(
    branchId: string,
    applicantData: any,
    applicantEmail: string,
    applicantPhone: string,
    files?: Array<{ originalname: string; mimetype: string; size: number; buffer: Buffer }>,
    createdBy?: string
  ) {
    try {
      const applicationNumber = `ADM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const application = await prisma.admissionApplication.create({
        data: {
          branch_id: branchId,
          application_number: applicationNumber,
          applicant_data: applicantData,
          applicant_email: applicantEmail,
          applicant_phone: applicantPhone,
          application_date: new Date(),
          status: "submitted",
          payment_status: "pending",
          created_by: createdBy || null,
        },
      });

      // Save uploaded documents to database
      if (files && files.length > 0) {
        await prisma.admissionDocument.createMany({
          data: files.map((file) => ({
            file_name: file.originalname,
            file_type: file.mimetype,
            file_size: file.size,
            file_data: file.buffer,
            document_type: "attachment",
            application_id: application.id,
            uploaded_by: createdBy || null,
          })),
        });
      }

      // Fetch with documents
      const result = await prisma.admissionApplication.findUnique({
        where: { id: application.id },
        include: {
          documents: {
            select: {
              id: true,
              file_name: true,
              file_type: true,
              file_size: true,
              document_type: true,
              created_at: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Admission application submitted successfully",
        data: result,
      };
    } catch (error) {
      console.error("Error submitting application:", error);
      return {
        success: false,
        message: "Failed to submit application",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Approve admission application (requires offer letter upload)
   */
  static async approveApplication(
    applicationId: string,
    reviewedBy: string,
    reviewNotes?: string,
    offerLetterFile?: { originalname: string; mimetype: string; size: number; buffer: Buffer }
  ) {
    try {
      const existing = await prisma.admissionApplication.findUnique({
        where: { id: applicationId },
      });

      if (!existing) {
        return { success: false, message: "Application not found" };
      }

      if (existing.status !== "submitted") {
        return { success: false, message: "Only submitted applications can be approved" };
      }

      // Save offer letter to database
      if (offerLetterFile) {
        await prisma.admissionDocument.create({
          data: {
            file_name: offerLetterFile.originalname,
            file_type: offerLetterFile.mimetype,
            file_size: offerLetterFile.size,
            file_data: offerLetterFile.buffer,
            document_type: "offer_letter",
            application_id: applicationId,
            uploaded_by: reviewedBy,
          },
        });
      }

      const application = await prisma.admissionApplication.update({
        where: { id: applicationId },
        data: {
          status: "approved",
          reviewed_by: reviewedBy,
          review_date: new Date(),
          review_notes: reviewNotes || null,
        },
        include: {
          documents: {
            select: {
              id: true,
              file_name: true,
              file_type: true,
              file_size: true,
              document_type: true,
              created_at: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Application approved. Agent can now set student credentials.",
        data: application,
      };
    } catch (error) {
      console.error("Error approving application:", error);
      return {
        success: false,
        message: "Failed to approve application",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Reject admission application
   */
  static async rejectApplication(
    applicationId: string,
    reviewedBy: string,
    reason: string
  ) {
    try {
      const existing = await prisma.admissionApplication.findUnique({
        where: { id: applicationId },
      });

      if (!existing) {
        return { success: false, message: "Application not found" };
      }

      if (existing.status !== "submitted") {
        return { success: false, message: "Only submitted applications can be rejected" };
      }

      const application = await prisma.admissionApplication.update({
        where: { id: applicationId },
        data: {
          status: "rejected",
          reviewed_by: reviewedBy,
          review_date: new Date(),
          review_notes: reason,
          rejection_reason: reason,
        },
        include: {
          documents: {
            select: {
              id: true,
              file_name: true,
              file_type: true,
              file_size: true,
              document_type: true,
              created_at: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Admission application rejected",
        data: application,
      };
    } catch (error) {
      console.error("Error rejecting application:", error);
      return {
        success: false,
        message: "Failed to reject application",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Set credentials and enroll student after approval
   */
  static async setCredentialsAndEnroll(
    applicationId: string,
    username: string,
    password: string,
    agentUserId: string
  ) {
    try {
      const application = await prisma.admissionApplication.findUnique({
        where: { id: applicationId },
        include: { branch: true },
      });

      if (!application) {
        return { success: false, message: "Application not found" };
      }

      if (application.status !== "approved") {
        return { success: false, message: "Application must be approved before setting credentials" };
      }

      // Check username uniqueness
      const existingUser = await prisma.user.findUnique({ where: { username } });
      if (existingUser) {
        return { success: false, message: "Username already exists. Please choose a different username." };
      }

      const appData: any = application.applicant_data || {};

      // Get Student role (legacy)
      const studentRole = await prisma.role.findFirst({ where: { name: "Student" } });
      if (!studentRole) {
        return { success: false, message: "Student role not found in system" };
      }

      // Get Student RBAC role
      const studentRbacRole = await prisma.rBACRole.findFirst({ where: { role_name: "Student" } });

      // Hash password
      const hashedPassword = await bcryptjs.hash(password, 10);

      // Generate student code and admission number
      const year = new Date().getFullYear();
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const studentCode = `ST-${year}-${randomNum}`;
      const admissionNumber = studentCode;

      // Transaction: create user + student + update application
      const result = await prisma.$transaction(async (tx) => {
        // Create user
        const newUser = await tx.user.create({
          data: {
            username,
            password_hash: hashedPassword,
            email: application.applicant_email,
            first_name: appData.first_name || "",
            last_name: appData.last_name || "",
            phone: application.applicant_phone,
            role_id: studentRole.id,
            branch_id: application.branch_id,
            is_active: true,
          },
        });

        // Create RBAC role assignment
        if (studentRbacRole) {
          await tx.userRole.create({
            data: {
              user_id: newUser.id,
              rbac_role_id: studentRbacRole.id,
              branch_id: application.branch_id,
              assigned_by: agentUserId,
            },
          });
        }

        // Create student record
        const student = await tx.student.create({
          data: {
            first_name: appData.first_name || "",
            last_name: appData.last_name || "",
            student_code: studentCode,
            admission_number: admissionNumber,
            branch_id: application.branch_id,
            user_id: newUser.id,
            date_of_birth: appData.date_of_birth ? new Date(appData.date_of_birth) : new Date(),
            admission_date: new Date(),
            gender: appData.gender || null,
            personal_email: application.applicant_email,
            personal_phone: application.applicant_phone,
            current_address: appData.address || null,
            city: appData.city || null,
            admission_status: "active",
            is_active: true,
            previous_school: appData.previous_school || null,
          },
        });

        // Update application to enrolled
        const updatedApp = await tx.admissionApplication.update({
          where: { id: applicationId },
          data: {
            status: "enrolled",
            student_id: student.id,
            student_username: username,
          },
          include: {
            documents: {
              select: {
                id: true,
                file_name: true,
                file_type: true,
                file_size: true,
                document_type: true,
                created_at: true,
              },
            },
          },
        });

        return { application: updatedApp, user: newUser, student };
      });

      return {
        success: true,
        message: "Student account created and enrolled successfully",
        data: result,
      };
    } catch (error) {
      console.error("Error setting credentials and enrolling:", error);
      return {
        success: false,
        message: "Failed to enroll student",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Suggest usernames for a student
   */
  static async suggestUsername(applicationId: string) {
    try {
      const application = await prisma.admissionApplication.findUnique({
        where: { id: applicationId },
        include: { branch: true },
      });

      if (!application) {
        return { success: false, message: "Application not found" };
      }

      const appData: any = application.applicant_data || {};
      const firstName = (appData.first_name || "").toLowerCase().replace(/[^a-z]/g, "");
      const lastName = (appData.last_name || "").toLowerCase().replace(/[^a-z]/g, "");
      const branchCode = (application.branch?.code || "br").toLowerCase();
      const appSuffix = application.application_number.split("-").pop()?.slice(-4) || "0000";

      const suggestions = [
        `${firstName}.${lastName}`,
        `${branchCode}.${firstName}.${lastName}`,
        `${firstName}.${lastName}.${appSuffix}`,
        `${branchCode}.${firstName}${appSuffix}`,
      ].filter((s) => s.length > 2);

      const results = [];
      for (const suggestion of suggestions) {
        const exists = await prisma.user.findUnique({ where: { username: suggestion } });
        results.push({ username: suggestion, available: !exists });
      }

      return {
        success: true,
        message: "Username suggestions generated",
        data: results,
      };
    } catch (error) {
      console.error("Error suggesting username:", error);
      return {
        success: false,
        message: "Failed to generate username suggestions",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get document file data for download
   */
  static async getDocumentFile(documentId: string) {
    try {
      const document = await prisma.admissionDocument.findUnique({
        where: { id: documentId },
      });

      if (!document) {
        return { success: false, message: "Document not found" };
      }

      return {
        success: true,
        data: document,
      };
    } catch (error) {
      console.error("Error fetching document:", error);
      return {
        success: false,
        message: "Failed to fetch document",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get applications with filters
   */
  static async getApplications(
    branchId?: string,
    status?: string,
    limit: number = 20,
    offset: number = 0,
    userContext?: any
  ) {
    try {
      // Data Scoping
      if (userContext && userContext.role?.name !== 'SuperAdmin') {
        branchId = userContext.branch_id;
      }

      const whereClause: any = {};

      if (branchId) {
        whereClause.branch_id = branchId;
      }

      // Admission agents only see their own applications
      if (userContext && userContext.role?.name?.toLowerCase().includes('admission')) {
        whereClause.created_by = userContext.id;
      }

      if (status) {
        whereClause.status = status;
      }

      const applications = await prisma.admissionApplication.findMany({
        where: whereClause,
        orderBy: { application_date: "desc" },
        take: limit,
        skip: offset,
        include: {
          documents: {
            select: {
              id: true,
              file_name: true,
              file_type: true,
              file_size: true,
              document_type: true,
              created_at: true,
            },
          },
        },
      });

      const total = await prisma.admissionApplication.count({
        where: whereClause,
      });

      const flattenedApplications = applications.map((app: typeof applications[number]) => {
        const applicantData: any = (app as any).applicant_data || {};
        return {
          ...applicantData,
          ...app,
          email: (app as any).applicant_email,
          phone: (app as any).applicant_phone,
        };
      });

      return {
        success: true,
        message: "Applications retrieved",
        data: flattenedApplications,
        pagination: {
          limit,
          offset,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error getting applications:", error);
      return {
        success: false,
        message: "Failed to get applications",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get single application details
   */
  static async getApplicationDetails(applicationId: string) {
    try {
      const application = await prisma.admissionApplication.findUnique({
        where: { id: applicationId },
        include: {
          documents: {
            select: {
              id: true,
              file_name: true,
              file_type: true,
              file_size: true,
              document_type: true,
              created_at: true,
            },
          },
          branch: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      if (!application) {
        return { success: false, message: "Application not found" };
      }

      const applicantData: any = application.applicant_data || {};
      const flattenedApplication = {
        ...applicantData,
        ...application,
        email: application.applicant_email,
        phone: application.applicant_phone,
      };

      return {
        success: true,
        message: "Application details retrieved",
        data: flattenedApplication,
      };
    } catch (error) {
      console.error("Error getting application details:", error);
      return {
        success: false,
        message: "Failed to get application details",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get admission statistics
   */
  static async getAdmissionStats(branchId?: string, userContext?: any) {
    try {
      // Data Scoping
      if (userContext && userContext.role?.name !== 'SuperAdmin') {
        branchId = userContext.branch_id;
      }
      const whereClause: any = {};

      if (branchId) {
        whereClause.branch_id = branchId;
      }

      // Admission agents only see their own stats
      if (userContext && userContext.role?.name?.toLowerCase().includes('admission')) {
        whereClause.created_by = userContext.id;
      }

      const total = await prisma.admissionApplication.count({
        where: whereClause,
      });

      const submitted = await prisma.admissionApplication.count({
        where: { ...whereClause, status: "submitted" },
      });

      const approved = await prisma.admissionApplication.count({
        where: { ...whereClause, status: "approved" },
      });

      const rejected = await prisma.admissionApplication.count({
        where: { ...whereClause, status: "rejected" },
      });

      const enrolled = await prisma.admissionApplication.count({
        where: { ...whereClause, status: "enrolled" },
      });

      const paymentPending = await prisma.admissionApplication.count({
        where: { ...whereClause, payment_status: "pending" },
      });

      return {
        success: true,
        message: "Admission statistics retrieved",
        data: {
          total,
          submitted,
          approved,
          rejected,
          enrolled,
          paymentPending,
          approvalRate: total > 0 ? ((approved / total) * 100).toFixed(2) + "%" : "0%",
        },
      };
    } catch (error) {
      console.error("Error getting admission statistics:", error);
      return {
        success: false,
        message: "Failed to get admission statistics",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Update payment status
   */
  static async updatePaymentStatus(
    applicationId: string,
    paymentStatus: "pending" | "completed" | "failed"
  ) {
    try {
      const application = await prisma.admissionApplication.update({
        where: {
          id: applicationId
        },
        data: { payment_status: paymentStatus },
      });

      return {
        success: true,
        message: "Payment status updated",
        data: application,
      };
    } catch (error) {
      console.error("Error updating payment status:", error);
      return {
        success: false,
        message: "Failed to update payment status",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Update admission application
   */
  static async updateApplication(
    applicationId: string,
    data: any
  ) {
    try {
      const { branchId, applicantEmail, applicantPhone, applicantData, status, ...rest } = data;

      const updateData: any = {};

      if (branchId) updateData.branch_id = branchId;
      if (applicantEmail) updateData.applicant_email = applicantEmail;
      if (applicantPhone) updateData.applicant_phone = applicantPhone;
      if (status) updateData.status = status;
      if (applicantData) updateData.applicant_data = applicantData;

      if (Object.keys(rest).length > 0) {
        const existingApp = await prisma.admissionApplication.findUnique({
          where: { id: applicationId }
        });

        if (existingApp) {
          const currentApplicantData: any = existingApp.applicant_data || {};
          const newApplicantData = { ...currentApplicantData, ...rest };
          updateData.applicant_data = newApplicantData;
        }
      }

      const application = await prisma.admissionApplication.update({
        where: { id: applicationId },
        data: updateData,
      });

      return {
        success: true,
        message: "Admission application updated successfully",
        data: application,
      };
    } catch (error) {
      console.error("Error updating application:", error);
      return {
        success: false,
        message: "Failed to update application",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
