import { 
  User, 
  InsertUser, 
  Contact, 
  InsertContact,
  Chat,
  InsertChat,
  ChatParticipant,
  InsertChatParticipant,
  Message,
  InsertMessage,
  MessageStatus,
  InsertMessageStatus
} from "@shared/schema";
import { format } from "date-fns";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  updateUserStatus(id: number, isOnline: boolean): Promise<User>;
  
  // Contact methods
  getContactsByUserId(userId: number): Promise<Contact[]>;
  getContactByUserAndContactId(userId: number, contactId: number): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  
  // Chat methods
  getChatsByUserId(userId: number): Promise<Chat[]>;
  getChatById(chatId: number, userId: number): Promise<Chat | undefined>;
  getChatByParticipants(participantIds: number[]): Promise<Chat | undefined>;
  createChat(chat: InsertChat): Promise<Chat>;
  
  // Chat participant methods
  getChatParticipants(chatId: number): Promise<ChatParticipant[]>;
  addChatParticipant(participant: InsertChatParticipant): Promise<ChatParticipant>;
  isChatParticipant(chatId: number, userId: number): Promise<boolean>;
  
  // Message methods
  getMessagesByChatId(chatId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Message status methods
  getMessageStatusByMessageAndUserId(messageId: number, userId: number): Promise<MessageStatus | undefined>;
  createMessageStatus(status: InsertMessageStatus): Promise<MessageStatus>;
  updateMessageStatus(messageId: number, userId: number, status: string): Promise<MessageStatus>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contacts: Map<number, Contact>;
  private chats: Map<number, Chat>;
  private chatParticipants: Map<number, ChatParticipant>;
  private messages: Map<number, Message>;
  private messageStatuses: Map<number, MessageStatus>;
  
  private userId: number;
  private contactId: number;
  private chatId: number;
  private chatParticipantId: number;
  private messageId: number;
  private messageStatusId: number;

  // Storage keys for localStorage
  private readonly STORAGE_KEYS = {
    USERS: 'whatsapp_clone_users',
    CONTACTS: 'whatsapp_clone_contacts',
    CHATS: 'whatsapp_clone_chats',
    CHAT_PARTICIPANTS: 'whatsapp_clone_chat_participants',
    MESSAGES: 'whatsapp_clone_messages',
    MESSAGE_STATUSES: 'whatsapp_clone_message_statuses',
    COUNTERS: 'whatsapp_clone_counters'
  };

  constructor() {
    // Initialize from localStorage if available, otherwise create new Maps
    this.users = this._loadFromLocalStorage(this.STORAGE_KEYS.USERS, new Map<number, User>());
    this.contacts = this._loadFromLocalStorage(this.STORAGE_KEYS.CONTACTS, new Map<number, Contact>());
    this.chats = this._loadFromLocalStorage(this.STORAGE_KEYS.CHATS, new Map<number, Chat>());
    this.chatParticipants = this._loadFromLocalStorage(this.STORAGE_KEYS.CHAT_PARTICIPANTS, new Map<number, ChatParticipant>());
    this.messages = this._loadFromLocalStorage(this.STORAGE_KEYS.MESSAGES, new Map<number, Message>());
    this.messageStatuses = this._loadFromLocalStorage(this.STORAGE_KEYS.MESSAGE_STATUSES, new Map<number, MessageStatus>());
    
    // Load counters from localStorage or initialize
    const counters = this._loadFromLocalStorage(this.STORAGE_KEYS.COUNTERS, {
      userId: 1,
      contactId: 1,
      chatId: 1,
      chatParticipantId: 1,
      messageId: 1,
      messageStatusId: 1
    });
    
    this.userId = counters.userId;
    this.contactId = counters.contactId;
    this.chatId = counters.chatId;
    this.chatParticipantId = counters.chatParticipantId;
    this.messageId = counters.messageId;
    this.messageStatusId = counters.messageStatusId;
    
    // Add some demo data if needed
    if (this.users.size === 0) {
      this._initializeDemoData();
    }
  }
  
  // Helper method to load data from localStorage
  private _loadFromLocalStorage<T>(key: string, defaultValue: T): T {
    try {
      if (typeof localStorage !== 'undefined') {
        const data = localStorage.getItem(key);
        if (data) {
          // For Maps, we need to convert the array back to a Map
          if (defaultValue instanceof Map) {
            const parsedData = JSON.parse(data);
            return new Map(parsedData) as unknown as T;
          }
          return JSON.parse(data);
        }
      }
    } catch (error) {
      console.error(`Error loading data from localStorage for key ${key}:`, error);
    }
    return defaultValue;
  }
  
  // Helper method to save data to localStorage
  private _saveToLocalStorage(key: string, data: any): void {
    try {
      if (typeof localStorage !== 'undefined') {
        // For Maps, we need to convert to an array first
        if (data instanceof Map) {
          localStorage.setItem(key, JSON.stringify(Array.from(data.entries())));
        } else {
          localStorage.setItem(key, JSON.stringify(data));
        }
      }
    } catch (error) {
      console.error(`Error saving data to localStorage for key ${key}:`, error);
    }
  }
  
  // Helper method to save all data
  private _saveAllData(): void {
    this._saveToLocalStorage(this.STORAGE_KEYS.USERS, this.users);
    this._saveToLocalStorage(this.STORAGE_KEYS.CONTACTS, this.contacts);
    this._saveToLocalStorage(this.STORAGE_KEYS.CHATS, this.chats);
    this._saveToLocalStorage(this.STORAGE_KEYS.CHAT_PARTICIPANTS, this.chatParticipants);
    this._saveToLocalStorage(this.STORAGE_KEYS.MESSAGES, this.messages);
    this._saveToLocalStorage(this.STORAGE_KEYS.MESSAGE_STATUSES, this.messageStatuses);
    
    this._saveToLocalStorage(this.STORAGE_KEYS.COUNTERS, {
      userId: this.userId,
      contactId: this.contactId,
      chatId: this.chatId,
      chatParticipantId: this.chatParticipantId,
      messageId: this.messageId,
      messageStatusId: this.messageStatusId
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = {
      id,
      ...userData,
      lastSeen: now,
      isOnline: false,
    };
    this.users.set(id, user);
    this._saveAllData(); // Save to localStorage
    return user;
  }
  
  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error("User not found");
    }
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    this._saveAllData(); // Save to localStorage
    return updatedUser;
  }
  
  async updateUserStatus(id: number, isOnline: boolean): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error("User not found");
    }
    const updatedUser = { 
      ...user, 
      isOnline,
      lastSeen: isOnline ? user.lastSeen : new Date()
    };
    this.users.set(id, updatedUser);
    this._saveAllData(); // Save to localStorage
    return updatedUser;
  }

  // Contact methods
  async getContactsByUserId(userId: number): Promise<Contact[]> {
    return Array.from(this.contacts.values())
      .filter((contact) => contact.userId === userId)
      .map((contact) => {
        const contactUser = this.users.get(contact.contactId);
        if (!contactUser) {
          throw new Error("Contact user not found");
        }
        return {
          ...contact,
          user: contactUser,
          displayName: contact.displayName || contactUser.displayName,
          status: contactUser.status,
          avatar: contactUser.avatar,
        };
      });
  }
  
  async getContactByUserAndContactId(userId: number, contactId: number): Promise<Contact | undefined> {
    return Array.from(this.contacts.values()).find(
      (contact) => contact.userId === userId && contact.contactId === contactId
    );
  }
  
  async createContact(contactData: InsertContact): Promise<Contact> {
    const id = this.contactId++;
    const contactUser = this.users.get(contactData.contactId);
    if (!contactUser) {
      throw new Error("Contact user not found");
    }
    
    const contact: Contact = {
      id,
      ...contactData,
      user: contactUser,
      displayName: contactData.displayName || contactUser.displayName,
      status: contactUser.status,
      avatar: contactUser.avatar,
    };
    this.contacts.set(id, contact);
    this._saveAllData(); // Save to localStorage
    return contact;
  }

  // Chat methods
  async getChatsByUserId(userId: number): Promise<Chat[]> {
    // Get all chat IDs where the user is a participant
    const chatIds = Array.from(this.chatParticipants.values())
      .filter((participant) => participant.userId === userId)
      .map((participant) => participant.chatId);
    
    // Get all chats with those IDs
    return Promise.all(
      chatIds.map(async (chatId) => {
        const chat = await this.getChatById(chatId, userId);
        if (!chat) {
          throw new Error("Chat not found");
        }
        return chat;
      })
    );
  }
  
  async getChatById(chatId: number, userId: number): Promise<Chat | undefined> {
    const chat = this.chats.get(chatId);
    if (!chat) {
      return undefined;
    }
    
    // Get chat participants excluding the current user
    const otherParticipants = Array.from(this.chatParticipants.values())
      .filter((participant) => participant.chatId === chatId && participant.userId !== userId)
      .map((participant) => participant.userId);
    
    // For non-group chats, use the other participant's info
    let chatName = chat.name;
    let chatAvatar = chat.avatar;
    let isOnline = false;
    let lastSeen = null;
    
    if (!chat.isGroup && otherParticipants.length > 0) {
      const otherUser = this.users.get(otherParticipants[0]);
      if (otherUser) {
        chatName = chat.name || otherUser.displayName;
        chatAvatar = chat.avatar || otherUser.avatar;
        isOnline = otherUser.isOnline;
        lastSeen = otherUser.lastSeen ? format(new Date(otherUser.lastSeen), "yyyy-MM-dd'T'HH:mm:ss") : null;
      }
    }
    
    // Get latest message in this chat
    const chatMessages = Array.from(this.messages.values())
      .filter((message) => message.chatId === chatId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    const lastMessage = chatMessages.length > 0 ? chatMessages[0] : null;
    
    // Count unread messages for the current user
    const unreadCount = chatMessages.filter((message) => {
      if (message.senderId === userId) return false;
      
      // Check if the message has been read by the current user
      const status = Array.from(this.messageStatuses.values()).find(
        (status) => status.messageId === message.id && status.userId === userId
      );
      
      return status ? status.status !== "read" : true;
    }).length;
    
    return {
      ...chat,
      lastMessage: lastMessage?.text || "",
      lastMessageTime: lastMessage ? format(new Date(lastMessage.createdAt), "h:mm a") : "",
      lastMessageSent: lastMessage ? lastMessage.senderId === userId : false,
      lastMessageStatus: lastMessage?.status || "",
      unreadCount,
      isOnline,
      lastSeen,
    };
  }
  
  async getChatByParticipants(participantIds: number[]): Promise<Chat | undefined> {
    // Get all chat IDs
    const allChatIds = new Set(Array.from(this.chatParticipants.values()).map(p => p.chatId));
    
    // Filter for non-group chats that contain all of the specified participants
    for (const chatId of allChatIds) {
      const chat = this.chats.get(chatId);
      if (chat && !chat.isGroup) {
        const chatParticipantIds = Array.from(this.chatParticipants.values())
          .filter(p => p.chatId === chatId)
          .map(p => p.userId);
        
        // Check if participants match exactly
        if (participantIds.length === chatParticipantIds.length && 
            participantIds.every(id => chatParticipantIds.includes(id))) {
          return this.getChatById(chatId, participantIds[0]);
        }
      }
    }
    
    return undefined;
  }
  
  async createChat(chatData: InsertChat): Promise<Chat> {
    const id = this.chatId++;
    const now = new Date();
    const chat: Chat = {
      id,
      ...chatData,
      createdAt: now,
      lastMessage: "",
      lastMessageTime: "",
      lastMessageSent: false,
      lastMessageStatus: "",
      unreadCount: 0,
      isOnline: false,
      lastSeen: null,
    };
    this.chats.set(id, chat);
    this._saveAllData(); // Save to localStorage
    return chat;
  }

  // Chat participant methods
  async getChatParticipants(chatId: number): Promise<ChatParticipant[]> {
    return Array.from(this.chatParticipants.values())
      .filter((participant) => participant.chatId === chatId);
  }
  
  async addChatParticipant(participantData: InsertChatParticipant): Promise<ChatParticipant> {
    const id = this.chatParticipantId++;
    const now = new Date();
    const participant: ChatParticipant = {
      id,
      ...participantData,
      joinedAt: now,
    };
    this.chatParticipants.set(id, participant);
    return participant;
  }
  
  async isChatParticipant(chatId: number, userId: number): Promise<boolean> {
    return Array.from(this.chatParticipants.values())
      .some((participant) => participant.chatId === chatId && participant.userId === userId);
  }

  // Message methods
  async getMessagesByChatId(chatId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((message) => message.chatId === chatId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
  
  async createMessage(messageData: InsertMessage): Promise<Message> {
    const id = this.messageId++;
    const now = new Date();
    const message: Message = {
      id,
      ...messageData,
      createdAt: now,
      status: "sent",
    };
    this.messages.set(id, message);
    
    // Update the chat's last message
    const chat = this.chats.get(messageData.chatId);
    if (chat) {
      this.chats.set(messageData.chatId, {
        ...chat,
        lastMessage: messageData.text || "Media",
        lastMessageTime: format(now, "h:mm a"),
        lastMessageSent: true,
        lastMessageStatus: "sent",
      });
    }
    
    return message;
  }

  // Message status methods
  async getMessageStatusByMessageAndUserId(messageId: number, userId: number): Promise<MessageStatus | undefined> {
    return Array.from(this.messageStatuses.values()).find(
      (status) => status.messageId === messageId && status.userId === userId
    );
  }
  
  async createMessageStatus(statusData: InsertMessageStatus): Promise<MessageStatus> {
    const id = this.messageStatusId++;
    const now = new Date();
    const status: MessageStatus = {
      id,
      ...statusData,
      updatedAt: now,
    };
    this.messageStatuses.set(id, status);
    
    // Update the message status if all participants have received/read it
    this._updateMessageStatusIfAll(statusData.messageId);
    
    return status;
  }
  
  async updateMessageStatus(messageId: number, userId: number, status: string): Promise<MessageStatus> {
    const existingStatus = await this.getMessageStatusByMessageAndUserId(messageId, userId);
    if (existingStatus) {
      const now = new Date();
      const updatedStatus: MessageStatus = {
        ...existingStatus,
        status,
        updatedAt: now,
      };
      this.messageStatuses.set(existingStatus.id, updatedStatus);
      
      // Update the message status if all participants have received/read it
      this._updateMessageStatusIfAll(messageId);
      
      return updatedStatus;
    }
    
    // If no status exists, create one
    return this.createMessageStatus({
      messageId,
      userId,
      status,
    });
  }
  
  // Helper method to update message status when all participants have received/read it
  private async _updateMessageStatusIfAll(messageId: number): Promise<void> {
    const message = this.messages.get(messageId);
    if (!message) return;
    
    // Get all participants except the sender
    const participants = await this.getChatParticipants(message.chatId);
    const otherParticipants = participants.filter(p => p.userId !== message.senderId);
    
    // Get status for all other participants
    const statuses = Array.from(this.messageStatuses.values())
      .filter(s => s.messageId === messageId);
    
    // Check if all have at least delivered status
    const allDelivered = otherParticipants.every(p => 
      statuses.some(s => s.userId === p.userId && (s.status === "delivered" || s.status === "read"))
    );
    
    // Check if all have read status
    const allRead = otherParticipants.every(p => 
      statuses.some(s => s.userId === p.userId && s.status === "read")
    );
    
    // Update the message status
    if (allRead) {
      this.messages.set(messageId, { ...message, status: "read" });
    } else if (allDelivered) {
      this.messages.set(messageId, { ...message, status: "delivered" });
    }
    
    // Update the chat's last message status if this is the last message
    const chat = this.chats.get(message.chatId);
    if (chat) {
      const lastMessages = await this.getMessagesByChatId(message.chatId);
      if (lastMessages.length > 0 && lastMessages[lastMessages.length - 1].id === messageId) {
        this.chats.set(message.chatId, {
          ...chat,
          lastMessageStatus: allRead ? "read" : allDelivered ? "delivered" : "sent",
        });
      }
    }
  }
  
  // Initialize demo data
  private _initializeDemoData(): void {
    // This method can be used to initialize demo data if needed
    // For now, keep it empty to let users create their own data
  }
}

export const storage = new MemStorage();
