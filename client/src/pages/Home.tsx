import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import LeftSidebar from "@/components/LeftSidebar";
import ChatArea from "@/components/ChatArea";
import WelcomeScreen from "@/components/WelcomeScreen";
import HeaderBar from "@/components/HeaderBar";
import MobileNav from "@/components/MobileNav";
import ProfileModal from "@/components/ProfileModal";
import NewChatModal from "@/components/NewChatModal";
import { useQuery } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { Chat, Contact, Message, User } from "@shared/schema";

function Home() {
  const [, navigate] = useLocation();
  const { user, isLoading: isAuthLoading } = useAuth();
  const isMobile = useIsMobile();
  
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !user) {
      navigate("/login");
    }
  }, [user, isAuthLoading, navigate]);

  // Fetch chats for the current user
  const { data: chats = [], isLoading: isChatsLoading } = useQuery<Chat[]>({
    queryKey: ["/api/chats"],
    enabled: !!user,
  });

  // Fetch contacts for the current user
  const { data: contacts = [], isLoading: isContactsLoading } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
    enabled: !!user,
  });

  // Fetch active chat messages
  const { data: messages = [], isLoading: isMessagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages", activeChatId],
    enabled: !!activeChatId,
  });

  // Get active chat from chats
  const activeChat = activeChatId ? chats.find(chat => chat.id === activeChatId) : null;

  // Handle opening a chat
  const handleOpenChat = (chatId: number) => {
    setActiveChatId(chatId);
  };

  // Handle starting a new chat
  const handleStartNewChat = () => {
    setShowNewChatModal(true);
  };

  // Handle opening profile modal
  const handleOpenProfile = () => {
    setShowProfileModal(true);
  };

  if (isAuthLoading || !user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-background dark:bg-background">
      {/* Mobile Header */}
      {isMobile && <HeaderBar onOpenMenu={handleOpenProfile} onStartNewChat={handleStartNewChat} />}
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <LeftSidebar 
          user={user}
          chats={chats}
          isLoading={isChatsLoading}
          onOpenChat={handleOpenChat}
          onOpenProfile={handleOpenProfile}
          onStartNewChat={handleStartNewChat}
          activeChatId={activeChatId}
          isMobile={isMobile}
        />
        
        {/* Chat Area or Welcome Screen */}
        {activeChat ? (
          <ChatArea 
            chat={activeChat}
            messages={messages}
            isLoading={isMessagesLoading}
            onGoBack={() => setActiveChatId(null)}
            isMobile={isMobile}
          />
        ) : (
          <WelcomeScreen />
        )}
      </div>
      
      {/* Mobile Navigation */}
      {isMobile && <MobileNav onStartNewChat={handleStartNewChat} />}
      
      {/* Modals */}
      {showProfileModal && (
        <ProfileModal 
          user={user}
          onClose={() => setShowProfileModal(false)} 
        />
      )}
      
      {showNewChatModal && (
        <NewChatModal 
          contacts={contacts}
          isLoading={isContactsLoading}
          onClose={() => setShowNewChatModal(false)}
          onSelectContact={(contactId) => {
            // Logic to open or create chat with contact
            setShowNewChatModal(false);
          }}
        />
      )}
    </div>
  );
}

export default Home;
