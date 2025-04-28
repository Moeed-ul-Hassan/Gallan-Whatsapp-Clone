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

// Create a memory store for sessions
const MemoryStore = createMemoryStore(session);

// Create Express app
const app = express();

// Set up JSON body parsing
app.use(express.json());

// Initialize the server
export async function initializeServer(): Promise<http.Server> {
  try {
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