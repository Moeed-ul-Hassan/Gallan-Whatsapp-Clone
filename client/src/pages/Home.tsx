import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Chat, Contact, Message, User } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Icons
import { 
  Search, MessageSquare, MoreVertical, ArrowLeft, Paperclip, 
  Smile, Mic, LogOut, UserCircle, Settings, Users, Loader2, MessageCircle
} from "lucide-react";

// Components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useMessagePolling } from "@/hooks/use-message-polling";
import SettingsDialog from "@/components/SettingsDialog";

// Dropdowns and dialogs
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatMessageTime, formatChatTime } from "@/lib/formatDate";
import getDefaultAvatarUri, { getInitials } from "@/lib/getDefaultAvatar";

function Home() {
  // Hooks
  const [, navigate] = useLocation();
  const { user, isLoading: isAuthLoading, logout } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // State
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [showNewContact, setShowNewContact] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileStatus, setProfileStatus] = useState("");
  const [newContactUsername, setNewContactUsername] = useState("");
  const [newContactDisplayName, setNewContactDisplayName] = useState("");

  // Polling for new messages (must be called after all useState hooks)
  const polling = useMessagePolling(activeChatId);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !user) {
      navigate("/login");
    } else if (user) {
      setProfileName(user.displayName);
      setProfileStatus(user.status || "");
    }
  }, [user, isAuthLoading, navigate]);

  // Queries
  const { data: chats = [], isLoading: isChatsLoading } = useQuery<Chat[]>({
    queryKey: ["/api/chats"],
    enabled: !!user,
  });

  const { data: contacts = [], isLoading: isContactsLoading } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
    enabled: !!user,
  });

  // Log contacts when they change
  useEffect(() => {
    if (contacts.length > 0) {
      console.log("Contacts fetched:", contacts);
    }
  }, [contacts]);

  const { data: messages = [], isLoading: isMessagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages", activeChatId],
    queryFn: async () => {
      if (!activeChatId) return [];
      const response = await apiRequest("GET", `/api/messages/${activeChatId}`);
      return response.json();
    },
    enabled: !!activeChatId,
  });

  // Filtered chats based on search
  const filteredChats = chats.filter(chat => 
    chat.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Active chat
  const activeChat = activeChatId ? chats.find(chat => chat.id === activeChatId) : null;

  // Mutations
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await logout();
      navigate("/login");
    },
    onError: (error) => {
      toast({
        title: "Logout failed",
        description: error instanceof Error ? error.message : "Failed to logout",
        variant: "destructive",
      });
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (userData: { displayName: string; status: string }) => {
      if (!user) throw new Error("User not found");
      const response = await apiRequest("PATCH", `/api/users/${user.id}`, userData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      setShowProfile(false);
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const addContactMutation = useMutation({
    mutationFn: async (contactData: { username: string; displayName: string }) => {
      const response = await apiRequest("POST", "/api/contacts", contactData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "Contact added",
        description: "New contact has been added successfully.",
      });
      setNewContactUsername("");
      setNewContactDisplayName("");
      setShowNewContact(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to add contact",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  const startChatMutation = useMutation({
    mutationFn: async (contactId: number) => {
      const response = await apiRequest("POST", "/api/chats", { contactId });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
      setActiveChatId(data.id);
      setShowNewChat(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to start chat",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ chatId, text }: { chatId: number; text: string }) => {
      const response = await apiRequest("POST", "/api/messages", { 
        chatId, 
        text,
        status: "sent" 
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", activeChatId] });
      queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
      setMessageText("");
    },
    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Handlers
  const handleSendMessage = () => {
    if (!messageText.trim() || !activeChatId) return;
    
    sendMessageMutation.mutate({
      chatId: activeChatId,
      text: messageText.trim()
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleUpdateProfile = () => {
    updateProfileMutation.mutate({
      displayName: profileName,
      status: profileStatus
    });
  };

  const handleAddContact = () => {
    if (!newContactUsername.trim()) return;
    
    addContactMutation.mutate({
      username: newContactUsername.trim(),
      displayName: newContactDisplayName.trim() || newContactUsername.trim()
    });
  };

  const handleStartChat = (contactId: number) => {
    startChatMutation.mutate(contactId);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (isAuthLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#111b21]">
        <Loader2 className="h-8 w-8 text-[#00a884] animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#0c1317]">
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className={`
          ${isMobile && activeChatId ? 'hidden' : 'flex'} 
          md:flex flex-col w-full md:w-96 border-r border-[#202c33]
        `}>
          {/* Sidebar Header */}
          <div className="flex justify-between items-center p-3 bg-[#202c33] h-16">
            <div 
              className="flex items-center cursor-pointer"
              onClick={() => setShowProfile(true)}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar || getDefaultAvatarUri(user.displayName)} alt={user.displayName} />
                <AvatarFallback className="bg-[#00a884]">{getInitials(user.displayName)}</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" onClick={() => setShowNewContact(true)}>
                <Users className="h-5 w-5 text-[#aebac1]" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MessageCircle className="h-5 w-5 text-[#aebac1]" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <MoreVertical className="h-5 w-5 text-[#aebac1]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#233138] border-[#233138] text-[#d1d7db]">
                  <DropdownMenuItem onClick={() => setShowProfile(true)}>
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowSettings(true)}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#395057]" />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Search Box */}
          <div className="p-2 bg-[#111b21]">
            <div className="flex items-center bg-[#202c33] rounded-lg px-3 py-1.5">
              <Search className="h-5 w-5 text-[#aebac1]" />
              <Input
                type="text"
                placeholder="Search or start new chat"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ml-2 bg-transparent border-none text-[#d1d7db] placeholder-[#8696a0] w-full focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
              />
            </div>
          </div>
          
          {/* Chats List */}
          <div className="flex-1 overflow-y-auto bg-[#111b21]">
            {isChatsLoading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-6 w-6 text-[#00a884] animate-spin" />
              </div>
            ) : filteredChats.length > 0 ? (
              <div>
                {filteredChats.map((chat) => (
                  <div 
                    key={chat.id}
                    className={`flex items-center p-3 hover:bg-[#202c33] cursor-pointer ${chat.id === activeChatId ? 'bg-[#2a3942]' : ''}`}
                    onClick={() => setActiveChatId(chat.id)}
                  >
                    <Avatar className="h-12 w-12 mr-3">
                      <AvatarImage src={chat.avatar || getDefaultAvatarUri(chat.name)} alt={chat.name || "Chat"} />
                      <AvatarFallback className="bg-[#00a884]">
                        {getInitials(chat.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden border-b border-[#222d34] pb-3">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-medium text-[#e9edef] truncate">{chat.name}</h3>
                        <span className="text-xs text-[#8696a0]">{formatChatTime(chat.lastMessageTime || '')}</span>
                      </div>
                      <div className="flex items-center">
                        <p className="text-sm text-[#8696a0] truncate">
                          {chat.lastMessage || "Start a conversation"}
                        </p>
                        {chat.unreadCount > 0 && (
                          <span className="ml-2 bg-[#00a884] text-white rounded-full text-xs px-[5px] py-[1px]">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="flex justify-center items-center h-32 text-[#8696a0]">
                No chats found
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center h-64 text-[#8696a0] p-4 text-center">
                <MessageSquare className="h-12 w-12 mb-4 text-[#00a884]" />
                <p className="mb-2">No chats yet</p>
                <Button 
                  className="mt-4 bg-[#00a884] hover:bg-[#00a884]/90 text-white"
                  onClick={() => setShowNewChat(true)}
                >
                  Start a new chat
                </Button>
              </div>
            )}
          </div>
        </aside>
        
        {/* Chat Area */}
        {activeChat ? (
          <div className={`
            ${isMobile && !activeChatId ? 'hidden' : 'flex'} 
            md:flex flex-col flex-1 bg-[#0c141a]
          `}>
            {/* Chat Header */}
            <div className="flex justify-between items-center p-3 bg-[#202c33] h-16">
              <div className="flex items-center">
                {isMobile && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="mr-2"
                    onClick={() => setActiveChatId(null)}
                  >
                    <ArrowLeft className="h-5 w-5 text-[#aebac1]" />
                  </Button>
                )}
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={activeChat.avatar || getDefaultAvatarUri(activeChat.name)} alt={activeChat.name || "Chat"} />
                  <AvatarFallback className="bg-[#00a884]">
                    {getInitials(activeChat.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-[#e9edef]">{activeChat.name}</h3>
                  <p className="text-xs text-[#8696a0]">
                    {activeChat.isOnline ? 'Online' : activeChat.lastSeen ? `Last seen ${activeChat.lastSeen}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Search className="h-5 w-5 text-[#aebac1]" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <MoreVertical className="h-5 w-5 text-[#aebac1]" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#233138] border-[#233138] text-[#d1d7db]">
                    <DropdownMenuItem>Contact info</DropdownMenuItem>
                    <DropdownMenuItem>Select messages</DropdownMenuItem>
                    <DropdownMenuItem>Close chat</DropdownMenuItem>
                    <DropdownMenuItem>Mute notifications</DropdownMenuItem>
                    <DropdownMenuItem>Clear messages</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-500 focus:text-red-500">Delete chat</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* Messages */}
            <div 
              className="flex-1 overflow-y-auto p-4"
              style={{ backgroundImage: "url('https://web.whatsapp.com/img/bg-chat-tile-dark_a4be512e7195b6b733d9110b408f075d.png')", backgroundRepeat: "repeat" }}
            >
              {isMessagesLoading ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-6 w-6 text-[#00a884] animate-spin" />
                </div>
              ) : messages.length > 0 ? (
                <div className="space-y-2">
                  {messages.map((message) => {
                    const isSent = message.senderId === user.id;
                    
                    return (
                      <div 
                        key={message.id}
                        className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[70%] rounded-lg px-3 py-2 shadow-sm ${
                            isSent ? 'bg-[#005c4b] text-[#e9edef]' : 'bg-[#202c33] text-[#e9edef]'
                          }`}
                        >
                          <p className="break-words">{message.text}</p>
                          <div className="flex justify-end items-center mt-1">
                            <span className="text-[10px] text-[#8696a0] mr-1">
                              {formatMessageTime(message.createdAt.toString())}
                            </span>
                            {isSent && (
                              <svg viewBox="0 0 18 18" width="18" height="18" className="w-3.5 h-3.5 text-[#8696a0]">
                                <polyline points="14,4 6,12 2,8" fill="none" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col justify-center items-center h-64 text-[#8696a0] text-center">
                  <p>No messages yet</p>
                  <p>Start a conversation</p>
                </div>
              )}
            </div>
            
            {/* Message Input */}
            <div className="bg-[#202c33] p-3">
              <div className="flex items-center">
                <Button variant="ghost" size="icon" className="text-[#8696a0]">
                  <Smile className="h-6 w-6" />
                </Button>
                <Button variant="ghost" size="icon" className="text-[#8696a0]">
                  <Paperclip className="h-6 w-6" />
                </Button>
                <Input
                  placeholder="Type a message"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 mx-2 bg-[#2a3942] border-none rounded-lg text-[#d1d7db] placeholder-[#8696a0] focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-[#8696a0]"
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || sendMessageMutation.isPending}
                >
                  {messageText.trim() ? (
                    <svg viewBox="0 0 24 24" width="24" height="24" className="text-[#00a884]">
                      <path fill="currentColor" d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"></path>
                    </svg>
                  ) : (
                    <Mic className="h-6 w-6" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 bg-[#222e35] items-center justify-center">
            <div className="text-center max-w-md p-8">
              <div className="mb-8">
                <MessageSquare className="w-16 h-16 text-[#00a884] mx-auto" />
              </div>
              <h2 className="text-2xl font-light text-[#e9edef] mb-4">Gallan Web</h2>
              <p className="text-[#8696a0] mb-6">
                Send and receive messages without keeping your phone online.
                Use Gallan on up to 4 linked devices and 1 phone at the same time.
              </p>
              <div className="text-[#8696a0] text-sm flex justify-center items-center mt-8">
                <span>End-to-end encrypted</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profile Dialog */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="bg-[#222e35] border-[#222e35] text-[#e9edef] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-[#e9edef]">Profile</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center my-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={user.avatar || getDefaultAvatarUri(user.displayName)} alt={user.displayName} />
              <AvatarFallback className="bg-[#00a884] text-xl">
                {getInitials(user.displayName)}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-[#8696a0]">Your Name</label>
              <Input 
                value={profileName} 
                onChange={(e) => setProfileName(e.target.value)}
                className="bg-[#2a3942] border-[#2a3942] text-[#d1d7db] focus-visible:ring-[#00a884]"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm text-[#8696a0]">About</label>
              </div>
              <Textarea 
                value={profileStatus}
                onChange={(e) => setProfileStatus(e.target.value)}
                className="bg-[#2a3942] border-[#2a3942] text-[#d1d7db] focus-visible:ring-[#00a884]"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-[#8696a0]">Username</label>
              <div className="bg-[#111b21] p-3 rounded-md text-[#d1d7db]">
                {user.username}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              className="bg-[#00a884] hover:bg-[#00a884]/90 text-white"
              onClick={handleUpdateProfile}
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Contact Dialog */}
      <Dialog open={showNewContact} onOpenChange={setShowNewContact}>
        <DialogContent className="bg-[#222e35] border-[#222e35] text-[#e9edef] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-[#e9edef]">Add New Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-[#8696a0]">Username</label>
              <Input 
                value={newContactUsername} 
                onChange={(e) => setNewContactUsername(e.target.value)}
                placeholder="Enter username to add"
                className="bg-[#2a3942] border-[#2a3942] text-[#d1d7db] focus-visible:ring-[#00a884]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-[#8696a0]">Display Name (optional)</label>
              <Input 
                value={newContactDisplayName} 
                onChange={(e) => setNewContactDisplayName(e.target.value)}
                placeholder="How you want to see this contact"
                className="bg-[#2a3942] border-[#2a3942] text-[#d1d7db] focus-visible:ring-[#00a884]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              className="bg-[#00a884] hover:bg-[#00a884]/90 text-white"
              onClick={handleAddContact}
              disabled={addContactMutation.isPending || !newContactUsername.trim()}
            >
              {addContactMutation.isPending ? "Adding..." : "Add Contact"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Chat Dialog */}
      <Dialog open={showNewChat} onOpenChange={setShowNewChat}>
        <DialogContent className="bg-[#222e35] border-[#222e35] text-[#e9edef] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-[#e9edef]">New Chat</DialogTitle>
          </DialogHeader>
          {isContactsLoading ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="h-6 w-6 text-[#00a884] animate-spin" />
            </div>
          ) : contacts.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              {contacts.map((contact: Contact) => {
                console.log("Rendering contact:", contact);
                // Get user information from the contact
                const contactUser = contact.user;
                const displayName = contact.displayName || contactUser.displayName;
                const avatar = contactUser.avatar;
                const status = contactUser.status || "Hey there! I'm using Gallan";
                
                return (
                  <div 
                    key={contact.contactId}
                    className="flex items-center p-3 hover:bg-[#202c33] cursor-pointer rounded"
                    onClick={() => handleStartChat(contact.contactId)}
                  >
                    <Avatar className="h-12 w-12 mr-3">
                      <AvatarImage src={avatar || getDefaultAvatarUri(displayName)} alt={displayName} />
                      <AvatarFallback className="bg-[#00a884]">
                        {getInitials(displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-[#e9edef]">{displayName}</h3>
                      <p className="text-sm text-[#8696a0]">{status}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-[#8696a0] mb-4">No contacts yet.</p>
              <Button 
                className="bg-[#00a884] hover:bg-[#00a884]/90 text-white"
                onClick={() => {
                  setShowNewChat(false);
                  setShowNewContact(true);
                }}
              >
                Add a contact first
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
    </div>
  );
}

export default Home;