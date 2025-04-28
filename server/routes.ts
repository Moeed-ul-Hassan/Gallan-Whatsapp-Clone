import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import createMemoryStore from "memorystore";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { insertUserSchema, insertMessageSchema, User } from "@shared/schema";

const MemoryStore = createMemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve flow diagram page
  app.get("/flow-diagram", (req, res) => {
    res.sendFile("flow-diagram.html", { root: "public" });
  });
  // Configure session middleware
  app.use(
    session({
      cookie: { maxAge: 86400000 }, // 24 hours
      store: new MemoryStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      resave: false,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET || "whatsapp-clone-secret",
    })
  );

  // Initialize Passport and restore authentication state from session
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Passport to use local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }

        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
          return done(null, false, { message: "Incorrect password." });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  // Serialize and deserialize user
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Authentication middleware
  const isAuthenticated = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Auth routes
  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      // Hash password
      const hashedPassword = bcrypt.hashSync(userData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });
      
      // Add Islamic scholar contacts for ALL new users
      try {
        // Create contact for Mufti Samar Abbas Qadri (ID: 2)
        await storage.createContact({
          userId: user.id,
          contactId: 2, // mufti_samar
          displayName: "Mufti Samar Abbas Qadri"
        });
        
        // Create contact for Mufti Naseer udin Naseer (ID: 3)
        await storage.createContact({
          userId: user.id,
          contactId: 3, // mufti_naseer
          displayName: "Mufti Naseer udin Naseer" 
        });
        
        console.log(`Added Islamic scholar contacts for new user: ${user.username}`);
      } catch (contactError) {
        console.error("Error adding Islamic scholar contacts:", contactError);
      }
      
      // Log the user in automatically after registration
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Update user status to online
        storage.updateUserStatus(user.id, true);
        
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "An error occurred during registration" });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: Error, user: User) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        
        // Update user status
        storage.updateUserStatus(user.id, true);
        
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.get("/api/auth/me", isAuthenticated, (req, res) => {
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user as User;
    res.json(userWithoutPassword);
  });

  app.post("/api/auth/logout", isAuthenticated, (req, res) => {
    // Update user status
    const user = req.user as User;
    storage.updateUserStatus(user.id, false);
    
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  // User routes
  app.patch("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const userId = parseInt(req.params.id);
      
      // Ensure user can only update their own profile
      if (userId !== user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const { displayName, status } = req.body;
      const updatedUser = await storage.updateUser(userId, { displayName, status });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Contacts routes
  app.get("/api/contacts", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const contacts = await storage.getContactsByUserId(user.id);
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  app.post("/api/contacts", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const { username, displayName } = req.body;
      
      console.log("Adding contact with username:", username);
      console.log("Current users:", Array.from(storage.users.values()).map(u => ({ id: u.id, username: u.username })));
      
      // Find user by username
      const contactUser = await storage.getUserByUsername(username);
      if (!contactUser) {
        console.log("User not found with username:", username);
        
        // Let's create a test user for demonstration purposes if username doesn't exist
        if (!username.includes("test-")) {
          return res.status(404).json({ message: "User not found. Please register this user first." });
        }
        
        // Create a test user
        const testUser = await storage.createUser({
          username: username,
          password: "password123", // Demo purpose only
          displayName: displayName || username,
          status: "Hey there! I'm using Gallan",
          avatar: null
        });
        
        console.log("Created test user:", testUser);
        
        // Create contact
        const contact = await storage.createContact({
          userId: user.id,
          contactId: testUser.id,
          displayName: displayName || testUser.displayName,
        });
        
        return res.status(201).json(contact);
      }
      
      // Can't add yourself as a contact
      if (contactUser.id === user.id) {
        return res.status(400).json({ message: "Cannot add yourself as a contact" });
      }
      
      // Check if contact already exists
      const existingContact = await storage.getContactByUserAndContactId(user.id, contactUser.id);
      if (existingContact) {
        return res.status(409).json({ message: "Contact already exists" });
      }
      
      // Create contact
      const contact = await storage.createContact({
        userId: user.id,
        contactId: contactUser.id,
        displayName: displayName || contactUser.displayName,
      });
      
      res.status(201).json(contact);
    } catch (error) {
      console.error("Error creating contact:", error);
      res.status(500).json({ message: "Failed to add contact" });
    }
  });

  // Chats routes
  app.get("/api/chats", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const chats = await storage.getChatsByUserId(user.id);
      res.json(chats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chats" });
    }
  });

  app.post("/api/chats", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const { contactId, name, isGroup = false } = req.body;
      
      // For individual chats, check if a chat already exists
      if (!isGroup) {
        const existingChat = await storage.getChatByParticipants([user.id, contactId]);
        if (existingChat) {
          return res.json(existingChat);
        }
        
        // Get contact details
        const contact = await storage.getUser(contactId);
        if (!contact) {
          return res.status(404).json({ message: "Contact not found" });
        }
        
        // Create a new chat
        const chat = await storage.createChat({
          name: name || contact.displayName,
          isGroup: false,
          avatar: contact.avatar,
        });
        
        // Add participants
        await storage.addChatParticipant({ chatId: chat.id, userId: user.id, isAdmin: false });
        await storage.addChatParticipant({ chatId: chat.id, userId: contactId, isAdmin: false });
        
        // Get the formatted chat
        const formattedChat = await storage.getChatById(chat.id, user.id);
        
        return res.status(201).json(formattedChat);
      }
      
      // For group chats (not fully implemented)
      return res.status(501).json({ message: "Group chats not implemented" });
    } catch (error) {
      res.status(500).json({ message: "Failed to create chat" });
    }
  });

  // Messages routes
  app.get("/api/messages/:chatId", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const chatId = parseInt(req.params.chatId);
      
      // Check if user is a participant in the chat
      const isParticipant = await storage.isChatParticipant(chatId, user.id);
      if (!isParticipant) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Get messages
      const messages = await storage.getMessagesByChatId(chatId);
      
      // Update message statuses to read for this user
      messages.forEach(async (message) => {
        if (message.senderId !== user.id) {
          await storage.updateMessageStatus(message.id, user.id, "read");
        }
      });
      
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const messageData = insertMessageSchema.parse(req.body);
      
      // Check if user is a participant in the chat
      const isParticipant = await storage.isChatParticipant(messageData.chatId, user.id);
      if (!isParticipant) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Create message
      const message = await storage.createMessage({
        ...messageData,
        senderId: user.id,
      });
      
      // Get chat participants and create message status for each (except sender)
      const participants = await storage.getChatParticipants(messageData.chatId);
      participants.forEach(async (participant) => {
        if (participant.userId !== user.id) {
          await storage.createMessageStatus({
            messageId: message.id,
            userId: participant.userId,
            status: "delivered",
          });
        }
      });
      
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
