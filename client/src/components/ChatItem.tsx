import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Chat } from "@shared/schema";
import { Check, CheckCheck } from "lucide-react";

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
          return <Check className="h-4 w-4 text-[#E5E5E5]" />;
        case "delivered":
          return <CheckCheck className="h-4 w-4 text-[#A1A1A1]" />;
        case "read":
          return <CheckCheck className="h-4 w-4 text-[#34B7F1]" />;
        default:
          return null;
      }
    }
    return null;
  };

  return (
    <div 
      className={cn(
        "flex items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#202C33] cursor-pointer",
        isActive && "bg-gray-100 dark:bg-[#2A3942]"
      )}
      onClick={onClick}
    >
      <Avatar>
        <AvatarImage src={chat.avatar} alt={chat.name} />
        <AvatarFallback>{chat.name.substring(0, 2)}</AvatarFallback>
      </Avatar>
      <div className="ml-4 flex-1">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">{chat.name}</h3>
          <span className="text-xs text-muted-foreground">{chat.lastMessageTime}</span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-muted-foreground truncate max-w-[180px]">
            {chat.lastMessage}
          </p>
          <div className="flex items-center">
            {chat.unreadCount > 0 ? (
              <span className="bg-primary text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
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
