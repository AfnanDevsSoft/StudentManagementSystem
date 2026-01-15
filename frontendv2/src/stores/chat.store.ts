import { create } from "zustand";
import { io, Socket } from "socket.io-client";

// Types
export interface ChatUser {
  id: string;
  first_name: string;
  last_name: string;
  username?: string;
  profile_photo?: string;
}

export interface MessageAttachment {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  thumbnail_url?: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender: ChatUser;
  content: string;
  message_type: string;
  attachments?: MessageAttachment[];
  reply_to?: {
    id: string;
    content: string;
    sender: { first_name: string; last_name: string };
  };
  read_receipts?: Array<{ user_id: string; read_at: string }>;
  is_edited: boolean;
  edited_at?: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  type: "direct" | "group";
  name?: string;
  description?: string;
  avatar_url?: string;
  participants: Array<{
    user_id: string;
    role: string;
    user: ChatUser;
  }>;
  messages?: ChatMessage[];
  unreadCount: number;
  last_message_at?: string;
}

export interface TypingUser {
  userId: string;
  username: string;
  displayName: string;
}

export interface UserPresence {
  userId: string;
  status: "online" | "away" | "busy" | "offline";
  lastSeenAt: string | null;
}

interface ChatState {
  // Connection state
  socket: Socket | null;
  connected: boolean;

  // Data state
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, ChatMessage[]>;
  typingUsers: Record<string, TypingUser[]>;
  presence: Record<string, UserPresence>;
  unreadCount: number;

