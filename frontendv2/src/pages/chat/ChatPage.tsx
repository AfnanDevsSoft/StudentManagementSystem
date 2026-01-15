import React, { useEffect, useState } from "react";
import { MainLayout } from "../../components/layout/MainLayout";
import { ChatSidebar } from "../../components/chat/ChatSidebar";
import { ChatWindow } from "../../components/chat/ChatWindow";
import { ChatHeader } from "../../components/chat/ChatHeader";
import { EmptyChatState } from "../../components/chat/EmptyChatState";
import { NewConversationDialog } from "../../components/chat/NewConversationDialog";
import { useChatStore } from "../../stores/chat.store";
import { useAuth } from "../../contexts/AuthContext";
import { useConversations, useUnreadCount } from "../../hooks/useChat";
import { Wifi, WifiOff } from "lucide-react";

export const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const {
    connect,
    disconnect,
    connected,
    activeConversationId,
    setConversations,
    conversations,
    updateUnreadCount,
  } = useChatStore();

  const [showNewConversation, setShowNewConversation] = useState(false);

  // Fetch conversations via React Query
  const { data: fetchedConversations, isLoading } = useConversations();

  // Fetch unread count
  const { data: unreadCount } = useUnreadCount();

  // Connect to socket on mount
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token && !connected) {
      connect(token);
    }

    return () => {
      // Don't disconnect on unmount to maintain connection
      // disconnect() will be called when user logs out
    };
  }, [connect, connected]);

  // Sync conversations from React Query to Zustand
  useEffect(() => {
    if (fetchedConversations) {
      setConversations(fetchedConversations);
    }
  }, [fetchedConversations, setConversations]);

  // Sync unread count
  useEffect(() => {
    if (unreadCount !== undefined) {
      updateUnreadCount(unreadCount);
    }
  }, [unreadCount, updateUnreadCount]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  return (
    <MainLayout>
      <div className="h-[calc(100vh-120px)] flex flex-col">
        {/* Connection status */}
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <h1 className="text-xl font-semibold">Chat</h1>
          <div className="flex items-center gap-2 text-sm">
            {connected ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-green-600">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Connecting...</span>
              </>
            )}
          </div>
        </div>

        {/* Chat interface */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <ChatSidebar
            onNewConversation={() => setShowNewConversation(true)}
            isLoading={isLoading}
          />

          {/* Main chat area */}
          <div className="flex-1 flex flex-col">
            {activeConversation ? (
              <>
                <ChatHeader conversation={activeConversation} />
                <ChatWindow conversation={activeConversation} />
              </>
            ) : (
              <EmptyChatState onStartChat={() => setShowNewConversation(true)} />
            )}
          </div>
        </div>
      </div>

      {/* New conversation dialog */}
      <NewConversationDialog
        open={showNewConversation}
        onOpenChange={setShowNewConversation}
      />
    </MainLayout>
  );
};

export default ChatPage;
