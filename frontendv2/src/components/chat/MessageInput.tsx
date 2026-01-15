import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send, X, Paperclip, File, Image, FileText, Film, Music } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import type { ChatMessage } from "../../stores/chat.store";

interface FilePreview {
  file: File;
  preview?: string;
}

interface MessageInputProps {
  onSend: (content: string, replyToId?: string, files?: File[]) => void;
  onTyping: (isTyping: boolean) => void;
  replyTo?: ChatMessage | null;
  onCancelReply?: () => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  onTyping,
  replyTo,
  onCancelReply,
  disabled = false,
}) => {
  const [content, setContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<FilePreview[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [content]);

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      selectedFiles.forEach((f) => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
    };
  }, []);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    onTyping(true);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 2000);
  }, [onTyping]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedContent = content.trim();
    const hasContent = trimmedContent || selectedFiles.length > 0;
    if (!hasContent || disabled) return;

    const files = selectedFiles.map((f) => f.file);
    onSend(trimmedContent, replyTo?.id, files.length > 0 ? files : undefined);

    // Clear state
    setContent("");
    selectedFiles.forEach((f) => {
      if (f.preview) URL.revokeObjectURL(f.preview);
    });
    setSelectedFiles([]);
    onTyping(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Focus back on textarea
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Send on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    handleTyping();
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles: FilePreview[] = Array.from(files).map((file) => {
        const isImage = file.type.startsWith("image/");
        return {
          file,
          preview: isImage ? URL.createObjectURL(file) : undefined,
        };
      });
      setSelectedFiles((prev) => [...prev, ...newFiles]);
      // Reset input so the same file can be selected again
      e.target.value = "";
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => {
      const file = prev[index];
      if (file.preview) URL.revokeObjectURL(file.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return Image;
    if (file.type.startsWith("video/")) return Film;
    if (file.type.startsWith("audio/")) return Music;
    if (file.type.includes("pdf") || file.type.includes("document") || file.type.includes("text")) return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const canSend = content.trim() || selectedFiles.length > 0;

  return (
    <form onSubmit={handleSubmit} className="border-t bg-background p-4">
      {/* Reply preview */}
      {replyTo && (
        <div className="flex items-center justify-between mb-2 px-3 py-2 bg-muted rounded-lg">
          <div className="flex-1 min-w-0">
            <span className="text-xs text-muted-foreground">
              Replying to{" "}
              <span className="font-medium">
                {replyTo.sender.first_name} {replyTo.sender.last_name}
              </span>
            </span>
            <p className="text-sm truncate">{replyTo.content}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 flex-shrink-0"
            onClick={onCancelReply}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* File previews */}
      {selectedFiles.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selectedFiles.map((filePreview, index) => {
            const FileIcon = getFileIcon(filePreview.file);
            const isImage = filePreview.file.type.startsWith("image/");

            return (
              <div
                key={index}
                className="relative group bg-muted rounded-lg overflow-hidden"
              >
                {isImage && filePreview.preview ? (
                  <div className="w-20 h-20">
                    <img
                      src={filePreview.preview}
                      alt={filePreview.file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-40 p-3 flex items-center gap-2">
                    <FileIcon className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">
                        {filePreview.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(filePreview.file.size)}
                      </p>
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
      />

      {/* Input area */}
      <div className="flex items-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="flex-shrink-0"
          disabled={disabled}
          onClick={handleFileClick}
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        <Textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="min-h-[40px] max-h-[150px] resize-none"
          disabled={disabled}
          rows={1}
        />

        <Button
          type="submit"
          size="icon"
          className="flex-shrink-0"
          disabled={disabled || !canSend}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-2">
        Press Enter to send, Shift+Enter for new line
      </p>
    </form>
  );
};
