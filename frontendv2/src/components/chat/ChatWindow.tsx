import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { TypingIndicator } from "./TypingIndicator";
import { useChatStore, type Conversation, type ChatMessage } from "../../stores/chat.store";
import { useMessages } from "../../hooks/useChat";
import { useAuth } from "../../contexts/AuthContext";

interface ChatWindowProps {
  conversation: Conversation;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversation }) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);

  const {
    messages: storedMessages,
    setMessages,
    sendMessage,
    setTyping,
    markAsRead,
    typingUsers,
  } = useChatStore();

  // Fetch messages via React Query
  const { data: fetchedMessages, isLoading } = useMessages(conversation.id);

  // Sync fetched messages to store
  useEffect(() => {
    if (fetchedMessages) {
      setMessages(conversation.id, fetchedMessages);
    }
  }, [fetchedMessages, conversation.id, setMessages]);

  // Get messages from store (includes real-time updates)
  const messages = storedMessages[conversation.id] || [];

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read when viewing
  useEffect(() => {
    if (messages.length > 0) {
      const unreadMessageIds = messages
        .filter((m) => {
          const isOwnMessage = m.sender_id === user?.id;
          const hasReadReceipt = m.read_receipts?.some((r) => r.user_id === user?.id);
          return !isOwnMessage && !hasReadReceipt;
        })
        .map((m) => m.id);

      if (unreadMessageIds.length > 0) {
        markAsRead(conversation.id, unreadMessageIds);
      }
    }
  }, [messages, conversation.id, user?.id, markAsRead]);

  const handleSend = (content: string, replyToId?: string, files?: File[]) => {
    sendMessage(conversation.id, content, replyToId, files);
    setReplyTo(null);
  };

  const handleTyping = (isTyping: boolean) => {
    setTyping(conversation.id, isTyping);
  };

  const handleReply = (message: ChatMessage) => {
    setReplyTo(message);
  };

  const handleCancelReply = () => {
    setReplyTo(null);
  };

  // Group messages by date
  const groupedMessages = messages.reduce<Record<string, ChatMessage[]>>((acc, message) => {
    const date = new Date(message.created_at).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(message);
    return acc;
  }, {});

  const typing = typingUsers[conversation.id] || [];

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Messages area */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation by sending a message</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date}>
                {/* Date separator */}
                <div className="flex items-center justify-center mb-4">
                  <div className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                    {new Date(date).toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>

                {/* Messages for this date */}
                <div className="space-y-3">
                  {dateMessages.map((message, index) => {
                    const isOwn = message.sender_id === user?.id;
                    const prevMessage = index > 0 ? dateMessages[index - 1] : null;
                    const showSender =
                      conversation.type === "group" &&
                      (!prevMessage || prevMessage.sender_id !== message.sender_id);

                    return (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isOwn={isOwn}
                        showSender={showSender}
                        onReply={handleReply}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Typing indicator */}
      {typing.length > 0 && <TypingIndicator typingUsers={typing} />}

      {/* Message input */}
      <MessageInput
        onSend={handleSend}
        onTyping={handleTyping}
        replyTo={replyTo}
        onCancelReply={handleCancelReply}
      />
    </div>
  );
};
