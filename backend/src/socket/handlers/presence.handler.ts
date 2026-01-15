import { Socket, Server } from "socket.io";
import { PresenceService } from "../../services/presence.service";
import { AuthenticatedSocket } from "../middleware/socket-auth.middleware";

export class PresenceHandler {
  static register(socket: Socket, io: Server) {
    const authSocket = socket as AuthenticatedSocket;
    const userId = authSocket.data.user.id;
    const username = authSocket.data.user.username;

    // Set user online when connected
    PresenceService.setOnline(userId, socket.id)
      .then(() => {
        // Broadcast presence to all connected users
        io.emit("presence:update", {
          userId,
          status: "online",
          lastSeenAt: new Date(),
        });
        console.log(`User ${username} is now online`);
      })
      .catch((error) => {
        console.error(`Error setting user ${username} online:`, error);
      });

    // Update presence status
    socket.on("presence:status", async (status: "online" | "away" | "busy") => {
      try {
        await PresenceService.updateStatus(userId, status);
        io.emit("presence:update", {
          userId,
          status,
          lastSeenAt: new Date(),
        });
        console.log(`User ${username} status changed to ${status}`);
      } catch (error: any) {
        socket.emit("presence:error", { message: error.message });
      }
    });

    // Get online users
    socket.on("presence:get", async (userIds: string[]) => {
      try {
        const presenceData = await PresenceService.getPresenceForUsers(userIds);
        socket.emit("presence:list", presenceData);
      } catch (error: any) {
        socket.emit("presence:error", { message: error.message });
      }
    });

    // Get all online users
    socket.on("presence:online", async () => {
      try {
        const onlineUsers = await PresenceService.getOnlineUsers();
        socket.emit("presence:online:list", onlineUsers);
      } catch (error: any) {
        socket.emit("presence:error", { message: error.message });
      }
    });
  }

  static async handleDisconnect(socket: Socket) {
    const authSocket = socket as AuthenticatedSocket;
    if (authSocket.data?.user?.id) {
      const userId = authSocket.data.user.id;
      const username = authSocket.data.user.username;

      try {
        await PresenceService.setOffline(userId);
        console.log(`User ${username} is now offline`);

        // Broadcast offline status
        socket.broadcast.emit("presence:update", {
          userId,
          status: "offline",
          lastSeenAt: new Date(),
        });
      } catch (error) {
        console.error(`Error setting user ${username} offline:`, error);
      }
    }
  }
}
