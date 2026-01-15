import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Plus, Search, Users } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { OnlineStatus } from "./OnlineStatus";
import { useChatStore, type Conversation } from "../../stores/chat.store";
import { useAuth } from "../../contexts/AuthContext";

interface ChatSidebarProps {
  onNewConversation: () => void;
  isLoading?: boolean;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  onNewConversation,
  isLoading = false,
}) => {
  const { user } = useAuth();
  const {
    conversations,
    activeConversationId,
    setActiveConversation,
    presence,
    getOtherParticipant,
  } = useChatStore();

  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();

    // Search by group name
    if (conv.name?.toLowerCase().includes(query)) return true;

    // Search by participant names
    return conv.participants.some(
      (p) =>
        p.user.first_name.toLowerCase().includes(query) ||
        p.user.last_name.toLowerCase().includes(query)
    );
  });

  const getConversationDisplay = (conv: Conversation) => {
    if (conv.type === "group") {
      return {
        name: conv.name || "Group Chat",
        avatar: conv.name?.[0] || "G",
        status: null,
      };
    }

    const otherUser = getOtherParticipant(conv, user?.id || "");
    if (!otherUser) {
      return { name: "Unknown", avatar: "?", status: null };
    }

    const userPresence = presence[otherUser.id];
    return {
      name: `${otherUser.first_name} ${otherUser.last_name}`,
      avatar: `${otherUser.first_name[0]}${otherUser.last_name[0]}`,
      status: userPresence?.status || "offline",
    };
  };

  return (
    <div className="w-80 border-r flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Messages</h2>
          <Button size="sm" onClick={onNewConversation}>
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Conversations list */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground">
            Loading conversations...
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {searchQuery ? "No conversations found" : "No conversations yet"}
          </div>
        ) : (
          <div className="py-2">
            {filteredConversations.map((conv) => {
              const display = getConversationDisplay(conv);
              const lastMessage = conv.messages?.[0];
              const isActive = activeConversationId === conv.id;

              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversation(conv.id)}
                  className={cn(
                    "w-full px-4 py-3 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left",
                    isActive && "bg-muted"
                  )}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {conv.type === "group" ? (
                        <Users className="h-5 w-5" />
                      ) : (
                        display.avatar
                      )}
                    </div>
                    {display.status && (
                      <div className="absolute -bottom-0.5 -right-0.5">
                        <OnlineStatus status={display.status as any} size="sm" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium truncate">{display.name}</span>
                      {conv.last_message_at && (
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {formatDistanceToNow(new Date(conv.last_message_at), {
                            addSuffix: false,
                          })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-sm text-muted-foreground truncate">
                        {lastMessage ? (
                          <>
                            {lastMessage.sender_id === user?.id && "You: "}
                            {lastMessage.content}
                          </>
                        ) : (
                          "No messages yet"
                        )}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-full flex items-center justify-center">
                          {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
