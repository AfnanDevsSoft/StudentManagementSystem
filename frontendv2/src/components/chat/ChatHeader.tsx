import React from "react";
import { MoreVertical, Phone, Video, Info, Users } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { OnlineStatus } from "./OnlineStatus";
import { useChatStore, type Conversation } from "../../stores/chat.store";
import { useAuth } from "../../contexts/AuthContext";

interface ChatHeaderProps {
  conversation: Conversation;
  onViewInfo?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation,
  onViewInfo,
}) => {
  const { user } = useAuth();
  const { presence, getOtherParticipant, typingUsers } = useChatStore();

  const getHeaderInfo = () => {
    if (conversation.type === "group") {
      const memberCount = conversation.participants.length;
      return {
        name: conversation.name || "Group Chat",
        subtitle: `${memberCount} members`,
        avatar: conversation.name?.[0] || "G",
        status: null,
      };
    }

    const otherUser = getOtherParticipant(conversation, user?.id || "");
    if (!otherUser) {
      return { name: "Unknown", subtitle: "", avatar: "?", status: null };
    }

    const userPresence = presence[otherUser.id];
    const status = userPresence?.status || "offline";

    return {
      name: `${otherUser.first_name} ${otherUser.last_name}`,
      subtitle: status === "online" ? "Online" : `Last seen ${userPresence?.lastSeenAt ? "recently" : "a while ago"}`,
      avatar: `${otherUser.first_name[0]}${otherUser.last_name[0]}`,
      status,
    };
  };

  const headerInfo = getHeaderInfo();
  const typing = typingUsers[conversation.id] || [];

  return (
    <div className="px-4 py-3 border-b flex items-center justify-between bg-background">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
            {conversation.type === "group" ? (
              <Users className="h-5 w-5" />
            ) : (
              headerInfo.avatar
            )}
          </div>
          {headerInfo.status && (
            <div className="absolute -bottom-0.5 -right-0.5">
              <OnlineStatus status={headerInfo.status as any} size="sm" />
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h3 className="font-semibold">{headerInfo.name}</h3>
          <p className="text-sm text-muted-foreground">
            {typing.length > 0 ? (
              <span className="text-primary">
                {typing.length === 1
                  ? `${typing[0].displayName} is typing...`
                  : `${typing.length} people are typing...`}
              </span>
            ) : (
              headerInfo.subtitle
            )}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" disabled>
          <Phone className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" disabled>
          <Video className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onViewInfo}>
          <Info className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onViewInfo}>
              View info
            </DropdownMenuItem>
            <DropdownMenuItem>Mute notifications</DropdownMenuItem>
            <DropdownMenuItem>Search in conversation</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Leave conversation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
