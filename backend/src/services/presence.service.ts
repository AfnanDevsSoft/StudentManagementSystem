import { prisma } from "../lib/db";

export class PresenceService {
  /**
   * Set user as online
   */
  static async setOnline(userId: string, socketId: string, deviceInfo?: string) {
    try {
      return await prisma.userPresence.upsert({
        where: { user_id: userId },
        update: {
          status: "online",
          socket_id: socketId,
          last_seen_at: new Date(),
          device_info: deviceInfo,
        },
        create: {
          user_id: userId,
          status: "online",
          socket_id: socketId,
          last_seen_at: new Date(),
          device_info: deviceInfo,
        },
      });
    } catch (error: any) {
      console.error("Error setting user online:", error);
      throw error;
    }
  }

  /**
   * Set user as offline
   */
  static async setOffline(userId: string) {
    try {
      return await prisma.userPresence.update({
        where: { user_id: userId },
        data: {
          status: "offline",
          socket_id: null,
          last_seen_at: new Date(),
        },
      });
    } catch (error: any) {
      // User might not have a presence record yet
      if (error.code === "P2025") {
        return null;
      }
      console.error("Error setting user offline:", error);
      throw error;
    }
  }

  /**
   * Update user status (online, away, busy)
   */
  static async updateStatus(userId: string, status: "online" | "away" | "busy") {
    try {
      return await prisma.userPresence.update({
        where: { user_id: userId },
        data: { status, last_seen_at: new Date() },
      });
    } catch (error: any) {
      console.error("Error updating status:", error);
      throw error;
    }
  }

  /**
   * Get presence for multiple users
   */
  static async getPresenceForUsers(userIds: string[]) {
    try {
      const presenceRecords = await prisma.userPresence.findMany({
        where: { user_id: { in: userIds } },
        select: {
          user_id: true,
          status: true,
          last_seen_at: true,
        },
      });

      // Create a map with all requested users, defaulting to offline
      const presenceMap: Record<
        string,
        { userId: string; status: string; lastSeenAt: Date | null }
      > = {};

      userIds.forEach((id) => {
        presenceMap[id] = { userId: id, status: "offline", lastSeenAt: null };
      });

      presenceRecords.forEach((record) => {
        presenceMap[record.user_id] = {
          userId: record.user_id,
          status: record.status,
          lastSeenAt: record.last_seen_at,
        };
      });

      return Object.values(presenceMap);
    } catch (error: any) {
      console.error("Error getting presence for users:", error);
      throw error;
    }
  }

  /**
   * Get all online users
   */
  static async getOnlineUsers() {
    try {
      return await prisma.userPresence.findMany({
        where: { status: { in: ["online", "away", "busy"] } },
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
      });
    } catch (error: any) {
      console.error("Error getting online users:", error);
      throw error;
    }
  }

  /**
   * Get user presence by user ID
   */
  static async getUserPresence(userId: string) {
    try {
      const presence = await prisma.userPresence.findUnique({
        where: { user_id: userId },
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

      if (!presence) {
        return { userId, status: "offline", lastSeenAt: null };
      }

      return {
        userId: presence.user_id,
        status: presence.status,
        lastSeenAt: presence.last_seen_at,
        user: presence.user,
      };
    } catch (error: any) {
      console.error("Error getting user presence:", error);
      throw error;
    }
  }

  /**
   * Clean up stale presence records (users who disconnected without proper cleanup)
   */
  static async cleanupStalePresence(maxAgeMinutes = 5) {
    try {
      const cutoff = new Date(Date.now() - maxAgeMinutes * 60 * 1000);

      await prisma.userPresence.updateMany({
        where: {
          status: { not: "offline" },
          last_seen_at: { lt: cutoff },
        },
        data: {
          status: "offline",
          socket_id: null,
        },
      });
    } catch (error: any) {
      console.error("Error cleaning up stale presence:", error);
    }
  }
}
