import express, { Express, Request, Response, NextFunction } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import createMemoryStore from "memorystore";
import bcrypt from "bcryptjs";
import { z } from "zod";
import path from "path";
import http from "http";
import { storage } from "./storage";
import { registerRoutes } from "./routes";
import { serveStatic } from "./vite";
import { MongoStorage } from "./mongo-storage";

// Create a memory store for sessions
const MemoryStore = createMemoryStore(session);

// Create Express app
const app = express();

// Set up JSON body parsing
app.use(express.json());

// Initialize the server
export async function initializeServer(): Promise<http.Server> {
  try {
    // Try to initialize MongoDB if URI is available in the environment
    if (process.env.MONGODB_URI) {
      console.log("Desktop app: Connecting to MongoDB...");
      try {
        const mongoStorage = new MongoStorage();
        await mongoStorage.init();
        console.log("Desktop app: Connected to MongoDB successfully");
      } catch (mongoError) {
        console.error("Desktop app: Failed to connect to MongoDB:", mongoError);
        console.log("Desktop app: Falling back to in-memory storage");
      }
    } else {
      console.log("Desktop app: No MongoDB URI provided, using in-memory storage");
    }
    
    // Register all routes
    const server = await registerRoutes(app);
    
    // Serve static files in production
    if (process.env.NODE_ENV === 'production') {
      serveStatic(app);
    }

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error(err.stack);
      res.status(500).json({ message: "Something went wrong!" });
    });

    return server;
  } catch (error) {
    console.error("Failed to initialize server:", error);
    throw error;
  }
}

// Start the server and return the server instance
export async function startServer(port: number = 5000): Promise<http.Server> {
  const server = await initializeServer();
  
  return new Promise((resolve) => {
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
      resolve(server);
    });
  });
}

// Export the module
export default {
  startServer,
  initializeServer,
};