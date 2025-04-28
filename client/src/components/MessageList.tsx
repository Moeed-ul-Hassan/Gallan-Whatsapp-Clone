import { useEffect, useRef } from "react";
import Message from "@/components/Message";
import { Message as MessageType } from "@shared/schema";
import { formatMessageDate } from "@/lib/formatDate";

interface MessageListProps {
  messages: MessageType[];
  isLoading: boolean;
  currentUserId: number;
}

function MessageList({ messages, isLoading, currentUserId }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Group messages by date
  const groupedMessages: { [date: string]: MessageType[] } = {};
  
  messages.forEach(message => {
    const date = formatMessageDate(message.createdAt);
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(message);
  });

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex justify-center items-center h-full">
          <p className="text-muted-foreground">No messages yet. Start a conversation!</p>
        </div>
      ) : (
        Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date}>
            {/* Date Separator */}
            <div className="flex justify-center my-4">
              <span className="bg-white dark:bg-[#202C33] px-3 py-1 rounded-lg text-xs text-muted-foreground">
                {date}
              </span>
            </div>
            
            {/* Messages for this date */}
            {dateMessages.map((message) => (
              <Message
                key={message.id}
                message={message}
                isSent={message.senderId === currentUserId}
              />
            ))}
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList;