  // Actions
  connect: (token: string) => void;
  disconnect: () => void;
  setActiveConversation: (id: string | null) => void;
  setConversations: (conversations: Conversation[]) => void;
  setMessages: (conversationId: string, messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  updateMessage: (message: ChatMessage) => void;
  removeMessage: (conversationId: string, messageId: string) => void;
  sendMessage: (conversationId: string, content: string, replyToId?: string, files?: File[]) => void;
  markAsRead: (conversationId: string, messageIds: string[]) => void;
  setTyping: (conversationId: string, isTyping: boolean) => void;
  updatePresence: (userId: string, presence: UserPresence) => void;
  updateUnreadCount: (count: number) => void;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  getOtherParticipant: (conversation: Conversation, currentUserId: string) => ChatUser | null;
}

const API_URL = import.meta.env.VITE_API_BASE_URL?.replace("/api/v1", "") || "http://localhost:3000";

export const useChatStore = create<ChatState>((set, get) => ({
  socket: null,
  connected: false,
  conversations: [],
  activeConversationId: null,
  messages: {},
  typingUsers: {},
  presence: {},
  unreadCount: 0,

  connect: (token: string) => {
    // Prevent multiple connections
    if (get().socket?.connected) {
      console.log("Socket already connected");
      return;
    }

    console.log("Connecting to socket at:", API_URL);

    const socket = io(API_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      set({ connected: true });
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      set({ connected: false });
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });

    // Message events
    socket.on("chat:message:new", (message: ChatMessage) => {
      const state = get();
      const messages = state.messages[message.conversation_id] || [];

      // Avoid duplicates
      if (messages.some(m => m.id === message.id)) return;

      set({
        messages: {
          ...state.messages,
          [message.conversation_id]: [...messages, message],
        },
      });

      // Update unread if not active conversation and not own message
      const currentUserId = localStorage.getItem("user_id");
      if (state.activeConversationId !== message.conversation_id && message.sender_id !== currentUserId) {
        set({ unreadCount: state.unreadCount + 1 });
      }
    });

    socket.on("chat:message:edited", (message: ChatMessage) => {
      const state = get();
      const messages = state.messages[message.conversation_id] || [];
      set({
        messages: {
          ...state.messages,
          [message.conversation_id]: messages.map((m) =>
            m.id === message.id ? message : m
          ),
        },
      });
    });

    socket.on("chat:message:deleted", (data: { conversationId: string; messageId: string }) => {
      const state = get();
      const messages = state.messages[data.conversationId] || [];
      set({
        messages: {
          ...state.messages,
          [data.conversationId]: messages.filter((m) => m.id !== data.messageId),
        },
      });
    });

    // Typing events
    socket.on("typing:update", (data: {
      conversationId: string;
      userId: string;
      username: string;
      displayName: string;
      isTyping: boolean;
    }) => {
      const state = get();
      const current = state.typingUsers[data.conversationId] || [];

      if (data.isTyping) {
        if (!current.find((u) => u.userId === data.userId)) {
          set({
            typingUsers: {
              ...state.typingUsers,
              [data.conversationId]: [
                ...current,
                { userId: data.userId, username: data.username, displayName: data.displayName },
              ],
            },
          });
        }
      } else {
        set({
          typingUsers: {
            ...state.typingUsers,
            [data.conversationId]: current.filter((u) => u.userId !== data.userId),
          },
        });
      }
    });

    // Presence events
    socket.on("presence:update", (data: { userId: string; status: string; lastSeenAt: string }) => {
      const state = get();
      set({
        presence: {
          ...state.presence,
          [data.userId]: data as UserPresence,
        },
      });
    });

    // Read receipt events
    socket.on("chat:read:receipt", (data: {
      conversationId: string;
      userId: string;
      messageIds: string[];
      readAt: string;
    }) => {
      const state = get();
      const messages = state.messages[data.conversationId] || [];
      set({
        messages: {
          ...state.messages,
          [data.conversationId]: messages.map((m) => {
            if (data.messageIds.includes(m.id)) {
              const receipts = m.read_receipts || [];
              if (!receipts.find((r) => r.user_id === data.userId)) {
                return {
                  ...m,
                  read_receipts: [...receipts, { user_id: data.userId, read_at: data.readAt }],
                };
              }
            }
            return m;
          }),
        },
      });
    });

    // Notification events
    socket.on("chat:notification", (data: { type: string; conversationId: string; message: ChatMessage }) => {
      console.log("Chat notification:", data);
      // Could show toast notification here
    });

    // Error events
    socket.on("chat:error", (data: { event: string; message: string }) => {
      console.error("Chat error:", data);
    });

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, connected: false });
    }
  },

  setActiveConversation: (id: string | null) => {
    const prevId = get().activeConversationId;

    // Leave previous conversation room
    if (prevId && prevId !== id) {
      get().leaveConversation(prevId);
    }

    set({ activeConversationId: id });

    // Join new conversation room
    if (id) {
      get().joinConversation(id);
    }
  },

  setConversations: (conversations: Conversation[]) => {
    set({ conversations });
  },

  setMessages: (conversationId: string, messages: ChatMessage[]) => {
    const state = get();
    set({
      messages: {
        ...state.messages,
        [conversationId]: messages,
      },
    });
  },

  addMessage: (message: ChatMessage) => {
    const state = get();
    const messages = state.messages[message.conversation_id] || [];
    set({
      messages: {
        ...state.messages,
        [message.conversation_id]: [...messages, message],
      },
    });
  },

  updateMessage: (message: ChatMessage) => {
    const state = get();
    const messages = state.messages[message.conversation_id] || [];
    set({
      messages: {
        ...state.messages,
        [message.conversation_id]: messages.map((m) => (m.id === message.id ? message : m)),
      },
    });
  },

  removeMessage: (conversationId: string, messageId: string) => {
    const state = get();
    const messages = state.messages[conversationId] || [];
    set({
      messages: {
        ...state.messages,
        [conversationId]: messages.filter((m) => m.id !== messageId),
      },
    });
  },

  sendMessage: async (conversationId: string, content: string, replyToId?: string, files?: File[]) => {
    const { socket } = get();
    if (!socket) return;

    let attachmentIds: string[] = [];

    // Upload files first if any
    if (files && files.length > 0) {
      try {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("files", file);
        });
        formData.append("conversationId", conversationId);

        const token = localStorage.getItem("access_token");
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

        const response = await fetch(`${baseUrl}/chat/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          attachmentIds = data.data?.attachments?.map((a: { id: string }) => a.id) || [];
          console.log("Upload successful, attachmentIds:", attachmentIds);
        } else {
          const errorData = await response.json();
          console.error("Upload failed:", response.status, errorData);
        }
      } catch (error) {
        console.error("Failed to upload files:", error);
      }
    }

    // Don't send empty message if files failed to upload
    if (files && files.length > 0 && attachmentIds.length === 0 && !content) {
      console.error("File upload failed and no message content");
      return;
    }

    // Send message via socket
    socket.emit("chat:message", {
      conversationId,
      content: content || "",
      messageType: attachmentIds.length > 0 ? "attachment" : "text",
      replyToId,
      attachmentIds,
    });
  },

  markAsRead: (conversationId: string, messageIds: string[]) => {
    const { socket, unreadCount, conversations } = get();
    if (socket && messageIds.length > 0) {
      socket.emit("chat:read", { conversationId, messageIds });
      // Immediately decrement global unread count
      const newCount = Math.max(0, unreadCount - messageIds.length);
      // Also update conversation's unread count
      const updatedConversations = conversations.map((c) =>
        c.id === conversationId
          ? { ...c, unreadCount: Math.max(0, c.unreadCount - messageIds.length) }
          : c
      );
      set({ unreadCount: newCount, conversations: updatedConversations });
    }
  },

  setTyping: (conversationId: string, isTyping: boolean) => {
    const { socket } = get();
    if (socket) {
      socket.emit(isTyping ? "typing:start" : "typing:stop", conversationId);
    }
  },

  updatePresence: (userId: string, presence: UserPresence) => {
    const state = get();
    set({
      presence: {
        ...state.presence,
        [userId]: presence,
      },
    });
  },

  updateUnreadCount: (count: number) => {
    set({ unreadCount: count });
  },

  joinConversation: (conversationId: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit("chat:join", conversationId);
    }
  },

  leaveConversation: (conversationId: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit("chat:leave", conversationId);
    }
  },

  getOtherParticipant: (conversation: Conversation, currentUserId: string): ChatUser | null => {
    if (conversation.type !== "direct") return null;
    const other = conversation.participants.find((p) => p.user_id !== currentUserId);
    return other?.user || null;
  },
}));
