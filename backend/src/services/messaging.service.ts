import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class MessagingService {
  /**
   * Send a direct message
   */
  static async sendMessage(
    senderId: string,
    recipientId: string,
    messageData: {
      subject: string;
      messageBody: string;
      attachmentUrl?: string;
    }
  ) {
    try {
      // Verify both users exist
      const [sender, recipient] = await Promise.all([
        prisma.user.findUnique({ where: { id: senderId } }),
        prisma.user.findUnique({ where: { id: recipientId } }),
      ]);

      if (!sender || !recipient) {
        return { success: false, message: "Sender or recipient not found" };
      }

      const message = await prisma.directMessage.create({
        data: {
          sender_id: senderId,
          recipient_id: recipientId,
          subject: messageData.subject,
          message_body: messageData.messageBody,
          attachment_url: messageData.attachmentUrl,
        },
      });

      return {
        success: true,
        message: "Message sent successfully",
        data: message,
      };
    } catch (error: any) {
      console.error("Error sending message:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get inbox messages
   */
  static async getInboxMessages(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ) {
    try {
      const [messages, total] = await Promise.all([
        prisma.directMessage.findMany({
          where: {
            recipient_id: userId,
            is_deleted: false,
          },
          include: {
            sender: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
              },
            },
          },
          orderBy: { created_at: "desc" },
          take: limit,
          skip: offset,
        }),
        prisma.directMessage.count({
          where: {
            recipient_id: userId,
            is_deleted: false,
          },
        }),
      ]);

      return {
        success: true,
        message: "Inbox messages retrieved",
        data: messages,
        pagination: {
          limit,
          offset,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      console.error("Error getting inbox messages:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get sent messages
   */
  static async getSentMessages(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ) {
    try {
      const [messages, total] = await Promise.all([
        prisma.directMessage.findMany({
          where: {
            sender_id: userId,
            is_deleted: false,
          },
          include: {
            recipient: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
              },
            },
          },
          orderBy: { created_at: "desc" },
          take: limit,
          skip: offset,
        }),
        prisma.directMessage.count({
          where: {
            sender_id: userId,
            is_deleted: false,
          },
        }),
      ]);

      return {
        success: true,
        message: "Sent messages retrieved",
        data: messages,
        pagination: {
          limit,
          offset,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      console.error("Error getting sent messages:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get conversation between two users
   */
  static async getConversation(
    userId: string,
    otherUserId: string,
    limit: number = 50
  ) {
    try {
      const messages = await prisma.directMessage.findMany({
        where: {
          OR: [
            {
              sender_id: userId,
              recipient_id: otherUserId,
            },
            {
              sender_id: otherUserId,
              recipient_id: userId,
            },
          ],
          is_deleted: false,
        },
        include: {
          sender: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
            },
          },
          recipient: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
            },
          },
        },
        orderBy: { created_at: "asc" },
        take: limit,
      });

      return {
        success: true,
        message: "Conversation retrieved",
        data: messages,
      };
    } catch (error: any) {
      console.error("Error getting conversation:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Mark message as read
   */
  static async markAsRead(messageId: string) {
    try {
      const message = await prisma.directMessage.update({
        where: { id: messageId },
        data: { read_at: new Date() },
      });

      return {
        success: true,
        message: "Message marked as read",
        data: message,
      };
    } catch (error: any) {
      console.error("Error marking message as read:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Mark multiple messages as read
   */
  static async markMultipleAsRead(messageIds: string[]) {
    try {
      await prisma.directMessage.updateMany({
        where: {
          id: {
            in: messageIds,
          },
        },
        data: { read_at: new Date() },
      });

      return {
        success: true,
        message: "Messages marked as read",
      };
    } catch (error: any) {
      console.error("Error marking messages as read:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Delete message
   */
  static async deleteMessage(messageId: string) {
    try {
      const message = await prisma.directMessage.update({
        where: { id: messageId },
        data: {
          is_deleted: true,
          deleted_at: new Date(),
        },
      });

      return {
        success: true,
        message: "Message deleted",
        data: message,
      };
    } catch (error: any) {
      console.error("Error deleting message:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Search messages
   */
  static async searchMessages(
    userId: string,
    searchTerm: string,
    limit: number = 20
  ) {
    try {
      const messages = await prisma.directMessage.findMany({
        where: {
          OR: [
            {
              sender_id: userId,
              subject: { contains: searchTerm, mode: "insensitive" },
            },
            {
              sender_id: userId,
              message_body: { contains: searchTerm, mode: "insensitive" },
            },
            {
              recipient_id: userId,
              subject: { contains: searchTerm, mode: "insensitive" },
            },
            {
              recipient_id: userId,
              message_body: { contains: searchTerm, mode: "insensitive" },
            },
          ],
          is_deleted: false,
        },
        include: {
          sender: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
            },
          },
          recipient: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
        take: limit,
      });

      return {
        success: true,
        message: "Messages search completed",
        data: messages,
      };
    } catch (error: any) {
      console.error("Error searching messages:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get unread message count
   */
  static async getUnreadCount(userId: string) {
    try {
      const unreadCount = await prisma.directMessage.count({
        where: {
          recipient_id: userId,
          read_at: null,
          is_deleted: false,
        },
      });

      return {
        success: true,
        message: "Unread count retrieved",
        data: { unreadCount },
      };
    } catch (error: any) {
      console.error("Error getting unread count:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get conversation participants
   */
  static async getMessageParticipants(userId: string, limit: number = 20) {
    try {
      const participants = await prisma.directMessage.findMany({
        where: {
          OR: [{ sender_id: userId }, { recipient_id: userId }],
        },
        distinct: ["sender_id", "recipient_id"],
        take: limit,
      });

      const uniqueParticipants = new Map();
      participants.forEach((msg) => {
        const otherUserId =
          msg.sender_id === userId ? msg.recipient_id : msg.sender_id;
        uniqueParticipants.set(otherUserId, true);
      });

      return {
        success: true,
        message: "Participants retrieved",
        data: { count: uniqueParticipants.size },
      };
    } catch (error: any) {
      console.error("Error getting participants:", error);
      return { success: false, message: error.message };
    }
  }
}

export default MessagingService;
