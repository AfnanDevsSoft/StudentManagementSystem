import { prisma } from "../lib/db";

export class NotificationService {
  /**
   * Send a notification to a user
   */
  static async sendNotification(
    userId: string,
    notificationType: "email" | "sms" | "in_app",
    subject: string,
    message: string
  ) {
    try {
      // Create notification record in database
      const notification = await prisma.notification.create({
        data: {
          user_id: userId,
          notification_type: notificationType,
          subject,
          message,
          status: "pending",
        },
      });

      // TODO: Integrate with actual email/SMS providers
      // For now, we're just creating the record
      if (notificationType === "email") {
        // await this.sendEmail(userId, subject, message);
        console.log(`[EMAIL] Sent to user ${userId}: ${subject}`);
      } else if (notificationType === "sms") {
        // await this.sendSMS(userId, message);
        console.log(`[SMS] Sent to user ${userId}: ${message}`);
      }

      // Update status to sent
      const sentNotification = await prisma.notification.update({
        where: { id: notification.id },
        data: { sent_at: new Date(), status: "sent" },
      });

      return {
        success: true,
        message: "Notification sent successfully",
        data: sentNotification,
      };
    } catch (error) {
      console.error("Error sending notification:", error);
      return {
        success: false,
        message: "Failed to send notification",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get all notifications for a user
   */
  static async getNotifications(
    userId: string,
    limit: number = 20,
    offset: number = 0,
    unreadOnly: boolean = false
  ) {
    try {
      const whereClause: any = { user_id: userId };

      if (unreadOnly) {
        whereClause.read_at = null;
      }

      const notifications = await prisma.notification.findMany({
        where: whereClause,
        orderBy: { created_at: "desc" },
        take: limit,
        skip: offset,
      });

      const total = await prisma.notification.count({
        where: whereClause,
      });

      const unreadCount = await prisma.notification.count({
        where: { user_id: userId, read_at: null },
      });

      return {
        success: true,
        message: "Notifications retrieved successfully",
        data: notifications,
        pagination: {
          limit,
          offset,
          total,
          pages: Math.ceil(total / limit),
        },
        unreadCount,
      };
    } catch (error) {
      console.error("Error retrieving notifications:", error);
      return {
        success: false,
        message: "Failed to retrieve notifications",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string) {
    try {
      const notification = await prisma.notification.update({
        where: { id: notificationId },
        data: { read_at: new Date() },
      });

      return {
        success: true,
        message: "Notification marked as read",
        data: notification,
      };
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return {
        success: false,
        message: "Failed to mark notification as read",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string) {
    try {
      const result = await prisma.notification.updateMany({
        where: { user_id: userId, read_at: null },
        data: { read_at: new Date() },
      });

      return {
        success: true,
        message: `Marked ${result.count} notifications as read`,
        data: { updatedCount: result.count },
      };
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return {
        success: false,
        message: "Failed to mark all notifications as read",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: string) {
    try {
      await prisma.notification.delete({
        where: { id: notificationId },
      });

      return {
        success: true,
        message: "Notification deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting notification:", error);
      return {
        success: false,
        message: "Failed to delete notification",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send bulk notifications to multiple users
   */
  static async sendBulkNotifications(
    userIds: string[],
    notificationType: "email" | "sms" | "in_app",
    subject: string,
    message: string
  ) {
    try {
      const notifications = await Promise.all(
        userIds.map((userId) =>
          this.sendNotification(userId, notificationType, subject, message)
        )
      );

      const successCount = notifications.filter((n) => n.success).length;

      return {
        success: true,
        message: `Successfully sent ${successCount} of ${userIds.length} notifications`,
        data: { totalCount: userIds.length, successCount },
      };
    } catch (error) {
      console.error("Error sending bulk notifications:", error);
      return {
        success: false,
        message: "Failed to send bulk notifications",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get notification statistics for admin
   */
  static async getNotificationStats(branchId?: string) {
    try {
      const whereClause: any = {};

      const totalNotifications = await prisma.notification.count({
        where: whereClause,
      });

      const sentNotifications = await prisma.notification.count({
        where: { ...whereClause, status: "sent" },
      });

      const pendingNotifications = await prisma.notification.count({
        where: { ...whereClause, status: "pending" },
      });

      const unreadNotifications = await prisma.notification.count({
        where: { ...whereClause, read_at: null },
      });

      const byType = await prisma.notification.groupBy({
        by: ["notification_type"],
        _count: true,
        where: whereClause,
      });

      return {
        success: true,
        message: "Notification statistics retrieved",
        data: {
          total: totalNotifications,
          sent: sentNotifications,
          pending: pendingNotifications,
          unread: unreadNotifications,
          byType: byType.map((t: any) => ({
            type: t.notification_type,
            count: t._count,
          })),
        },
      };
    } catch (error) {
      console.error("Error getting notification stats:", error);
      return {
        success: false,
        message: "Failed to get notification statistics",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
