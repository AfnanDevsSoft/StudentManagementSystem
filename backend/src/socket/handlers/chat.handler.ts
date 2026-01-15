import { Socket, Server } from "socket.io";
import { ChatService } from "../../services/chat.service";
import { AuthenticatedSocket } from "../middleware/socket-auth.middleware";

export class ChatHandler {
  static register(socket: Socket, io: Server) {
    const authSocket = socket as AuthenticatedSocket;
    const userId = authSocket.data.user.id;
    const username = authSocket.data.user.username;

    // Join user's personal room for direct notifications
    socket.join(`user:${userId}`);
    console.log(`User ${username} joined personal room: user:${userId}`);

    // Join conversation room
    socket.on("chat:join", async (conversationId: string) => {
      try {
        const canAccess = await ChatService.canAccessConversation(
          userId,
          conversationId
        );
        if (canAccess) {
          socket.join(`conversation:${conversationId}`);
          socket.emit("chat:joined", { conversationId });
          console.log(`User ${username} joined conversation: ${conversationId}`);
        } else {
          socket.emit("chat:error", {
            event: "chat:join",
            message: "Access denied to conversation",
          });
        }
      } catch (error: any) {
        socket.emit("chat:error", {
          event: "chat:join",
          message: error.message,
        });
      }
    });

    // Leave conversation room
    socket.on("chat:leave", (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
      socket.emit("chat:left", { conversationId });
      console.log(`User ${username} left conversation: ${conversationId}`);
    });

    // Send message
    socket.on(
      "chat:message",
      async (data: {
        conversationId: string;
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
      }) => {
        try {
          const result = await ChatService.sendMessage({
            conversationId: data.conversationId,
            senderId: userId,
            content: data.content,
            messageType: data.messageType || "text",
            replyToId: data.replyToId,
            attachmentIds: data.attachmentIds,
            attachments: data.attachments,
          });

          if (result.success && result.data) {
            // Emit to all participants in the conversation
            io.to(`conversation:${data.conversationId}`).emit(
              "chat:message:new",
              result.data
            );

            // Also notify offline users via their personal room
            const participants = await ChatService.getConversationParticipants(
              data.conversationId
            );
            participants
              .filter((p) => p.user_id !== userId)
              .forEach((p) => {
                io.to(`user:${p.user_id}`).emit("chat:notification", {
                  type: "new_message",
                  conversationId: data.conversationId,
                  message: result.data,
                });
              });

            console.log(
              `Message sent by ${username} in conversation ${data.conversationId}`
            );
          } else {
            socket.emit("chat:error", {
              event: "chat:message",
              message: result.message,
            });
          }
        } catch (error: any) {
          socket.emit("chat:error", {
            event: "chat:message",
            message: error.message,
          });
        }
      }
    );

    // Mark messages as read
    socket.on(
      "chat:read",
      async (data: { conversationId: string; messageIds: string[] }) => {
        try {
          await ChatService.markMessagesAsRead(userId, data.messageIds);

          // Notify sender(s) about read receipt
          io.to(`conversation:${data.conversationId}`).emit("chat:read:receipt", {
            conversationId: data.conversationId,
            userId,
            messageIds: data.messageIds,
            readAt: new Date(),
          });
        } catch (error: any) {
          socket.emit("chat:error", {
            event: "chat:read",
            message: error.message,
          });
        }
      }
    );

    // Edit message
    socket.on(
      "chat:message:edit",
      async (data: { messageId: string; content: string }) => {
        try {
          const result = await ChatService.editMessage(
            userId,
            data.messageId,
            data.content
          );
          if (result.success && result.data) {
            io.to(`conversation:${result.data.conversation_id}`).emit(
              "chat:message:edited",
              result.data
            );
          } else {
            socket.emit("chat:error", {
              event: "chat:message:edit",
              message: result.message,
            });
          }
        } catch (error: any) {
          socket.emit("chat:error", {
            event: "chat:message:edit",
            message: error.message,
          });
        }
      }
    );

    // Delete message
    socket.on("chat:message:delete", async (messageId: string) => {
      try {
        const result = await ChatService.deleteMessage(userId, messageId);
        if (result.success && result.data) {
          io.to(`conversation:${result.data.conversation_id}`).emit(
            "chat:message:deleted",
            {
              messageId,
              conversationId: result.data.conversation_id,
            }
          );
        } else {
          socket.emit("chat:error", {
            event: "chat:message:delete",
            message: result.message,
          });
        }
      } catch (error: any) {
        socket.emit("chat:error", {
          event: "chat:message:delete",
          message: error.message,
        });
      }
    });
  }
}
