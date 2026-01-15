import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Check, CheckCheck, MoreVertical, Reply, Pencil, Trash2, File, FileText, Film, Music, Download } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import type { ChatMessage, MessageAttachment } from "../../stores/chat.store";

const API_URL = import.meta.env.VITE_API_BASE_URL?.replace("/api/v1", "") || "http://localhost:3000";

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  showSender?: boolean;
  onReply?: (message: ChatMessage) => void;
  onEdit?: (message: ChatMessage) => void;
  onDelete?: (messageId: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showSender = false,
  onReply,
  onEdit,
  onDelete,
}) => {
  const hasReadReceipts = message.read_receipts && message.read_receipts.length > 0;

  return (
    <div className={cn("flex gap-2 group", isOwn ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      {!isOwn && showSender && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
          {message.sender.first_name[0]}
          {message.sender.last_name[0]}
        </div>
      )}

      <div className={cn("flex flex-col max-w-[70%]", isOwn ? "items-end" : "items-start")}>
        {/* Sender name */}
        {showSender && !isOwn && (
          <span className="text-xs text-muted-foreground mb-1">
            {message.sender.first_name} {message.sender.last_name}
          </span>
        )}

        {/* Reply preview */}
        {message.reply_to && (
          <div
            className={cn(
              "text-xs px-3 py-1 rounded-t-lg border-l-2",
              isOwn
                ? "bg-primary/5 border-primary text-right"
                : "bg-muted/50 border-muted-foreground"
            )}
          >
            <span className="font-medium">
              {message.reply_to.sender.first_name} {message.reply_to.sender.last_name}
            </span>
            <p className="truncate opacity-75">{message.reply_to.content}</p>
          </div>
        )}

        {/* Attachments (render before text if present) */}
        {message.attachments && message.attachments.length > 0 && (
          <div className={cn("space-y-2", message.content ? "mb-1" : "")}>
            {message.attachments.map((att) => {
              const fileUrl = att.file_url.startsWith("http") ? att.file_url : `${API_URL}${att.file_url}`;
              const isImage = att.file_type.startsWith("image/");
              const isVideo = att.file_type.startsWith("video/");
              const isAudio = att.file_type.startsWith("audio/");

              if (isImage) {
                return (
                  <a
                    key={att.id}
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img
                      src={fileUrl}
                      alt={att.file_name}
                      className="max-w-[280px] max-h-[280px] rounded-lg object-cover"
                    />
                  </a>
                );
              }

              if (isVideo) {
                return (
                  <video
                    key={att.id}
                    src={fileUrl}
                    controls
                    className="max-w-[280px] rounded-lg"
                  />
                );
              }

              if (isAudio) {
                return (
                  <audio key={att.id} src={fileUrl} controls className="max-w-[280px]" />
                );
              }

              // Other file types
              const FileIcon = att.file_type.includes("pdf") || att.file_type.includes("document") ? FileText : File;
              return (
                <a
                  key={att.id}
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg",
                    isOwn ? "bg-primary-foreground/10" : "bg-background/50"
                  )}
                >
                  <FileIcon className="h-8 w-8 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{att.file_name}</p>
                    <p className="text-xs opacity-75">
                      {(att.file_size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Download className="h-4 w-4 flex-shrink-0" />
                </a>
              );
            })}
          </div>
        )}

        {/* Message bubble (only if has text content) */}
        {message.content ? (
          <div
            className={cn(
              "px-4 py-2 rounded-2xl relative",
              message.reply_to ? "rounded-t-none" : "",
              isOwn
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            )}
          >
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          </div>
        ) : !message.attachments || message.attachments.length === 0 ? (
          // Fallback for empty messages (shouldn't happen normally)
          <div
            className={cn(
              "px-4 py-2 rounded-2xl relative",
              isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
            )}
          >
            <p className="text-xs opacity-50 italic">Empty message</p>
          </div>
        ) : null}

        {/* Time and read receipt */}
        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
          <span>{formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}</span>
          {message.is_edited && <span>(edited)</span>}
          {isOwn && (
            hasReadReceipts ? (
              <CheckCheck className="w-3 h-3 text-blue-500" />
            ) : (
              <Check className="w-3 h-3" />
            )
          )}
        </div>
      </div>

      {/* Actions dropdown */}
      <div className={cn("opacity-0 group-hover:opacity-100 transition-opacity", isOwn ? "order-first" : "order-last")}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isOwn ? "end" : "start"}>
            {onReply && (
              <DropdownMenuItem onClick={() => onReply(message)}>
                <Reply className="h-4 w-4 mr-2" />
                Reply
              </DropdownMenuItem>
            )}
            {isOwn && onEdit && (
              <DropdownMenuItem onClick={() => onEdit(message)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
            )}
            {isOwn && onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(message.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
