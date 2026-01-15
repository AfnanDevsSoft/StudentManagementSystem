import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/db";
import { RBACService } from "../../services/rbac.service";

export interface AuthenticatedSocket extends Socket {
  data: {
    user: {
      id: string;
      username: string;
      email: string;
      first_name: string;
      last_name: string;
      profile_photo: string | null;
      role: { id: string; name: string };
      branch_id: string;
      permissions: string[];
    };
  };
}

export async function verifySocketToken(
  socket: Socket,
  next: (err?: Error) => void
) {
  try {
    // Get token from handshake auth or query params
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.query?.token as string);

    if (!token) {
      console.log("Socket auth failed: No token provided");
      return next(new Error("Authentication required"));
    }

    // Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as { userId: string };

    if (!decoded.userId) {
      console.log("Socket auth failed: Invalid token payload");
      return next(new Error("Invalid token"));
    }

    // Fetch user with role
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        role: true,
        branch: true,
      },
    });

    if (!user || !user.is_active) {
      console.log("Socket auth failed: User not found or inactive");
      return next(new Error("User not found or inactive"));
    }

    // Get user permissions
    const permissions = await RBACService.getUserPermissions(user.id);

    // Attach user data to socket
    socket.data.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      profile_photo: user.profile_photo,
      role: { id: user.role.id, name: user.role.name },
      branch_id: user.branch_id,
      permissions,
    };

    console.log(`Socket authenticated for user: ${user.username}`);
    next();
  } catch (error: any) {
    console.error("Socket auth error:", error.message);
    next(new Error("Invalid or expired token"));
  }
}
