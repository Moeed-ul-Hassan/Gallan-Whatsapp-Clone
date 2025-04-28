import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Chat } from "@shared/schema";
import { Check, CheckCheck, Circle } from "lucide-react";

interface ChatItemProps {
  chat: Chat;
  isActive: boolean;
  onClick: () => void;
}

function ChatItem({ chat, isActive, onClick }: ChatItemProps) {
  // Determine the message status icon
  const renderMessageStatus = () => {
    if (chat.lastMessageSent) {
      switch(chat.lastMessageStatus) {
        case "sent":
          return <Check className="h-4 w-4 text-[#E5E5E5] transition-all" />;
        case "delivered":
          return <CheckCheck className="h-4 w-4 text-[#A1A1A1] transition-all" />;
        case "read":
          return <CheckCheck className="h-4 w-4 text-blue-400 transition-all" />;
        default:
          return null;
      }
    }
    return null;
  };

  return (
    <div 
      className={cn(
        "chat-item flex items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#202C33] cursor-pointer relative overflow-hidden",
        isActive ? "bg-gray-100 dark:bg-[#2A3942] active" : "",
        chat.isOnline && "online-indicator",
        "pop-in"
      )}
      onClick={onClick}
      style={{animationDelay: `${Math.random() * 0.3}s`}}
    >
      <div className="relative">
        <Avatar className="transition-all hover:scale-105">
          <AvatarImage src={chat.avatar || undefined} alt={chat.name || "Chat"} />
          <AvatarFallback className="bg-gradient-to-br from-primary to-primary-600">
            {(chat.name || "CH").substring(0, 2)}
          </AvatarFallback>
        </Avatar>
        {chat.isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full animate-pulse"></span>
        )}
      </div>
      <div className="ml-4 flex-1">
        <div className="flex justify-between items-center">
          <h3 className={cn(
            "font-medium transition-all",
            isActive && "gradient-text font-semibold"
          )}>
            {chat.name || "Chat"}
          </h3>
          <span className="text-xs text-muted-foreground">{chat.lastMessageTime}</span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-muted-foreground truncate max-w-[180px] transition-all">
            {chat.lastMessage}
          </p>
          <div className="flex items-center">
            {chat.unreadCount > 0 ? (
              <span className="bg-gradient-to-r from-primary to-teal-500 text-white rounded-full text-xs min-w-5 h-5 px-1.5 flex items-center justify-center shadow-sm animate-pulse">
                {chat.unreadCount}
              </span>
            ) : (
              renderMessageStatus()
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatItem;
