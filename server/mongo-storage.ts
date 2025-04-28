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
import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import { IStorage } from "./storage";

// Initialize the MongoDB connection before export
let mongoClient: MongoClient | null = null;

// MongoDB Storage Implementation
export class MongoStorage implements IStorage {
  private client: MongoClient;
  private db: any;
  private initialized: boolean = false;

  // Collection names
  private readonly COLLECTIONS = {
    USERS: 'users',
    CONTACTS: 'contacts',
    CHATS: 'chats',
    CHAT_PARTICIPANTS: 'chat_participants',
    MESSAGES: 'messages',
    MESSAGE_STATUSES: 'message_statuses',
    COUNTERS: 'counters'
  };

  constructor() {
    // Connection will be established in init()
    this.client = new MongoClient(process.env.MONGODB_URI || "");
  }

  // Initialize the MongoDB connection and collections
  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      console.log("Trying to connect to MongoDB...");
      console.log("MongoDB URI:", process.env.MONGODB_URI ? "URI is set" : "URI is missing");
      
      await this.client.connect();
      console.log("Connected to MongoDB successfully");
      
      this.db = this.client.db("gallan_db");
      this.initialized = true;

      // Initialize counters if they don't exist
      console.log("Initializing counters collection...");
      const countersCollection = this.db.collection(this.COLLECTIONS.COUNTERS);
      const counters = await countersCollection.findOne({ _id: 'counters' });
      
      if (!counters) {
        console.log("Creating counters collection...");
        await countersCollection.insertOne({
          _id: 'counters',
          userId: 1,
          contactId: 1,
          chatId: 1,
          chatParticipantId: 1,
          messageId: 1,
          messageStatusId: 1
        });
      }

      // Initialize demo data if needed
      console.log("Checking users collection...");
      const usersCollection = this.db.collection(this.COLLECTIONS.USERS);
      const users = await usersCollection.find({}).toArray();
      
      if (users.length === 0) {
        console.log("No users found, initializing demo data...");
        await this._initializeDemoData();
      } else {
        console.log(`Found ${users.length} existing users in MongoDB`);
      }

