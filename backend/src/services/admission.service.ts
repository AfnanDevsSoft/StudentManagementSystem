import { prisma } from "../lib/db";

export class AdmissionService {
  /**
   * Submit admission application
   */
  static async submitApplication(
    branchId: string,
    applicantData: any,
    applicantEmail: string,
    applicantPhone: string
  ) {
    try {
      // Generate application number
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
        },
      });

      return {
        success: true,
        message: "Admission application submitted successfully",
        data: application,
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
   * Approve admission application
   */
  static async approveApplication(
    applicationId: string,
    reviewedBy: string,
    reviewNotes?: string
  ) {
    try {
      const application = await prisma.admissionApplication.update({
        where: { id: applicationId },
        data: {
          status: "approved",
          reviewed_by: reviewedBy,
          review_date: new Date(),
          review_notes: reviewNotes,
        },
      });

      return {
        success: true,
        message: "Admission application approved",
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
      const application = await prisma.admissionApplication.update({
        where: { id: applicationId },
        data: {
          status: "rejected",
          reviewed_by: reviewedBy,
          review_date: new Date(),
          review_notes: reason,
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

      if (status) {
        whereClause.status = status;
      }

      const applications = await prisma.admissionApplication.findMany({
        where: whereClause,
        orderBy: { application_date: "desc" },
        take: limit,
        skip: offset,
      });

      const total = await prisma.admissionApplication.count({
        where: whereClause,
      });

      const flattenedApplications = applications.map((app: typeof applications[number]) => {
        const applicantData: any = (app as any).applicant_data || {};
        return {
          ...applicantData, // Spread JSON first
          ...app,           // Spread DB record second (overwrites JSON)
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
      });

      if (!application) {
        return { success: false, message: "Application not found" };
      }

      const applicantData: any = application.applicant_data || {};
      const flattenedApplication = {
        ...applicantData, // Spread JSON first
        ...application,   // Spread DB record second (overwrites JSON)
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

      // Prepare update data
      const updateData: any = {};

      if (branchId) updateData.branch_id = branchId;
      if (applicantEmail) updateData.applicant_email = applicantEmail;
      if (applicantPhone) updateData.applicant_phone = applicantPhone;
      if (status) updateData.status = status;
      if (applicantData) updateData.applicant_data = applicantData;

      // If we have flat fields that belong in applicant_data (from frontend flat structure)
      // we need to merge them into applicant_data
      if (Object.keys(rest).length > 0) {
        // Fetch existing application to get current applicant_data
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
