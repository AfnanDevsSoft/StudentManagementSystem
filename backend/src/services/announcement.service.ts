import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class AnnouncementService {
  /**
   * Create announcement
   */
  static async createAnnouncement(
    courseId: string,
    createdBy: string,
    announcementData: {
      title: string;
      content: string;
      priority?: "low" | "normal" | "high" | "urgent";
      announcementType?: "general" | "assignment" | "exam" | "holiday";
      attachmentUrl?: string;
      scheduledFor?: Date;
      expiresAt?: Date;
    }
  ) {
    try {
      const announcement = await prisma.classAnnouncement.create({
        data: {
          course_id: courseId,
          created_by: createdBy,
          title: announcementData.title,
          content: announcementData.content,
          priority: announcementData.priority || "normal",
          announcement_type: announcementData.announcementType || "general",
          attachment_url: announcementData.attachmentUrl,
          scheduled_for: announcementData.scheduledFor,
          expires_at: announcementData.expiresAt,
        },
      });

      return {
        success: true,
        message: "Announcement created",
        data: announcement,
      };
    } catch (error: any) {
      console.error("Error creating announcement:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get announcements for a course
   */
  static async getAnnouncements(
    courseId: string,
    limit: number = 20,
    offset: number = 0
  ) {
    try {
      const [announcements, total] = await Promise.all([
        prisma.classAnnouncement.findMany({
          where: {
            course_id: courseId,
          },
          include: {
            course: {
              select: { course_name: true },
            },
          },
          orderBy: { created_at: "desc" },
          take: limit,
          skip: offset,
        }),
        prisma.classAnnouncement.count({
          where: {
            course_id: courseId,
          },
        }),
      ]);

      return {
        success: true,
        message: "Announcements retrieved",
        data: announcements,
        pagination: {
          limit,
          offset,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      console.error("Error getting announcements:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get announcements by priority
   */
  static async getAnnouncementsByPriority(
    courseId: string,
    priority: "low" | "normal" | "high" | "urgent",
    limit: number = 20
  ) {
    try {
      const announcements = await prisma.classAnnouncement.findMany({
        where: {
          course_id: courseId,
          priority,
        },
        orderBy: { created_at: "desc" },
        take: limit,
      });

      return {
        success: true,
        message: "Announcements retrieved",
        data: announcements,
      };
    } catch (error: any) {
      console.error("Error getting announcements by priority:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get announcements by type
   */
  static async getAnnouncementsByType(
    courseId: string,
    announcementType: "general" | "assignment" | "exam" | "holiday",
    limit: number = 20
  ) {
    try {
      const announcements = await prisma.classAnnouncement.findMany({
        where: {
          course_id: courseId,
          announcement_type: announcementType,
        },
        orderBy: { created_at: "desc" },
        take: limit,
      });

      return {
        success: true,
        message: "Announcements retrieved",
        data: announcements,
      };
    } catch (error: any) {
      console.error("Error getting announcements by type:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Update announcement
   */
  static async updateAnnouncement(
    announcementId: string,
    updateData: {
      title?: string;
      content?: string;
      priority?: "low" | "normal" | "high" | "urgent";
      announcementType?: "general" | "assignment" | "exam" | "holiday";
      expiresAt?: Date;
    }
  ) {
    try {
      const announcement = await prisma.classAnnouncement.update({
        where: { id: announcementId },
        data: updateData,
      });

      return {
        success: true,
        message: "Announcement updated",
        data: announcement,
      };
    } catch (error: any) {
      console.error("Error updating announcement:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Delete announcement
   */
  static async deleteAnnouncement(announcementId: string) {
    try {
      const announcement = await prisma.classAnnouncement.delete({
        where: { id: announcementId },
      });

      return {
        success: true,
        message: "Announcement deleted",
        data: announcement,
      };
    } catch (error: any) {
      console.error("Error deleting announcement:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Pin/Unpin announcement
   */
  static async pinAnnouncement(announcementId: string, isPinned: boolean) {
    try {
      const announcement = await prisma.classAnnouncement.update({
        where: { id: announcementId },
        data: { is_pinned: isPinned },
      });

      return {
        success: true,
        message: `Announcement ${isPinned ? "pinned" : "unpinned"}`,
        data: announcement,
      };
    } catch (error: any) {
      console.error("Error pinning announcement:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Track announcement view
   */
  static async trackView(announcementId: string) {
    try {
      const announcement = await prisma.classAnnouncement.update({
        where: { id: announcementId },
        data: {
          view_count: {
            increment: 1,
          },
        },
      });

      return {
        success: true,
        message: "View tracked",
        data: announcement,
      };
    } catch (error: any) {
      console.error("Error tracking view:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get pinned announcements
   */
  static async getPinnedAnnouncements(courseId: string) {
    try {
      const announcements = await prisma.classAnnouncement.findMany({
        where: {
          course_id: courseId,
          is_pinned: true,
        },
        orderBy: { created_at: "desc" },
      });

      return {
        success: true,
        message: "Pinned announcements retrieved",
        data: announcements,
      };
    } catch (error: any) {
      console.error("Error getting pinned announcements:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get upcoming announcements
   */
  static async getUpcomingAnnouncements(courseId: string, limit: number = 10) {
    try {
      const announcements = await prisma.classAnnouncement.findMany({
        where: {
          course_id: courseId,
          scheduled_for: {
            gt: new Date(),
          },
        },
        orderBy: { scheduled_for: "asc" },
        take: limit,
      });

      return {
        success: true,
        message: "Upcoming announcements retrieved",
        data: announcements,
      };
    } catch (error: any) {
      console.error("Error getting upcoming announcements:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get announcement statistics
   */
  static async getAnnouncementStats(courseId: string) {
    try {
      const [
        totalAnnouncements,
        urgentCount,
        highPriorityCount,
        examsCount,
        assignmentCount,
      ] = await Promise.all([
        prisma.classAnnouncement.count({
          where: { course_id: courseId },
        }),
        prisma.classAnnouncement.count({
          where: {
            course_id: courseId,
            priority: "urgent",
          },
        }),
        prisma.classAnnouncement.count({
          where: {
            course_id: courseId,
            priority: "high",
          },
        }),
        prisma.classAnnouncement.count({
          where: {
            course_id: courseId,
            announcement_type: "exam",
          },
        }),
        prisma.classAnnouncement.count({
          where: {
            course_id: courseId,
            announcement_type: "assignment",
          },
        }),
      ]);

      return {
        success: true,
        message: "Announcement statistics retrieved",
        data: {
          totalAnnouncements,
          urgentCount,
          highPriorityCount,
          examsCount,
          assignmentCount,
        },
      };
    } catch (error: any) {
      console.error("Error getting announcement stats:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Search announcements
   */
  static async searchAnnouncements(
    courseId: string,
    searchTerm: string,
    limit: number = 20
  ) {
    try {
      const announcements = await prisma.classAnnouncement.findMany({
        where: {
          course_id: courseId,
          OR: [
            { title: { contains: searchTerm, mode: "insensitive" } },
            { content: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        orderBy: { created_at: "desc" },
        take: limit,
      });

      return {
        success: true,
        message: "Announcements search completed",
        data: announcements,
      };
    } catch (error: any) {
      console.error("Error searching announcements:", error);
      return { success: false, message: error.message };
    }
  }
}

export default AnnouncementService;
