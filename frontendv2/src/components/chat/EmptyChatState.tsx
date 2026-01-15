import React from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "../ui/button";

interface EmptyChatStateProps {
  onStartChat: () => void;
}

export const EmptyChatState: React.FC<EmptyChatStateProps> = ({ onStartChat }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <MessageSquare className="h-10 w-10 text-primary" />
      </div>
      <h2 className="text-2xl font-semibold mb-2">Welcome to Chat</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Connect with teachers, students, and staff. Select a conversation from the
        sidebar or start a new chat.
      </p>
      <Button onClick={onStartChat}>Start a conversation</Button>
    </div>
  );
};
