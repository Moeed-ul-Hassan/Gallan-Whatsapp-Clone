import { useState, useEffect } from "react";
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
  const [isVisible, setIsVisible] = useState(false);

  // Format time from timestamp
  const time = format(new Date(message.createdAt), "h:mm a");
  
  // Set animation after component mount
  useEffect(() => {
    // Small delay to ensure animation looks natural
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Determine message status icon with enhanced styling
  const renderMessageStatus = () => {
    if (isSent) {
      switch(message.status) {
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
    <div className={cn(
      "flex mb-4 transition-all duration-300", 
      isSent ? "justify-end" : "",
      isVisible ? "opacity-100" : "opacity-0 translate-y-2"
    )}>
      <div className="max-w-[75%] relative">
        <div 
          className={cn(
            "rounded-lg p-2 pl-3 pr-3 shadow-sm relative pop-in transition-all",
            isSent 
              ? "bg-gradient-to-br from-[#DCF8C6] to-[#C4F0B5] dark:from-[#005C4B] dark:to-[#00483b] sent-bubble-tail chat-bubble-tail hover:shadow-md" 
              : "bg-white dark:bg-[#202C33] received-bubble-tail chat-bubble-tail hover:shadow-md"
          )}
        >
          {message.mediaUrl && (
            <div className={cn(
              "mb-1 rounded-lg overflow-hidden transition-all duration-300", 
              !isImageLoaded && "h-48 animate-pulse bg-gray-200 dark:bg-gray-700"
            )}>
              <img 
                src={message.mediaUrl} 
                alt="Shared media" 
                className="rounded-lg max-w-full transition-all duration-300 hover:scale-[1.01]"
                onLoad={() => setIsImageLoaded(true)}
                style={{ display: isImageLoaded ? 'block' : 'none' }}
              />
            </div>
          )}
          
          {message.text && (
            <p className="text-text-primary-light dark:text-text-primary-dark transition-all">{message.text}</p>
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
