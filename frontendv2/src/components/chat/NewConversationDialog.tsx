import React, { useState } from "react";
import { Search, Users, User, X, Check, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";
import { useSearchUsers, useCreateDirectConversation, useCreateGroupConversation } from "../../hooks/useChat";
import { useChatStore, type ChatUser } from "../../stores/chat.store";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewConversationDialog: React.FC<NewConversationDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { user } = useAuth();
  const { setActiveConversation } = useChatStore();

  const [tab, setTab] = useState<"direct" | "group">("direct");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Array<ChatUser & { role: { name: string }; email: string }>>([]);
  const [groupName, setGroupName] = useState("");

  const { data: searchResults, isLoading: isSearching } = useSearchUsers(searchQuery);
  const createDirectMutation = useCreateDirectConversation();
  const createGroupMutation = useCreateGroupConversation();

  const handleSelectUser = (selectedUser: ChatUser & { role: { name: string }; email: string }) => {
    if (tab === "direct") {
      // For direct messages, immediately create conversation
      handleCreateDirect(selectedUser.id);
    } else {
      // For groups, add to selected list
      if (!selectedUsers.find((u) => u.id === selectedUser.id)) {
        setSelectedUsers([...selectedUsers, selectedUser]);
      }
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));
  };

  const handleCreateDirect = async (recipientId: string) => {
    try {
      const conversation = await createDirectMutation.mutateAsync(recipientId);
      setActiveConversation(conversation.id);
      onOpenChange(false);
      resetForm();
      toast.success("Conversation created");
    } catch (error: any) {
      toast.error(error.message || "Failed to create conversation");
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }
    if (selectedUsers.length < 1) {
      toast.error("Please select at least one participant");
      return;
    }

    try {
      const conversation = await createGroupMutation.mutateAsync({
        name: groupName.trim(),
        participantIds: selectedUsers.map((u) => u.id),
      });
      setActiveConversation(conversation.id);
      onOpenChange(false);
      resetForm();
      toast.success("Group created");
    } catch (error: any) {
      toast.error(error.message || "Failed to create group");
    }
  };

  const resetForm = () => {
    setSearchQuery("");
    setSelectedUsers([]);
    setGroupName("");
    setTab("direct");
  };

  const isLoading = createDirectMutation.isPending || createGroupMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "direct" | "group")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="direct" className="gap-2">
              <User className="h-4 w-4" />
              Direct Message
            </TabsTrigger>
            <TabsTrigger value="group" className="gap-2">
              <Users className="h-4 w-4" />
              Group Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="direct" className="mt-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <ScrollArea className="h-[300px]">
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : searchResults && searchResults.length > 0 ? (
                <div className="space-y-1">
                  {searchResults.map((searchUser) => (
                    <button
                      key={searchUser.id}
                      onClick={() => handleSelectUser(searchUser)}
                      disabled={isLoading}
                      className="w-full px-3 py-2 flex items-center gap-3 rounded-lg hover:bg-muted transition-colors text-left disabled:opacity-50"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {searchUser.first_name[0]}
                        {searchUser.last_name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">
                          {searchUser.first_name} {searchUser.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {searchUser.email}
                        </p>
                      </div>
                      <Badge variant="secondary" className="flex-shrink-0">
                        {searchUser.role.name}
                      </Badge>
                    </button>
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="text-center py-8 text-muted-foreground">
                  No users found
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Start typing to search for users
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="group" className="mt-4 space-y-4">
            <div>
              <Label>Group Name</Label>
              <Input
                placeholder="Enter group name..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>

            <div>
              <Label>Add Participants</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Selected users */}
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((selectedUser) => (
                  <Badge
                    key={selectedUser.id}
                    variant="secondary"
                    className="gap-1 pr-1"
                  >
                    {selectedUser.first_name} {selectedUser.last_name}
                    <button
                      onClick={() => handleRemoveUser(selectedUser.id)}
                      className="ml-1 hover:bg-muted rounded p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <ScrollArea className="h-[200px]">
              {isSearching ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : searchResults && searchResults.length > 0 ? (
                <div className="space-y-1">
                  {searchResults.map((searchUser) => {
                    const isSelected = selectedUsers.some((u) => u.id === searchUser.id);
                    return (
                      <button
                        key={searchUser.id}
                        onClick={() => handleSelectUser(searchUser)}
                        className={cn(
                          "w-full px-3 py-2 flex items-center gap-3 rounded-lg transition-colors text-left",
                          isSelected ? "bg-primary/10" : "hover:bg-muted"
                        )}
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                          {searchUser.first_name[0]}
                          {searchUser.last_name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">
                            {searchUser.first_name} {searchUser.last_name}
                          </p>
                        </div>
                        {isSelected && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : searchQuery ? (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  No users found
                </div>
              ) : (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  Search to add participants
                </div>
              )}
            </ScrollArea>

            <Button
              className="w-full"
              onClick={handleCreateGroup}
              disabled={isLoading || !groupName.trim() || selectedUsers.length === 0}
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Group
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
