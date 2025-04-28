import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  status: text("status").default("Hey there! I am using WhatsApp Clone"),
  avatar: text("avatar"),
  lastSeen: timestamp("last_seen").defaultNow(),
  isOnline: boolean("is_online").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  status: true,
  avatar: true,
});

// Contacts table
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  contactId: integer("contact_id").references(() => users.id).notNull(),
  displayName: text("display_name"),
});

export const insertContactSchema = createInsertSchema(contacts).pick({
  userId: true,
  contactId: true,
  displayName: true,
});

// Chats table
export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isGroup: boolean("is_group").default(false),
  avatar: text("avatar"),
});

export const insertChatSchema = createInsertSchema(chats).pick({
  name: true,
  isGroup: true,
  avatar: true,
});

// Chat participants table
export const chatParticipants = pgTable("chat_participants", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id").references(() => chats.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  isAdmin: boolean("is_admin").default(false),
});

export const insertChatParticipantSchema = createInsertSchema(chatParticipants).pick({
  chatId: true,
  userId: true,
  isAdmin: true,
});

// Messages table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id").references(() => chats.id).notNull(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  text: text("text"),
  mediaUrl: text("media_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  status: text("status").default("sent"), // sent, delivered, read
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  chatId: true,
  senderId: true,
  text: true,
  mediaUrl: true,
});

// Message status table (for tracking read/delivered status per user)
export const messageStatus = pgTable("message_status", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").references(() => messages.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  status: text("status").default("delivered"), // delivered, read
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMessageStatusSchema = createInsertSchema(messageStatus).pick({
  messageId: true,
  userId: true,
  status: true,
});

// Type definitions

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Contact = typeof contacts.$inferSelect & {
  user: User;
  displayName: string;
  status: string;
  avatar: string | null;
};
export type InsertContact = z.infer<typeof insertContactSchema>;

export type Chat = typeof chats.$inferSelect & {
  lastMessage: string;
  lastMessageTime: string;
  lastMessageSent: boolean;
  lastMessageStatus: string;
  unreadCount: number;
  isOnline: boolean;
  lastSeen: string | null;
};
export type InsertChat = z.infer<typeof insertChatSchema>;

export type ChatParticipant = typeof chatParticipants.$inferSelect;
export type InsertChatParticipant = z.infer<typeof insertChatParticipantSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type MessageStatus = typeof messageStatus.$inferSelect;
export type InsertMessageStatus = z.infer<typeof insertMessageStatusSchema>;
