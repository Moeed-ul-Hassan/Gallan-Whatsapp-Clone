import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import ChatItem from "@/components/ChatItem";
import { ThemeToggle } from "@/components/ThemeToggle";
import { User, Chat } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, MoreVertical, PieChart } from "lucide-react";

interface LeftSidebarProps {
  user: User;
  chats: Chat[];
  isLoading: boolean;
  onOpenChat: (chatId: number) => void;
  onOpenProfile: () => void;
  onStartNewChat: () => void;
  activeChatId: number | null;
  isMobile: boolean;
}

function LeftSidebar({
  user,
  chats,
  isLoading,
  onOpenChat,
  onOpenProfile,
  onStartNewChat,
  activeChatId,
  isMobile
}: LeftSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className={`
      ${isMobile && activeChatId ? 'hidden' : 'flex'} 
      md:flex flex-col w-full md:w-96 border-r border-gray-200 dark:border-gray-700
    `}>
      {/* Sidebar Header */}
      <div className="flex justify-between items-center p-3 bg-gray-100 dark:bg-[#202C33] h-16">
        <div className="flex items-center">
          <Avatar>
            <AvatarImage src={user.avatar} alt={user.displayName} />
            <AvatarFallback>{user.displayName.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <span className="ml-3 font-medium">{user.displayName}</span>
        </div>
        <div className="flex space-x-4">
          <Button variant="ghost" size="icon" onClick={() => {}}>
            <PieChart className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onStartNewChat}>
            <MessageSquare className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
          </Button>
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={onOpenProfile}>
            <MoreVertical className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
          </Button>
        </div>
      </div>
      
      {/* Search Box */}
      <div className="p-2 bg-background dark:bg-background">
        <div className="flex items-center bg-gray-100 dark:bg-[#202C33] rounded-lg px-3 py-1">
          <Search className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
          <Input
            type="text"
            placeholder="Search or start new chat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ml-2 bg-transparent border-none w-full focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
      </div>
      
      {/* Chats List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <p className="text-muted-foreground">Loading chats...</p>
          </div>
        ) : filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <ChatItem 
              key={chat.id}
              chat={chat}
              isActive={chat.id === activeChatId}
              onClick={() => onOpenChat(chat.id)}
            />
          ))
        ) : searchQuery ? (
          <div className="flex justify-center items-center h-32">
            <p className="text-muted-foreground">No chats found</p>
          </div>
        ) : (
          <div className="flex justify-center items-center h-32">
            <p className="text-muted-foreground">No chats yet. Start a new conversation!</p>
          </div>
        )}
      </div>
    </aside>
  );
}

export default LeftSidebar;
