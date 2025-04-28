import { ArrowLeft, Phone, Search, Video, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import MessageList from "@/components/MessageList";
import MessageInput from "@/components/MessageInput";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Chat, Message } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

interface ChatAreaProps {
  chat: Chat;
  messages: Message[];
  isLoading: boolean;
  onGoBack: () => void;
  isMobile: boolean;
}

function ChatArea({ chat, messages, isLoading, onGoBack, isMobile }: ChatAreaProps) {
  const { user } = useAuth();
  const [messageText, setMessageText] = useState("");
  
  const sendMessageMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest("POST", `/api/messages`, {
        chatId: chat.id,
        text,
        senderId: user?.id,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", chat.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
      setMessageText("");
    },
  });

  const handleSendMessage = () => {
    if (messageText.trim()) {
      sendMessageMutation.mutate(messageText);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <main className="flex-1 flex flex-col bg-[#E5DDD5] dark:bg-[#0B141A]">
      {/* Chat Header */}
      <div className="flex items-center p-3 bg-gray-100 dark:bg-[#202C33] h-16 border-l border-gray-200 dark:border-gray-700">
        {isMobile && (
          <Button variant="ghost" size="icon" className="mr-2" onClick={onGoBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <Avatar>
          <AvatarImage src={chat.avatar} alt={chat.name} />
          <AvatarFallback>{chat.name.substring(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="ml-4 flex-1">
          <h2 className="font-medium">{chat.name}</h2>
          <p className="text-xs text-muted-foreground">
            {chat.isOnline ? "Online" : chat.lastSeen ? `Last seen ${chat.lastSeen}` : "Offline"}
          </p>
        </div>
        <div className="flex space-x-4">
          <Button variant="ghost" size="icon">
            <Video className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
          </Button>
          <Button variant="ghost" size="icon">
            <Phone className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
          </Button>
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
          </Button>
        </div>
      </div>
      
      {/* Chat Messages */}
      <MessageList
        messages={messages}
        isLoading={isLoading}
        currentUserId={user?.id || 0}
      />
      
      {/* Chat Input */}
      <MessageInput
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        onSend={handleSendMessage}
        onKeyDown={handleKeyDown}
        isLoading={sendMessageMutation.isPending}
      />
    </main>
  );
}

export default ChatArea;
