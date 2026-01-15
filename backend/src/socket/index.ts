import { Server as HttpServer } from "http";
import { Server as SocketServer, Socket } from "socket.io";
import { verifySocketToken } from "./middleware/socket-auth.middleware";
import { ChatHandler } from "./handlers/chat.handler";
import { PresenceHandler } from "./handlers/presence.handler";
import { TypingHandler } from "./handlers/typing.handler";
import { PresenceService } from "../services/presence.service";

let io: SocketServer | null = null;

export function initializeSocketIO(httpServer: HttpServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGINS?.split(",") || [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
      ],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ["websocket", "polling"],
  });

  // Authentication middleware
  io.use(verifySocketToken);

  // Connection handler
  io.on("connection", (socket: Socket) => {
    const user = (socket as any).data?.user;
    console.log(
      `Socket connected: ${socket.id}, User: ${user?.username || "unknown"}`
    );

    // Initialize handlers
    ChatHandler.register(socket, io!);
    PresenceHandler.register(socket, io!);
    TypingHandler.register(socket, io!);

    // Handle disconnection
    socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected: ${socket.id}, Reason: ${reason}`);
      PresenceHandler.handleDisconnect(socket);
      TypingHandler.handleDisconnect(socket);
    });

    // Handle errors
    socket.on("error", (error) => {
      console.error(`Socket error: ${socket.id}`, error);
    });
  });

  // Start presence cleanup interval (every 5 minutes)
  setInterval(() => {
    PresenceService.cleanupStalePresence(5).catch((error) => {
      console.error("Error in presence cleanup:", error);
    });
  }, 5 * 60 * 1000);

  console.log("Socket.io initialized successfully");
  return io;
}

export function getIO(): SocketServer {
  if (!io) {
    throw new Error("Socket.io not initialized. Call initializeSocketIO first.");
  }
  return io;
}

export { io };
