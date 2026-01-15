import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Conversation, ChatMessage, ChatUser } from "../stores/chat.store";

const chatEndpoints = {
  conversations: "/chat/conversations",
  conversationsDirect: "/chat/conversations/direct",
  conversationsGroup: "/chat/conversations/group",
  messages: (id: string) => `/chat/conversations/${id}/messages`,
  search: "/chat/search",
  unreadCount: "/chat/unread-count",
  onlineUsers: "/chat/presence/online",
  searchUsers: "/chat/users/search",
};

// Fetch all conversations
export function useConversations() {
  return useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: async () => {
      const response = await api.get(chatEndpoints.conversations);
      return response.data.data;
    },
    staleTime: 30000,
  });
}

// Fetch messages for a conversation
export function useMessages(conversationId: string | null, enabled = true) {
  return useQuery<ChatMessage[]>({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const response = await api.get(chatEndpoints.messages(conversationId));
      return response.data.data;
    },
    enabled: enabled && !!conversationId,
    staleTime: 10000,
  });
}

// Create direct conversation
export function useCreateDirectConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (recipientId: string) => {
      const response = await api.post(chatEndpoints.conversationsDirect, { recipientId });
      return response.data.data as Conversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

// Create group conversation
export function useCreateGroupConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; participantIds: string[]; description?: string }) => {
      const response = await api.post(chatEndpoints.conversationsGroup, data);
      return response.data.data as Conversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

// Search messages
export function useSearchMessages(query: string) {
  return useQuery({
    queryKey: ["searchMessages", query],
    queryFn: async () => {
      const response = await api.get(chatEndpoints.search, { params: { q: query } });
      return response.data.data;
    },
    enabled: query.length >= 2,
  });
}

// Get unread count
export function useUnreadCount() {
  return useQuery<number>({
    queryKey: ["unreadCount"],
    queryFn: async () => {
      const response = await api.get(chatEndpoints.unreadCount);
      return response.data.data.unreadCount;
    },
    refetchInterval: 60000, // Refetch every minute
  });
}

// Get online users
export function useOnlineUsers() {
  return useQuery({
    queryKey: ["onlineUsers"],
    queryFn: async () => {
      const response = await api.get(chatEndpoints.onlineUsers);
      return response.data.data;
    },
    refetchInterval: 30000,
  });
}

// Search users for new conversations
export function useSearchUsers(query: string) {
  return useQuery<Array<ChatUser & { role: { name: string }; email: string }>>({
    queryKey: ["searchUsers", query],
    queryFn: async () => {
      const response = await api.get(chatEndpoints.searchUsers, { params: { q: query } });
      return response.data.data;
    },
    enabled: query.length >= 1,
  });
}

// Leave conversation
export function useLeaveConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (conversationId: string) => {
      const response = await api.post(`/chat/conversations/${conversationId}/leave`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

// Add participants to group
export function useAddParticipants() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ conversationId, participantIds }: { conversationId: string; participantIds: string[] }) => {
      const response = await api.post(`/chat/conversations/${conversationId}/participants`, { participantIds });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

// Update group
export function useUpdateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      conversationId,
      data,
    }: {
      conversationId: string;
      data: { name?: string; description?: string };
    }) => {
      const response = await api.put(`/chat/conversations/${conversationId}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
