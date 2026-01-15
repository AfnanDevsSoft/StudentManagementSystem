import { prisma } from "../lib/db";

export class ChatService {
  // ============= Conversation Management =============

  /**
   * Create a direct (1:1) conversation
   */
  static async createDirectConversation(userId1: string, userId2: string) {
    try {
      // Check if conversation already exists
      const existing = await prisma.conversation.findFirst({
        where: {
          type: "direct",
          AND: [
            { participants: { some: { user_id: userId1, left_at: null } } },
            { participants: { some: { user_id: userId2, left_at: null } } },
          ],
        },
        include: {
          participants: {
            where: { left_at: null },
            include: {
              user: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  profile_photo: true,
                  username: true,
                },
              },
            },
          },
        },
      });

      if (existing) {
        return { success: true, message: "Conversation already exists", data: existing };
      }

      // Create new direct conversation
      const conversation = await prisma.conversation.create({
        data: {
          type: "direct",
          created_by: userId1,
          participants: {
            create: [
              { user_id: userId1, role: "member" },
              { user_id: userId2, role: "member" },
            ],
          },
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  profile_photo: true,
                  username: true,
                },
              },
            },
          },
        },
      });

      return { success: true, message: "Conversation created", data: conversation };
    } catch (error: any) {
      console.error("Error creating direct conversation:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Create a group conversation
   */
  static async createGroupConversation(
    creatorId: string,
    name: string,
    participantIds: string[],
    description?: string
  ) {
    try {
      // Ensure creator is in participants
      const allParticipants = [...new Set([creatorId, ...participantIds])];

      const conversation = await prisma.conversation.create({
        data: {
          type: "group",
          name,
          description,
          created_by: creatorId,
          participants: {
            create: allParticipants.map((id) => ({
              user_id: id,
              role: id === creatorId ? "admin" : "member",
            })),
          },
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  profile_photo: true,
                  username: true,
                },
              },
            },
          },
        },
      });

      return { success: true, message: "Group created", data: conversation };
    } catch (error: any) {
      console.error("Error creating group conversation:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get user's conversations with last message and unread count
   */
  static async getUserConversations(userId: string, limit = 20, offset = 0) {
    try {
      const conversations = await prisma.conversation.findMany({
        where: {
          participants: {
            some: { user_id: userId, left_at: null },
          },
          is_active: true,
        },
        include: {
          participants: {
            where: { left_at: null },
            include: {
              user: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  profile_photo: true,
                  username: true,
                },
              },
            },
          },
          messages: {
            where: { is_deleted: false },
            orderBy: { created_at: "desc" },
            take: 1,
            include: {
              sender: {
                select: { id: true, first_name: true, last_name: true },
              },
            },
          },
        },
        orderBy: { last_message_at: { sort: "desc", nulls: "last" } },
        take: limit,
        skip: offset,
      });

      // Get unread counts for each conversation
      const conversationsWithUnread = await Promise.all(
        conversations.map(async (conv) => {
          const participant = conv.participants.find((p) => p.user_id === userId);
          const unreadCount = await prisma.chatMessage.count({
            where: {
              conversation_id: conv.id,
              sender_id: { not: userId },
              created_at: { gt: participant?.last_read_at || new Date(0) },
              is_deleted: false,
            },
          });
          return { ...conv, unreadCount };
        })
      );

      const total = await prisma.conversation.count({
        where: {
          participants: { some: { user_id: userId, left_at: null } },
          is_active: true,
        },
      });

      return {
        success: true,
        data: conversationsWithUnread,
        pagination: { limit, offset, total, pages: Math.ceil(total / limit) },
      };
    } catch (error: any) {
      console.error("Error getting user conversations:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get conversation by ID
   */
  static async getConversationById(conversationId: string, userId: string) {
    try {
      const canAccess = await this.canAccessConversation(userId, conversationId);
      if (!canAccess) {
        return { success: false, message: "Access denied" };
      }

      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          participants: {
            where: { left_at: null },
            include: {
              user: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  profile_photo: true,
                  username: true,
                },
              },
            },
          },
        },
      });

      return { success: true, data: conversation };
    } catch (error: any) {
      console.error("Error getting conversation:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Check if user can access conversation
   */
  static async canAccessConversation(
    userId: string,
    conversationId: string
  ): Promise<boolean> {
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversation_id: conversationId,
        user_id: userId,
        left_at: null,
      },
    });
    return !!participant;
  }

  /**
   * Get conversation participants
   */
  static async getConversationParticipants(conversationId: string) {
    return prisma.conversationParticipant.findMany({
      where: { conversation_id: conversationId, left_at: null },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            profile_photo: true,
          },
        },
      },
    });
  }

  /**
   * Add participants to group
   */
  static async addParticipants(
    conversationId: string,
    userId: string,
    participantIds: string[]
  ) {
    try {
      // Check if user is admin
      const participant = await prisma.conversationParticipant.findFirst({
        where: {
          conversation_id: conversationId,
          user_id: userId,
          role: "admin",
          left_at: null,
        },
      });

      if (!participant) {
        return { success: false, message: "Only admins can add participants" };
      }

      // Add participants
      await prisma.conversationParticipant.createMany({
        data: participantIds.map((id) => ({
          conversation_id: conversationId,
          user_id: id,
          role: "member",
        })),
        skipDuplicates: true,
      });

      return { success: true, message: "Participants added" };
    } catch (error: any) {
      console.error("Error adding participants:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Leave conversation
   */
  static async leaveConversation(conversationId: string, userId: string) {
    try {
      await prisma.conversationParticipant.updateMany({
        where: {
          conversation_id: conversationId,
          user_id: userId,
        },
        data: { left_at: new Date() },
      });

      return { success: true, message: "Left conversation" };
    } catch (error: any) {
      console.error("Error leaving conversation:", error);
      return { success: false, message: error.message };
    }
  }

  // ============= Message Operations =============

  /**
   * Send a message
   */
  static async sendMessage(data: {
    conversationId: string;
    senderId: string;
    content: string;
    messageType?: string;
    replyToId?: string;
    attachmentIds?: string[];
    attachments?: Array<{
      fileName: string;
      fileUrl: string;
      fileType: string;
      fileSize: number;
      thumbnailUrl?: string;
    }>;
  }) {
    try {
      // Verify sender is participant
      const canAccess = await this.canAccessConversation(
        data.senderId,
        data.conversationId
      );
      if (!canAccess) {
        return { success: false, message: "Not a participant in this conversation" };
      }

      // Get attachment data from ChatAttachment if attachmentIds provided
      let attachmentsToCreate: Array<{
        file_name: string;
        file_url: string;
        file_type: string;
        file_size: number;
        thumbnail_url?: string;
      }> = [];

      if (data.attachmentIds && data.attachmentIds.length > 0) {
        const chatAttachments = await prisma.chatAttachment.findMany({
          where: { id: { in: data.attachmentIds } },
        });
        attachmentsToCreate = chatAttachments.map((att) => ({
          file_name: att.file_name,
          file_url: att.file_url,
          file_type: att.file_type,
          file_size: att.file_size,
          thumbnail_url: att.thumbnail_url || undefined,
        }));
      } else if (data.attachments) {
        attachmentsToCreate = data.attachments.map((att) => ({
          file_name: att.fileName,
          file_url: att.fileUrl,
          file_type: att.fileType,
          file_size: att.fileSize,
          thumbnail_url: att.thumbnailUrl,
        }));
      }

      const message = await prisma.chatMessage.create({
        data: {
          conversation_id: data.conversationId,
          sender_id: data.senderId,
          content: data.content,
          message_type: data.messageType || "text",
          reply_to_id: data.replyToId,
          attachments: attachmentsToCreate.length > 0
            ? { create: attachmentsToCreate }
            : undefined,
        },
        include: {
          sender: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              profile_photo: true,
            },
          },
          attachments: true,
          reply_to: {
            select: {
              id: true,
              content: true,
              sender: { select: { first_name: true, last_name: true } },
            },
          },
        },
      });

      // Update conversation's last_message_at
      await prisma.conversation.update({
        where: { id: data.conversationId },
        data: { last_message_at: new Date() },
      });

      // Clean up ChatAttachment records if used
      if (data.attachmentIds && data.attachmentIds.length > 0) {
        await prisma.chatAttachment.deleteMany({
          where: { id: { in: data.attachmentIds } },
        });
      }

      return { success: true, message: "Message sent", data: message };
    } catch (error: any) {
      console.error("Error sending message:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get messages for a conversation
   */
  static async getMessages(
    conversationId: string,
    userId: string,
    limit = 50,
    before?: string // cursor for pagination
  ) {
    try {
      const canAccess = await this.canAccessConversation(userId, conversationId);
      if (!canAccess) {
        return { success: false, message: "Access denied" };
      }

      const messages = await prisma.chatMessage.findMany({
        where: {
          conversation_id: conversationId,
          is_deleted: false,
          ...(before && { created_at: { lt: new Date(before) } }),
        },
        include: {
          sender: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              profile_photo: true,
            },
          },
          attachments: true,
          reply_to: {
            select: {
              id: true,
              content: true,
              sender: { select: { first_name: true, last_name: true } },
            },
          },
          read_receipts: {
            select: { user_id: true, read_at: true },
          },
        },
        orderBy: { created_at: "desc" },
        take: limit,
      });

      // Update last_read_at for the user
      await prisma.conversationParticipant.updateMany({
        where: { conversation_id: conversationId, user_id: userId },
        data: { last_read_at: new Date() },
      });

      return { success: true, data: messages.reverse() };
    } catch (error: any) {
      console.error("Error getting messages:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Mark messages as read
   */
  static async markMessagesAsRead(userId: string, messageIds: string[]) {
    try {
      await prisma.messageReadReceipt.createMany({
        data: messageIds.map((id) => ({
          message_id: id,
          user_id: userId,
        })),
        skipDuplicates: true,
      });

      return { success: true, message: "Messages marked as read" };
    } catch (error: any) {
      console.error("Error marking messages as read:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Edit a message
   */
  static async editMessage(userId: string, messageId: string, newContent: string) {
    try {
      const message = await prisma.chatMessage.findUnique({
        where: { id: messageId },
      });

      if (!message || message.sender_id !== userId) {
        return { success: false, message: "Cannot edit this message" };
      }

      const updated = await prisma.chatMessage.update({
        where: { id: messageId },
        data: {
          content: newContent,
          is_edited: true,
          edited_at: new Date(),
        },
        include: {
          sender: {
            select: { id: true, first_name: true, last_name: true },
          },
        },
      });

      return { success: true, data: updated };
    } catch (error: any) {
      console.error("Error editing message:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Delete a message (soft delete)
   */
  static async deleteMessage(userId: string, messageId: string) {
    try {
      const message = await prisma.chatMessage.findUnique({
        where: { id: messageId },
      });

      if (!message || message.sender_id !== userId) {
        return { success: false, message: "Cannot delete this message" };
      }

      const updated = await prisma.chatMessage.update({
        where: { id: messageId },
        data: {
          is_deleted: true,
          deleted_at: new Date(),
        },
      });

      return { success: true, data: updated };
    } catch (error: any) {
      console.error("Error deleting message:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Search messages across user's conversations
   */
  static async searchMessages(userId: string, query: string, limit = 20) {
    try {
      // Get user's conversations
      const userConversations = await prisma.conversationParticipant.findMany({
        where: { user_id: userId, left_at: null },
        select: { conversation_id: true },
      });

      const conversationIds = userConversations.map((c) => c.conversation_id);

      const messages = await prisma.chatMessage.findMany({
        where: {
          conversation_id: { in: conversationIds },
          content: { contains: query, mode: "insensitive" },
          is_deleted: false,
        },
        include: {
          sender: {
            select: { id: true, first_name: true, last_name: true },
          },
          conversation: { select: { id: true, name: true, type: true } },
        },
        orderBy: { created_at: "desc" },
        take: limit,
      });

      return { success: true, data: messages };
    } catch (error: any) {
      console.error("Error searching messages:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get total unread message count for user
   */
  static async getUnreadCount(userId: string) {
    try {
      const participants = await prisma.conversationParticipant.findMany({
        where: { user_id: userId, left_at: null },
        select: { conversation_id: true, last_read_at: true },
      });

      let totalUnread = 0;
      for (const p of participants) {
        const count = await prisma.chatMessage.count({
          where: {
            conversation_id: p.conversation_id,
            sender_id: { not: userId },
            created_at: { gt: p.last_read_at || new Date(0) },
            is_deleted: false,
          },
        });
        totalUnread += count;
      }

      return { success: true, data: { unreadCount: totalUnread } };
    } catch (error: any) {
      console.error("Error getting unread count:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Update group conversation details
   */
  static async updateGroup(
    conversationId: string,
    userId: string,
    data: { name?: string; description?: string; avatar_url?: string }
  ) {
    try {
      // Check if user is admin
      const participant = await prisma.conversationParticipant.findFirst({
        where: {
          conversation_id: conversationId,
          user_id: userId,
          role: "admin",
          left_at: null,
        },
      });

      if (!participant) {
        return { success: false, message: "Only admins can update group" };
      }

      const updated = await prisma.conversation.update({
        where: { id: conversationId },
        data,
        include: {
          participants: {
            where: { left_at: null },
            include: {
              user: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  profile_photo: true,
                },
              },
            },
          },
        },
      });

      return { success: true, data: updated };
    } catch (error: any) {
      console.error("Error updating group:", error);
      return { success: false, message: error.message };
    }
  }
}
