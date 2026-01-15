import { Socket, Server } from "socket.io";
import { AuthenticatedSocket } from "../middleware/socket-auth.middleware";

// In-memory typing state (not persisted to database)
const typingUsers = new Map<string, Map<string, NodeJS.Timeout>>(); // conversationId -> Map<userId, timeout>

export class TypingHandler {
  static register(socket: Socket, io: Server) {
    const authSocket = socket as AuthenticatedSocket;
    const userId = authSocket.data.user.id;
    const username = authSocket.data.user.username;
    const userDisplayName = `${authSocket.data.user.first_name} ${authSocket.data.user.last_name}`;

    // User started typing
    socket.on("typing:start", (conversationId: string) => {
      // Initialize conversation typing map if needed
      if (!typingUsers.has(conversationId)) {
        typingUsers.set(conversationId, new Map());
      }

      const conversationTyping = typingUsers.get(conversationId)!;

      // Clear existing timeout if any
      if (conversationTyping.has(userId)) {
        clearTimeout(conversationTyping.get(userId)!);
      }

      // Set new timeout to auto-clear after 5 seconds
      const timeout = setTimeout(() => {
        conversationTyping.delete(userId);
        socket.to(`conversation:${conversationId}`).emit("typing:update", {
          conversationId,
          userId,
          username,
          displayName: userDisplayName,
          isTyping: false,
        });
      }, 5000);

      conversationTyping.set(userId, timeout);

      // Broadcast to conversation (except sender)
      socket.to(`conversation:${conversationId}`).emit("typing:update", {
        conversationId,
        userId,
        username,
        displayName: userDisplayName,
        isTyping: true,
      });
    });

    // User stopped typing
    socket.on("typing:stop", (conversationId: string) => {
      const conversationTyping = typingUsers.get(conversationId);
      if (conversationTyping) {
        // Clear timeout
        if (conversationTyping.has(userId)) {
          clearTimeout(conversationTyping.get(userId)!);
          conversationTyping.delete(userId);
        }
      }

      socket.to(`conversation:${conversationId}`).emit("typing:update", {
        conversationId,
        userId,
        username,
        displayName: userDisplayName,
        isTyping: false,
      });
    });
  }

  // Clean up typing state when user disconnects
  static handleDisconnect(socket: Socket) {
    const authSocket = socket as AuthenticatedSocket;
    if (authSocket.data?.user?.id) {
      const userId = authSocket.data.user.id;

      // Remove user from all conversation typing states
      typingUsers.forEach((conversationTyping, conversationId) => {
        if (conversationTyping.has(userId)) {
          clearTimeout(conversationTyping.get(userId)!);
          conversationTyping.delete(userId);

          // Notify conversation that user stopped typing
          socket.to(`conversation:${conversationId}`).emit("typing:update", {
            conversationId,
            userId,
            isTyping: false,
          });
        }
      });
    }
  }
}