      console.log("MongoDB storage initialized successfully");
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      console.log("Falling back to in-memory storage");
      // We'll fall back to memory storage instead of crashing
      this.initialized = false;
      throw error;
    }
  }

  // Helper method to get the next sequence value
  private async _getNextSequence(sequenceName: string): Promise<number> {
    const result = await this.db.collection(this.COLLECTIONS.COUNTERS).findOneAndUpdate(
      { _id: 'counters' },
      { $inc: { [sequenceName]: 1 } },
      { returnDocument: 'after' }
    );
    
    return result.value[sequenceName];
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const user = await this.db.collection(this.COLLECTIONS.USERS).findOne({ id });
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await this.db.collection(this.COLLECTIONS.USERS).findOne({
      username: { $regex: new RegExp(`^${username}$`, 'i') }
    });
    return user || undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = await this._getNextSequence('userId');
    const now = new Date();
    
    const user: User = {
      id,
      ...userData,
      lastSeen: now,
      isOnline: false,
    };
    
    await this.db.collection(this.COLLECTIONS.USERS).insertOne(user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const result = await this.db.collection(this.COLLECTIONS.USERS).findOneAndUpdate(
      { id },
      { $set: data },
      { returnDocument: 'after' }
    );
    
    if (!result.value) {
      throw new Error("User not found");
    }
    
    return result.value;
  }

  async updateUserStatus(id: number, isOnline: boolean): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error("User not found");
    }
    
    const updateData = {
      isOnline,
      lastSeen: isOnline ? user.lastSeen : new Date()
    };
    
    return this.updateUser(id, updateData);
  }

  // Contact methods
  async getContactsByUserId(userId: number): Promise<Contact[]> {
    const contacts = await this.db.collection(this.COLLECTIONS.CONTACTS)
      .find({ userId })
      .toArray();
    
    return Promise.all(contacts.map(async (contact: any) => {
      const contactUser = await this.getUser(contact.contactId);
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
    }));
  }

  async getContactByUserAndContactId(userId: number, contactId: number): Promise<Contact | undefined> {
    const contact = await this.db.collection(this.COLLECTIONS.CONTACTS).findOne({
      userId,
      contactId
    });
    
    return contact || undefined;
  }

  async createContact(contactData: InsertContact): Promise<Contact> {
    const id = await this._getNextSequence('contactId');
    const contactUser = await this.getUser(contactData.contactId);
    
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
    
    await this.db.collection(this.COLLECTIONS.CONTACTS).insertOne(contact);
    return contact;
  }

  // Chat methods
  async getChatsByUserId(userId: number): Promise<Chat[]> {
    // Get all chat IDs where the user is a participant
    const participants = await this.db.collection(this.COLLECTIONS.CHAT_PARTICIPANTS)
      .find({ userId })
      .toArray();
    
    const chatIds = participants.map((p: any) => p.chatId);
    
    // Get all chats with those IDs
    return Promise.all(
      chatIds.map(async (chatId: number) => {
        const chat = await this.getChatById(chatId, userId);
        if (!chat) {
          throw new Error("Chat not found");
        }
        return chat;
      })
    );
  }

  async getChatById(chatId: number, userId: number): Promise<Chat | undefined> {
    const chat = await this.db.collection(this.COLLECTIONS.CHATS).findOne({ id: chatId });
    if (!chat) {
      return undefined;
    }
    
    // Get chat participants excluding the current user
    const otherParticipants = await this.db.collection(this.COLLECTIONS.CHAT_PARTICIPANTS)
      .find({ chatId, userId: { $ne: userId } })
      .toArray();
    
    const otherParticipantIds = otherParticipants.map((p: any) => p.userId);
    
    // For non-group chats, use the other participant's info
    let chatName = chat.name;
    let chatAvatar = chat.avatar;
    let isOnline = false;
    let lastSeen = null;
    
    if (!chat.isGroup && otherParticipantIds.length > 0) {
      const otherUser = await this.getUser(otherParticipantIds[0]);
      if (otherUser) {
        chatName = chat.name || otherUser.displayName;
        chatAvatar = chat.avatar || otherUser.avatar;
        isOnline = otherUser.isOnline;
        lastSeen = otherUser.lastSeen ? format(new Date(otherUser.lastSeen), "yyyy-MM-dd'T'HH:mm:ss") : null;
      }
    }
    
    // Get latest message in this chat
    const chatMessages = await this.db.collection(this.COLLECTIONS.MESSAGES)
      .find({ chatId })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();
    
    const lastMessage = chatMessages.length > 0 ? chatMessages[0] : null;
    
    // Count unread messages for the current user
    let unreadCount = 0;
    
    for (const message of chatMessages) {
      if (message.senderId === userId) continue;
      
      // Check if the message has been read by the current user
      const status = await this.db.collection(this.COLLECTIONS.MESSAGE_STATUSES).findOne({
        messageId: message.id,
        userId
      });
      
      if (!status || status.status !== "read") {
        unreadCount++;
      }
    }
    
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
    // Get all chats
    const chats = await this.db.collection(this.COLLECTIONS.CHATS)
      .find({ isGroup: false })
      .toArray();
    
    for (const chat of chats) {
      // Get all participants for this chat
      const participants = await this.db.collection(this.COLLECTIONS.CHAT_PARTICIPANTS)
        .find({ chatId: chat.id })
        .toArray();
      
      const chatParticipantIds = participants.map((p: any) => p.userId);
      
      // Check if participants match exactly
      if (participantIds.length === chatParticipantIds.length && 
          participantIds.every(id => chatParticipantIds.includes(id))) {
        return this.getChatById(chat.id, participantIds[0]);
      }
    }
    
    return undefined;
  }

  async createChat(chatData: InsertChat): Promise<Chat> {
    const id = await this._getNextSequence('chatId');
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
    
    await this.db.collection(this.COLLECTIONS.CHATS).insertOne(chat);
    return chat;
  }

  // Chat participant methods
  async getChatParticipants(chatId: number): Promise<ChatParticipant[]> {
    return this.db.collection(this.COLLECTIONS.CHAT_PARTICIPANTS)
      .find({ chatId })
      .toArray();
  }

  async addChatParticipant(participantData: InsertChatParticipant): Promise<ChatParticipant> {
    const id = await this._getNextSequence('chatParticipantId');
    const now = new Date();
    
    const participant: ChatParticipant = {
      id,
      ...participantData,
      joinedAt: now,
    };
    
    await this.db.collection(this.COLLECTIONS.CHAT_PARTICIPANTS).insertOne(participant);
    return participant;
  }

  async isChatParticipant(chatId: number, userId: number): Promise<boolean> {
    const participant = await this.db.collection(this.COLLECTIONS.CHAT_PARTICIPANTS).findOne({
      chatId,
      userId
    });
    
    return !!participant;
  }

  // Message methods
  async getMessagesByChatId(chatId: number): Promise<Message[]> {
    return this.db.collection(this.COLLECTIONS.MESSAGES)
      .find({ chatId })
      .sort({ createdAt: 1 })
      .toArray();
  }

  async createMessage(messageData: InsertMessage): Promise<Message> {
    const id = await this._getNextSequence('messageId');
    const now = new Date();
    
    const message: Message = {
      id,
      ...messageData,
      createdAt: now,
      status: "sent",
    };
    
    await this.db.collection(this.COLLECTIONS.MESSAGES).insertOne(message);
    
    // Update the chat's last message
    await this.db.collection(this.COLLECTIONS.CHATS).updateOne(
      { id: messageData.chatId },
      {
        $set: {
          lastMessage: messageData.text || "Media",
          lastMessageTime: format(now, "h:mm a"),
          lastMessageSent: true,
          lastMessageStatus: "sent",
        }
      }
    );
    
    return message;
  }

  // Message status methods
  async getMessageStatusByMessageAndUserId(messageId: number, userId: number): Promise<MessageStatus | undefined> {
    const status = await this.db.collection(this.COLLECTIONS.MESSAGE_STATUSES).findOne({
      messageId,
      userId
    });
    
    return status || undefined;
  }

  async createMessageStatus(statusData: InsertMessageStatus): Promise<MessageStatus> {
    const id = await this._getNextSequence('messageStatusId');
    const now = new Date();
    
    const status: MessageStatus = {
      id,
      ...statusData,
      updatedAt: now,
    };
    
    await this.db.collection(this.COLLECTIONS.MESSAGE_STATUSES).insertOne(status);
    
    // If all participants have read the message, update message status
    await this._updateMessageStatusIfAll(statusData.messageId);
    
    return status;
  }

  async updateMessageStatus(messageId: number, userId: number, status: string): Promise<MessageStatus> {
    const messageStatus = await this.getMessageStatusByMessageAndUserId(messageId, userId);
    
    if (!messageStatus) {
      return this.createMessageStatus({
        messageId,
        userId,
        status,
      });
    }
    
    const now = new Date();
    const updatedStatus: MessageStatus = {
      ...messageStatus,
      status,
      updatedAt: now,
    };
    
    await this.db.collection(this.COLLECTIONS.MESSAGE_STATUSES).replaceOne(
      { id: messageStatus.id },
      updatedStatus
    );
    
    // If all participants have read the message, update message status
    await this._updateMessageStatusIfAll(messageId);
    
    return updatedStatus;
  }

  // Helper method to update message status if all participants have seen it
  private async _updateMessageStatusIfAll(messageId: number): Promise<void> {
    const message = await this.db.collection(this.COLLECTIONS.MESSAGES).findOne({ id: messageId });
    if (!message) return;
    
    const chat = await this.db.collection(this.COLLECTIONS.CHATS).findOne({ id: message.chatId });
    if (!chat) return;
    
    // Get all participants except the sender
    const participants = await this.db.collection(this.COLLECTIONS.CHAT_PARTICIPANTS).find({
      chatId: chat.id,
      userId: { $ne: message.senderId }
    }).toArray();
    
    if (participants.length === 0) return;
    
    // Check if all participants have read the message
    const statuses = await this.db.collection(this.COLLECTIONS.MESSAGE_STATUSES).find({
      messageId
    }).toArray();
    
    const allRead = participants.every(participant => 
      statuses.some(status => 
        status.userId === participant.userId && status.status === "read"
      )
    );
    
    if (allRead) {
      await this.db.collection(this.COLLECTIONS.MESSAGES).updateOne(
        { id: messageId },
        { $set: { status: "read" } }
      );
    } else if (statuses.length === participants.length) {
      await this.db.collection(this.COLLECTIONS.MESSAGES).updateOne(
        { id: messageId },
        { $set: { status: "delivered" } }
      );
    }
  }

  // Initialize demo data
  private async _initializeDemoData(): Promise<void> {
    try {
      console.log("Initializing demo data in MongoDB...");
      
      // Create demo user for testing
      const hashedPassword = await bcrypt.hash("password123", 10);
      
      const demoUser = {
        id: 1,
        username: "demo-user",
        password: hashedPassword,
        displayName: "Demo User",
        status: "Hey there! I'm using Gallan",
        avatar: null,
        lastSeen: new Date(),
        isOnline: false
      };
      
      // Create Islamic scholars as demo users
      const muftiSamarUser = {
        id: 2,
        username: "mufti_samar",
        password: hashedPassword,
        displayName: "Mufti Samar Abbas Qadri",
        status: "اللهم صل على محمد وآل محمد",  // Arabic: "O Allah, bless Muhammad and the family of Muhammad"
        avatar: null,
        lastSeen: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        isOnline: false
      };
      
      const muftiNaseerUser = {
        id: 3,
        username: "mufti_naseer",
        password: hashedPassword,
        displayName: "Mufti Naseer udin Naseer",
        status: "الحمد لله رب العالمين",  // Arabic: "Praise be to Allah, Lord of the worlds"
        avatar: null,
        lastSeen: new Date(Date.now() - 120 * 60 * 1000), // 2 hours ago
        isOnline: false
      };
      
      // Insert users
      await this.db.collection(this.COLLECTIONS.USERS).insertMany([
        demoUser, 
        muftiSamarUser, 
        muftiNaseerUser
      ]);
      
      // Add contacts for demo user
      const contact1 = {
        id: 1,
        userId: demoUser.id,
        contactId: muftiSamarUser.id,
        displayName: null,
        user: muftiSamarUser,
        status: muftiSamarUser.status,
        avatar: muftiSamarUser.avatar
      };
      
      const contact2 = {
        id: 2,
        userId: demoUser.id,
        contactId: muftiNaseerUser.id,
        displayName: null,
        user: muftiNaseerUser,
        status: muftiNaseerUser.status,
        avatar: muftiNaseerUser.avatar
      };
      
      await this.db.collection(this.COLLECTIONS.CONTACTS).insertMany([contact1, contact2]);
      
      console.log("Added demo user: demo-user");
      console.log("Added demo contacts: Mufti Samar Abbas Qadri, Mufti Naseer udin Naseer");
      
    } catch (error) {
      console.error("Error initializing demo data:", error);
    }
  }
}