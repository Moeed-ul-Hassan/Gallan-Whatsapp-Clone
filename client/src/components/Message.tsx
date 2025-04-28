import { useState } from "react";
import { Message as MessageType } from "@shared/schema";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessageProps {
  message: MessageType;
  isSent: boolean;
}

function Message({ message, isSent }: MessageProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(!message.mediaUrl);

  // Format time from timestamp
  const time = format(new Date(message.createdAt), "h:mm a");

  // Determine message status icon
  const renderMessageStatus = () => {
    if (isSent) {
      switch(message.status) {
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
    <div className={cn("flex mb-4", isSent ? "justify-end" : "")}>
      <div className="max-w-[75%] relative">
        <div 
          className={cn(
            "rounded-lg p-2 pl-3 pr-3 shadow-sm relative",
            isSent 
              ? "bg-[#DCF8C6] dark:bg-[#005C4B] sent-bubble-tail chat-bubble-tail" 
              : "bg-white dark:bg-[#202C33] received-bubble-tail chat-bubble-tail"
          )}
        >
          {message.mediaUrl && (
            <div className={cn("mb-1", !isImageLoaded && "h-48 animate-pulse bg-gray-200 dark:bg-gray-700 rounded")}>
              <img 
                src={message.mediaUrl} 
                alt="Shared media" 
                className="rounded-lg max-w-full"
                onLoad={() => setIsImageLoaded(true)}
                style={{ display: isImageLoaded ? 'block' : 'none' }}
              />
            </div>
          )}
          
          {message.text && (
            <p className="text-text-primary-light dark:text-text-primary-dark">{message.text}</p>
          )}
          
          <div className="flex justify-end items-center mt-1">
            <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark mr-1">{time}</span>
            {renderMessageStatus()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Message;
